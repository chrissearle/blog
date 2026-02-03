---
title: Upgrading drupal from 4.7 to 5.0
date: 2007-01-07 22:53:11 +0100
tags: [drupal]
---

To upgrade a site from drupal 4.7 to 5.0:

I have several sites running drupal 4.7 that will want to be upgraded to 5.0 - here's how I'm thinking of approaching it. Mostly culled from a [Lullabot](http://www.lullabot.com/videos/upgrading-from-drupal-4-7-x-to-drupal-5-x) video.

*Prerequisites:*

* backups of site and db
* all third party modules that a site is using are available

*Process:*

*  Log in as an admin user
*  Set the site to offline mode. Note that you can get a login while in offline mode at the relative url of /user
*  Disable third party modules/themes
*  Set the theme to a default - probably best to go with bluemarine
*  Create the new drupal dir (for my sites which are on a common code base - this means moving the symlink in sites and editing the apache config
*  If there are any changes to common code (.htaccess, spam checks for guestbook, other patches) that are in the common location - grab them now
*  Run update.php
*  Move third party modules and themes to sites/all/modules sites/all/themes
*  Enable third modules/themes
*  Run update.php
*  Test
*  Go to online mode

