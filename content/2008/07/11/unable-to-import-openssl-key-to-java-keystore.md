---
title: Unable to import openssl key to java keystore
date: 2008-07-11 11:42:54 +0200
tags: [ssl, keystore, openssl]
---

**UPDATE - progress - see end of article**

I have an openssl self-signed certificate for some websites. These are based on an openssl RSA key. I can use them successfully as client keys - but - it seems that glassfish (perhaps all others - I don't know) need the key in the keystore as well as the certificate.

So - I have an RSA key file and a PEM certificate file.

keytool only imports the certificate (this works fine for this certificate for java processes that act as an SSL client - but here I want to act as the SSL server) - so here are the other things I have tried:

**Jetty PKCS12Import**

From [http://number9.hellooperator.net/articles/category/security](http://number9.hellooperator.net/articles/category/security)

Pre-requisite

    curl -O http://dist.codehaus.org/jetty/jetty-6.1.11/jetty-6.1.11.zip
    unzip -j jetty-6.1.11.zip jetty-6.1.11/lib/jetty-6.1.11.jar

Now - convert to pkcs12

    openssl pkcs12 -export -out keystore.pcks12 -in /etc/apache2/ssl/certificate.crt -inkey /etc/ssl/private/key.key

And then import

    java -cp jetty-6.1.11.jar org.mortbay.jetty.security.PKCS12Import keystore.pcks12 keystore.jks

Problem is that I get:

    Exception in thread "main" java.io.IOException: failed to decrypt safe contents entry: java.lang.ArithmeticException: / by zero
        at com.sun.net.ssl.internal.pkcs12.PKCS12KeyStore.engineLoad(PKCS12KeyStore.java:1277)
        at java.security.KeyStore.load(KeyStore.java:1185)
        at org.mortbay.jetty.security.PKCS12Import.main(PKCS12Import.java:95)
    Caused by: java.lang.ArithmeticException: / by zero
        at com.sun.crypto.provider.PKCS12PBECipherCore.a(DashoA13*..)
        at com.sun.crypto.provider.PKCS12PBECipherCore.a(DashoA13*..)
        at com.sun.crypto.provider.PKCS12PBECipherCore.a(DashoA13*..)
        at com.sun.crypto.provider.PKCS12PBECipherCore.a(DashoA13*..)
        at com.sun.crypto.provider.PKCS12PBECipherCore$PBEWithSHA1AndRC2_40.engineInit(DashoA13*..)
        at javax.crypto.Cipher.a(DashoA13*..)
        at javax.crypto.Cipher.a(DashoA13*..)
        at javax.crypto.Cipher.init(DashoA13*..)
        at javax.crypto.Cipher.init(DashoA13*..)
        at com.sun.net.ssl.internal.pkcs12.PKCS12KeyStore.engineLoad(PKCS12KeyStore.java:1273)
        ... 2 more</code></pre>

**Neal Groothius**

From: [http://www.nealgroothuis.name/import-a-private-key-into-a-java-keystore/](http://www.nealgroothuis.name/import-a-private-key-into-a-java-keystore/)

This wants the certificate and key in DER form:

    openssl rsa -in /etc/ssl/private/key.key -out key.der -outform DER
    openssl x509 -in /etc/apache2/ssl/certificate.crt -out cert.der -outform DER

Then import:

    java -cp . KeyStoreImport keystore.jks cert.der key.der keyalias

But that gives:

    java.security.spec.InvalidKeySpecException: java.security.InvalidKeyException: IOException : algid parse error, not a sequence
        at sun.security.rsa.RSAKeyFactory.engineGeneratePrivate(RSAKeyFactory.java:175)
        at java.security.KeyFactory.generatePrivate(KeyFactory.java:342)
        at KeyStoreImport.main(KeyStoreImport.java:80)
    Caused by: java.security.InvalidKeyException: IOException : algid parse error, not a sequence
        at sun.security.pkcs.PKCS8Key.decode(PKCS8Key.java:344)
        at sun.security.pkcs.PKCS8Key.decode(PKCS8Key.java:350)
        at sun.security.rsa.RSAPrivateCrtKeyImpl.<init>(RSAPrivateCrtKeyImpl.java:74)
        at sun.security.rsa.RSAPrivateCrtKeyImpl.newKey(RSAPrivateCrtKeyImpl.java:58)
        at sun.security.rsa.RSAKeyFactory.generatePrivate(RSAKeyFactory.java:274)
        at sun.security.rsa.RSAKeyFactory.engineGeneratePrivate(RSAKeyFactory.java:171)
        ... 2 more

**Not yet commons-ssl**

From: [http://juliusdavies.ca/commons-ssl/](http://juliusdavies.ca/commons-ssl/)

    java -cp not-yet-commons-ssl-0.3.10.jar org.apache.commons.ssl.KeyStoreBuilder pass key.key /etc/apache2/ssl/certificate.crt

Gives:

    Exception in thread "main" java.util.NoSuchElementException
        at java.util.LinkedList$ListItr.next(LinkedList.java:698)
        at java.util.Collections$UnmodifiableCollection$1.next(Collections.java:1010)
        at org.apache.commons.ssl.KeyStoreBuilder.build(KeyStoreBuilder.java:167)
        at org.apache.commons.ssl.KeyStoreBuilder.build(KeyStoreBuilder.java:97)
        at org.apache.commons.ssl.KeyStoreBuilder.main(KeyStoreBuilder.java:555)</code></pre>

**UPDATE**

Progress. Julius Davies (not yet commons-ssl) got back to me and said - bug in 0.3.10 - try 0.3.9. Now - checking the download page it *says* that 0.3.10 is alpha - but I never made it that far down the page.

    java -cp not-yet-commons-ssl-0.3.9.jar org.apache.commons.ssl.KeyStoreBuilder pass_for_new_keystore key.key /etc/apache2/ssl/certificate.crt

This worked. Created a new keystore for me (named &lt;certificate's OU&gt;.jks). This has the certificate in it as well as the key (keytool -list shows it as a PrivateKeyEntry rather than a trustedCertEntry).

You can get it into the glassfish keystore too:

    keytool -importkeystore -srckeystore keystore.jks -destkeystore glassfish/domains/domain1/keystore.jks -srcstorepass pass_for_new_keystore -deststorepass changeit

I'll test to see if it can use it next week. If so - this article will be superseded with a new one :)
