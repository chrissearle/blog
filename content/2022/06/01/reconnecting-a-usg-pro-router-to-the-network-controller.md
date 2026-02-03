---
title: Reconnecting a USG Pro router to the network controller
date: 2022-06-01 08:37 +0200
tags: [unifi, unifi controller, ubiquiti, unifi gateway]
intro: Unifi gateway (USG-Pro-4) was showing as disconnected in the network application/controller - but had a fully functioning inform url. However it was routing correctly - was it possible to fix this without a restart?
image: /images/posts/2022/06/unifi.png
---

In the Unifi controller/network application - the router was showing as "offline".

![Unifi Network Application - router showing offline](/images/posts/2022/06/unifi.png)

It was also not available via Ubiquiti's [online proxy](https://unifi.ui.com/) - so something was not working well.

However - since it was routing just fine - and the network was in use - was it possible to get things sorted without a restart and loss of connectivity?

First step was to ssh to the router and run the info command:

```text
admin@MainRouter:~$ info
Model: UniFi-Gateway-4
Version: 4.4.55.5377109
MAC Address: xx:xx:xx:xx:xx:xx
IP Address: xx.xx.xx.xx
Hostname: MainRouter
Uptime: 30865255 seconds
Status: Connected (http://192.168.1.x:8080/inform)
```

Note that it does have a non-standard inform url set - but this was correct for this installation. Also - the status showed "Connected".

So - first steps were to try to trigger a re-connect via setting the inform url (set-inform ...).

However - no combination worked - set-inform to the current url - no change. Set to the hostname for that IP - no change. Set to a non-answering and then set back - no change. In all cases it just said:

```text
Adoption request sent to 'http://HOSTNAME:8080/inform'.  Use the controller to complete the adopt process.
```

So - something was stuck.

A check of /var/log/messages showed a bunch of these:

```text
MainRouter mcad: mcad[PID]: ace_reporter.reporter_fail(): Unknown[11] (http://HOSTNAME:8080/inform)
```

Most googling suggested that this was solved by a restart - but I still wanted to see if we could fix it without that first.

It looks like the process controlling this is mcad. Was it running - `ps` said yes.

OK - how is it started?

By `/etc/init.d/unifi-init`

So - a simple restart - first a sudo su just to see if I had permission (logged in as the user configured from the network application as ssh user - so I hoped I did - and it turned out I did) - then a restart:

```shell
sudo su
/etc/init.d/unifi-init restart
```

Suddenly the controller was showing the router as "Adopting", then "Getting Ready" and finally "Online".

Success :)
