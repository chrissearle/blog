---
title: Postgres monitoring with munin 1.4 and multiple databases
date: 2011-10-11 11:26:59 +0200
tags: [munin, postgresql]
---

In munin 1.4 the number of plugins for postgres has increased. They are all based on the same perl module - Munin::Plugin::Pgsql

Many of them allow for suffixing the database name to the symlink in `/etc/munin/plugins/` to run against a given db or to suffix ALL to run against all (this is standard munin behaviour - see the plugins that have a filename ending in _).

If you enable several databases on the same plugin - it does a lot of stuff to be specific but it wasn't changing the plugin title so all the graphs generated got the same title. Hard to know which db is which.

I found that if I insert this line

~~~ perl
$pg->{title} = $pg->{title} . " " . $pg->wildcard_parameter();
~~~

just before the call to 

~~~ perl
$pg->Process();
~~~

then I get unique titles.

Not sure if this is handled in later versions (I am running this via the lenny-backports apt repo).
