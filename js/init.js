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
var player = new Player(playerStateChangeHandler);

/**
 * Entry point of the webapp. All the initialization is triggered here.
 */
$(document).ready(function() {
    initTuningSystems();
    initDragAndDrop();
});

function initTuningSystems() {
    $.get("default_tuning_systems.json", function(data) {
        systems = TuningSystems.loadFromObject(data);

        renderAvailableTemperaments(systems, "#temperamentSelect");
        initCharts(systems);
    });
}

function initDragAndDrop() {
    var dropZone = document.getElementById('drop-zone');
    var uploadForm = document.getElementById('js-upload-form');

    var startUpload = function(files) {
        console.log(files)
    };

    uploadForm.addEventListener('submit', function(e) {
        var uploadFiles = document.getElementById('js-upload-files').files;
        e.preventDefault();

        startUpload(uploadFiles)
    });

    dropZone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';

        startUpload(e.dataTransfer.files)
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


function play(file) {
    loadRemote(file, function(data) {
        var file = new MidiFile(data);
        player.play(file.toString(), file, getSelectedTemperament());
    })
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