---
title: Installing apt keys
date: 2006-01-04 08:31:46 +0100
tags: [debian, apt, gnupg]
---

Taken from the dpkg bot on #debian:

    gpg --keyserver subkeys.pgp.net --recv-keys <key> ; gpg --export <key> | sudo apt-key add -;

where key is the key ID reported missing from aptitude
