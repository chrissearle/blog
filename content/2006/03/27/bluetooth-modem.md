---
title: Bluetooth modem
date: 2006-03-27 17:12:28 +0200
tags: [mac, bluetooth, p990i]
---

Well - having got the mac mini - time to get bluetooth net access running - just for the fun of it.

To get bluetooth internet access running for my S700i Sony Ericsson I found the following two places useful

For a tutorial:
[http://www.crackistan.com/2004/11/connect-gprs-via-sony-ericsson-k700i-mac-os-x-bluetooth/](http://www.crackistan.com/2004/11/connect-gprs-via-sony-ericsson-k700i-mac-os-x-bluetooth/)

For the Sony Ericsson modem scripts
[http://www.taniwha.org.uk/](http://www.taniwha.org.uk/)

For Telenor - the CID of the downloaded internet connection was 1.

So I used:

*PPP*:

    Service Provider: Telenor
    Account Name: internet
    Password: seems to work with either empty or "guest"
    Telephone Number: blank

*TCP/IP*:

    Configure IPv4: Using PPP

*Bluetooth Modem*:

    Modem: Sony Ericsson GPRS CID1 +CGQREQ
    Enable error correction and compression in modem: Checked
    Wait for dial tone before dialing: Checked
    Show Bluetooth status in menu bar: Checked
    Show modem status in menu bar: Checked
