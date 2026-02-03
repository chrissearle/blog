---
title: Using self generated SSL (exim4 TLS/courier IMAPS) with Mail.app
date: 2006-07-14 14:52:00 +0200
tags: [mac, ssl, courier, imap, exim4, tls]
---

Mail.app wouldn't stop asking about the certificates.

So:

1.  Remove any instances of them from Keychain Access
1.  Try to get mail - when told about the certificate choose View certificate and drag the icon to the desktop
1.  Don't add the cert to your login keychain - drag it to the X509Anchors chain instead.
1.  Mark it as always trusted (after all - you trust yourself don't you?)
1.  Repeat 2. - 4. for sending mail.


Bingo! Well - works4me at least.
