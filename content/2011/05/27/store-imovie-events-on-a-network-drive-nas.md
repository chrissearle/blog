---
title: Store iMovie events on a network drive/NAS
date: 2011-05-27 09:07:09 +0200
tags: [osx, network attached storage, imovie, ilife 11]
---

I'd found a lot of info on the net about using symlinks to allow iMovie to see network disks, but this always seemed like too much of an effort.

So [this blog post](http://carryflag.blogspot.com/2010/06/imovie-event-library-on-network-drive.html) was a real nice find.

Short form - you just need to set a default:

```shell
defaults write -app iMovie allowNV -bool true
```

And now - when iMovie is opened the network drives are just as available as any other - and you can simply drag to copy or move the events to your NAS from within iMovie - which keeps the links to projects working.

I'm moving off all except the last year - gaining me nearly a terabyte of space on my iMac back ;)
