---
title: OpenDS allow import of encoded passwords
date: 2009-01-07 16:02:23 +0100
tags: [ldap, opends, ldif, passwords]
---

Note from Dominic on Freenode#opends:

Allow LDIF imports of encoded passwords: config/config.ldif, under cn=Default Password Policy,cn=Password Policies,cn=config

    change ds-cfg-allow-pre-encoded-passwords : true
