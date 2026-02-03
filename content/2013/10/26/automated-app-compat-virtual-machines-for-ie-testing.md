---
title: Automated App Compat virtual machines for IE testing
date: 2013-10-26 12:33 +0200
tags: [virtualbox, microsoft, ie, ievms, testing]
---

I very very very rarely need a windows install for anything. However - today I needed to talk to something that only has a windows driver.

This got me looking for ways to get a simple virtualized box running - which led me to this github repo: [Automated installation of the Microsoft IE App Compat virtual machines](https://github.com/xdissent/ievms)

So - first step was simply to install virtualbox (or in my case update it).

Then - all you have to do is

```shell
curl -s https://raw.github.com/xdissent/ievms/master/ievms.sh | bash
```

Or if you want specific IE versions (since this is really for IE testing - e.g. IE7 and IE9):

```shell
curl -s https://raw.github.com/xdissent/ievms/master/ievms.sh | env IEVMS_VERSIONS="7 9" bash
```

More details are on the github page - including info on snapshots (which can help you get around the 30 day limit - just revert to the original snapshot).
