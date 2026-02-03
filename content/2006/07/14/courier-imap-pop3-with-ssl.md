---
title: courier imap/pop3 with ssl
date: 2006-07-14 09:35:59 +0200
tags: [debian, ssl, courier, imap, pop3]
---

I was using courier-imap and courier-pop until today. I've just installed the -ssl versions of both.

At install they both create a certificate for localhost based in New York. This doesn't work unless it really is localhost.

In /etc/courier there are imapd.pem, imapd.cnf, pop3d.pem and pop3d.cnf

1.  Delete the .pem files
1.  Edit the .cnf files - make sure that you set CN to be the hostname or the mail server
1.  Run mkimapdcert
1.  Run mkpop3dcert
1.  Restart the services

I left the non-ssl IMAP running but only for 127.0.0.1 for squirrelmail.
