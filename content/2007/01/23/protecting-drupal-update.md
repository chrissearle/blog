---
title: Protecting drupal update
date: 2007-01-23 08:44:57 +0100
tags: [drupal, apache2]
---

An extra protection can be added to drupal update function by restricting which machines can access it.

Add this to the .htaccess

    <FilesMatch "update.php">
      Order deny,allow
      Deny from all
      Allow from 192.168.3.1
      Allow from 192.168.3.*
      Allow from .host.tld
      Allow from hostname.host.tld
    </FilesMatch>
