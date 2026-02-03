---
title: Puppet service config for ejabberd
date: 2013-12-13 09:29 +0100
tags: [puppet, ejabberd]
---

I have an issue getting a working puppet service config for ejabberd on debian.

The init.d script supports the following options:

```shell
Usage: /etc/init.d/ejabberd {start|stop|restart|force-reload|live}
```

So - it has restart but not status. That means setting hasstatus to false and giving it a status command.

OK - let's fall back to a ps based status - we want to look for the ejabberd process (beam).

```shell
ps -ef | grep beam
```

We're not interested in the grep processes

```shell
ps -ef | grep beam | grep -v grep
```

But we also want a return status - not output

```shell
ps -ef | grep beam | grep -qv grep
```

This should set the return status correctly.

In fact I can test too:

```shell
$ ps -ef | grep beam | grep -qv grep
$ echo $?
0
```

And if I change to grep after a non-existant process (just to test)

```shell
$ ps -ef | grep beamx | grep -qv grep
$ echo $?
1
```

So I created the following service definition:

```ruby
class ejabberd::service {
  service { 'ejabberd':
    ensure     => running,
    hasstatus  => false,
    hasrestart => true,
    status     => 'ps -ef | grep beam | grep -qv grep',
    enable     => true,
    require    => Class['ejabberd::config'],
  }
}
```

This worked to start with - but recently it suddenly started restarting the process every puppet run - here's the output from logcheck:

```
--------------------- Puppet Begin ------------------------


Service starts:
    ejabberd: 143 Time(s)

---------------------- Puppet End -------------------------
```

And I can't for the life of me see why.
