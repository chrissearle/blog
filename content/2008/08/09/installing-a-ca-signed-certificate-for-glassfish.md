---
title: Installing a CA signed certificate for glassfish
date: 2008-08-09 11:31:38 +0200
tags: [ssl, keystore, keytool, glassfish, openssl]
---

Instead of using a self-signed certificate with glassfish - we want to use one that is signed by a certificate authority.

Based on [http://blogs.sun.com/enterprisetechtips/entry/using_ssl_with_glassfish_v2](http://blogs.sun.com/enterprisetechtips/entry/using_ssl_with_glassfish_v2)

For this entire post - the keystore.jks file is the one found in the glassfish domain config - e.g. glassfish/domains/domain1/config/keystore.jks

First - generate a keypair (this will generate a full self-signed certificate)

    keytool -genkeypair -keyalg RSA -keystore keystore.jks
    -storepass changeit -validity 365
    -alias dev.chrissearle.net

Then - generate a signing request

    keytool -certreq -alias dev.chrissearle.net
    -file newreq.pem -keystore keystore.jks
    -storepass changeit

Send the generated certificate request off for signing (or sign it yourself if using a self-generated CA).

The sun blog has a java app for doing the replacement of the self-generated with the signed certificate. Attached to this post is that file and also compiled with JDK 6.

This seems to want the certificate in DER form - not PEM.

    openssl x509 -in newcert.pem -inform PEM -out newcert.der -outform DER

    java -cp . ReplaceCertInKeystore newcert.der keystore.jks changeit dev.chrissearle.net

You can check if this is successful:

    keytool -list -v -alias dev.chrissearle.net -keystore keystore.jks -storepass changeit

In the output of this command - check to see the details under "Issuer". This should be the details of the signing authority.
