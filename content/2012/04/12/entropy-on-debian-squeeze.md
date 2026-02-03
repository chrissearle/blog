---
title: Entropy on debian squeeze
date: 2012-04-12 13:51:26 +0200
tags: [debian, entropy, squeeze, haveged]
---

Struggling again to get a decent amount of entropy on a headless squeeze server.

* rng-tools + /dev/urandom wasn't working (and feels wrong too)
* randomsound needs a soundcard
* [entropy key](http://www.entropykey.co.uk/) would have to be purchased and sent to Germany and then a monthly fee to have the thing connected
* [timer_entropyd](http://www.vanheusden.com/te/) wasn't giving me much

So I just found that in [squeeze-backports](http://packages.debian.org/squeeze-backports/haveged) and [wheezy](http://packages.debian.org/wheezy/haveged) there's a package for [haveged](http://www.issihosts.com/haveged/index.html).

This had an instant effect - instead of hovering around 150 in /proc/sys/kernel/random/entropy_avail - it's now moving between 1k (default minimum is set to 1024 in /etc/default/haveged) and ca 4k (IIRC the pool itself is only 4k big).
