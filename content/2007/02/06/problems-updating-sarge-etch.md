---
title: Problems updating sarge -> etch
date: 2007-02-06 15:11:50 +0100
tags: [debian, upgrade]
---

The following problems:

Upgrade of kernel from 2.6.8-k7 to 2.6.18-k7 broke the network. The e1000 device was all configured up according to ifconfig and route was correct but always no route to host.

Threw a 3com card in (disabled the onboard e1000) and added pci=noacpi nolapic to the boot kernel params

All DAV, svn dav, dav_fs etc for apache has died. Had to remove them from enabled modules for the minute.

digest auth module is loading but AuthDigestFile config is not recognized

The line

    AuthDigestFile /path/to/file

needs to change to

    AuthDigestProvider file
    AuthUserFile /path/to/file

Upgrade request-tracker3.4 to 3.6 - how to upgrade db?

Proftpd won't start since it can't route IPv6 to the machine (on a side note - why does every upgrade entail finding yet another way to disable IPv6?).

Update. It starts - this is a warn not an error. Disabling IPv6 see [this post](/2005/03/17/disable-ipv6-in-a-2-6-kernel/)

Upgrade of gnokii-smsd has the following:

    Preparing to replace gnokii 0.6.5-1 (using .../gnokii_0.6.14-1_i386.deb) ...
    gnokii:x:114:
    groupdel: cannot remove user's primary group.
    dpkg: warning - old pre-removal script returned error exit status 8
    dpkg - trying script from the new package instead ...
    gnokii:x:114:
    groupdel: cannot remove user's primary group.
    dpkg: error processing /var/cache/apt/archives/gnokii_0.6.14-1_i386.deb (--unpack):
     subprocess new pre-removal script returned error exit status 8
    Errors were encountered while processing:
     /var/cache/apt/archives/gnokii_0.6.14-1_i386.deb
