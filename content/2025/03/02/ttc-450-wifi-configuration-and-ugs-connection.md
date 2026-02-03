---
title: TTC-450 wifi configuration and UGS connection
date: 2025-03-02 13:47 +0100
tags: [ttc-450, cnc, mac, osx, universal gcode sender, ugs, gcode, grbl]
intro: How to connect TTC-450 to wifi when you can't enter the password and how to connect to it over the network from UGS.
---

The TTC-450 sometimes stops dead while milling - and I have to unplug/replug the USB, reconnect UGS and start again - which works as I'm setting G28.1 and the programs start with G28 - so - don't power down so you keep your reference.

Apparently this can be due to EMI interference from the spindle driver (this is using the 500w spindle kit with the external power box).

I wonder if WiFi would be less affected.

The TTC-450 has a wifi configuration screen which allows you to scan for networks and to enter the password.

However - the keyboard isn't complete - of all the suitable wifi connections I have - none of them had a password where all the required characters were available via the onscreen keyboard.

## Connecting to WiFi

So - here's where sending ESP commands via the grbl console helped.

It's worth knowing that the controller in the TTC-450 is a MKS-DLC32.

Some searching around the issues lists found [this comment](https://github.com/makerbase-mks/MKS-DLC32/issues/12#issuecomment-967408225)

So - first - connect to the TTC-450 in UGS via USB.

Enter the following commands line by line

```plain
$ESP444=RESTART
$ESP115=ON
$ESP100=Your_SSID
$ESP101=Your_SSID_Password
$ESP110=STA
$ESP444=RESTART
$ESP115=ON
```

After each RESTART - wait for it to completely restart before sending the next command.

It may auto-connect after restart or if not should try to connect after the call to ESP115.

I tried two networks - it managed to connect to the second one but not the first - I have no idea why.

However - it did manage to get an address on the second network and shows connected on the screen.

## Connecting UGS over WiFi

Head to Settings > UGS and change connection driver from JSerialComm to TCP, apply and then exit settings.

On the connection bar set the following:

- Firmware: GRBL
- Host: IP address (or if you've setup a hostname you can use that too)
- Baud: 23

Note that it's using the baud entry for the TCP port - not the speed!

On connection - it showed:

```plain
Connecting to tcp://IP_ADDRESS:23
```

I tested it by sending `$$` and it responds with the current parameter settings.

Next steps - try to send a model over TCP for actual milling.
