---
title: Migrating package list
date: 2005-04-05 12:00:21 +0200
tags: [debian, apt]
---

On machine 1

```shell
dpkg --get-selections "*" > file.txt
```

Note - the "\*" is important - otherwise you don't get the required purge lines

On machine 2

```shell
dpkg --set-selections < file.txt
apt-get dselect-upgrade
```
