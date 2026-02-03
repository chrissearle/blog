---
title: Incorrect time and date on ReadyNAS
date: 2012-04-11 23:40:01 +0200
tags: [ntp, readynas]
---

My ReadyNAS (pro 6) had suddenly been set to 1992.

It seems that the NTP servers (FrontView > System > Clock) that I had time-a.netgear.com and time-c.netgear.com were way off base.

I set them to the debian NTP servers that I use (0.debian.pool.ntp.org and 1.debian.pool.ntp.org) and it fixed the datetime back again.

Not sure how to contact them - have sent an e-mail - we'll hope that it reaches the right people.

## Update

They reset the involved servers. However - I now have a local NTPD which sync's off debian's so I now use that.
