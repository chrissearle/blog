---
title: Building a debian firewall on a CF card
date: 2008-04-05 20:56:53 +0200
tags: [linux, debian, firewall, dns, bind, bind9, dhcp, iptables]
---

I currently have an OpenBSD firewall running on an ancient 586. I have a mini-itx board, CF/IDE converter and a CF card and have been intending to upgrade.

However - rather than OpenBSD I'm going to try for debian (since I know that much better).

This post will end up being a "how I did it" - but at the minute is just a collection of the notes I'm grabbing for now.

For the initial install - I hung a CD-ROM as the slave IDE unit on the primary IDE channel.

I used the 4.0r3 etch netinst CD downloaded from debian.org.

Install went smoothly once I replaced the CF-IDE converter with a [newer one that supported DMA](http://www.komplett.no/k/ki.aspx?sku=339710) (the newer CF card was DMA compatible) as I simply could not get the installer to disable DMA. However - see [debian bug 475223](http://bugs.debian.org/cgi-bin/bugreport.cgi?bug=475223:) for information on how you could actually do that.

###Disk Mounting

From [http://www.debian-administration.org/articles/179](http://www.debian-administration.org/articles/179) I got a starter fstab and the hint about mtab. Here's the versions I ended up with:

**/etc/fstab**

    proc            /proc           proc    defaults        0       0
    /dev/hda1   /               ext2    noatime,errors=remount-ro 0       1
    tmpfs          /etc/network/run tmpfs defaults,noatime                   0 0
    tmpfs          /tmp           tmpfs   defaults,noatime                   0 0
    tmpfs          /var/lock      tmpfs   defaults,noatime                   0 0
    tmpfs          /var/log       tmpfs   defaults,noatime                   0 0
    tmpfs          /var/run       tmpfs   defaults,noatime                   0 0
    tmpfs          /var/tmp       tmpfs   defaults,noatime                   0 0

*Warning: By mounting /var/log on tmpfs, logs will only be available for the current session.*

**/etc/mtab**

    rm -f /etc/mtab
    ln -s /proc/mounts /etc/mtab

###Network

**IPv6**

I have some issues with things when IPv6 is running. So, to disable IPV6 I added:

    blacklist ipv6

to /etc/modprobe.d/blacklist.

So - now the server boots, mounts the highly active parts of the system on tmpfs (we don't want to burn out the CF card).

**Network**

I need both ports to come up - one to the ISP, one internal.

*TODO: what is the allow-hotplug bit?*

**/etc/network/interfaces**

    # The loopback network interface
    auto lo eth0 eth1
    iface lo inet loopback

    # The external interface
    allow-hotplug eth0
    iface eth0 inet static
        address 213.187.160.178
        netmask 255.255.255.252
        gateway 213.187.160.177

    # The internal interface
    iface eth1 inet static
        address 192.168.1.2
        netmask 255.255.255.0

###Services

**SSH**

Install ssh with aptitude.

I configured up ssh with the following sshd_config file (/etc/ssh):

    Port 22
    Protocol 2
    HostKey /etc/ssh/ssh_host_rsa_key
    HostKey /etc/ssh/ssh_host_dsa_key
    UsePrivilegeSeparation yes

    KeyRegenerationInterval 3600
    ServerKeyBits 768

    SyslogFacility AUTH
    LogLevel INFO

    LoginGraceTime 120
    PermitRootLogin yes
    StrictModes yes

    RSAAuthentication yes
    PubkeyAuthentication yes

    IgnoreRhosts yes
    RhostsRSAAuthentication no
    HostbasedAuthentication no

    PermitEmptyPasswords no

    ChallengeResponseAuthentication no

    # Remember to make sure that you have a working set of .ssh/authorized_keys before changing this from yes to no!
    PasswordAuthentication no

    X11Forwarding no
    PrintMotd no
    PrintLastLog yes
    TCPKeepAlive yes

    AcceptEnv LANG LC_*

    Subsystem sftp /usr/lib/openssh/sftp-server

    UsePAM yes

**DNS**

Install bind9 with aptitude.

Two new files in /etc/bind:

**/etc/bind/home.chrissearle.org**

    $ORIGIN .
    $TTL 3600       ; 1 hour
    home.chrissearle.org            IN SOA  ns.home.chrissearle.org. hostmaster.chrissearle.org. (
                                    2008041201    ; serial
                                    3600            ; refresh 1 hr
                                    1800            ; retry 30 mins
                                    604800          ; expire 1 wk
                                    3600            ; minimum 1 hr
                                    )
                            NS      ns.home.chrissearle.org.

    $ORIGIN home.chrissearle.org.
    menavaur              A  192.168.1.1     ; Old firewall
    nornour               A  192.168.1.2     ; New firewall
    dolphin-tp            A  192.168.1.3     ; Astrid mac mini LAN
    dolphin               A  192.168.1.4     ; Astrid mac mini WLAN
    slippen-tp            A  192.168.1.5     ; Chris laptop LAN
    slippen               A  192.168.1.6     ; Chris laptop WLAN
    czar                  A  192.168.1.7     ; Linux file server
    goldeneagle           A  192.168.1.8     ; Astrid XP
    galatea-tp            A  192.168.1.9     ; Chris laptop (work) LAN
    galatea               A  192.168.1.10    ; Chris laptop (work) WLAN
    bonnet                A  192.168.1.11    ; Chris iMac
    shah                  A  192.168.1.12    ; Unused
    islander              A  192.168.1.13    ; Unused
    serica                A  192.168.1.14    ; Unused
    klondyke              A  192.168.1.15    ; Unused
    campernel             A  192.168.1.16    ; Unused
    bedroom-tp            A  192.168.1.30    ; Airport
    bedroom               A  192.168.1.31    ; Airport
    lounge-tp             A  192.168.1.32    ; Airport
    lounge                A  192.168.1.33    ; Airport
    store                 A  192.168.1.34    ; ReadyNAS NV+
    wii                   A  192.168.1.35    ; Wii
    dhcp50                A  192.168.1.50    ; DHCP
    dhcp51                A  192.168.1.51    ; DHCP
    dhcp52                A  192.168.1.52    ; DHCP
    dhcp53                A  192.168.1.53    ; DHCP
    dhcp54                A  192.168.1.54    ; DHCP
    dhcp55                A  192.168.1.55    ; DHCP
    dhcp56                A  192.168.1.56    ; DHCP
    dhcp57                A  192.168.1.57    ; DHCP
    dhcp58                A  192.168.1.58    ; DHCP
    dhcp59                A  192.168.1.59    ; DHCP
    dhcp60                A  192.168.1.60    ; DHCP
    wifi1                 A  192.168.1.200   ; Linksys AP
    wifi2                 A  192.168.1.201   ; Linksys AP
    ns                    CNAME  nornour             
    irc                   CNAME  czar                
    web                   CNAME  czar                

**1.168.192.in-addr.arpa**

    $ORIGIN .
    $TTL 3600       ; 1 hour
    1.168.192.in--addr.arpa            IN SOA  ns.home.chrissearle.org. hostmaster.chrissearle.org. (
                                    2008041201    ; serial
                                    3600            ; refresh 1 hr
                                    1800            ; retry 30 mins
                                    604800          ; expire 1 wk
                                    3600            ; minimum 1 hr
                                    )
                            NS      ns.home.chrissearle.org.

    $ORIGIN 1.168.192.in--addr.arpa.
    1    PTR  menavaur.home.chrissearle.org.          ; Old firewall
    2    PTR  nornour.home.chrissearle.org.           ; New firewall
    3    PTR  dolphin-tp.home.chrissearle.org.        ; Astrid mac mini LAN
    4    PTR  dolphin.home.chrissearle.org.           ; Astrid mac mini WLAN
    5    PTR  slippen-tp.home.chrissearle.org.        ; Chris laptop LAN
    6    PTR  slippen.home.chrissearle.org.           ; Chris laptop WLAN
    7    PTR  czar.home.chrissearle.org.              ; Linux file server
    8    PTR  goldeneagle.home.chrissearle.org.       ; Astrid XP
    9    PTR  galatea-tp.home.chrissearle.org.        ; Chris laptop (work) LAN
    10   PTR  galatea.home.chrissearle.org.           ; Chris laptop (work) WLAN
    11   PTR  bonnet.home.chrissearle.org.            ; Chris iMac
    12   PTR  shah.home.chrissearle.org.              ; Unused
    13   PTR  islander.home.chrissearle.org.          ; Unused
    14   PTR  serica.home.chrissearle.org.            ; Unused
    15   PTR  klondyke.home.chrissearle.org.          ; Unused
    16   PTR  campernel.home.chrissearle.org.         ; Unused
    30   PTR  bedroom-tp.home.chrissearle.org.        ; Airport
    31   PTR  bedroom.home.chrissearle.org.           ; Airport
    32   PTR  lounge-tp.home.chrissearle.org.         ; Airport
    33   PTR  lounge.home.chrissearle.org.            ; Airport
    34   PTR  store.home.chrissearle.org.             ; ReadyNAS NV+
    35   PTR  wii.home.chrissearle.org.               ; Wii
    50   PTR  dhcp50.home.chrissearle.org.            ; DHCP
    51   PTR  dhcp51.home.chrissearle.org.            ; DHCP
    52   PTR  dhcp52.home.chrissearle.org.            ; DHCP
    53   PTR  dhcp53.home.chrissearle.org.            ; DHCP
    54   PTR  dhcp54.home.chrissearle.org.            ; DHCP
    55   PTR  dhcp55.home.chrissearle.org.            ; DHCP
    56   PTR  dhcp56.home.chrissearle.org.            ; DHCP
    57   PTR  dhcp57.home.chrissearle.org.            ; DHCP
    58   PTR  dhcp58.home.chrissearle.org.            ; DHCP
    59   PTR  dhcp59.home.chrissearle.org.            ; DHCP
    60   PTR  dhcp60.home.chrissearle.org.            ; DHCP
    200  PTR  wifi1.home.chrissearle.org.             ; Linksys AP
    201  PTR  wifi2.home.chrissearle.org.             ; Linksys AP

Then we need to activate these two:

**/etc/bind/named.conf.local**

    zone "home.chrissearle.org" {
        type master;
        file "/etc/bind/home.chrissearle.org";
    };

    zone "1.168.192.in-addr.arpa" {
        type master;
        file "/etc/bind/1.168.192.in-addr.arpa";
    };

Restarted bind - now this is authoritative for my local net 192.168.1.x and forwards to the ISP for everything else.

**DHCPD**

Install dhcpd (virtual package) with aptitude.

Firstly - we want only to serve DHCP internally - that is on interface eth1.

**/etc/defaults/dhcp**

    INTERFACES="eth1"

Now configure it. Most internal machines get a fixed IP via MAC address, but there is also a range of .50 to .60 for visitors. 

**/etc/dhcpd.conf**

    group {
        option subnet-mask      255.255.255.0;
        option routers  192.168.1.2;
        option domain-name-servers      192.168.1.2;
        option domain-name      "home.chrissearle.org";

        host menavaur {
                hardware ethernet 00:60:08:47:03:69;
                fixed-address 192.168.1.1;
        }

        host dolphin-tp {
                hardware ethernet 00:16:CB:94:15:D3;
                fixed-address 192.168.1.3;
        }

        host dolphin {
                hardware ethernet 00:16:CB:05:8C:03;
                fixed-address 192.168.1.4;
        }

        host slippen-tp {
                hardware ethernet 00:16:CB:C9:2E:A3;
                fixed-address 192.168.1.5;
        }

        host slippen {
                hardware ethernet 00:16:CB:B9:F5:B6;
                fixed-address 192.168.1.6;
        }

        host czar {
                hardware ethernet 00:0A:5E:1F:3D:6F;
                fixed-address 192.168.1.7;
        }

        host goldeneagle {
                hardware ethernet 00:0C:6E:4D:48:DA;
                fixed-address 192.168.1.8;
        }

        host galatea-tp {
                hardware ethernet 00:1B:63:A8:06:8B;
                fixed-address 192.168.1.9;
        }

        host galatea {
                hardware ethernet 00:1C:B3:C5:21:5B;
                fixed-address 192.168.1.10;
        }

        host bedroom-tp {
                hardware ethernet 00:14:51:74:F6:AA;
                fixed-address 192.168.1.30;
        }

        host bedroom {
                hardware ethernet 00:14:51:74:F6:AB;
                fixed-address 192.168.1.31;
        }

        host lounge-tp {
                hardware ethernet 00:14:51:73:86:96;
                fixed-address 192.168.1.32;
        }

        host lounge {
                hardware ethernet 00:14:51:73:86:97;
                fixed-address 192.168.1.33;
        }

        host wii {
                hardware ethernet 00:19:1D:FE:A0:56;
                fixed-address 192.168.1.35;
        }

        host wifi1 {
                hardware ethernet 00:1A:70:AB:A4:AC;
                fixed-address 192.168.1.200;
        }

        host wifi2 {
                hardware ethernet 00:1A:70:AB:A6:91;
                fixed-address 192.168.1.201;
        }

    }
    shared-network LOCAL-NET {
        option  domain-name "home.chrissearle.org ";
        option  domain-name-servers 192.168.1.2;

        subnet 192.168.1.0 netmask 255.255.255.0 {
                option routers 192.168.1.2;

                range 192.168.1.50 192.168.1.60;
        }
    }

**DenyHosts**

Denyhosts will add hosts to /etc/hosts.deny if they try things like brute force attacks on ssh.

Install denyhosts with aptitude.

Configure the /etc/denyhosts.conf file - I simply changed the mail addresses and mail server - everything else was left defaulted.

**IPTables**

From [http://www.debian-administration.org/articles/23](http://www.debian-administration.org/articles/23) and [http://www.debian-administration.org/articles/73](http://www.debian-administration.org/articles/73) - the following iptables script was generated.

**/etc/network/if-ip.d/00-firewall**

    #!/bin/sh

    PATH=/usr/sbin:/sbin:/bin:/usr/bin

    # Set policy
    iptables -P INPUT DROP
    iptables -P FORWARD DROP
    iptables -P OUTPUT ACCEPT

    # delete all existing rules.
    iptables -F
    iptables -t nat -F
    iptables -t mangle -F
    iptables -X

    # Always accept loopback traffic
    iptables -A INPUT -i lo -j ACCEPT

    # Allow established connections, and those not coming from the outside
    iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
    iptables -A INPUT -m state --state NEW -i ! eth0 -j ACCEPT
    iptables -A FORWARD -i eth0 -o eth1 -m state --state ESTABLISHED,RELATED -j ACCEPT

    # Allow outgoing connections from the LAN side.
    iptables -A FORWARD -i eth1 -o eth0 -j ACCEPT

    # NAT ssh (2222) and http (80) to an internal machine
    iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j DNAT --to 192.168.1.7:80
    iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 2222 -j DNAT --to 192.168.1.7:22

    # Open some ports externally (including the ports for NAT)
    iptables -A FORWARD -p tcp -m state --state NEW --dport 22 -i eth0 -j ACCEPT
    iptables -A FORWARD -p tcp -m state --state NEW --dport 80 -i eth0 -j ACCEPT
    iptables -A FORWARD -p tcp -m state --state NEW --dport 2222 -i eth0 -j ACCEPT

    # Masquerade.
    iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

    # Don't forward from the outside to the inside.
    iptables -A FORWARD -i eth0 -o eth0 -j REJECT

    # Enable routing.
    echo 1 > /proc/sys/net/ipv4/ip_forward
