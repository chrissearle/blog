---
title: Time machine on a large external disk as a sparseimage
date: 2009-04-01 22:51:43 +0200
tags: [mac, backup, osx, nas, network attached storage, time machine, readynas, storage]
---

Having a very large external disk I wanted to limit Time Machine to use only part of it.

To do so - you can use the same technology as time capsule does - sparseimages.

In the following:

HOSTNAME is the result of:

    hostname -s

MAC is the mac address of the network adapter:

    ifconfig en0 | grep ether | sed -e "s/.*ether //" | sed -e "s/://g"

**Utilities**

[Time Tamer](http://www.drobo.com/droboapps/downloads/index.php?id=16):

This grabs both HOSTNAME and MAC for you and then runs:

    hdiutil create -size 500g -fs HFS+J  -volname "TM-backup-of-HOSTNAME" /Volumes/Drivename/HOSTNAME_MAC.sparsebundle

But - although backup works - restore shows only one backup - you have to option click the time machine icon and choose "Browse other Time Machine disks" - and then select the sparseimage backup. A workaround but inelegant. This drive is also included by spotlight - you have to add it to the Private list for spotlight config to exclude it.

[BackMyFruitUp](http://code.google.com/p/backmyfruitup/):

Again this will handle finding HOSTNAME and MAC. Then it will run:

    hdiutil create -nospotlight -imagekey sparse-band-size=131072 -size 500g \
    -fs "Case-sensitive Journaled HFS+" -volname "Backup of HOSTNAME" \
    /Volumes/Drivename/HOSTNAME_MAC.sparsebundle

Again - although backup works - restore shows only one backup - you have to option click the time machine icon and choose "Browse other Time Machine disks" - and then select the sparseimage. And in this case I seem to need the sparseimage mounted first. However - I do prefer the -nospotlight setting - I don't really want my time machine files turning up in spotlight searches.

I'm not sure why this is failing - it is the same technology that is used to support Time Machine on a Time Capsule - just that its local and not over the network. I wonder if the backup process detecting the sparseimage says "find an image with servername and mac address of en0" but the restore process says "find an image with servername and the mac address of the network connection in use" or something similar. But this is just guessing.

I have also not tried restore of OSX from a Time Machine backup.

At this point I repartitioned the disk to give to real partitions.

**ReadyNAS**

However - a new firmware for my NAS (ReadyNAS NV+) now includes the ability to use it as if it were time capsule - you enable Time Machine support and it then just appears in the list of available drives.

This is again using a sparseimage - but this time the time machine gui shows all backups - no option clicking or anything ;)

Both my machines are now backing up to the NAS and from the ReadyNAS forums you can see that system restore also works (although I've not yet tested it personally).
