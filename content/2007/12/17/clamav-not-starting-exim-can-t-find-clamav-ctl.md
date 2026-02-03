---
title: Clamav not starting (exim can't find clamav.ctl)
date: 2007-12-17 18:36:14 +0100
tags: [debian, exim4, clamav]
---

My exim4 process is configured based on [this post](/2005/05/19/sendmail-exim4/) and other points [noted here](/tags/exim4/).

Today it started failing - clamav failed to read its db (locked) possibly due to freshclam runs.

[Debian bug](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=454587) gave the hint - the packages in volatile have this fixed (a non-security update that fixes this issue in stable).

So - added to my apt-config:

    deb http://volatile.debian.org/debian-volatile etch/volatile main contrib non-free
