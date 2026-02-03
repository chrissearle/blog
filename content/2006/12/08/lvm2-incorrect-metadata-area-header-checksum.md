---
title: LVM2 - Incorrect metadata area header checksum
date: 2006-12-08 13:38:08 +0100
tags: [debian, lvm2]
---

I have most of my debian boxes using lvm2. On one (sadly my main server I was getting):

    Incorrect metadata area header checksum

but everything seemed to be working.

So - I ran vgscan. This stated that there was a problem on /dev/hdd. Well - /dev/hdd is a cdrom unit - so no lvm there.

I edited /etc/lvm/lvm.conf and changed

    filter = [ "r|/dev/cdrom|" ]

to

    filter = [ "r|/dev/cdrom|", "r|/dev/hdd|" ]

which solves the issue for me.
