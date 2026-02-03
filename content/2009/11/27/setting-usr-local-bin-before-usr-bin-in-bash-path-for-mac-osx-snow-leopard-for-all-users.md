---
title: Setting /usr/local/bin before /usr/bin in bash PATH for Mac OSX Snow Leopard for all users
date: 2009-11-27 20:05:57 +0100
tags: [mac, osx, snow leopard]
---

Just a short reminder - the list of paths that path_helper (/usr/libexec/path_helper is called from /etc/profile) is stored in /etc/paths. Just add /usr/local/bin at the top of the file.
