---
title: Updating Allsky to INDI Allsky
date: 2026-10-08 17:02 +0200
category: Photography
tags: [raspberry pi, 3d printing, astrophotography, timelapse, allsky, keogram, star trail]
intro: Updating the software on my Allsky camera to INDI Allsky
---

Back in [March](/2026/03/08/allsky-camera/) I posted about setting up my Allsky camera.

This used software from [AllskyTeam/allsky](https://github.com/AllskyTeam/allsky).

I recently found [aaronwmorris/indi-allsky](https://github.com/aaronwmorris/indi-allsky) which uses standard INDI drivers instead of direct camera control and which has a bunch of extras that are nice to have. It also updates via the standard debian apt update system which makes upgrading a lot simpler.

The hardware is the same - all the updates were made over the network.

Live public view: [allsky.chrissearle.org](https://allsky.chrissearle.org/indi-allsky/)

As well as the current view, timelapse and keograms of the old setup this one has the ability to add satellites passing, planet positions, and even aircraft overhead (pulling info from another Pi I have with an ADSB receiver).

