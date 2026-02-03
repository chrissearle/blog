---
title: Leopard issues
date: 2007-12-02 10:18:03 +0100
tags: [mac, osx, leopard]
---

Folllowing issues after update (updated 8:55 wed 19th dec)

####Can't send mail

Leopard refuses to use the self-signed certificate for my exim4 server (although it can use the courier imap certificate just fine and the two certificates are in the same place in the system keychain). Posted: [discussions.apple.com](http://discussions.apple.com/thread.jspa?threadID=1271815&tstart=0). Gives error Operation could not be completed. (MFMessageErrorDomain error 1035.) and in the logs Couldn't register server "com.apple.KeychainProxyServer" on this host. **Fixed by complete replacement of login keychain and removal of .mac keychain sync**

####Refusues to remember passwords for mail


Just keeps on asking about mail passwords each time Mail.app is started **Fixed by complete replacement of login keychain and removal of .mac keychain sync**

####Refuses to open some sites in safari

I have some Trac sites that are Basic Auth protected behind https. Safari just times out - never shows the Basic Auth dialog. Firefox logs in just fine. **Fixed by complete replacement of login keychain and removal of .mac keychain sync**

####Downloads stall

Larger downloads just stall out on my home LAN. Only leopard boxes exhibit this. I wonder if it is to do with Self tuning TCP ([discussions.apple.com](http://discussions.apple.com/thread.jspa?threadID=1238813&tstart=0)) but haven't found a way to test. Tried a test of reducing MTU to 1400 from 1500 (default) but it didn't help. **Workaround found: sysctl -w net.inet.tcp.rfc1323=0** This turns off the packet resizing code which seems to be struggling with my OpenBSD 3.3 firewall. When I get the 4.0 firewall up and running I will test again.
