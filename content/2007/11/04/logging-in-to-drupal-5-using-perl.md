---
title: Logging in to drupal 5 using perl
date: 2007-11-04 10:53:46 +0100
tags: [drupal, cron, lwp, perl]
---

Normally you can call the drupal cron page (/cron.php) as the anonymous user - but - to work around an issue with the simplenews module and taxonomy access control I need to run the cron script as a logged in user.

You need to do three things (for drupal 5 - I used to be able to start at step 2 for drupal 4).

1.  Grab the root page to get the PHPSESSID cookie
1.  Login to associate your cookie with a logged in session
1.  Call the script you want - in this case cron.php
