---
title: 3d printed arduino lamp
date: 2018-06-03 10:11 +0200
tags: [3d printing, arduino, lamp, ws2812b]
category: 3D Printing - Laser Cutting - CNC
image: /images/posts/2018/06/lamp.jpg
intro: LED strip light 3D printed lamp
---

## The model

A fairly long time ago I found and printed [this model: Celluar Lamp](https://www.thingiverse.com/thing:19104). I even scaled it up in size - just to see if I could print it.

## The lamp

So - then of course the next question arose - what to do with it. I decided to use up one of the strips of programmable WS2812B LEDs I had lying around.

So - I needed something to put the strip on, and something to diffuse the LEDs with.

The holder was basically just a tube I could wind the LEDs around with a base and a hole to allow me to thread the wires to the inside:

![LED holder](/images/posts/2018/06/led-holder.png)

The diffuser is just a simple cylinder - printed in vase mode with no top or bottom.

## The wait

Then the project just sat and collected dust for a while. I knew I wanted to control it using a Wemos D1 mini arduino for the built in wifi, and I knew I'd settled on using the FastLED library for the LEDs - but I couldn't be bothered to do the work :)

## The lamp lives

The last night I found [FastLED + ESP8266 Web Server](https://github.com/jasoncoon/esp8266-fastled-webserver) on github. Perfect.

All I had to do was change the wifi details and set the correct number of LEDs.

That meant that we now have the lamp functional.

![Lamp](/images/posts/2018/06/lamp.jpg)

## The lamp is not finished

Things still to do:

- Get a proper power supply and connect it directly instead of via USB and route it in at the base instead of the top
- Monitor the temperature - I need to set a max brightness/allowed current so that it doesn't get too warm

## The video

A short mobile phone recording showing some of the modes that the program provides. Note that you can also set a single solid RGB colour at a chosen brightness - so it doesn't have to be moving/changing - but I didn't record that :)

:youtube{id="cDbYmUZQoEg" title="LED Lamp"}


## The STL files

- The main lamp is from the thingiverse link above
- :download{title="holder" path="/files/posts/2018/06/led-holder.stl"}
- :download{title="diffuser" path="/files/posts/2018/06/diffuser.stl"}
