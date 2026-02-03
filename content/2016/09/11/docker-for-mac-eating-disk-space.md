---
title: Docker for mac eating disk space
date: 2016-09-11 08:01 +0200
tags: [docker, mac, osx]
intro: Docker likes very large qcow2 files
---

I've recently been struggling with my mac laptop not having any disk space left. Each time I've deleted whatever large files I had in Download or any other out of date stuff - thinking that I was just being a heavy disk user.

But - it kept happening - so I actually dug into it with du.

It turns out I had gigabytes and gigabytes in

    ~/Library/Containers/com.docker.docker/Data/com.docker.driver.amd64-linux/Docker.qcow2

So I deleted all images and containers - but this file didn't get any smaller.

Google lead me to this [github issue](https://github.com/docker/for-mac/issues/371) which covers this behaviour.

For me - it's simplest just to do a client reset (since this docker is only used for development) - but I hope that they fix this fairly soon.
