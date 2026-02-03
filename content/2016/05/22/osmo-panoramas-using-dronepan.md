---
title: Osmo panoramas using DronePan
date: 2016-05-22 11:20 +0200
tags: [osmo, dronepan, femsjøen, dji]
image: /images/posts/2016/05/pano-images.png
intro: Adding Osmo support to DronePan
category: Radio Control
updated: 2022-10-06 00:00
---

## Update: October 2022

I recently restitched these using PTGui 12 pro as Autopano Pro and Panotour are sadly discontinued.

They can be seen at [Momento360](https://momento360.com/e/uc/fea0e18032984e4dac669c47b5af4dd7?utm_campaign=embed&utm_source=other&size=medium)

## Original:

Some weeks back the folks behind [DronePan](http://www.dronepan.com/) decided to make the application open source. I decided to get involved and have (amongst other things) added support for the DJI Osmo handheld camera.

But - I never seem to get time to actually use the application :)

So - this weekend - we were down at the hut by Femsjøen to do some maintenance work so I took a few minutes out to do some panoramas even though the weather was a bit grey and dull.

DronePan does the move and take photo controls for you - all the way from straight up to down 30 degrees (this is the current limit of movement you can get via the SDK) and in a full 360 round. You can choose different settings for the number of rows and the number of shots per row and it does the rest.

It helps to get the Osmo a little off ground - so - I used the normal DJI extension rod and a [pakpod tripod](http://www.pakpod.com/) which is nicely small and light as well as being able to be used in ways that normal tripods can't.

![Osmo in action](/images/posts/2016/05/action.jpg)

Here's a stitching example. You can see that the shots 1 thru 41 are done by DronePan - so - 8 shots per row - 5 rows - gives 40 nicely spaced shots - and then one zenith. But - the gimbal on the osmo supports only down to 30 degrees below horizon - so - here I simply picked up the osmo - took one directly down (42) then a few more in an approximate 60 below circle (43-50):

![Stitching example](/images/posts/2016/05/pano-images.png)

This is stiched in [Autopano Pro](http://www.kolor.com/autopano/) - I've found that it simply makes fewer mistakes than PT Gui - so I've switched over even though it is more expensive.

So - I took four panoramas and stiched them all to full 360x180 spherical view panorama shots. Looks like 3 are good and one has one slightly dodgy point on the ground - can be difficult to do the ground shots when standing on the edge of a wooden quay.

Then I used [Panotour](http://www.kolor.com/panotour/) to join them into one "tour" (a set of panoramas in a viewer with clickable links between):
