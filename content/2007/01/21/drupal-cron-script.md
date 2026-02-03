---
title: Drupal cron script
date: 2007-01-21 12:36:06 +0100
tags: [drupal, ruby, cron]
---

To avoid having to set up multiple cron lines - here's a script that will read your drupal install(s) and call cron on each one found.

Not sure where I saw the code (rss feed) - but the comment was present in the downloaded code - so thats a pointer to where it starts.

Changes I've made - the dir match is changed from \*_ to _ so that it will follow symlinks. It also handles multiple drupal installs. Timeout wrapping added - one of my sites takes a long while to return.

:download{title="drupal_cron.rb" path="/files/posts/2007/01/drupal-cron.rb"}

Feel free to comment with fixes or suggestions to make it better.
