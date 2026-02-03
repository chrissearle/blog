---
title: SSL certificate based login with myopenid.com and safari
date: 2009-03-14 18:39:57 +0100
tags: [ssl, openid, myopenid.com]
---

I delegate my domains OpenID logins to myopenid.com - but I was having issues getting SSL certificate based login to work in safari.

Here's what I needed to do (mostly as a reminder to myself).

1.  Generate a new SSL certificate on the myopenid.com site
2.  Click the link to download the certificate. It downloads and installs via keychain access (I get a private key, a public key and a certificate).
3.  Set the certificate to be trusted (since Jan Rain/MyOpenID isn't a recognised issuer)
4.  Right click the certificate and add an Identity Preference. Add the URL https://www.myopenid.com/signin_certificate

This last step seems to be what was needed for me to get it to work properly.

Now - as long as I am on one of my own machines with an unlocked keychain then I can login with OpenID without sending passwords over the wire.
