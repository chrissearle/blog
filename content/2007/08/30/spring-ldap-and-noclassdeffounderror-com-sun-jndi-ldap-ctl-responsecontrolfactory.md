---
title: spring-ldap and NoClassDefFoundError com.sun.jndi.ldap.ctl.ResponseControlFactory
date: 2007-08-30 22:06:50 +0200
tags: [java, ldap, spring, maven, spring-ldap]
---

When using spring-ldap - if you get a NoClassDefFoundError for com.sun.jndi.ldap.ctl.ResponseControlFactory then you need the ldap booster pack (currently 1.0).

This is available from Sun:

[http://java.sun.com/products/jndi/downloads/index.html](http://java.sun.com/products/jndi/downloads/index.html)

Go to the JNDI 1.2.1 page and grab JNDI/LDAP Booster Pack 1.0 (ldapbp-1_0.zip)

Unzip and then install as an artifact:

    mvn install:install-file -DgroupId=com.sun -DartifactId=ldapbp -Dversion=1.0 -Dpackaging=jar -Dfile=/unzippeddir/lib/ldapbp.jar

Then add the dependency to your pom

    <dependency>
      <groupId>com.sun</groupId>
      <artifactId>ldapbp</artifactId>
      <version>1.0</version>
    </dependency>
