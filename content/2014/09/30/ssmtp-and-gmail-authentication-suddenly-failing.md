---
title: sSMTP and Gmail - authentication suddenly failing
date: 2014-09-30 12:27 +0200
tags: [mail, gmail, google, smtp, ssmtp]
intro: ssmtp suddenly isn't able to get a valid authentication from gmail
---

I've been running sSMTP as my mailer daemon for a long time using my google apps domain as mail server.

The config for this was pretty simple - /etc/ssmtp/ssmtp.conf:

```
root=me@my.domain.tld

mailhub=smtp.gmail.com:587

rewriteDomain=domain.tld

hostname=server.domain.tld

FromLineOverride=YES

AuthUser=notifications@domain.tld
AuthPass=users-gmail-password
AuthMethod=LOGIN

UseTLS=YES
UseSTARTTLS=YES
```

This has been working fine.

Recently I noticed mail was not getting through. I now see in the logs:

```
Creating SSL connection to host
SSL connection using RSA_ARCFOUR_SHA1
Authorization failed (535 5.7.8 http://support.google.com/mail/bin/answer.py?answer=14257 <mail.id> - gsmtp)
```

I've checked the password. I can log in to the web with it and send mail via the gmail web gui just fine.

I've turned on two-factor auth and set up an app specific password.

I've checked that SPF and DKIM are set up on the domain (a bit cargo-culting here - found this on a google help page)

Nothing helps. As far as I can see - everything is correct just that google will no longer accept mail from this ssmtp instance - and I have no idea why :(
