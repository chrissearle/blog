---
title: Disable IPv6 in a 2.6 kernel
date: 2005-03-17 14:37:02 +0100
tags: [debian, kernel, modprobe]
---

Debian linux running a 2.6 kernel

To disable IPv6 you need both the following lines in your /etc/modprobe.conf file

```text
alias ipv6 off
alias net-pf-10 off
```

Thanks to the guys on the #debian freenode channel for help with this.

**Update**

Moved the config to /etc/modprobe.d/local

**Update**

This stopped working on 2.6.18 on debian etch. Now my /etc/modprobe.d/local now contains just

```text
blacklist ipv6
```

Apparently - in some cases this may still not work - in that case it is possible to try

```text
install ipv6 /bin/true
```
