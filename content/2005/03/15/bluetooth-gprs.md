---
title: Bluetooth/GPRS
date: 2005-03-15 12:33:34 +0100
tags: [linux, bluetooth]
---

Running a dial-up over bluetooth to a S700i.

Most of this is cargo-culted from the pages listed on holtmann.org (page no longer available) - with most of it coming from [teaparty.net](http://www.teaparty.net/technotes/blue-gprs.html).

Installed bluez-hcidump, bluez-pin and bluez-utils.

Used hcidump and sdptool to scan for the device - got the device's id.

bluez-pin worked for me - so I kept that.

### Config files.

/etc/bluetooth/hcid.conf - unchanged

/etc/bluetooth/rfcomm.conf

    rfcomm0 {
      bind yes;
      device device_id;
      channel 1;
      comment "S700i GPRS";
    }

/etc/ppp/peers/gprs

    /dev/rfcomm0 57600
    connect '/usr/sbin/chat -v -f /etc/chatscripts/gprs'
    noauth
    defaultroute
    replacedefaultroute
    debug

NB - debug can probably be removed - replacedefaultroute too - that was used for testing whilst still online via normal net connection.

/etc/chatscripts/gprs

    TIMEOUT         120
    ABORT           'BUSY'
    ABORT           'ERROR'
    ABORT           'NO CARRIER'
    ''              'ATE1'
    OK              AT+CGDCONT=1,"IP","internet"
    OK              ATD*99***1#
    # or OK         ATD*99#
    CONNECT         \d\c

To connect

    sudo rfcomm bind rfcomm0
    sudo pppd call gprs

This brings up ppp0 and sets the default route so that communication goes over this.

To disconnect - wish I knew how to do this properly - at present

1. Kill the pppd process
1. sudo rfcomm release rfcomm0
1. Reset the defaultroute (with a /etc/init.d/networking restart) - this is only necessary when testing (see comment above about replacedefaultroute).

ifdown ppp0 doesn't work (complains about not being configured) - pppd disconnect needs a script I don't have.
