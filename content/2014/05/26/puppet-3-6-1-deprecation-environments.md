---
title: "Puppet 3.6.1 - deprecation: environments"
date: 2014-05-26 08:18 +0200
tags: [puppet, debian]
intro: Dealing with deprecations when migrating from puppet 3.6.0 to 3.6.1
---

This weekend I updated puppet (master and agent) from 3.6.0 to 3.6.1 (this is on debian using the apt.puppetlabs.com repository).

This filled my logs with the following error:

```
puppet-master[26558]: no 'environments' in {:current_environment=>*root*, :root_environment=>*root*} at top of [[0, nil, nil]]
```

So - something in a point release broke.

Some digging leads to [directory environments](http://docs.puppetlabs.com/puppet/latest/reference/environments.html). Here we can learn that directory environments:

- override config file environments
- can be enabled in some specific ways

And in the [release notes](http://docs.puppetlabs.com/puppet/latest/reference/release_notes.html#deprecation-config-file-environments-and-the-global-manifestmodulepathconfigversion-settings) we can see that it will also mean:

- using no environments is deprecated
- "In a future version of Puppet (probably Puppet 4), directory environments will always be enabled"

Now - I have not enabled environments - so it looks like 3.6.1 on debian at least this last point has already happened (could be a bug, could be just me - no idea).

Now - I have a really really simple network to manage - a puppet master who is also an agent - and a second agent. That's it right now. So - how to simply get back to running a single production environment?

The simplest I have found is the following.

1. create the directory _environments/production_ under puppet (default /etc/puppet)
2. create an environment.conf file pointing back to the original locations

My environment.conf looks like

```ruby
manifest = $confdir/manifests/site.pp
manifestdir = $confdir/manifests
modulepath = $confdir/modules
```

Now at least I'm back with a running master/agent. Maybe I should look into using the environments/production directory properly - but at 6am on a monday morning I needed a quick fix ;)

Next issue - how to handle the deprecation of import (which I use in one file - the main site.pp to bring in config from nodes.pp and then for each site). But that's only giving deprecation warnings so I have a little time.
