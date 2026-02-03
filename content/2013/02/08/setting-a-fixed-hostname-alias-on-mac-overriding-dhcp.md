---
title: Setting a fixed hostname alias on mac overriding DHCP
date: 2013-02-08 11:05:34 +0100
tags: [java, mac, tomcat, dhcp, hostname]
---

This turned up as an issue when developing webapps.

If you set a fixed hostname (local.foo.bar for example) via an /etc/hosts alias to 127.0.0.1 (perhaps you need to have access to .foo.bar cookies or similar) then you can browse localhost via the local.foo.bar name.

However - when starting tomcat under java this gave an error on hostname/url. I've had the issue running tomcat 6 under java 7 - have had reports of tomcat 7 under java 6 also being an issue.

It turns out that Mac OSX takes the hostname given by DHCP - and this can change often.

It seems to be trying to do some kind of network lookup/matching and won't start tomcat unless it finds a good match.

So - you need to force the mac to ignore hostname allocation by setting a fixed hostname.

For Lion and Mountain Lion:

```shell
scutil --set HostName local.foo.bar
```

Previous versions of OSX had some settings in /etc/hostconfig - but I don't have an old enough install to test on.

YMMV on whether you need sudo or not for editing /etc/hosts and scutil call

Tip: Don't pick an alias that's an existing host - it'll prevent you reaching that host by name :)
