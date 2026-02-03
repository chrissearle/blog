---
title: Backing up Aperture Vault to a NAS
date: 2008-10-01 08:52:23 +0200
tags: [mac, backup, aperture, osx, rsync, nas, network attached storage, readynas]
---

Listening to [the digital story](http://www.thedigitalstory.com/blog/2008/09/its_not_just_your_ph.html) this morning prompted me to think about my Aperture setup.

Aperture has its "vault" functionality - but this only works to the local hard drive or to USB/firewire drives directly attached to the box.

I have a RAID5 based NAS (network attached storage) device which I would  far prefer to have my backups on - since I've had USB disks die on me before.

How to get the vault onto the network device?

If you google for networked aperture backups - then the normal choice that comes up is to create a disk image using disk utility and have that on the NAS. This works because it appears local when mounted.

However - it is astonishingly slow (at least for me).

My approach has been to rsync the vault from a local point to the NAS via cron (nightly run).

However - I now intend to at least test out [Create a Vault On a Network Drive](http://www.bagelturf.com/aparticles/vaults/vnet/index.php) since my NAS supports AFP although the file system is not HFS+ - we'll have to see if it works.

**Update 03/10/08**

Yes - it works. It is also very slow (this will of course be influenced by if you're on a 10, 100 or 1000 network - I use an 100) but it does work.

However - it also makes startup of Aperture very slow if the network drive is mounted. I'm not sure why - is it trying to compare the vault at startup?

I may return to using the rsync method or - just connect the drive when I want to update the vault - not sure yet.
