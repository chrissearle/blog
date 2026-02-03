---
title: Catalina and USB Serial chips
date: 2019-11-22 22:59 +0100
tags: [iot, wemos, lolin, esp8266, esp32, cp2102, ch341, ch340, osx, catalina, mac]
intro: To get some devices running under Mac OSX I have been using the drivers from mac-usb-serial.com - it seems that the ones I need are now working in Catalina out of the box
---

Up until recently - working with ESP8266 and ESP32 devices on Mac OSX required obtaining USB to serial drivers so that the correct port under /dev/ would work when the device was connected.

My usual devices are the Wemos D1 mini (CH341), the Wemos D1 mini pro (CP2102) and the Lolin D32 (CH341) - the first two are ESP8266, the last an ESP32.

After testing a lot of free drivers - I downloaded the serial detect app from https://www.mac-usb-serial.com/ - and then when that detected the devices - I actually bought the drivers and they have worked well.

However - while looking into if they were ready for catalina I stumbled across a post (to which I've sadly lost the link) stating that apple had added some support.

I tested tonight - and all my devices work on catalina out of the box - no custom driver needed.

So - up until Mojave the mac-usb-serial drivers were pretty solid - and the serial detect app is also a fast way to find out what chipset a device is using - but - for CH341 and CP2102 at least I don't seem to need to install extra drivers any more.
