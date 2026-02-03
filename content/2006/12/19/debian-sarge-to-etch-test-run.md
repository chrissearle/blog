---
title: Debian sarge to etch test run
date: 2006-12-19 12:38:20 +0100
tags: [debian]
---

I have two servers running debian sarge (stable). Etch is nearly ready to go stable (in hard freeze) so I decided to test the upgrade on the least important box.

This box has apache, samba, gnump3d (music).

First I switched all the apt sources over to etch.

Then I ran <code>apt-get update</code>, followed by an <code>aptitude update</code> (aptitude seems to get confused with sources changes without the apt-get update).

Finally - <code>aptitude dist-upgrade</code>. This threatened to remove my kernel image (2.6.8) and not install a new one.

So - <code>aptitude install linux-iamge-2.6.18-686</code>. This wanted to install a new kernel and remove the old one. Not so good - but - if necessary then OK. However - during config it moaned about this being a first time lilo install (all my boxen run grub instead). So - <code>aptitude install linux-image-2.6.18-686 grub</code> and finally it installed a new kernel.

Reboot to the 2.6.18 kernel (the 2.6.8 was gone at this point) and it booted OK. Now re-run the dist-upgrade. This worked for all packages except ssh. That had problems - couldn't install openssh-server and openssh-client. I had to purge ssh and then install these two packages to get them in place.

Finally - the box is running etch.
