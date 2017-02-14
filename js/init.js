/**
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

var systems;

/**
 * Entry point of the webapp. All the initialization is triggered here.
 */
$(document).ready(function() {
    initDragAndDrop();

    initTuningSystems(function(systems) {
        initCharts(systems);
        renderAvailableTemperaments(systems, "#temperamentSelect");
        updateTemperamentShiftRadio(getSelectedTemperament());
        updatePitchbend();
    });

    $('#pitchbend').on('input', function(e) {
        getSelectedTemperament().setPitchbend(e.target.value);
    });
});

function initTuningSystems(callback) {
    $.get("default_tuning_systems.json", function(data) {
        systems = TuningSystems.loadFromObject(data);
        callback(systems);
    });
}

var player = new Player(playerStateChangeHandler);
var userMidiFiles = {};


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
    console.log(identifier + ": " + state);
    var text;

    if (state === PlayerStates.STOPPED) {
        $("#stop-button").addClass("disabled");
        $("#restart-button").removeClass("disabled");
        text = "Gestoppt: "
    } else if (state === PlayerStates.PLAYING) {
        $("#stop-button").removeClass("disabled");
        $("#restart-button").removeClass("disabled");
        text = "Spielt gerade: "
    }

    $("#player-label").text(text + identifier);
}

/**
 * Returns the identifier of the temperament which is currently selected in the radio with id temperamentSelect
 */
function getSelectedTemperament() {
    var option = $('#temperamentSelect').find('input:radio:checked').attr("id");
    return systems[option];
}

function onTemperamentChange(event) {
    var identifier = event.currentTarget.children[0].id;
    var temperament = systems[identifier];
    player.setTemperament(temperament);
    updateTemperamentShiftRadio(temperament);
    updateSeries(temperament);
    updatePitchbend();
}

function shiftTemperament(note) {
    var temperament = getSelectedTemperament();
    temperament.shift(note);
    updateSeries(temperament);
}

function updateTemperamentShiftRadio(temperament) {
    var rootNote = temperament.getCurrentRootNote();
    var container = $('#rootNoteSelect');
    container.children().removeClass("active");

    if (rootNote === undefined) {
        container.children().addClass("disabled");
    } else {
        container.children().removeClass("disabled");
        setRadioChecked(container.find("#NOTE_" + rootNote).parent(), true);
    }
}

function updatePitchbend() {
    getSelectedTemperament().setPitchbend($("#pitchbend").val());
}

function setRadioChecked(label, val) {
    if (val) {
        label.addClass("active");
        label.children(":first").prop('checked', true);
    } else {
        label.removeClass("active");
        label.children(":first").prop('checked', false);
    }
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
            setRadioChecked(label, true);
            first = false;
        }
        $el.append(label);
    });
}