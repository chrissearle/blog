---
title: Rebuild rabbit sensor to single wire bus
date: 2014-11-22 12:42 +0100
tags: [rabbits, arduino, DS18B20]
series: Rabbit Hutch-Run
image: /images/posts/2014/11/circuit.png
intro: Updating the temperature sensor for the outside rabbit run
---

OK - so I decided to move the arduino end of the temperature sensor to the other end of the connection - that is indoors.

This means that I use the ethernet cable as a simple onewire bus wire - not as an ethernet cable - and also means that I don't have to
have the arduino in a weatherproof box.

So the circuit design now looks like this:

![Circuit Diagram](/images/posts/2014/11/circuit.png)

And soldered up - you can see the red/black power, blue (LED) and yellow (1wire bus) hookup wires that go to the arduino and the end of the network wire heading off to the sensors. The sensors themselves are connected in parallel with the sensor wire connected to blue, the ground to blue/white and the power to brown. No other wires in the ethernet cable are in use.

![Wired up](/images/posts/2014/11/breadboard.jpg)

### Code

All updated [on github](https://github.com/chrissearle/rabbit-temperatures)
