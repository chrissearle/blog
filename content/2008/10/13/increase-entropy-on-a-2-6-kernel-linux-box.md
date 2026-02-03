---
title: Increase entropy on a 2.6 kernel linux box
date: 2008-10-13 17:35:14 +0200
tags: [linux, debian, entropy, rng-tools]
---

A good source of entropy is needed for random number generation. This affects services that go via SSL amongst other things.

However - in 2.6.x kernels the entropy sources of a system were reduced - as far as I can see it now is only affected by keyboard, mouse and some IRQ interrupts.

Why is this important? Well - there are two [random number sources](http://en.wikipedia.org/wiki/Urandom) on linux - /dev/random and /dev/urandom. /dev/random will **block** if there is nothing left in the entropy bit bucket. /dev/urandom uses the same bucket - but will not block (it can reuse the pool of bits).

You can see how many bits entropy you have available by looking in /proc/sys/kernel/random/entropy_avail (just cat it like a normal text file).

I had normally between 100 and 200 - way way too low for many SSL processes to work efficiently.

My server has no keyboard and no mouse and I have no idea if the IRQ calls for my network driver pass the required flag to be considered.

So - what to do?

Most suggestions are around hardware generators or listening to ambient noise.

However - I have found that the tools rng-tools that are used for dealing with hardware random number generators can be pressed into a somewhat hacked service by making the system take /dev/urandom (the non-blocking one) as a hardware source to feed the bucket.

Process for debian etch:

1. <code>apt-get install rng-tools</code>
2. Edit <code>/etc/default/rng-tools</code>
3. Set <code>HRNGDEVICE=/dev/urandom</code>
4. Run <code>/etc/init.d/rng-tools start</code>

This immediately gave me an entropy bucket averaging around 2000 and maxing up over 4000.

This has meant that many services that were slow or were timing out are now working.

Note - I make no comment on how secure this is (some dislike the idea of /dev/urandom), or if it is a good idea - all I can say is that I can now use services that were blocking before.
