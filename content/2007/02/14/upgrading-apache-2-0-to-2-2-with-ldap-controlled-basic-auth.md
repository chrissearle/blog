---
title: Upgrading apache 2.0 to 2.2 with ldap controlled basic auth
date: 2007-02-14 22:33:32 +0100
tags: [debian, apache2, ldap]
---

LDAP authentication started giving:

    (9)Bad file descriptor: Could not open password file: (null)

This is because apache 2.2 needs to be told what provider.

Add:

    AuthBasicProvider ldap

In addition - to be allowed to use require valid-user add:

    AuthzLDAPAuthoritative off

So - in full - the old config:

    <Location /location>
      AuthName "Auth NAme"
      AuthType Basic
      AuthLDAPURL ldap://host:port/basedn?attribute
      require valid-user
    </Location>

changes to

    <Location /location>
      AuthName "Auth NAme"
      AuthType Basic
      AuthBasicProvider ldap
      AuthzLDAPAuthoritative off
      AuthLDAPURL ldap://host:port/basedn?attribute
      require valid-user
    </Location>
