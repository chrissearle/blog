---
title: Update OpenDS 2.2.0 to OpenDJ 2.4.3
date: 2011-09-03 11:59:34 +0200
tags: [ldap, opends, opendj]
---

Finally got around to upgrading my OpenDS 2.2.0 to OpenDJ 2.4.3.

Clean upgrade - just followed [the OpenDJ wiki](https://wikis.forgerock.org/confluence/display/OPENDJ/OpenDJ+Installation+Guide#OpenDJInstallationGuide-UpgradingToOpenDJDirectoryServer).

Only change I had to make was from

```shell
./bin/rebuild-index -i dn2id -b "dc=example,dc=com"
```

to

```shell
./bin/rebuild-index --rebuildAll -b "dc=example,dc=com"
```

Rebuilding the dn2id index only left the sync-conflict index for my root backend in degraded mode.
