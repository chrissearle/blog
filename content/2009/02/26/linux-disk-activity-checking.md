---
title: Linux disk activity checking
date: 2009-02-26 12:33:04 +0100
tags: [linux, debian, firewall]
---

As part of [Building a debian firewall on a CF card](/2008/04/05/building-a-debian-firewall-on-a-cf-card) I was trying to make sure that disk writes to the firewall CF card were kept to a minimum.

However - I've never really been able to test this. So I was pleased to find [http://samwel.tk/laptop_mode/faq](http://samwel.tk/laptop_mode/faq) - under section 5 there is a question titled "My disk spins up all the time and I have no clue what causes this. Can I debug this?".

This article is basically a copy of that text so that I can find it next time I need to test and have forgotten how - but - to be absolutely clear - the content is from the faq on [http://samwel.tk](http://samwel.tk) - not from me.

### My disk spins up all the time and I have no clue what causes this. Can I debug this?

Yes, you can. But first, check that you have modified your syslog.conf to not sync, as described in the last question of the previous section. To debug disk activity, you can do:

```shell
echo 1 > /proc/sys/vm/block_dump
```

(Warning: you must disable syslogd before you do this, or you must make sure that kernel output is not logged. If you forget this, your system may get into a feedback loop, where syslogd causes disk activity, this causes kernel output, and this causes syslogd to do more disk activity, etcetera!)

This enables file/disk activity debugging in the kernel. You can read the output using dmesg. When you're done, disable block dump using

```shell
echo 0 > /proc/sys/vm/block_dump
```
