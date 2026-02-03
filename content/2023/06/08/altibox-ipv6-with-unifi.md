---
title: Altibox IPv6 with Unifi
date: 2023-06-08 21:58 +0200
tags: [altibox, ipv6, unifi, unifi gateway, unifi controller, dhcpv6]
intro: How to get IPv6 from altibox with a modem in bridge mode and a unifi network
image: /images/posts/2023/06/internet-wan1.png
---

Altibox do support IPv6 to the home.

In fact - they support it on most modems - [5 of the 6 here are listed](https://www.altibox.no/privat/ipv6/).

In my case - the FMG modem is listed - but in bridge mode we need to configure the network correctly.

It turns out that they are providing a standard DHCPv6 connection - with a prefix delegation size of /56.

So - there are two parts to this - one is to configure the WAN interface - the other the network.

### Note!

Both originally and also recently after I restored my controller from backup (disk switch) - I did not get IPv6 straight away.

In both cases - after I power cycled the USG 4 Pro router - it all started to work.

---

## WAN settings

So - in the network application on the unifi controller - under settings > internet > primary

- IPv6 connection: DHCPv6
- Prefix Delegation Size: 56.

![Primary WAN settings](/images/posts/2023/06/internet-wan1.png)

---

## Network settings

Now - for each network that is to get IPv6 (for this example just the default network) - settings > networks > default

My understanding of the prefix ID is it divides the supplied net into /64 blocks. So - ID 0 is ...::0/64, ID 1 is ...::1/64 etc. I just took 1 - any /64 is more than I need - but - if wanted - you could use different IDs on different local networks.

Under IPv6

- IPv6 Interface Type: DHCPv6
- IPv6 Prefix ID: 1
- IPv6 Prefix Delegation Interface: WAN
- Router Advertisement (RA): enable
- RA Priority: High (was the default value)
- RA Valid Lifetime: 28800 (just set it to double the preferred lifetime)
- RA Preferred Lifetime: 14400 (was the default value)
- DHCPv6/RDNSS DNS Control: enable it if you want the default DNS from altibox - disable and set manually if you want to control it.

![Default network IPv6 settings](/images/posts/2023/06/networks-default.png)

### Public DNS servers

| Provider   | IPv4    | IPv6                 |
| ---------- | ------- | -------------------- |
| Cloudflare | 1.1.1.1 | 2606:4700:4700::1111 |
| Google     | 8.8.8.8 | 2001:4860:4860::8888 |
| Google     | 8.8.4.4 | 2001:4860:4860::8844 |
