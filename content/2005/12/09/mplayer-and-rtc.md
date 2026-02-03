---
title: mplayer and rtc
date: 2005-12-09 09:15:27 +0100
tags: [linux, mplayer, sysctl]
---

mplayer works best with the real time clock (rtc) device /dev/rtc. It also wants to be able to set frequency up to 1024 as a user.

First make sure the rtc module is loaded - one way is to add rtc to /etc/modules

Now - lots of places I see the recommendation to add

```shell
echo 1024 > /proc/sys/dev/rtc/max-user-freq
```

to your startup scripts. I've never been sure where to hack this in - and the people who are giving the advice have many different suggestions. The whole thing feels like a bad hack.

So - after some investigation - I feel that it is much better to use sysctl - by adding the following to /etc/sysctl.conf

```text
dev.rtc.max-user-freq = 1024
```

You can check if it worked after boot by looking inside the file /proc/sys/dev/rtc/max-user-freq - mine contains the value 1024 :)
