---
title: Rescuing a dead lvm install
date: 2006-04-18 18:59:44 +0200
tags: [debian, lvm2]
---

One of my machines has an lvm2 volume group spread across three disks. One died - here's how I rescued some of the data

Very luckily - the dead disk contained one whole logical volume - used for media storage. This meant that all the other logical volumes were there - but - lvm wouldn't start.

If I'd found out about it in time then this should have been enough:

    vgreduce --removemissing vg0

However - by the time I found that the system was in a worse state (wouldn't boot even to single user mode).

So - here's how I got the data off using knoppix.

Boot to knoppix then switch to a tty.

The device mapper module is present - but not lvm - let's sort that out

    modprobe dm_mod
    apt-get update
    apt-get install lvm2

Now we can start using it. Let's get the tool symlinks in place

    cd /sbin
    ln -s lvmiopversion vgscan
    ln -s lvmoipversion vgchange

Now we can look at the data

    vgscan
    vgchange -a y
    cd /mnt
    mkdir home
    mount -t xfs /dev/mapper/vg0-home home

Notes - I've got xfs logical volumes. All the volumes that were not on the dead disk are mountable. I had already run the vgreduce command before this point.

My thanks to Klaus Pieper and the debian-users mailing list for this one :) A life saver.
