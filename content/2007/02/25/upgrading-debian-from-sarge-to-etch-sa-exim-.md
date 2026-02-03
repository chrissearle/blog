---
title: "Upgrading debian from sarge to etch : sa-exim "
date: 2007-02-25 21:09:01 +0100
tags: [debian, exim4, spamassassin, sa-exim]
---

After upgrading sarge to etch - spamassassin was installed - but sa-exim wasn't running (the headers in mail showed it to be to do with the setting of SAEximRunCond stating that it should not run).

After a lot of looking at the default line in /etc/exim4/sa-exim.conf I found lower down the line:

    SAEximRunCond: 0

Comment this **out** if you want sa-exim to run spamassassin on the mail!
