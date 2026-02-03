---
title: Handling mail for non-system users with Exim4
date: 2005-12-07 23:03:33 +0100
tags: [debian, courier, exim4, dovecot, smtp]
---

An article popped up on debian-administration.org. I'm going to have to take a closer look at one of the comments:

[http://www.debian-administration.org/articles/302#comment_6](http://www.debian-administration.org/articles/302#comment_6)

If this can work well with courier (which I guess it should) then this will solve an issue I've had a while (and I don't want to go the route of a database for this).

Edit: Various things that have come up under discussion

courier assumes $HOME - to change this you need to change the authenticator so that it changes the value of  $HOME (at least according to various google searches)

dovecot can look at several password databases (from 1.x up) and they can specify different locations for maildir [http://wiki.dovecot.org/Authentication](http://wiki.dovecot.org/Authentication)

exim smtp auth via ldap - your starter for 10 here: [http://www.alios.org/exim4ldapauth.html](http://www.alios.org/exim4ldapauth.html)

all virtual users need also to be in the virtual file if you use catchall addresses 
