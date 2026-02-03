---
title: Nokia n95 email configuration (google, mac and personal)
date: 2007-07-07 16:34:53 +0200
tags: [imap, pop3, smtp, n95, nokia]
---

OK - Google confiig is  based on the page: 

[http://asimag.wordpress.com/2007/06/22/how-to-configure-gmail-account-on-your-n95n73/](http://asimag.wordpress.com/2007/06/22/how-to-configure-gmail-account-on-your-n95n73/)


1.  Open Messaging Application
1.  Options > Settings > Email > Mailboxes
1.  Options > New Mailbox
1.  Mailbox Type: POP3
1.  E-mail: your gmail mail
1.  Incoming server: pop.gmail.com
1.  Outgoing server: smtp.gmail.com
1.  Access Point, choose Always ask or your preferred one
1.  In Mailbox name keep gmail or choose something meaningful to you
1.  Finish
1.  Options > Settings > Email > Mailboxes > Gmail
1.  Connection settings
1.  Incoming e-mail
1.  Username: your gmail mail
1.  Password: your password
1.  Security: SSL/TLS
1.  Back > Outgoing
1.  Username/password and security as for incoming
1.  Back > Back > User settings
1.  Enter your Name as you want to display
1.  Back > Retrieval Settings
1.  Set a limit if you wish
1.  Set auto retrieve if you wish


For .mac - its pretty similar:


1.  Open Messaging Application
1.  Options > Settings > Email > Mailboxes
1.  Options > New Mailbox
1.  Mailbox Type: IMAP
1.  E-mail: your .mac mail
1.  Incoming server: mail.mac.com
1.  Outgoing server: smtp.mac.com
1.  Access Point, choose Always ask or your preferred one
1.  In Mailbox name keep mac or choose something meaningful to you
1.  Finish
1.  Options > Settings > Email > Mailboxes > Mac
1.  Connection settings
1.  Incoming e-mail
1.  Username: your .mac account user (note - not the e-mail like the gmail config - this is your username)
1.  Password: your password
1.  Back > Outgoing
1.  Username/password as for incoming, security TLS/SSL port 25
1.  Back > Back > User settings
1.  Enter your Name as you want to display
1.  Back > Retrieval Settings
1.  Set a limit if you wish
1.  Set auto retrieve if you wish


Personal server (debian etch):

This is talking to a courier imap with ssl (OpenSSL) and exim4 (GnuTLS)

The settings are all the same as above (replace user, pass and host etc as needed).

For secure IMAP or POP3 - just choose SSL/TLS. Self-generated certificate gives a warning on the phone but you can choose to continue.

NOTE: At present the n95 refuses to talk SSMTP to the exim4 server. Doesn't matter if I use StartTLS, SSL/TLS and whatever port. It just gives a long long wait at Connecting to mailbox 'mailbox name' followed by a General - Operation timed out error message.

I wonder if this is like the SonyEricsson p990i that could talk OpenSSL but not GnuTLS. But nothing is logged on the server at all :(
