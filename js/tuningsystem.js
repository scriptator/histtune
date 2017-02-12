/*
    Copyright (c) 2017, Matt Westcott & Ben Firshman & Johannes Vass
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:

        * Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above copyright
          notice, this list of conditions and the following disclaimer in the
          documentation and/or other materials provided with the distribution.
        * Neither the name of the <organization> nor the
          names of its contributors may be used to endorse or promote products
          derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const DEFAULT_CONCERT_PITCH_FREQ = 440; // Hz
const CONCERT_PITCH_NOTE = new Note(69);


var Notes = Object.freeze({C: 0, Cis: 1, D: 2, Dis: 3, E: 4, F: 5, Fis: 6, G: 7, Gis: 8, A: 9, Ais: 10, B: 11});

/**
 * Construct a new TuningSystem.
 *
 * @param name the display name of the temperament
 * @param deviations an array containing 12 numbers which get interpreted as the deviations from the equal temerament
 *        in cents, starting from C ranging up to B
 * @param rootNote the base note of the tuning system given as the index of the note in semitones starting from c.
 *        If set to such a number, the system is expected to be sensibly transformable to other bases
 * @param concertPitch [optional] the concert pitch in Hz, default 440
 * @constructor
 */
function TuningSystem(identifier, name, deviations, rootNote, concertPitch) {

    /**
     * This function calculates the pitch in Hertz given this tuning system, given a note object.
     *
     * @param note the note object
     * @returns the pitch in Hz as a {number}
     */
    this.getPitchForNote = function (note) {
        var deviation = this.shiftedDeviations[note.noteIndex]; // deviation in cents
        var differenceFromCP = note.getDifferenceToNote(CONCERT_PITCH_NOTE); // difference in half tones

        var frequencyRatio = Math.pow(2, (differenceFromCP * 100 + deviation) / 1200);
        return this.concertPitch * frequencyRatio;
    };

    /**
     * This function calculates the pitch in Hertz given this tuning system, given the value of a midi note.
     *
     * @param midiNote between 0 and 127
     * @returns the pitch in Hz as a {number}
     */
    this.getPitchForMidiNote = function (midiNote) {
        var parsedNote = new Note(midiNote);
        return this.getPitchForNote(parsedNote);
    };

    /**
     * Returns the index of the note in semitones starting from c, which is currently the root for this tuning system
     * (i.e. the one which has no deviation from equal temperament) or undefined iff the tuning system is not shiftable.
     */
    this.getCurrentRootNote = function() {
        return this.currentRootNote;
    };

    /**
     * Returns whether this tuning system can be translated such that it has a different note as the root by simply
     * shifting the deviation array around.
     */
    this.isShiftable = function() {
        return this.originalRootNote !== undefined;
    };

    /**
     * Shifts the tuning system to another root.
     *
     * @param note a number between 0 and 11 which sets adapts the tuning system such that it has this note as its root
     */
    this.shift = function(note) {
        if (!this.isShiftable()) {
            return;
        }

        if (note < 0 || note >= 12) {
            console.log("Could not shift tuning system because note " + note + " is unknown");
            return;
        }

        var diff = this.originalRootNote - note;
        diff = diff >= 0 ? diff : 12 + diff;

        // copy the deviations over to the shifted array
        for (var i=0; i < 12; i++) {
            this.shiftedDeviations[i] = this.deviations[(diff + i) % 12]
        }

        this.currentRootNote = note;
    };

    /**
     * Returns the deviations in an order where the keys are arranged in the order they are on the circle of fifths.
     *
     * @param start [optional] the offset of the starting key on the circle of fifths. (i.e. C = 0, D = -2, F = 1)
     * @returns {Array} the reordered deviations, starting with the key given by start
     */
    this.getDeviationsInCircleOfFifths = function (start) {
        if(!start) {
            start = 0;
        }

        var deviations = [];
        for(i=0; i < 12; i++) {
            var index = ((start + i) * 7) % 12;
            index = index < 0 ? index + 12 : index;
            deviations.push(this.shiftedDeviations[index])
        }
        return deviations;
    };

    if (!deviations.length === 12) {
        throw new Error("Deviations has to be an array containing the deviations from equal temerament in cents.");
    }

    this.identifier = identifier;
    this.name = name;

    this.originalRootNote = rootNote;
    this.deviations = deviations;

    this.currentRootNote = rootNote;
    this.shiftedDeviations = deviations.slice();

    this.concertPitch = concertPitch ? concertPitch : DEFAULT_CONCERT_PITCH_FREQ;

    return this;
}

/**
 * A Note object which can calculate the ocave and note index as well as differences in half tones to other notes.
 *
 * @param midiNote the note (between 0 and 127)
 */
function Note(midiNote) {
    if(midiNote < 0 || midiNote > 127) {
        throw new Error("MIDI notes are only defined between 0 and 127");
    }

    this.midiNote = midiNote;
    this.octave = Math.floor(midiNote / 12);
    this.noteIndex = midiNote % 12;

    this.getDifferenceToNote = function (note) {
        return this.midiNote - note.midiNote;
    }
}

var TuningSystems = {
    loadFromJson: function (json) {
        var data = JSON.parse(json);
        return TuningSystems.loadFromObject(data);
    },

    loadFromObject: function (parsedJson) {
        var parsed = {};

        for(var key in parsedJson) {
            try {
                var name = parsedJson[key].name;
                var deviations = parsedJson[key].deviations;
                var rootNote = parsedJson[key].rootNote;
                parsed[key] = new TuningSystem(key, name, deviations, rootNote);
            } catch (e) {
                throw new TypeError("Could not parse data structure containing Tuning System information: " + e);
            }
        }
        return parsed;
    }
};
