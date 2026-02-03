---
title: Octopi Setup
date: 2019-01-09 10:12 +0100
tags: [prusa, mk3, octopi, timelapse, octolapse]
category: 3D Printing - Laser Cutting - CNC
intro: Octopi on a raspberry pi 3 with a prusa mk3
---

Back before I got the prusa mk3 printer - I was using octopi on a raspberry pi zero w to run octopi with the pi camera v2.

Up until recently - I have been using the prusa only via the SD card.

But - I have just picked up a couple of raspberry pi 3b+ units (along with raspberry's PoE hats - which also work really well).

I decided to give octopi a go - but on a 3b+ - a USB cable is less invasive than installing the zero onto the prusa board (and easier to remove if it needs to be).

Normal installation of octopi onto the memory card is covered well enough on [the octoprint site](https://octoprint.org/download/).

This will be running ethernet - let's disable the wifi and bluetooth stacks.

In config.txt:

```ini
dtoverlay=pi3-disable-wifi
dtoverlay=pi3-disable-bt
```

Next - the main camera is the pi v2 camera - let's force that to be the main octoprint camera:

In octopi.txt the only uncommented lines are:

```ini
camera="raspi"
camera_raspi_options="-fps 30 -x 1920 -y 1080"
```

The setting for `camera` could be left on auto - but later on a second USB camera will be added that will be configured outside of octoprint and to avoid having issues with device ordering this forces it to choose the pi cam.

In the octopi settings - the following settings:

```text
Stream URL - /webcam/?action=stream
Snapshot URL - http://127.0.0.1:8080/?action=snapshot
```

The first goes thru the running haproxy instance that octopi is running - the other is direct (note that this unit is not exposed to the wider internet and so hasn't had much done yet - so the webcam stream is available on the LAN on `http://IP_OR_HOSTNAME:8080`)

At this point both the camera on the control page and the timelapse functionality should work.

## Second camera

I have an old USB webcam lying around. I also wanted to test out octolapse - and that from above (the pi cam is mounted on an arm on a corner of the build plate to keep it stationary relative to the plate). So I wanted to see if I could add a second camera.

There is a plugin for octoprint called multicam - which recommends a separate pi. But - I won't be loading this second cam very highly - so I went with it on the same 3b+.

To test - logged in as the pi user over ssh:

```shell
cd ~/mjpg-streamer
./mjpg_streamer -i "./input_uvc.so -f 3 -r 1280x720" -o "./output_http.so -w ./www-octopi -p 8800"
```

Then test `http://IP_OR_HOSTNAME:8800` - it should show a snapshot and a stream. Note that this is at a very low framerate - since all we need here is the snapshot function - we won't be needing a good stream framerate (nor do we want to load the Pi heavily by adding a higher framerate).

Next step - let's run this when the machine starts. It seems the simplest way to do so is via crontab.

Run `sudo crontab -e` to edit root's crontab file and add:

```shell
@reboot /home/pi/mjpg-streamer/mjpg_streamer -i "/home/pi/mjpg-streamer/input_uvc.so -f 3 -r 1280x720" -o "/home/pi/mjpg-streamer/output_http.so -w /home/pi/mjpg-streamer/www-octopi -p 8800"
```

Lastly - the multicam plugin config. Rename Default to Pi and add a new camera called USB with the URL `http://IP_OR_HOSTNAME:8800/?action=stream`. It seems that the multicam plugin will simply be changing the URL of the player when run in the browser - so localhost doesn't work here. You could add configuration to haproxy and just use a different path (similar to the default camera) if you wish.

At this point - you should be able to switch between cameras in the control tab. The inbuilt timelapse is still using the Pi camera.

## Octolapse

This is a relatively complex plugin to setup - so here we'll only look at the camera.

Under `Settings > Octolapse > Camera` add a second camera. Type set to Webcam, base address to `http://IP_OR_HOSTNAME:8800`. The only other setting is the Snapshot delay - that is calculated as 1000/framerate - so set that to match.

Octolapse now captures from both cameras (you can check/uncheck them if you only want one).

However - I have other issues with octolapse that I haven't spent time on (the movement of the head out of the way is sometimes crashing when it moves back to the part - and I haven't looked into why yet). But at least the camera is working fine :)
