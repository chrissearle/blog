---
title: TTC-450 on Mac OSX
date: 2024-09-19 11:48 +0200
tags: [ttc-450, cnc, mac, osx, universal gcode sender, ugs, gcode, grbl]
category: 3D Printing - Laser Cutting - CNC
intro: Running the TTC-450 desktop CNC on Mac OSX
---

The TTC-450 desktop CNC comes with support for various pieces of software. Candle is included.

According to [Two Trees FAQ](https://www.twotrees3dofficial.com/pages/help-center):

> Install the software candle, which can be used for free on the Windows system, it does not support the MAC system.

(even though it appears that candle in some form does - there are some forks out there).

They also state that it requires installation of the CH340 serial USB driver.

Recent versions of Mac OSX come with support for the CH340 chipset already.

The simplest setup seems to be to install Universal Gcode Sender - connect via USB - choose the port and connect the machine as a standard GRBL device.

This does work - however the connection is unstable.

The symptom is that the program just stops. The CNC sits still - spindle still running.

The only way to get the connection back is to disconnect/reconnect the cable - and then restart the program entirely.

I am not currently sure if this is an issue on the mac, on the CNC or the cable itself.


