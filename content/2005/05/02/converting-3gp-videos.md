---
title: Converting .3gp videos
date: 2005-05-02 18:53:36 +0200
tags: [linux, 3gp, codec]
---

From [this blog](http://blog.chris.de/archives/22_Nokias_3gp_Files.html) information on getting mplayer to play .3gp files:

In /etc/mplayer/codecs - find the section for the videocodec ffh263 (just search for it) and add:

```text
format 0x33363273
```
