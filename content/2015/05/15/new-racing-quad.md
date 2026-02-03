---
title: New racing quad
date: 2015-05-15 06:50 +0200
tags: [quadcopter, FPV, "250", naze32]
category: Radio Control
image: /images/posts/2015/05/quad-3.jpg
intro: Finishing up most of the work on the FPV racing quad
---

Finally did most of the build on the new FPV racing quad.

## Background

Initial information was covered in [this blog post](/2015/04/21/racing-250-frame-change/) but the basic idea was that I had a racing FPV250 kit but I disliked the frame. I also wanted to try out the Naze32 board instead of the KK2.1 I was using.

## Naze32

The Naze32 is smaller than the KK card - about 35mm square (looks like the mount holes are 30mm apart). It has several firmware options - the commonest are baseflight and cleanflight. Both [baseflight](https://chrome.google.com/webstore/detail/baseflight-configurator/mppkgnedeapfejgfimkdoninnofofigk) and [cleanflight](https://chrome.google.com/webstore/detail/cleanflight-configurator/enacoimjcgeinfnnnpajinjgmkahmfgb) are chrome apps that connect to the naze32 board over USB. There is no onboard screen/buttons like the KK - all configuration is done via a computer.

I've gone with [cleanflight](http://cleanflight.com/) since it's being developed faster and has some more functions (baseflight is very stable so might suit you if you don't want to play around as much).

So far (initial testing) the board is working very well.

Note for naze32/cleanflight - [this youtube playlist](https://www.youtube.com/playlist?list=PLYsWjANuAm4p47OBBTOo4Xr3lNUc8PFpc) covers nearly everything. Video 1 is initial setup, video 2 covers things like getting stick movement max/min set correctly - and that's likely enough to get you going.

I've also set up VBAT monitoring and am using the buzzer that came with the KK2.1 card. This gives both signals for low battery as well as others. For example - I've used an AUX channel (channel 5) on the radio and a [cleanflight mode](https://github.com/cleanflight/cleanflight/blob/master/docs/Modes.md) setting (BEEPER) to allow me to turn on the beeper from the radio. This means I can find it if it gets lost in long grass or similar (I hope). The last channel (have a 6 channel rx) I've used to allow switching between ACRO/RATE (that's manual mode), ANGLE (original self-levelling) and HORIZON (new self-levelling) modes.

## Other

I am also waiting on some WS2812 programmable LED strips to set up signalling LEDs on the underside so I can see status in the distance. I will likely add some kind of OSD as well.

One of the frame switches on the PDB board is used for the FPV gear - so that can be turned on or off. To keep the power filter board (which takes a balance plug) I took a simple 3s balance plug extension cable - and took just the plug end, removed everything except the outermost two pins and just soldered that to the FPV power points on the frame's power board.

## Pics

![Arms folded](/images/posts/2015/05/quad-1.jpg)

![Showing mounting of FPV cam (mobius on top is for filming and still needs a strap](/images/posts/2015/05/quad-2.jpg)

![Arms open](/images/posts/2015/05/quad-3.jpg)
