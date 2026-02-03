---
title: KK2.0 quad with DX6i TX and orange R615X RX
date: 2014-06-07 20:33 +0200
tags: [dx6i, kk2.0, quadcopter, spektrum]
category: Radio Control
image: /images/posts/2014/06/quad.jpg
intro: Replacing the Turnigiy TGY 9X radio with the DX6i
---

So - I've been running the KK2.0 quad with the Turnigy TGY 9X radio I got at the same time I built the quad.

Thing is - that the radio burnt out it's battery compartment when new. I replaced the connectors and it works fine - but it always smells newly burnt. Not good right? And I have the Spektrum DX6i radio for the blade quad I have.

The DX6i is only 6 channels - not 9 like the Turnigy - but I was using 5. So that's OK.

So - I decided to move the quad over to the DX6i radio.

That meant that after transfer I had one spare channel which I decided to use as a remote lights switch.

I've also removed the legs - I don't run a camera or gimbal on this quad (prefer the phantom for that) so I don't need a big set of legs hanging there. For support I've put a plastic golfball under each arm - just to raise it a little.

## Parts used

- [Orange R615X receiver](http://www.hobbyking.com/hobbyking/store/uh_viewItem.asp?idProduct=46632)
- [Turnigy Receiver Controlled Switch](http://www.hobbyking.com/hobbyking/store/uh_viewItem.asp?idProduct=8833)

## Binding

- Make sure the DX6i has the correct model selected and is turned _off_
- Put the binding loop on the battery/bind pins of the RX (actually this came delivered with this loop in place)
- Connect the throttle from the KK2.0 (middle of the 5 3-pin connectors) to the throttle on the RX
- Connected the battery to the power distribution board on the quad - the RX starts to flash - which means it is ready to bind
- Turn on the DX6i while holding the bind/trainer switch

At this point the RX should move from rapid flash to slow flash then solid LED. If it moves to slow flash and then no light - repeat. It was a bit fiddly getting the correct duration to hold the bind/trainer switch on the radio.

## Connections

The cables I use have three colours - orange, red, brown.

- Orange goes to the front of the RX (marked S on the end of the RX) - signal.
- Red is the middle pin - for voltage
- Brown is the third pin - ground (I believe)

On the KK2.0 the orange wire connects closest to the screen, the brown closest to the edge.

![KK2.0 Pinout](/images/posts/2014/06/kk2-info.jpg)

![R615X Pinout](/images/posts/2014/06/r615x-info.jpg)

Connections are simple and as expected:

- RX THRO <-> KK THR
- RX AILE <-> KK AIL
- RX ELEV <-> KK ELE
- RX RUDD <-> KK RUD
- RX AUX1 <-> KK AUX

The RX GEAR connects to the control connector for the Turnigy Receiver Controlled Switch. This means that the Gear switch on the radio will trigger that switch.

## Model configuration

Start with the default Acro (plane) model.

### Type and Name


```text
Setup List > Model Type > Acro
Setup List > Model Name > Something Meaningful for you
```

### Flaps

This is what will trigger the AUX1 port on the RX and hence RX on the KK2.0 (which I have set for self-levelling). This means that the flaps switch controls self-levelling.

```text
Adjust List > Flaps > LAND FLAP > Down 100
```

### Reverse

```text
Setup List > Reverse > Thro > N
Setup List > Reverse > Elev > R
Setup List > Reverse > Gear > N
Setup List > Reverse > Aile > R
Setup List > Reverse > Rudd > N
Setup List > Reverse > Flap > N
```

![Main Screen](/images/posts/2014/06/dx6i-main.jpg)

![Model Type](/images/posts/2014/06/dx6i-modeltype.jpg)

![Setup List > Reverse](/images/posts/2014/06/dx6i-reverse.jpg)

![Adjust List > Flaps](/images/posts/2014/06/dx6i-flaps.jpg)

## KK2.0 setup

### Receiver Test

Use the receiver test to make sure that the signal is getting through - moving the sticks - and check that they move in the right direction.

### Mode Settings

Setting to Aux here means we're going to use Aux (flaps switch) to control the self-levelling.

### Sensor Calibration

With the quad very level (need to make sure that all this fiddling/removal of parts/adding of new parts hasn't moved the controller).

### ESC Calibration

I still need to do this:

1. Important: TAKE OFF THE PROPELLERS OR DISCONNECT ONE WIRE FROM THE MOTORS!!
2. Turn off the KK2.0 FC power.
3. Turn on the transmitter and set the throttle to max.
4. Press down button 1 and 4 on the KK2.0 FC, keep pressing until last step. Releasing the buttons aborts the calibration.
5. Turn on power to the KK2.0 FC (hope you have several arms/hands).
6. Wait for the ESCs to beep full throttle calibrated signal. Takes a few seconds, depends on the ESC.
7. Lower the throttle to idle.
8. Wait for the ESC idle throttle calibrated signal.
9. Release the buttons on the KK2.0 FC.

## Result

The thing flies and it flies well. If anything it's _twitchy_ - far less movement on the DX6i sticks to get the same response as I used to get on the turnigy - so some tuning needed. But all-in-all - it works well. Flaps switch correctly moves it in and out of self-levelling, and the gear switch controls some LEDs on the unit.

![The quad itself](/images/posts/2014/06/quad.jpg)

Might not be the neatest build - but still not bad considering it's my first unit and it's been hacked back and forth since then :)
