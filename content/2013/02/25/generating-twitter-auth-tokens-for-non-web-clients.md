---
title: Generating twitter auth tokens for non-web clients
date: 2013-02-25 12:15:04 +0100
tags: [ruby, twitter, oauth]
---

I use twitter for various system stuff - and needed a way to get auth tokens for users for twitter oauth based apps.

Twitter provides PIN based authentication for this - you generate a URL based on the consumer token/secret - visit that - log in - get a PIN and use the PIN to generate the auth token/secret.

:download{title="get_keys.rb" path="/files/posts/2013/02/get-keys.rb"} is a simple ruby script to do just that.

It takes consumer_token and consumer_secret as command line params (in that order), generates the authorize URL and prints it - then waits for the PIN. Displays consumer and auth token info at the end.
