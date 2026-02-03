---
title: Recovering box after powercut
date: 2005-08-03 07:28:16 +0200
tags: [debian, lvm2]
---

Had a powercut over most of Oslo. When this box came up the partition table on /dev/hdb was totally gone.

Now - this is not good since most of the partitions on the box are lvm2 partitions using physical volumes on both hda and hdb.

First thing to try was to look in /etc/lvm/archive for the latest vol group descriptor. This stated that the lvm partition was installed on /dev/hdb (note - no idea how I managed that - or why). Nothing would work using hdb sadly so a new partition hdb1 of type lvm was added spanning the whole disk. pvdisplay stated that it couldn't find a device with a given UUID. Some googling led to the following:

```shell
pvcreate --restorefile /etc/lvm/archive/file --uuid <uuid></uuid>
```

Now I could mount the missing partitions - but /tmp and /usr were damaged (probably due to the difference in using hdb vs hdb1).

So - most user data was on the backup tape - though not all (box was newly set up and not all backup was yet configured). Managed to extract the following:

- /etc
- /usr/local (own partition)
- /web (also on tape)
- /repository (also on tape)
- /home
- /var/lib/mailman
- /var/lib/awstats
- /var/lib/munin
- /var/lib/ldap
- /var/lib/mysql

Took also a copy of the output of df -h, apt's sources.list and dpkg --get-selections.

Reinstalled using the latest sarge net install - set up lvm etc as before (this time on hdb1)

After a reinstall with as minimal a set of packages possible - ran

```shell
dpkg --get-selections < selectionsfile
apt-get dselect-upgrade
```

Now the install set matched.

Copied out from the old /etc config for exim4, apache2, greylistd, slapd, any cron files that differed, nagios, munin, mrtg. Re-ran make-jpkg - and restarted jboss.

Things forgotten:

As far as I can see - only the SSL self-generated certificates at the moment.

Things to do:

- Generate SSL certs
- Bring https site back up
- Find out why spamassassin bayesian autolearn is failing (90% sure it's a permissions problem)
- Re-add the svnserve wrapper (from the svn book - sets umask)

Note - ALL partitions are now configured to go on tape :)
