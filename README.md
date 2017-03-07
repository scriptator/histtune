# Wunderwelt _histtune_

Histtune is my final project of the course *Wunderbare Welt der musikalischen Akustik: Synthese* at the *University of Vienna*.

It lets you explore historical tuning systems and compare them with our usual *equal temperament* by playing examples.
The major point is, however, that it is a full MIDI player, where you can play your own MIDI files in a chosen temperament.

The frontend part is rather ugly because I only put it together quickly using jQuery. However, the logic behind the tuning
systems is quite good, I think.

## Demo

Visit https://scriptator.github.io/histtune/ for a demo instance.

## Run locally

You need to serve histtune from some webserver because otherwise the cross-origin policy of today's browsers disallows
for making XHR requests. For development I suggest the following very simple solution:

* **cd** into the repository root
* execute: **python3 -m http.server**
* --> the website will be served under http://localhost:8000

## Add further tuning systems

Per default the JSON file *default_tuning_systems.json* is loaded on application startup. If you want to adapt the
systems it will be the easiest to edit this very file. Just stick to the format imposed by the existing entries in there.

As soon as you are done you just need to reload the website and the changes will be displayed and new entries will
show up in the selection and plots.
