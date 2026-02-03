---
title: Converting existing bind9 and dhcpd to dynamic dns
date: 2008-06-08 14:54:03 +0200
tags: [dns, bind9, dhcp, named, dhcp3, ddns, dynamic dns]
---

I have a working dns (bind9) and dhcpd running on my home lan. This adds dynamic dns updates from dhcpd to bind9.

The following is mostly based on [http://www.semicomplete.com/articles/dynamic-dns-with-dhcp/](http://www.semicomplete.com/articles/dynamic-dns-with-dhcp/). Kudos til Trygve Laugstøl for assistance too :)

####Key

First - generate a key to use:

    dnssec-keygen -a hmac-md5 -b 128 -n USER dhcpupdate

This generates two files - you want the key from the *.key file - the last string on the line - will look like an md5.

####Bind9

Now - update bind. I use debian's basic setup - so my edits are in /etc/bind/named.conf.local

Add to the file

    key dhcpupdate {
      algorithm hmac-md5;
      secret "your key - keep the quotes here";
    };

Then to each of the zone statements add

    allow-update { key dhcpupdate; };

Here are my two zones updated:

    zone "home.chrissearle.org" {
            type master;
            file "/etc/bind/home.chrissearle.org";
            allow-update { key dhcpupdate; };
   };

    zone "1.168.192.in-addr.arpa" {
            type master;
            file "/etc/bind/1.168.192.in-addr.arpa";
            allow-update { key dhcpupdate; };
    };

Make sure that the bind process can write to the location on disk where the zone files are - it will need to write the journal files there. In my case chmod g+w /etc/bind was needed.

####Testing bind9

Restart bind and then use the nsupdate command

This is based on my setup - home.chrissearle.org/192.168.1.x

    # nsupdate
    > server localhost
    > key dhcpupdate thekeygoesherenoquotes
    > update add 50.1.168.192.in-addr.arpa 600 IN PTR testnode.home.chrissearle.org.
    > send
    > update add testnode.home.chrissearle.org. 600 IN A 192.168.1.50
    > send

The site linked above has more info on what errors you can get and what they often mean.

####dhcpd

NOTE - I am running debian stable (etch). And I was using the dhcp package - this is 2.0 - way too old. Install dhcp3-server and purge dhcp or this **simply won't work**.

To the top of my dhcpd.conf file I added the following (note that the authoritative line is due to upgrading dhcp from v2 to v3):

    ddns-update-style interim;

    update-static-leases on;

    authoritative;

    key dhcpupdate {
      algorithm hmac-md5;
      secret the-key-goes-here-no-quotes-this-time;
    }

    zone 1.168.192.in-addr.arpa {
      primary localhost;
      key dhcpupdate;
    }

    zone home.chrissearle.org {
      primary localhost;
      key dhcpupdate;
    }

I have my home domain in a group:

    group {
        option subnet-mask      255.255.255.0;
        option routers  192.168.1.2;
        option domain-name-servers      192.168.1.2;
        option domain-name      "home.chrissearle.org";
        ddns-domainname "home.chrissearle.org";

All that has changed here is the added ddns-domainname line.

And for each host where I allocate fixed IP based on mac - add a ddns-hostname. For example:

    host slippen {
      hardware ethernet 00:16:CB:B9:F5:B6;
      fixed-address 192.168.1.6;
      ddns-hostname "slippen";
    }

Finally - for the dhcp range for non-fast IP addresses:

                ddns-hostname = binary-to-ascii(10, 8, "-", leased-address);
                ddns-domainname = "home.chrissearle.org";



Hint - if your bind9 process listens to the internet then you must look at protecting ddns updates - probably with bind's controls{} syntax.
