---
title: Setting up encrypted partitions using dm-crypt
date: 2005-09-17 10:16:47 +0200
tags: [debian, lvm2, encryption]
---

All you need to know is found here [http://deb.riseup.net/storage/encryption/dmcrypt/](http://deb.riseup.net/storage/encryption/dmcrypt/)

**Comments**

- Stock debian 2.6 kernel works just fine
- Stock debian kernel is modular - so looking in /proc/crypto before you start won't show aes, and dmsetup targets won't show crypto
- Here - I'm adding an lvm2 partition for this (the comments at the end of the above link about lvm are about putting lvm pv's onto a crypt partition - here I have a crypt partition on top of lvm - so the comments do not apply)
- On a different machine I've used a partition on an USB external harddisk which works too (you will need to remount if you unplug the USB and replug while mounted)
- The above link has details of using loopback too

Code executed:

```shell
aptitude install dmsetup cryptsetup
lvcreate -L 1G -n crypt vg
cryptsetup -y create private /dev/mapper/vg0-crypt
mkfs -t xfs /dev/mapper/private
mkdir /mnt/private
```

Two new scripts (I do not want the partition automounted):

_mount_private:_

```shell
#!/bin/bash
if [ -b /dev/mapper/private ]; then
    cryptsetup remove private
fi
cryptsetup create private /dev/mapper/vg0-crypt
mount -t xfs /dev/mapper/private /mnt/private
```

_umount_private:_

```shell
#!/bin/bash
umount /mnt/private
cryptsetup remove private
```
