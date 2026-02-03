---
title: More DronePan work
date: 2016-05-29 19:27 +0200
tags: [osmo, dronepan, femsjøen, dji]
image: /images/posts/2016/05/6x8-4.png
intro: Adding Inspire support to DronePan
category: Radio Control
---

This article follows on from [Osmo panoramas using DronePan](../../22/osmo-panoramas-using-dronepan/)

The settings view in [DronePan](http://www.dronepan.com/) has a fair few options - there's a lot of devices it works with and they need different options available.

So I wanted to do some changes to the settings view. First off - I wanted to only show the relevant information for the currently connected device - hide the settings that are not in use.

Secondly - I wanted to replace the concept of "sky row".

### Sky Row/Max Pitch

#### Sky Row

A normal drone panorama with DronePan runs from a start pitch of 0˚ down to the nadir at -90˚.

Originally we supported only 0˚, -30˚, -60˚ then the nadir at -90˚.

But the Inspire 1 allows you to point above the horizon - to a maximum pitch of +30˚. So we added a "Sky Row" concept that meant "if you choose sky row then we'll add a row at +30˚".

#### Max Pitch

But here's the issue with that - we also added the ability to add more rows. And so - you can get more rows in the 30˚-0˚ than just one.

So - this is a change - we're removing "Sky Row" - and adding instead "Max Pitch" if the gimbal we see tells us it can go above 0˚.

You can therefore choose the max pitch (for all known DJI drones right now that's a +30˚ setting) or "Horizon".

It won't automatically add an extra row - you can set whatever row count you want and that will be the row count instead of having to remember "oh - I chose sky row - that means it's this number + 1".

#### Notes

- Osmo - we will always use Max Pitch. For the Osmo - positive pitch is down instead of up (DJI basically took the I1 gimbal and turned it upside-down). But this setting will always be used and does not appear on the settings page
- Phantom models - these require a setting in DJI Go to be allowed to go above the horizon. You may be able to set that setting and test if you can set a Max Pitch. I don't have a Phantom to test with - so I can't tell if it will work or not. There is a new setting in the latest SDK which talks about pitch extension - we're going to look at that - but haven't got there yet - see [issue #53](https://github.com/dbaldwin/DronePan/issues/53).

### Bugs/Updates

While working on this I caught a bug that is likely affecting the X5/X5R Inspire 1 users.

You see - we added more rows for them - their lenses are narrower. But - by mistake - we then took the number of rows and created an evenly spaced set of rows from the start point to 60˚ then always jumped 30˚ for the nadir.

So - that's going to cause issues stitching along the base of the image - not good.

So - now we space them evenly all the way thru the pitch movement.

Lastly - we wanted to add an option of 1, 2, 3 or 4 nadir/zenith shots.

This bug fix and nadir option together _**may** mean that X5/X5R users can in fact reduce the number of rows_ - someone with an X5/X5R will have to test - mine's an X3 so I have no idea.

### Two new panos

Here's a couple of stitches in progress (note for these two I didn't take extra ground shots):

![5 rows, 8 columns, 2 zenith](/images/posts/2016/05/5x8-2.png)

![6 rows, 8 columns, 4 zenith](/images/posts/2016/05/6x8-4.png)

You can see in both the zenith shots in place - and also I hope - that the rows are evenly spaced - including the space between the top row and the zenith shots. That last part is the fixed pitch bug.
