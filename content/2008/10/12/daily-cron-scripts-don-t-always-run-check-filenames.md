---
title: Daily cron scripts don't always run - check filenames
date: 2008-10-12 08:54:10 +0200
tags: [debian, cron, cron.daily]
---

I noticed that some of my scripts in <code>/etc/cron.daily</code> were not running.

It turns out that filenames with a dot in them (foo.sh, bar.pl) etc simply don't run.

Remove the dots (drop the extension - of course linux doesn't need them - they were only for my convenience) and it all works.
