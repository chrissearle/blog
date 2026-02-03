---
title: Sarge - munin - spamstats
date: 2005-06-14 07:33:31 +0200
tags: [debian, munin]
---

For some reason the munin packages in debian sarge don't seem to include the spamstats plugin.

I fetched the latest spamstats.in file from CVS - this is not ready to run as it needs to be processed by the build scripts - so to install into an existing binary install:

Get the file

```shell
wget 'http://cvs.sourceforge.net/viewcvs.py/*checkout*/munin/munin/node/node.d/spamstats.in'
```

Once this is in place

```shell
cd /etc/munin/plugins
ln -s /usr/share/munin/plugins/spamstats
```

Then edit /etc/munin/plugin-conf.d/munin-mode - I'm using exim4 - which logs to /var/log/mail.log - and with root.adm ownership - so I used the following:

```ini
[spamstats]
group adm
env.logfile mail.log
```

env.logdir and env.logfile are used to specifiy which logfile.

Now - restart the munin-node process - and you're done.
