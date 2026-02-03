---
title: E-mail validators that fail to validate correct addresses
date: 2010-05-12 07:14:16 +0200
tags: [web, mail, e-mail, validation, web form]
---

This drives me nuts. Forms that simply reject e-mail addresses with a + in them (perfectly valid according to the standards/RFC's - see [RFC 2822](http://www.faqs.org/rfcs/rfc2822.html) 3.2.4 Atom - definition of atext).

Why would you want a + ? Well - in my case it allows me to have user+uniquestring@chrissearle.org - therefore allowing me to use unique addresses per site I use. All pretty normal stuff. But - web validators just don't seem to get it (and in some cases the companies behind it aren't interested in fixing it either). Only a short list to start with (there have been more instances of this than I can recall right now).

Sites that do the same thing (will be added to as I find more):

* gigaset.siemens.com
* geocaching.com
* groundspeak.com
* britishairways.com
* steampowered.com
* pearltrees.com
* marksandspencer.com
* lynda.com
* play.com

Reasonably uninteresting - but - really annoying.
