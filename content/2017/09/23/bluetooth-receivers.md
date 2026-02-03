---
title: Bluetooth receivers
date: 2017-09-23 08:25 +0200
tags: [bluetooth, dalek, arduino]
image: /images/posts/2017/09/receiver.jpg
intro: Small bluetooth receiver for using with 3D prints to provide sound
---

So the Dalek needs to be able to play back Dalek noises.

I did wonder about arduino, wave shields etc - but I decided on a simpler approach.

I'll give it a bluetooth audio receiver and just use my phone to playback (any music app - iTunes or whatever). Then the sounds can just be audio files (and I can also use it as a bluetooth speaker for other things).

So I found that there is a cheap stereo bluetooth receviver out there - the BLK-MD-SPK-B-G. For more specs you can take a look at [the wiki page](https://www.elecfreaks.com/wiki/index.php?title=BLK-MD-SPK-B)

I'll need to connect some kind of speaker set to pins 3/4/5 and give it power on 12/13.

It's set up for a single cell lipo (wants power between 3.4 and 4.2v) - and I'm planning on powering from a USB charger - so I'll need a simple voltage divider or regulator here.

Oh - and it's far far smaller than I expected. Didn't read the specs :) I thought it'd be about 20x30 mm - it's actually 14x23 mm and with very very small soldering points. Will have to solder really carefully.

![BLK-MD-SPK-B-G bluetooth receiver in hand](/images/posts/2017/09/receiver.jpg)
