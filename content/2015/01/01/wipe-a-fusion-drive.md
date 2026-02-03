---
title: Wipe a fusion drive
date: 2015-01-01 12:07 +0100
tags: [osx, fusion, diskutil, mac]
intro: How to wipe a fusion drive and then when it has become two partitions - rebuild it back to a fusion drive
---

### Background

So - my iMac was misbehaving recently and diskutil stated that the disk needed repair.

This is not usually so big an issue - boot to recovery - start diskutil and repair.

However - this time it stated that it couldn't repair the disk even from a recovery boot.

### Intention

Since this has been upgraded a couple of times - I thought I'd make a nice clean start. Created a complete running backup on a USB disk with [SuperDuper](http://www.shirt-pocket.com/SuperDuper/), create a bootable USB disk with [Diskmaker X](http://liondiskmaker.com/) (yes - I know you can do it by hand but this makes it a lot simpler) and then wipe the disk completely.

So - backup made - boot to USB disk. Start disk utility - and get the message that it can't partition the fusion disk (create a new clean partition).

What to do?

Googling led me to the following info. It appears that a fusion drive is based on the concepts of a logical volume system similar to lvm - but managed with diskutil.

### Warning

**Note that this will not be recoverable. Make sure of your backups _before_ you start.**

While this worked for me - and seems common advice online - it's up to you to decide if you are going to try it - I take no responsibility if it trashes your system (but given that you're attempting it - it's likely trashed at some level already).

If this doesn't work for you then it'll mean a trip to apple or if you're living somewhere like me - a couple of weeks while the local reseller fixes it for you for a price and they likely won't be able to recover your data - so make sure you have it - time machine, superduper, simple copy to another disk or anything. Also remember to deauth audible/iTunes just in case (reauth them after reinstall).

### Step 1 - Erase the logical volume info

So - first - find your info - boot into recovery mode and start terminal then run

```shell
diskutil cs list
```

My laptop for example shows:

```shell
~  » diskutil cs list
CoreStorage logical volume groups (1 found)
|
+-- Logical Volume Group 01A424DC-EC8C-4AD7-89A8-788CC374D849
    =========================================================
    Name:         Macintosh HD
    Status:       Online
    ...
```

Grab the ID from the outermost Logical Volume Group - in this example 01A424DC-EC8C-4AD7-89A8-788CC374D849

Now - we're going to trash it. **Really - I mean it: Make sure of your backups.**

Run

```shell
diskutil cs delete ID
```

This removes the logical volume group.

Exit terminal to return to the recovery system.

### Step 2 - Rebuild a functioning fusion drive

Start diskutil from the recovery tool menu - it should show two drives in red - the normal and the SSD parts of the fusion drive. Click on one of them and diskutil should state that it's a damaged fusion drive and offer to fix it. Click fix.

Once this is done you have a pristine fusion drive ready for install - exit diskutil and start the normal install process.

### Result

Well - it worked for me. I can make no promises - but I ended up with a functioning undamaged fusion drive with no repairs needed after running diskutil verify disk. And my iMac is now running _much_ faster.
