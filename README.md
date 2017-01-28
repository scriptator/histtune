# Wunderwelt _histtune_

Histtune is my final project of the course *Wunderbare Welt der musikalischen Akustik: Synthese* at the *University of Vienna*.

It lets you explore historical tuning systems and compare them with our usual *equal temperament* by playing examples.
The major point is, however, that it is a full MIDI player, where you can play your own MIDI files in a chosen temperament.


## Run locally

You need to serve histtune from some webserver because otherwise the cross-origin policy of today's browsers disallows
for making XHR requests. For development I suggest the following very simple solution:

1) **cd** into the repository root
2) execute: **python3 -m http.server**
3) the website will be served under http://localhost:8080