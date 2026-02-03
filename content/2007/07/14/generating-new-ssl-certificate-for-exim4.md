---
title: Generating new SSL certificate for exim4
date: 2007-07-14 11:36:24 +0200
tags: [ssl, exim4]
---

Cargo culted direct from the exim site.

    openssl req -x509 -newkey rsa:1024 -keyout /etc/exim4/exim.key -out /etc/exim4/exim.crt -days 9999 -nodes

The really important bit is that the common name (CN) field must be the server name (at least so it seems to be for me)

Don't forget - if your pop3 and imap certificates also expire at the same time to [renew them to](/2006/07/14/courier-imap-pop3-with-ssl/).
