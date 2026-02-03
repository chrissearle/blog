---
title: Resizing boot/root partition
date: 2005-12-29 17:14:25 +0100
tags: [debian]
---

Background: A debian machine (unstable) with a 100Mb root/boot ext3 partition (hda1), a 500Mb swap space (hda2) and the rest of the disk under lvm2 (hda3).

Problem: I use a custom kernel (needs the EVMS block device kernel patch). And not enough space to build or install the next kernel - 100Mb is simply too small.

Solution

1.  Create a 256Mb swap space under the lvm2 area [mkswap]
1.  Remove the old swap space (remove partition) and create a new one using only half the space (leaving space after hda1) [fdisk, mkswap]
1.  Configure both swap disks in fstab (use pri=nn option to use hda2 first)
1.  Boot into knoppix (I used the 4.0.2 CD)
1.  In fdisk note the start cylinder of hda1 then delete hda1
1.  Create a new hda1 - make sure it uses the same start cylinder but now fills all the space up to hda2
1.  Commit the partition table (I needed to reboot knoppix for the kernel to update its view)
1.  Run e2fsck -f /dev/hda1
1.  Run resize2fs -p /dev/hda1
1.  Reboot from disk - all done

Notes - I use grub - I assume that lilo will also tackle this - but - no guarantees.
