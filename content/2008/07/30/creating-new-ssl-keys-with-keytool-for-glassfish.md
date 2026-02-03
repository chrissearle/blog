---
title: Creating new SSL keys with keytool for glassfish
date: 2008-07-30 10:19:04 +0200
tags: [java, ssl, keystore, keytool, glassfish]
---

I needed to generate a new certificate for glassfish's admin pages.

Instead of using the normal OpenSSL self-signed certificate it was easier just to use the java keystore keytool

    keytool -genkey -keyalg RSA -alias <alias_referred_to_in_glassfish> -keystore glassfish/domains/domain1/config/keystore.jks -storepass changeit

Note the -keyalg RSA - keytool by default uses DSA and firefox 3.0 will not accept this even with an added security exception.
