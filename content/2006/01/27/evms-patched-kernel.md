---
title: evms patched kernel
date: 2006-01-27 08:17:46 +0100
tags: [debian, kernel, evms]
---

The 2.6 series kernel only allows one owner of a block device ([http://evms.sourceforge.net/install/kernel.html](http://evms.sourceforge.net/install/kernel.html)). I need to use the BD Claim patch.

This is the only change made to the default debian kernel. First get the config file of the debian binary (since we want it as identical as possible)

    aptitude download linux-image-2.6.15-1-686
    mkdir boot
    dpkg-deb -x linux-image...deb boot/config-2.6.15-1-686

The config is now in the boot/config-2.6.15-1-686/boot dir

Now install the source (not sure of the dependencies)

    aptitude install linux-source-2.6 kernel-patch-evms
    cd /usr/src
    tar jxf linux-source-2.6.15.tar.bz2
    ln -s /usr/src/linux-source-2.6.15 linux
    cd linux
    cp <path>/boot/config-2.6.15-1-686 .config
    export PATCHES=evms-bd-claim
    PATCH_THE_KERNEL=AUTO make-kpkg --added-patches $PATCHES --initrd --append-to-version -evms kernel_image
    cd ..
    dpkg -i linux-image-2.6.15-evms_2.6.15-evms-10.00.Custom_i386.deb
