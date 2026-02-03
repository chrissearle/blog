---
title: Adding hosts to /etc/hosts on Leopard/Snow Leopard
date: 2010-10-31 10:47:07 +0100
tags: [mac, dns]
---

Adding hosts to /etc/hosts on Leopard/Snow Leopard is a little simpler than earlier versions (see [node:168])

- Edit /private/etc/hosts
- Run dscacheutil -flushcache

Since /etc is symlinked from /private/etc /private/etc/hosts is the same file as /etc/hosts
