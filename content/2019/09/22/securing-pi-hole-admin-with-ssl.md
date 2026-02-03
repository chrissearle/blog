---
title: Securing pi-hole admin with SSL
date: 2019-09-22 12:20 +0200
tags: [pi-hole, ssl]
intro: I recently added a running copy of pi-hole onto a spare raspberry pi to test. Moving it to https
---

I recently added a running copy of pi-hole onto a spare raspberry pi to test.

One thing I wanted to do was to make the admin view work with https.

[This FAQ on enabling SSL](https://discourse.pi-hole.net/t/enabling-https-for-your-pi-hole-web-interface/5771) has most of the information needed.

However - I am not using letsencrypt for this sort if internal setup - instead I have set up a [local CA](/2019/09/18/internal-certificate-authority-with-openssl-and-caman/).

So - for this setup there were three steps:

## Certificates

Using the [caman setup](/2019/09/18/internal-certificate-authority-with-openssl-and-caman/) - add and sign a new certificate:

```shell
cd caman
./caman new pi-hole.my.local.domain
./caman sign pi-hole.my.local.domain
```

Now we need two files on the pi-hole machine.

- Copy the CA certificate `ca/ca.crt.pem` to `/etc/lighttpd/fullchain.pem`
- Copy the site certificate `store/pi-hole.my.local.domain/_date_/pi-hole.my.local.domain.keycrt.pem` to `/etc/lighttpd/combined.pem`

Note you need the keycrt.pem in combined - both key and certificate

## Lighttpd external.conf

Copy the suggested config from [the FAQ](https://discourse.pi-hole.net/t/enabling-https-for-your-pi-hole-web-interface/5771) and change the domain to `pi-hole.my.local.domain`.

## Lighttpd modules

At this point - when I did a config check (`lighttpd -t -f /etc/lighttpd/lighttpd.conf`) and it said I needed to enable the SSL module.

I did so with `lighty-enable-mod ssl`. However - this added two things to `/etc/lighttpd/conf-enabled/10-ssl.conf` (symlinked in from conf-available by the call to lighty-enable-mod) - the first loads the SSL module - the second tries to use a server.pem certificate on 0.0.0.0:443. I only want the module loading so I changed the file to simply be:

```
server.modules += ( "mod_openssl" )
```

And then restarted with service lighttpd restart

That was enough to get `https://pi-hole.my.local.domain/admin` to work.
