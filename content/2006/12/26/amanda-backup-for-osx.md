---
title: Amanda backup for OSX
date: 2006-12-26 15:07:20 +0100
tags: [mac, backup, amanda]
---

I needed to get both my Mac machines (mac mini intel and macbook pro) to be included in the amanda backup I run.

I could have tried going via samba - but the following page works exactly as advertised:

[http://www.locnar.net/drupal/?q=node/16](http://www.locnar.net/drupal/?q=node/16)

Notes - I used the latest stable build as of today: 2.5.1p2. One oddity in configure (a call to head with unknown params) - but it all worked. I also had to use the username backup in the .amandahosts file since that is the user the tape server uses - this is only the .amandahosts file - the rest is using the amanda user as per the article.
