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

    Drag&Dop Functionality taken from:
    http://bootsnipp.com/snippets/featured/bootstrap-drag-and-drop-upload
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
        this.synth.setTemperament(temperament);
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

var player = new Player(playerStateChangeHandler);
var userMidiFiles = {};

/**
 * Load the player functionality.
 */
$(document).ready(function() {
    initDragAndDrop();

    initTuningSystems(function(systems) {
        renderAvailableTemperaments(systems, "#temperamentSelect");
    });
});

function initDragAndDrop() {
    var dropZone = document.getElementById('drop-zone');
    var uploadForm = document.getElementById('js-upload-form');

    uploadForm.addEventListener('submit', function(e) {
        var uploadFiles = document.getElementById('js-upload-files').files;
        e.preventDefault();

        addMIDIFilesToList(uploadFiles)
    });

    dropZone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';

        addMIDIFilesToList(e.dataTransfer.files)
    };

    dropZone.ondragover = function() {
        this.className = 'upload-drop-zone drop';
        return false;
    };

    dropZone.ondragleave = function() {
        this.className = 'upload-drop-zone';
        return false;
    }
}

/**
 * Loads a list of files into the list of MIDI files displayed at the top of the page.
 *
 * @param files an array of files
 */
function addMIDIFilesToList(files) {
    for (var i=0; i < files.length; i++) {
        var file = files[i];
        var reader = new FileReader();
        reader.onload = function () {
            userMidiFiles[file.name] = reader.result;
            renderUserMidiFiles();
        };
        reader.readAsBinaryString(file);
    }
}

/**
 * Rerenders the whole list of user-provided midi files from the variable userMidiFiles
 */
function renderUserMidiFiles() {
    var el = $("#user-midi-file-list");
    el.empty(); // remove old entries
    $.each(userMidiFiles, function(filename, data) {
        var entry = $('<li><a href="javascript:void(play(&quot;' + filename + '&quot;))">' + filename + '</a></li>');
        el.append(entry);
    });
}

function loadRemote(path, callback) {
    var fetch = new XMLHttpRequest();
    fetch.open('GET', path);
    fetch.overrideMimeType("text/plain; charset=x-user-defined");
    fetch.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            /* munge response into a binary string */
            var t = this.responseText || "" ;
            var ff = [];
            var mx = t.length;
            var scc= String.fromCharCode;
            for (var z = 0; z < mx; z++) {
                ff[z] = scc(t.charCodeAt(z) & 255);
            }
            callback(ff.join(""));
        }
    };
    fetch.send();
}


function play(identifier, file) {
    if (file) {
        loadRemote(file, startPlaying);
    } else {
        startPlaying(userMidiFiles[identifier])
    }

    function startPlaying(data) {
        var midiFile = new MidiFile(data);
        player.play(identifier, midiFile, getSelectedTemperament());
    }
}

function playerStateChangeHandler(identifier, state) {
    console.log(identifier + ": " + state)
}


function getSelectedTemperament() {
    var option = $('#temperamentSelect').find('input:radio:checked').attr("id");
    return systems[option];
}

function onTemperamentChange(event) {
    var identifier = event.currentTarget.children[0].id;
    player.setTemperament(systems[identifier]);
}

/**
 * This function hacks the available temperaments into a container with a given id. Each tuning system gets rendered
 * as a Radio, styled like a bootstrap button.
 *
 * @param tuningSystems a dict of (identifier, TuningSystem)
 * @param containerId the id of the container to display the data in
 */
function renderAvailableTemperaments(tuningSystems, containerId) {
    var options = {};
    for(key in tuningSystems) {
        options[tuningSystems[key].name] = key;
    }

    var first = true;
    var $el = $(containerId);
    $el.empty(); // remove old options
    $.each(options, function(key,value) {
        console.log("Creating new option for " + key);
        var label = $('<label class="btn btn-primary" onclick="onTemperamentChange(event)"><input type="radio" name="options"></label>')
            .append(key);
        label.children(":first").attr("id", value);
        if (first) {
            label.addClass("active");
            label.children(":first").prop('checked', true);
            first = false;
        }
        $el.append(label);
    });
}