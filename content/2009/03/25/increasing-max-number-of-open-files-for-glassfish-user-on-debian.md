---
title: Increasing max number of open files for glassfish user on debian
date: 2009-03-25 09:31:30 +0100
tags: [linux, debian, glassfish, ulimit]
---

My glassfish process kept dying with "Too many open files" in the log.

I'm not surprised that it has too many - it has quite a few large applications running - but how to increase this?

<code>ulimit -n</code> shows that the user has a default of 1024.

But <code>ulimit -n 2048</code> gives <code>-su: ulimit: open files: cannot modify limit: Operation not permitted</code>

Some digging leads to <code>/etc/security/limits.conf</code>

Here we added:

    glassfish        hard    nofile          2048
    glassfish        soft    nofile          2048

However - even after logging in and out glassfish still had 1024 and no right to change.

The issue here is that I'm using su to change to the glassfish user. And the pam config for su doesn't pay this limits.conf file any attention until you tell it to.

In <code>/etc/pam.d/su</code> uncomment the line

    session    required   pam_limits.so

Log out and in to glassfish and finally <code>ulimit -n</code> shows 2048.
