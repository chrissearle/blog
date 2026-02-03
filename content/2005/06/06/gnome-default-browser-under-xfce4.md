---
title: Gnome default browser - under xfce4
date: 2005-06-06 12:22:01 +0200
tags: [linux, gnome, xfce]
---

Running xfce4 - and have no gnome control panel - but I needed to change the default browser.

```shell
gconftool -g /desktop/gnome/url-handlers/http
gconftool -g /desktop/gnome/url-handlers/https
```

will tell you what is set - in my case "epiphany %s"

I tend to use opera - so

```shell
gconftool -s /desktop/gnome/url-handlers/http -t string 'opera -newpage %s'
gconftool -s /desktop/gnome/url-handlers/https -t string 'opera -newpage %s'
```

did the trick
