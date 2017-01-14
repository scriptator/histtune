/**
 * Created by johannesvass on 14.01.17.
 */

const DEFAULT_CONCERT_PITCH = 440;

function TuningSystem(name, deviations, concertPitch) {

    this.name = name;
    this.concertPitch = concertPitch ? concertPitch : DEFAULT_CONCERT_PITCH;

    this.deviations = this.parseDeviations(deviations);

    if (!deviations) {
        throw new Error("Can't init TuningSystem " + name + " because the deviation structure could not be parsed.");
    }

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
     * This function calculates the pitch in Hertz given this tuning system, given a note object.
     *
     * @param note the note object
     * @returns the pitch in Hz as a {number}
     */
    this.getPitchForNote = function (note) {
        // TODO all the magic

        return DEFAULT_CONCERT_PITCH;
    };

    /**
     *
     * @param deviations
     */
    this.parseDeviations = function (deviations) {

    };
}

function Deviation() {

}

function Note(midiNote) {
    // TODO implement a note data structure
}

var TuningSystems = {
    GLEICHSCHWEBEND: new TuningSystem("Gleichschwebend Temperierte Stimmung", )
};