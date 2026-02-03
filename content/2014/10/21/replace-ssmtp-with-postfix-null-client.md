---
title: Replace ssmtp with postfix null client
date: 2014-10-21 09:49 +0200
tags: [mail, gmail, ssmtp, postfix]
intro: ssmtp failing to login to gmail for one machine - replacing with postfix null client
---

I've been using ssmtp to provide outgoing mail to two machines. This provides a simple way to send mail out using gmail without having to have a running mail server. It had the restriction that you had to log in to gmail to use it.

Recently for one of those machines this [stopped working with a login failure](/2014/09/30/ssmtp-and-gmail-authentication-suddenly-failing/). The same configuration worked on different machines as long as the machine's IP address was different. This suggests that it is in fact being blocked and could be due to sending more than 10 messages in a given period (the box doesn't send that many - but they are often close together due to cron runs etc).

So I decided to switch to postfix so that the machine could send mail itself via normal routes. But I do not want them to ever receive mail. Postfix seems to call this a null client.

I ended up with the following /etc/postfix/main.cf configuration

```
myhostname = FQDN
mydomain = chrissearle.org
myorigin = $mydomain

relayhost = RELAYHOST

inet_interfaces = loopback-only
inet_protocols = ipv4
mydestination =
```

Where FQDN is the FQDN of the box postfix is installed on and RELAYHOST is $mydomain for machines running out on the net and my ISP's mail relay for boxes at home.

All that was left to do was to fixup the SPF records for the domain (so that the ISPs mail relay was included) and mail started to flow again.

Another advantage is that I no longer have to login as a specific mail user - which means that websites hosted using apache virtual hosts can again send email as themselves rather than the notification user I was using.
