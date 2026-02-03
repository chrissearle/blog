---
title: Glassfish and Too many open files - monitoring with munin
date: 2009-03-26 09:39:43 +0100
tags: [munin, glassfish, monitoring]
---

One of the systems that can be used for monitoring trends on a system is [munin](http://munin-monitoring.org/). It turns out that adding a graph to munin is reasonably simple.

There is a good guide on the [munin site](http://munin-monitoring.org/wiki/HowToWritePlugins).

So - I need a plugin that will return the number of open files.

    lsof -u glassfish | wc -l

This is a rough guide - it includes files, pipes, tcp connections etc etc - so it may give a slightly larger count - but the aim here is to see trends - are we stable or do we have a file leak?

So - here's the plugin code I ended up using:

```shell
#!/bin/sh
case $1 in
    config)
        cat <<'EOM'
graph_title Open file count for glassfish
graph_vlabel filecount
filecount.label filecount
graph_args --base 1000 -l 0
graph_category Processes
EOM
        exit 0;;
esac
echo -n "filecount.value "
lsof -u glassfish | wc -l
```

This got added as /etc/munin/plugins/glassfish_filecount. I also had to specify in /etc/munin/plugin-conf.d/munin-node (paths are from a debian install):

```ìni
[glassfish_filecount]
user root
```

to avoid errors from lsof.

The output shows that the trend is stable, that the limit increase should be enough and that there isn't a file leak.

It also shows that the lsof count includes more than the ulimit enforces (since lsof contains many different types) - since we see the graph going higher than 2048 which is the ulimit for open files. However - since it is showing the trend I needed to see I decided that it would do.
