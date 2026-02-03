---
title: Booting from grub shell
date: 2008-08-13 12:11:23 +0200
tags: [debian, grub]
---

When you install grub to debian and forget to run update-grub the first time before you reboot then there is no menu.lst file in /boot/grub so you boot to the grub shell

I had the following config

/dev/hda2 - /
/dev/hda3 - /boot

To boot this from the grub shell

    root=(hda0,2)

This points to /boot (hd0 is /dev/hda - the number after the comma is zero indexed partition number - so ,2 is /dev/hda3)

    kernel=/vmlinuz-... root=/dev/hda2 ro

Grub shell has tab completion to help you find the correct name for the kernel file

    initrd=/initrd...

Again - tab complete to get the correct name for the initrd image

    boot

Once you're in - then the first thing to run as root is

    update-grub
