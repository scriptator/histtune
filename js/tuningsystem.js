/**
 * Created by johannesvass on 14.01.17.
 */

const DEFAULT_CONCERT_PITCH_FREQ = 440; // Hz
const CONCERT_PITCH_NOTE = new Note(69);

/**
 * Construct a new TuningSystem.
 *
 * @param name the display name of the temperament
 * @param deviations an array containing 12 numbers which get interpreted as the deviations from the equal temerament
 *        in cents, starting from C ranging up to B
 * @param concertPitch [optional] the concert pitch in Hz, default 440
 * @constructor
 */
function TuningSystem(name, deviations, concertPitch) {

    /**
     * This function calculates the pitch in Hertz given this tuning system, given a note object.
     *
     * @param note the note object
     * @returns the pitch in Hz as a {number}
     */
    this.getPitchForNote = function (note) {
        var deviation = this.deviations[note.noteIndex]; // deviation in cents
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
            deviations.push(this.deviations[index])
        }
        return deviations;
    };

    this.name = name;
    this.concertPitch = concertPitch ? concertPitch : DEFAULT_CONCERT_PITCH_FREQ;
    this.deviations = deviations;

    if (!deviations.length === 12) {
        throw new Error("Deviations has to be an array containing the deviations from equal temerament in cents.");
    }
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
        data = JSON.parse(json);
        return TuningSystems.loadFromObject(data);
    },

    loadFromObject: function (parsedJson) {
        parsed = {};

        for(key in parsedJson) {
            try {
                var name = parsedJson[key].name;
                var deviations = parsedJson[key].deviations;
                parsed[key] = new TuningSystem(name, deviations);
            } catch (e) {
                throw new TypeError("Could not data structure containing Tuning System information: " + e);
            }
        }
        return parsed;
    }
};
