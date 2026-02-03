---
title: WLAN using a 3Com Office Connect 11g
date: 2005-08-23 16:16:05 +0200
tags: [debian, 3com, ndiswrapper]
---

I have a 3Com OfficeConnect Wireless 11g PCMCIA card lying around - 3CRWE154G72.

I wanted to get it up and running using debian unstable.

I've never got this card to play nice with the prism drivers that linux seems to think are the ones to use. So - let's try ndiswrapper.

Following steps are based on information from the #debian IRC channel on freenode

```shell
apt-get install build-essential ndiswrapper-source module-assistant wireless-tools
module-assistant auto-install ndiswrapper
```

The first command gets the stuff you need. The second builds and installs the kernel module. In this case I also needed to get ndiswrapper-utils - which it prompted for and fetched (over the ethernet LAN connection). This is good - since it needs something providing ndiswrapper-module - and that's what you're building.

Now - you need to get the drivers - I downloaded the exe - ran it on windows (turns out to be a self-extracting rar file). This gave an install diskette set of files with a subdirectory Driver.

Now - we need to install the driver:

```shell
ndiswrapper -i Driver/3C154G72.INF
```

Note - this was the only .inf file in the driver dir. This installed the correct driver for me - you can see the results with

```shell
ndiswrapper -l
Installed ndis drivers:
3c154g72        driver present, hardware present
```

You can test this now by modprobing ndiswrapper and using iwconfig (it should have created a wlan0 interface)

However - for automatic handling - I have the following in /etc/network/interfaces after the lo and eth0 areas

```shell
iface wlan0 inet dhcp
pre-up modprobe ndiswrapper
post-down rmmod ndiswrapper
wireless-essid <MYSSID>
wireless-key restricted <MYWEP>
```

Now - a simple <code>ifup wlan0</code> brings me online via the wireless net - and it all works (as long as eth0 is ifdown'd). All I need to do now is find a good way to auto eth0 at work and auto wlan0 at home.
