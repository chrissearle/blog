---
title: DVD/CD RW under debian (2.6 kernel)
date: 2006-01-17 10:14:01 +0100
tags: [debian, dvd, cd-rom, ide-cd]
---

This is a shortened version of [udev and DVD/CD RW under debian unstable](/2005/02/12/udev-and-dvd-cd-rw-under-debian-unstable/) for non-udev systems.

To get CD and DVD burning running under debian on a 2.6.x kernel

Under 2.6 ide-scsi (SCSI emulation) is deprecated. It's recommended to use ide-cd instead.

So - you need to make sure you're using ide-cd. Any references to ide-scsi need to be removed from lilo (and grub if that required the references).

Make sure that ide-cd is loaded (modprobe ide-cd) - you may want to add it to /etc/modules

Now - make sure that your /dev directory is correctly set up

For example on my box:

    $ ls -l /dev/cd* /dev/dvd* /dev/hdc
    lrwxrwxrwx 1 root root      3 Jan  4 08:10 /dev/cdrom -> hdc
    lrwxrwxrwx 1 root root      3 Jan  4 08:10 /dev/cdrw -> hdc
    lrwxrwxrwx 1 root root      3 Jan  4 08:10 /dev/dvd -> hdc
    brw-rw---- 1 root cdrom 22, 0 Jan  4 08:10 /dev/hdc

Now - to use cdrecord - I use 

    cdrecord dev=/dev/cdrw /path/to/image.iso

Note - due to some access problems in the kernel - I use this via sudo.

Edit: Merged both articles into one and placed it on [Debian Administration](http://www.debian-administration.org/articles/333)
