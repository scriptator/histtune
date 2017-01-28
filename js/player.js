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

var PlayerStates = Object.freeze({STOPPED: 0, PAUSED: 1, PLAYING: 2});


function Player() {

    this.state = PlayerStates.STOPPED;

    this.getState = function() {
        return this.state;
    };

    this.play = function(midiFile) {
        // stop currently playing song if there is one
        if (this.state != PlayerStates.STOPPED) {
            this.stop();
        }

        // play the new file
        this.midiFile = midiFile;
        this.synth = Synth(44100, getSelectedTemperament());
        this.replayer = Replayer(this.midiFile, this.synth, OrganProgram);
        this.audio = AudioPlayer(this.replayer);
    };

    this.pause = function() {

    };

    this.stop = function() {

    };

    return this;
}




// if(FileReader){
//     function cancelEvent(e){
//         e.stopPropagation();
//         e.preventDefault();
//     }
//     document.addEventListener('dragenter', cancelEvent, false);
//     document.addEventListener('dragover', cancelEvent, false);
//     document.addEventListener('drop', function(e){
//         cancelEvent(e);
//         for(var i=0;i<e.dataTransfer.files.length;++i){
//             var
//                 file = e.dataTransfer.files[i]
//                 ;
//             if(file.type != 'audio/midi'){
//                 continue;
//             }
//             var
//                 reader = new FileReader()
//                 ;
//             reader.onload = function(e){
//                 midiFile = MidiFile(e.target.result);
//                 synth = Synth(44100, getSelectedTemperament());
//                 replayer = Replayer(midiFile, synth, OrganProgram);
//                 audio = AudioPlayer(replayer);
//             };
//             reader.readAsBinaryString(file);
//         }
//     }, false);
// }