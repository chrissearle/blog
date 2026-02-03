---
title: Squid proxying and whatsmyip.net and similar services
date: 2006-11-17 19:42:55 +0100
tags: [mac, networking, internet]
---

Just a quick note.

If you configure the mac's HTTP proxy under network system settings to point to a squid server on your local network - then whatsmyip.net et al return your internal IP (in my case a 192.168.1.x one) - instead of the real external address.

Very confusing when you can't work out how an internal IP is getting out there - it isn't.

Could well be the same (in fact I expect it would be) for windows, linux too.
