---
title: Cisco SB SG200-08 Gigabit Smart Switch
date: 2015-10-30 06:44 +0100
tags: [cisco, networking, switch, snmp]
intro: First time with a managed switch at home
---

One of my switches died recently - an 8 port unmanaged gigabit switch.

I thought that this time I'd get one that supports link aggregation (the synology NAS behind it could use it) and settled for Cisco's SG200-08 - since I could get that by the next day.

It's a managed switch (first time for me) and it works fine.

Only one thing that wasn't expected - it appears that nearly all of Cisco's SG200 range support SNMP (some might need a firmware update) but not this one. It even has a different firmware format from the others. Some net posts seem to think that this is to _encourage_ you to order the larger more expensive units. I don't know - might be that it simply didn't work well enough - but whatever the reason - support it is missing.

That's a shame - nagios monitoring of Cisco switches seems to be SNMP based.

So - a nice switch, works well, management GUI works, was simple to set up - but - a little annoying that I can't easily monitor it with the setup I currently use.
