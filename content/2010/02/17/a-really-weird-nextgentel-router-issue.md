---
title: "A really weird #NextGenTel router issue"
date: 2010-02-17 07:28:15 +0100
tags: [mac, isp, adsl, nextgentel, ngt, xmpp, jabber]
---

### Router trouble

Thursday the 11th February - the router from my ISP (NextGenTel) suddenly entered a constant restart loop. Start, find DSL, find settings, connect, 2 sec or so uptime, reboot and off we go again.

This router has been in use here for over 3 years with almost no issues - the line has been really stable all that time - so this was a little unexpected.

After talking to them and trying some settings both at my end and at their end - it was decided that the old router may have some issues with its ADSL chip and that they'd send me a new router.

We were online at the weekend using 3G - and the new router arrived monday.

However - the new router displayed the same problem. Constant reboots.

### A power supply issue?

NextGenTel support listened to the description of the reboot cycle - and stated that this couldn't be to do with the ADSL line - it had to be a power problem.

We tested with a power overload/noise filter unit in the power supply - didn't help at all.

However - by this time we'd managed to pin down that the line was stable if my wife's mac mini was turned off. We started to suspect an earth fault in the power supply to the mac mini.

So - we dug out an old Macbook Pro and she's been using that since - and the line has been stable.

### Jabber enters the mix

**However** - a couple of days later I noticed that she wasn't on chat. We both use Adium to log in to a Jabber server.

The *minute* she logged in to adium the ADSL line dropped. And the reboot cycle started.

As soon as she logged out of chat - stable line again.

The mac mini is now back online - and as long as she doesn't start Adium then the line is as good as it has ever been.

### Notes

* I also use Adium to the same Jabber server - without issue.
* It's not specific to a given machine - the combination is Adium and her account logged in. That's enough to start the reboot cycle.

I can't believe any more that the power supply here has anything to to with this.

### What now?

I've mailed NextGenTel - but I suspect that the issue is a little too specific for them to have seen it before. I hope for an answer - but I don't really expect one straight away - it seems very strange that a given user on a given protocol over TCP/IP can cause an ADSL modem to constantly reboot - but it's consistently repeatable.

We'll just have to wait and see.
