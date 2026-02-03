---
title: udev and DVD/CD RW under debian unstable
date: 2005-02-12 16:18:15 +0100
tags: [debian, dvd, cd-rom, ide-cd, udev]
---

To get CD and DVD burning running under debian unstable on a 2.6.x kernel

Under 2.6 ide-scsi (SCSI emulation) is deprecated. It's recommended to use ide-cd instead. Using ide-cd under debian will also correctly set up sysfs details to help you get udev to auto-create the correct devices.

So - first make sure you're using ide-cd. This means - make sure you remove ide-scsi from lilo.conf (not sure about grub), and then check `/etc/modules`. It should contain the line ide-cd and not ide-scsi.

Secondly, the udev packages have done the work required to get udev to recognise the devices.

udev processes the rules files in `/etc/udev/rules.d` in alphanumeric order. If you use the non-devfs naming style (which I prefer) the file `/etc/udev/udev.rules` is symlinked into `/etc/udev/rules.d`.

In `/etc/udev` there is also a file called cd-aliases.rules. To get the aliases for CDROM, CDRW, DVD, DVDRW all you need to do is to symlink this into `rules.d`.

So, as root (or use sudo)

```shell
# cd /etc/udev/rules.d
# ls -l
lrwxrwxrwx  1 root  root  13 2004-10-15 12:51 udev.rules -> ../udev.rules
# ln -s ../cd-aliases.rules .
# ls -l
lrwxrwxrwx  1 root  root  13 2004-12-18 12:12 udev.rules -> ../cd-aliases.rules
lrwxrwxrwx  1 root  root  13 2004-10-15 12:51 udev.rules -> ../udev.rules
```

Restarting udev will (since the ide-cd module is loaded) find the correct info in sysfs (`/sys`) to correctly generate devices.

For example on my home box:

```shell
$ ls -l /dev/cd*
lrwxrwxrwx  1 root root 3 2005-01-20 19:45 /dev/cdrom -> hdc
lrwxrwxrwx  1 root root 3 2005-01-20 19:45 /dev/cdrom1 -> hdd
lrwxrwxrwx  1 root root 3 2005-01-20 19:45 /dev/cdrw -> hdd
```

And it's identified hdc and hdd correctly so that they are members of the cdrom group.

One issue with this is that cdrecord and dvdrecord even with using dev=ATAPI seem to want the generic scsi devices too. I've not looked into this too much, so it could be just a config error, but for DVD burning I tend to use growisofs since this talks direct to the ide device.
