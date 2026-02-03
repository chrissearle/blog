---
title: Patching denyhosts to allow correct plugin reporting
date: 2008-07-21 12:16:40 +0200
tags: [debian, denyhosts, abuse, dpkg-buildpackage]
---

This is a copy of an article I have recently had published on [www.debian-administration.org](http://www.debian-administration.org/articles/608)

Imagine you have denyhosts installed and it is adding new attackers to */etc/hosts.deny*. Wouldn't it be great to inform the relevant people so that some action could be taken?  With the right plugin that is possible, but there is a problem with the default reporting that we'll explain here.

That's what [Automatically Report all SSH Brute Force Attacks to ISPs](http://panthersoftware.com/articles/view/5/automatically-report-all-ssh-brute-force-attacks-to-isps) is all about. It grabs the IP, does some whois/lookup magic and sends off some e-mails.

So I installed it and left it running. This morning I find that one IP has hit and been correctly sent (and a reply received thanking me for the info and informing that the host has been closed down). Great! But - what's this - another 58 IPs were also reported to the plugin - causing a further 127 mails to go out. What's going on?

###Finding the bug

First hit - the [Debian Bug Tracker](http://www.debian.org/Bugs/). Here we find [bug #430449](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=430449) - over a year old but the correct symptom.

Having filed a follow-up I took a look at the code of denyhosts itself - and found a suspicious looking call to the deny plugin.

Finally - a trawl through the upstream bug tracker to find the same issue there.

###Patching the system

OK - so - it's a bug, and its an upstream bug. That's good - it means that we can have a hope of a fix. But - we need to fix our own system in the meantime.

You could just edit the python file directly - but - what if you have several systems running this version of denyhosts?

Let's build a Debian package containing the fix.

####Step 1 - grab the source

    apt-get source denyhosts

####Step 2 - make sure we have the build dependencies

    apt-get build-dep denyhosts

####Step 3 - Patch the source

Make the code changes you want

####Step 4 - Update changelog file for version

You need to update the version so that new versions/security updates etc will still work. The version is stored in debian/changelog as the first line.

I added:

    denyhosts (2.6-1etch1chris1) stable; urgency=low

      * Local build for fix to 430449

    -- Chris Searle &lt;chris@example.org>  Thu, 17 Jul 2008 11:06:15 +0200

*2.6-1etch1chris1* is a later version than *2.6-1etch1* (the current version) and an earlier version than *2.6-1etch2* or *2.6-2* which are the likely next version numbers.

####Step 5 - Build

In the root of the package directory structure that was created by the call to <code>apt-get source</code> run the following:

    dpkg-buildpackage -uc -us -rfakeroot

The -uc and -us are to prevent signing - we are not the package maintainer.

The -rfakeroot allows us to run as non-root.

####Step 6 - Install

There should be a new .deb file one directory up - mine is called denyhosts_2.6-1etch1chris1_all.deb

    dpkg -i denyhosts_2.6-1etch1chris1_all.deb
