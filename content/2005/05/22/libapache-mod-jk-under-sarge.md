---
title: libapache-mod-jk under sarge
date: 2005-05-22 14:44:09 +0200
tags: [java, debian, apache, tomcat, ajp13]
---

Sarge installation. Apache is 1.3.x (packaged). JBoss is 3.2.7 with tomcat.

Aim: ajp13 working

For each (or at least several) virtual host under apache we have an equivalent webapp running under jboss. We'd like to use apache as the front end server.

So - here's an example app URL: http://hostname:8080/app/

This should be accessable under: http://hostname/app/

mod_rewrite will be used to handle

```text
    http://hostname/ -> http://hostname/app/
```

since some things are apache only (awstats etc).

First - get libapache-mod-jk installed

```shell
apt-get install libapache-mod-jk
```

Then - to httpd.conf - near the end but before the include of conf.d add

```text
<IfModule mod_jk.c>
    JkWorkersFile /etc/libapache-mod-jk/workers.properties
</IfModule>
```

Finally - in the virtual host config for each virtual host (we use separate files under conf.d) add

```text
# Set up the ajp13 link
JkMount /app/* local
JkMount /app local
# mod_rewrite required
RewriteEngine on
# Don't rewrite if app is already there - /app/app/app etc is not fun
RewriteCond %{REQUEST_URI} !^/app
# For any other paths that apache should handle directly e.g. awstats,
# webalizer, any php stuff add similar lines to this one here
RewriteCond %{REQUEST_URI} !^/log
# Then handle anything that should be sent to the ajp13 redirect
RewriteRule ^/(.*) http://hostname/app/$1 [R]
```
