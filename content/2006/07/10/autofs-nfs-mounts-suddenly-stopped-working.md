---
title: autofs - nfs mounts suddenly stopped working
date: 2006-07-10 09:02:34 +0200
tags: [debian, nfs, autofs, mount]
---

Been using autofs to automount nfs for a long time - but it suddenly stopped working. Only thing in the logs was an "unable to mount" error.

The problem was that auto.net in /etc was no longer executable (maybe an update or something - not sure). Setting it executable - and suddenly - ba-bing - all nfs automounts came back :)
