---
title: Scroll wheel in debian guest after updating virtualbox from 3.x to 4.x
date: 2011-03-08 12:43:52 +0100
tags: [linux, debian, virtualbox, xorg, scrollwheel, zaxismapping]
---

After update from virtualbox 3.x to 4.x the scroll wheel of my mouse stopped working - just behaved as a three button mouse.

Newer versions of debian no longer have an xorg.conf file - since it's not normally needed.

After some searching I found that it has a config loading directory /usr/share/X11/xorg.conf.d/ and virtualbox had added a 50-vboxmouse.conf there.

I changed this file from

<pre><code>Section "InputClass"
        Identifier      "vboxmouse"
        MatchDevicePath "/dev/vboxguest"
        Driver          "vboxmouse"
EndSection</code></pre>

to

<pre><code>Section "InputClass"
        Identifier      "vboxmouse"
        MatchDevicePath "/dev/vboxguest"
        Driver          "vboxmouse"
        Option          "Buttons" "5"
        Option          "ZAxisMapping" "4 5"
EndSection</code></pre>

and I have my scroll wheel back.
