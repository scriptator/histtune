/*
    Copyright (c) 2017, Johannes Vass
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

var PlayerStates = Object.freeze({STOPPED: 0, PLAYING: 1});

/**
 * A wrapper around the jasmid library for providing the convenience of stopping and calling back if somethings happens
 * without needing to change the library too much.
 *
 * The given callback object is called with the identifier of the current song and its state after a state change took
 * place. If a stopped player is stopped again, no state change will happen and therefore also no callback.
 *
 * @param callback the above described callback
 * @returns {Player}
 * @constructor
 */
function Player(callback) {

    this.state = PlayerStates.STOPPED;
    this.callback = callback;

    this.getState = function () {
        return this.state;
    };

    this.setTemperament = function (temperament) {
        if (this.synth) {
            this.synth.setTemperament(temperament);
        } else {
            this.synth = Synth(44100, temperament);
        }
    };

    this.play = function (identifier, midiFile, temperament) {
        // stop currently playing song if there is one
        if (this.state !== PlayerStates.STOPPED) {
            this.stop();
        }

        // play the new file
        this.identifier = identifier;
        this.midiFile = midiFile;
        this.synth = Synth(44100, temperament);
        var replayer = Replayer(this.midiFile, this.synth, OrganProgram);
        this.audio = AudioPlayer(replayer, {}, this, this.stop);

        this.state = PlayerStates.PLAYING;
        this.callback(this.identifier, this.state);
    };

    this.stop = function () {
        if (this.state === PlayerStates.PLAYING) {
            this.state = PlayerStates.STOPPED;
            this.audio.stop();
            this.callback(this.identifier, this.state);
        } else {
            console.log("Requested to stop but was not playing: " + this.state);
        }
    };

    return this;
}
