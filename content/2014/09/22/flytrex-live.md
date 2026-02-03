---
title: Flytrex Live
date: 2014-09-22 14:40 +0200
tags: [quadcopter, hexcopter, gps tracking, gps logging]
category: Radio Control
intro: Updating from flytrex core to flytrex live
---

## UPDATE

Flytrex Core/Live service is now discontinued. This article is kept only for historical reasons

## Flytrex Core

I've been flying for a while with the first generation flytrex core.
This sits between the GPS and the Naza controller and simply logs the GPS data along with some barometric data from the
core itself and allows me to keep a [flight profile](http://www.flytrex.com/chrissearle/).

The core is easy to use, works well - but can only give data once you get home, extract the micro SD memory card and upload
the data. It also only provides logging - so I've had to have a separate GPS tracker (in case of flyaway).

## Flytrex Live

They now have a new product - the flytrex live. This provides
the same logging - but uploaded automatically over 2G/GPRS. It also has a "live flight" view that allows you (or others if you
set the permissions as public) to see the location in real time. Finally - it also has a "Last seen" setting - for tracking
craft that have [flown away](http://www.google.com/search?q=dji+flyaway).

It takes power from the multicopter and uses the GPS from the multicopter for its position data.

### Requirements

- the correct cable for your multicopter (as of this post - supported flight controllers: DJI Naza/Phantom (all versions),
  Blade 350 QX, APM 2.5 and 2.6)
- a micro SIM with 2G/GPRS data support (here in Norway both Telenor and Netcom SIMs have this)
- a soldering iron

### Installation

Installation is simple. Simply solder the power leads to the power board on your multicopter, insert the micro SIM and then
use the sticky pads that come with the flytrex live to mount it.

Remember to register the device at flytrex under your profile - easiest for me was to scan the QR code on the back of the unit.
Do this before you stick the sticky pads over the QR code!

### Getting up and running

When you power up the first time - it will connect to the 2G/GPRS network and then via that to the flytrex servers.
If it stays purple in colour - then it hasn't made a connection - check that you've got no PIN code enabled on the SIM card.

### Flying

Just fly - it uploads each mission. All done :)

### Issues

I'm pretty pleased - but I have a couple of comments so far:

- Initial connection. It failed (stayed purple) all the time I was indoors. Once I moved outdoors - registration worked fine.
  I have no problem with internal mobile coverage, but GPS reception is non-existant. I can only assume that the device only registers
  when receiving GPS data - but I can't find this documented.

- What way up to insert the micro SIM? I wondered about this until I had the unit in my hand. It's not mentioned anywhere
  I could find but this is a non-issue - it only goes in one way up.

- What does it do when there is no mobile coverage? I fly often in a small area that has _no_ coverage at all - does it remember
  and upload later or does it lose that mission? I'm still trying to find this out.
