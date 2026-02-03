---
title: Upgrading homebrew postgres
date: 2016-01-11 09:19 +0100
tags: [postgresql, pg-upgrade, homebrew]
intro: How to deal with upgrading a database after upgrading the engine
---

Homebrew postgresql updated from 9.4.x to 9.5.x today.

This meant that after update it wouldn't start because the database needed upgrading.

I started with [this article](https://kkob.us/2014/12/20/homebrew-and-postgresql-9-4/) - which in summary would be:

### pg_upgrade method

#### Stop and upgrade

    launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist
    brew update && brew upgrade postgresql

#### Create empty db

    initdb /usr/local/var/postgres9.5 -E utf8

#### Upgrade db

    pg_upgrade \
      -d /usr/local/var/postgres \
      -D /usr/local/var/postgres9.5 \
      -b /usr/local/Cellar/postgresql/9.4.5_2/bin/ \
      -B /usr/local/Cellar/postgresql/9.5.0/bin/ \
      -v

#### Tidy up

    mv /usr/local/var/postgres /usr/local/var/postgres9.4
    mv /usr/local/var/postgres9.5 /usr/local/var/postgres

#### Start

    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist

But - my postgres/template0/template1 databases had different encodings - template1 was in unicode, template0 and postgres in SQL_ASCII. So pg_upgrade failed. Couldn't find a configuration to initdb that would work.

### pg_dumpall method

So - time to look at the manual method on [the migration psql doc](http://www.postgresql.org/docs/9.5/static/upgrading.html)

The result was a combination. Note that I'd already performed the installation via homebrew in the previous step - so the rest of the fix was to clear out the 9.5 db directory and start again:

#### Stop if running via launchctl

    launchctl unload ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist

#### Make sure any previous attempt to upgrade is removed

    rm -rf /usr/local/var/postgres9.5

#### Start old install, dump the entire db and then stop it again

    /usr/local/Cellar/postgresql/9.4.5_2/bin/pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start
    /usr/local/Cellar/postgresql/9.4.5_2/bin/pg_dumpall > outputfile
    /usr/local/Cellar/postgresql/9.4.5_2/bin/pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log stop

#### Create empty db

    initdb /usr/local/var/postgres9.5 -E utf8

#### Tidy up

    mv /usr/local/var/postgres /usr/local/var/postgres9.4
    mv /usr/local/var/postgres9.5 /usr/local/var/postgres

#### Start

    launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql.plist

#### Import

    psql -d postgres -f outputfile

This worked - and now my databases are UTF based across all of them so the pg_upgrade method should work next time.
