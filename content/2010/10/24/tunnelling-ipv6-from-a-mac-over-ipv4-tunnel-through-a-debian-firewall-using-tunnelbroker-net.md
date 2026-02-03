---
title: Tunnelling IPv6 from a mac over IPv4 tunnel through a debian firewall using tunnelbroker.net
date: 2010-10-24 16:28:57 +0200
tags: [mac, debian, firewall, osx, iptables, ipv4, ipv6, tunnel, tunnelbroker.net]
---

## Tunnel configuration

Sign up for an account at [tunnelbroker](http://tunnelbroker.net)

Once signed up - choose _Create Regular Tunnel_

Enter the IPv4 address of the external interface of your firewall. Note - this must be able to receive and respond to ping from arc.he.net - the webpage will give you an IP address to allow ping for if it can't ping your firewall.

## Firewall configuration (debian lenny)

I had to open for incoming ping from he.net

```shell
iptables -A INPUT -p icmp -s 66.220.2.74 -d 0/0 -m state --state NEW,ESTABLISHED,RELATED -j ACCEPT
```

If your OUTPUT policy is not ACCEPT and doesn't allow ping then you may have to add some stuff there too.

You will need to forward protocol 41 to your inside box (my desktop is on the internal 192.168.1 network):

```shell
iptables -t nat -A PREROUTING -i eth0 -p 41 -j DNAT --to 192.168.1.x
iptables -t filter -A FORWARD -i eth0 -p 41 -d 192.168.1.x -j ACCEPT
```

## Client configuration (Mac Snow Leopard)

Head to [pugio.net](http://pugio.net/2009/01/enable-ipv6-on-mac-os-x-the-tu.html) - there is a shell script to enable the interface and a launchctl plist to enable at launch

## Test

Test with ping6 - for example:

```shell
chris$ ping6 pugio.net
PING6(56=40+8+8 bytes) 2001:xxxxxxxxxxxx --> 2002:4540:22b0::1
16 bytes from 2002:4540:22b0::1, icmp_seq=0 hlim=56 time=231.701 ms
16 bytes from 2002:4540:22b0::1, icmp_seq=1 hlim=56 time=209.833 ms
^C
--- pugio.net ping6 statistics ---
3 packets transmitted, 2 packets received, 33.3% packet loss
round-trip min/avg/max/std-dev = 209.833/220.767/231.701/10.934 ms
```
