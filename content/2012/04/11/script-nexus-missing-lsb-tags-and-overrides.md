---
title: script 'nexus' missing LSB tags and overrides
date: 2012-04-11 20:51:20 +0200
tags: [nexus]
---

Was getting the error

```
script 'nexus' missing LSB tags and overrides
```

Luckily I found that someone had already done the work :)

[http://mrexception.blogspot.com/2011/12/make-nexus-startup-script-lsb-compliant.html](http://mrexception.blogspot.com/2011/12/make-nexus-startup-script-lsb-compliant.html)

From that post - add the following to the top of the file:

```
    ### BEGIN INIT INFO
    # Provides:          nexus
    # Required-Start:    $remote_fs $syslog $network
    # Required-Stop:     $remote_fs $syslog $network
    # Default-Start:     2 3 4 5
    # Default-Stop:      0 1 6
    # Short-Description: Nexus Maven Proxy
    # Description:       Nexus Maven Proxy
    ### END INIT INFO
```
