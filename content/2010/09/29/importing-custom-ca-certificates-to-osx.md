---
title: Importing custom CA certificates to OSX
date: 2010-09-29 09:16:30 +0200
tags: [mac, ssl, osx, openssl]
---

For my own sites I use SSL certificates [signed by my own CA](/2008/08/09/using-a-self-generated-certificate-authority-for-openssl-on-debian-etch)

The CA certificate needs to be imported to the machines where I use the websites and for Mac OSX it needs to go into the system keychain - not the users keychain.

Importing via Keychain Access sometimes fails with cryptic error codes.

Here's how to do it via the command line:

```shell
sudo security import <cert file name> -k /Library/Keychains/System.keychain
```
