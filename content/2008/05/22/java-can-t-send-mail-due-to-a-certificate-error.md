---
title: Java can't send mail due to a certificate error
date: 2008-05-22 08:35:02 +0200
tags: [java, ssl, aperture, keystore, google, gmail, cacerts, jssecacerts, aperture2gmail]
---

I use a plugin to Aperture to send mail to gmail. It was failing due to a 

    javax.net.ssl.SSLHandshakeException: sun.security.validator.ValidatorException: PKIX path
    building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find
    valid certification path to requested target

The plugin author ([plugin home page](http://iphoto2gmail.notoptimal.net/)) found the following utility:

http://blogs.sun.com/andreas/entry/no_more_unable_to_find

This was able to grab the certificate and stick it into the system jssecacerts file for me - and then java could send to gmail again.

However - the gmail cert is a fully signed Thawte certificate - so I now need to find out why it wasn't being validated - it should not be necessary to have a local trusted copy of a commercial CA signed certificate. Next steps? Not sure - check the cacerts file I guess.

Running java 1.5 on Mac OSX:

    java -version
    java version "1.5.0_13"
    Java(TM) 2 Runtime Environment, Standard Edition (build 1.5.0_13-b05-237)
    Java HotSpot(TM) Client VM (build 1.5.0_13-119, mixed mode, sharing)</pre>

So the files are in:

    /System/Library/Frameworks/JavaVM.framework/Versions/CurrentJDK/Home/lib/security

cacerts I believe to be the CA list and jssecacerts is your local trusted certificates.

To get the certificate installed for testing:

    cd /System/Library/Frameworks/JavaVM.framework/Versions/CurrentJDK/Home/lib/security
    java InstallCert smtp.gmail.com:465 <password for keystore>
    press 1 to install certificate when prompted

The default keystore password is "changeit".
