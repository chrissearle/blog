---
title: Replacing denyhosts with fail2ban for debian
date: 2015-06-16 22:39 +0200
tags: [debian, ssh, denyhosts, fail2ban]
intro: Migration from wheezy to jessie and a package I use is no longer available
---

Preparing for migration from debian wheezy to debian jessie and one of the packages I use is no longer supported.

Denyhosts is something that I used to block incoming ssh attacks (it adds IP addresses to /etc/hosts.deny). But it is not available in Jessie. The security team had [the following comments](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=732712):

- There are unaddressed security issues (e.g. [#692229](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=692229)).
- The tool is dead upstream (last release 2008).
- There is a viable alternative, fail2ban, that provides the same or increased feature set.

So - time to look at fail2ban.

Fail2ban doesn't by default use hosts.deny - it creates iptables rules (that by default time out after a while). I was quite happy with this so the default config in jessie is pretty close to what I want.

Installation is easy - a simple apt-get/aptitude install of fail2ban.

Configuration - the recommendation for any fail2ban config is to copy any conf file (foo.conf) to a .local file in the same directory (foo.local) and then modify that.

The main config is /etc/fail2ban/jail.conf - so - I copied this to /etc/fail2ban/jail.local

Changes I made:

- ignoreip - space separated list of IP's/networks to be whitelisted. Defaults to localhost. I added IP ranges that I use.
- bantime - time for a ban in seconds. Defaults to 600 (10 mins) - I doubled it.
- destemail - mail address to send reports etc - defaults to root@localhost - I changed it to my monitoring email address.
- action - defaults to action\_ - which just does the ban. I changed it to action_mw which also sends email (there's an \_mwl too which also sends relevant log lines)

So - fail2ban is now running - and from the mail received and checking both iptables -L and fail2ban-client status ssh I've seen that it's doing its job. Denyhosts retired. Oh - and fail2ban runs fine on wheezy too and can help with lots of other services. Lots more config to dive into if you need it - but for basic ssh - the defaults work pretty well.
