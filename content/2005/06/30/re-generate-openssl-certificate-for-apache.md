---
title: Re-generate openssl certificate for apache
date: 2005-06-30 09:09:36 +0200
tags: [linux, ssl, apache2]
---

Just a note to self - to generate a new certificate

```shell
openssl req -new -key /etc/ssl/private/keyfile -x509 -days nnn -out /etc/apache2/ssl/certfile
```
