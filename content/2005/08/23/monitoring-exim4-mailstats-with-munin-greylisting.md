---
title: Monitoring Exim4 mailstats with munin (greylisting)
date: 2005-08-23 20:33:24 +0200
tags: [debian, exim4, munin, greylisting]
---

The script for monitoring exim4 mailstats does not take into account the greylist temporary reject - it shows as a true reject.

The affected file is symlinked in at /etc/munin/plugins/exim_mailstats

To not show these as true rejects - in the parseEximfile function change

```text
elsif ($line=~/rejected/)
{
    $rejected++;
}

elsif ($line=~/rejected/)
{
    if ($line!~/greylisted/) {
        $rejected++;
    }
}
```

You could probably add a new line on the graph to show greylist entries if you wanted.
