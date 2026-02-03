---
title: Rabbit bedroom temperature monitoring with Arduino
date: 2014-10-14 08:31 +0200
tags: [rabbits, arduino, DS18B20]
series: Rabbit Hutch-Run
image: /images/posts/2014/10/circuit.png
intro: How to keep an eye on the rabbit run heated sleeping area
---

So - we've insulated the sleeping room (originally a garden cushion box) for the rabbits and mounted a heating panel that should keep it between 12˚C and 15˚C. But we need to keep an eye on it.

I could just get a cheap thermometer with remote unit from a hardware store - but how to check how the temperature varies over time?

Let's play with an arduino instead :)

I started with [this tutorial from raywenderlich.com](http://www.raywenderlich.com/38841/arduino-tutorial-temperature-sensor). It's using OneWire temperature sensors called DS18B20. I'm also going to use an ethernet connection with PoE to avoid having to have a separate power supply to the board.

I also modified the code by grabbing the latest onewire and dallas libraries and changed the output from JSON to a format that it is easy to write a munin script around.

The circuit I have ended up with is:

![Circuit diagram](/images/posts/2014/10/circuit.png)

And breadboarded for testing it looks like:

![Breadboard circuit](/images/posts/2014/10/breadboard.jpg)

### Components

- Arduino Uno
- Arduino Ethernet Shield with PoE
- 2x DS18B20 (I chose [these pre-cabled waterproofed ones](http://www.youblob.com/shop/products/electronics/sensors/temperature/SEN-11050) to save time and make mounting easier)
- 2x 4k7Ω resistors
- 1x 330Ω resistor
- 1 LED

### Code

It's all [on github](https://github.com/chrissearle/rabbit-temperatures)
