---
title: Migrating OpenBSD 3.6 firewall to 4.0 on a CF card
date: 2007-02-04 17:12:38 +0100
tags: [openbsd, firewall, compact flash]
---

I have an OpenBSD 3.6 machine as my home firewall. I also have a mini-itx machine with IDE-CF converter card waiting to replace it. This is the state of play

The build machine is running 4.0.

**chroot**

As root - lets build a chroot area in /home/chroot

    cd /usr
    export CVSROOT=anoncvs@anoncvs.no.openbsd.org:/cvs
    cvs -d$CVSROOT checkout -rOPENBSD_4_0 -P src ports
    cd /usr/src/sys/arch/i386/conf
    config GENERIC
    cd ../compile/GENERIC
    make clean && make depend && make
    make install
    rm -rf /usr/obj/*
    cd /usr/src
    make obj
    cd /usr/src/etc && env DESTDIR=/ make distrib-dirs
    cd /usr/src
    make build
    cd /usr/src/etc && env DESTDIR=/home/chroot make distrib-dirs
    cd /usr/src && env DESTDIR=/home/chroot make build

**Update config**

All wished for config should be present in the chroot

**Ports**

Any wished for ports files should be in the chroot

**Compact flash**

Transfer the required files to the CF card using flashdist [http://www.nmedia.net/~chris/soekris/](http://www.nmedia.net/~chris/soekris/)
