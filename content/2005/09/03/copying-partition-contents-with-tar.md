---
title: Copying partition contents with tar
date: 2005-09-03 11:07:49 +0200
tags: [linux, tar]
---

Note to self - here's the tar command you keep having to lookup

```shell
cd /path/to/source
tar lcvf - .|(cd /path/to/dest; tar xpvf - )
```
