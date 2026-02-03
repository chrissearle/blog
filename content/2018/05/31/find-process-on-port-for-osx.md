---
title: Find process on port for OSX with lsof
date: 2018-05-31 08:25 +0200
tags: [osx, mac, linux]
intro: netstat -p doesn't work on mac - let's find the same info via lsof
---

It's often quite useful to know what running process is holding a port open. Doing this on linux has long been an easy case of running netstat with the -p option which shows the PID and name for each socket - for example:

    # netstat -lnp | grep :80
    tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      14897/nginx.conf
    ...

But the mac version of netstat doesn't support this option. I recently came across [this post on stackoverflow](https://stackoverflow.com/questions/4421633/who-is-listening-on-a-given-tcp-port-on-mac-os-x/4421674#4421674) that points out that you can use lsof:

    lsof -iTCP:xxxx | grep LISTEN

and on later versions

    lsof -iTCP:xxxx -sTCP:LISTEN

Note that this also works fine on linux:

    # lsof -iTCP:80 -sTCP:LISTEN
    COMMAND   PID  USER   FD   TYPE    DEVICE SIZE/OFF NODE NAME
    nginx   14897  root   48u  IPv4 525163059      0t0  TCP *:http (LISTEN)
    ...
