---
title: PHP segmentation fault if both curl and postgres modules loaded (debian)
date: 2010-01-22 07:24:55 +0100
tags: [debian, php]
---

Running some porting scripts (command line PHP) for drupal yesterday - and for the first time trying out postgres.

I kept getting a segmentation fault at the end of each script.

Turns out that there is some issue with the curl and postgres php modules.

For a workaround on debian see [debian bug 411982](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=411982#120) - it changes the order of loading.
