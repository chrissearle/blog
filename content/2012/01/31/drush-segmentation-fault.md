---
title: Drush segmentation fault
date: 2012-01-31 09:09:45 +0100
tags: [debian, php, drush, postgresql, curl]
---

Have been seeing segmentation faults coming from "drush cron" runs recently.

Seems that the issue is related to a conflict between the curl and pgsql php components.

On debian - the php cli config loads the config files under /etc/php5/cli/conf.d

If it loads curl.so before it loads pgsql.so then when releasing a postgres connection it will segfault.

Workaround is simply to load pgsql first. Files in the conf.d directory are loaded alphabetically.
