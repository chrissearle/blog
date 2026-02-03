---
title: Raspberry Pi - Home Assistant Kiosk
date: 2023-01-18 21:19 +0100
tags: [raspberry pi, homeassistant]
intro: Setup of a simple pi + touch screen home assistant kiosk
---

I wanted to set up a simple kiosk dashboard in homeassistant and make it available via a pi with the pi 7" touchscreen.

## Kiosk Dashboard

To set up the actual dashboard I simply followed this tutorial from [Smart Home Junkie](https://www.youtube.com/@SmartHomeJunkie) for the config then changed out the view/sub-view contents with the controls and displays I wanted:

:youtube{id="G3lT4zgjER8" title="Kiosk Mode in Home Assistant – How To – The Right Way! - Smart Home Junkie"}

## Pi Setup

Initial setup was just a simple Raspbian 64 bit SD card - basically just using [Raspberry Pi Imager](https://www.raspberrypi.com/documentation/computers/getting-started.html) but choosing 64 bit and enabling SSH.

I didn't bother with WiFi - this will be powered by PoE - so it will have an ethernet connection.

Right now - to save on fiddling with the screen board's use of the power pins on the 40 pin connecter and also because I find the fan on the PoE hat distracting - I'm using a simple PoE splitter.

Connect the 7" screen - [e.g. The PiHut has an assembly guide](https://thepihut.com/blogs/raspberry-pi-tutorials/raspberry-pi-7-touch-screen-assembly-guide)

Boot and login.

### Kiosk setup

For this - I followed [this guide from raspberry](https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/)

#### The kiosk.sh script

```shell
#!/bin/bash

xset s noblank
xset s off
xset -dpms

unclutter -idle 0.5 -root &

sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' /home/admin/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' /home/admin/.config/chromium/Default/Preferences

/usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk --force-dark-mode &

while true; do
	sleep 10
done
```

Changes:

I don't want to switch between tabs.

- no xdotool call - no tab switching. However - you do need the loop - without it the service starts then terminates and chromium shuts down again. Whether this is expected or not - I have no idea - but leaving this empty sleep loop in works fine.
- force dark mode - the dashboard is less glaring that way.

#### The service

```ini
[Unit]
Description=Chromium Kiosk
Wants=graphical.target
After=graphical.target

[Service]
ExecStartPre=/bin/sleep 20
Environment=DISPLAY=:0.0
Environment=XAUTHORITY=/home/admin/.Xauthority
Type=simple
ExecStart=/bin/bash /home/admin/kiosk.sh
Restart=on-abort
User=admin
Group=admin

[Install]
WantedBy=graphical.target
```

Changes:

- admin instead of pi as username
- add the ExecStartPre to sleep at the start so that the X desktop had time to load. This may not be needed when it gets updated from the 3B to a 4B pi. You could see the error in `service kiosk status` output

### ToDo

- Dim or disable the screen between midnight and 5am or similar. Should wake up on touch though. Not had time to look at this yet.
- Some sort of box for it
