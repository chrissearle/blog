---
title: Site converted to use middleman static site generator
date: 2013-08-10 12:02 +0200
tags: [drupal, middleman, site generation]
---

I've had this site running drupal since [august 2006](/2006/08/17/migration-to-drupal) but over time I've reduced the modules in use to almost nothing. There's nothing on the site that needs to be dynamic any more.

So I decided to migrate it to a static site generator - which means that the site is a lot easier to serve, requires far less maintenance and can be easily stored under version control :)

I've tried [nanoc](http://nanoc.ws) before - it works but I find the documentation on extending it a bit opaque, so for this site I've gone with [middleman](http://middlemanapp.com/). It seems to work well and I find that writing the few small extensions I need has been easy.

I've added apache redirects from the old drupal URLs to the new site - so I hope that google links etc will work. If not - let me know :)
