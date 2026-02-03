---
title: Mountain Lion upgrade
date: 2012-08-27 08:59:32 +0200
tags: [mac, osx, mountain lion]
---

Things I need to remember when updating to Mountain Lion. This list could well grow over time ;)

**Paths - /etc/paths get's written back to standard with /usr/local/bin last**

Set to:

* /opt/local/bin
* /usr/local/bin
* /usr/bin
* /bin
* /usr/sbin
* /sbin
    
**Permissions on /usr/local**

[Machomebrew](http://mxcl.github.com/homebrew/) needs /usr/local to be writable - remember to reset ownership after update.

**Command line tools - XCode**

Reinstall command line tools from xcode before running any machomebrew updates.

**Java runtime**

Run Intellij (or other java app) to trigger an install of a JVM.
