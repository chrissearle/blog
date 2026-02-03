---
title: UFW with Docker
date: 2018-09-21 08:16 +0200
tags: [ufw, docker, iptables, firewall]
---

Having recently moved a server from one machine to another - I wanted a simpler firewall to deal with than directly playing with iptables.

So I googled, found and installed UFW - I'm using debian so I used this [wiki link](https://wiki.debian.org/Uncomplicated%20Firewall%20%28ufw%29)

I opened just the ports I wanted and made sure that the default was to deny.

All seemed fine - until I found that all my docker ports were directly available over the net. I don't want this - these are supposed to be proxied behind https.

This is due to the fact that docker manipulates iptables itself directly.

First I found a fair number of sites suggesting to set docker to not use iptables.

    DOCKER_OPTS="--iptables=false"

But - docker uses iptables for things it needs so this breaks other things. For example connection from containers to the internet will fail if this is applied.

There seem to be two more options.

One is simply not to expose the ports when running `docker run -p ...` - but - that would make them unavailable to proxy too.

The last and simplest workaround is simply to change how you are running to limit which interface they listen to.

Change e.g.:

    docker run -p 8080:8080

to

    docker run -p 127.0.0.1:8080:8080

And it will only listen on the localhost interface.

Having done this on all my containers - they are no longer available via the direct port - but can happily live behind my web proxy.

Links used while digging into this:

* [techrepublic on iptables false](https://www.techrepublic.com/article/how-to-fix-the-docker-and-ufw-security-flaw/)
* [Mateusz Kubaczyk on configuring this in ubuntu - lots of details](https://www.mkubaczyk.com/2017/09/05/force-docker-not-bypass-ufw-rules-ubuntu-16-04/)
* [This answer on askubuntu which summarizes the three options](https://askubuntu.com/a/652572)
