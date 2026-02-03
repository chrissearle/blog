---
title: Rebuilding a PI Home Assistant kiosk
date: 2025-09-17 12:35 +0200
tags: [raspberry pi, homeassistant, kiosk] 
intro: My old pi4 running home assistant kiosk finally killed its SD card - time to build a new one
---

Back in [2023](/2023/01/18/raspberry-pi-home-assistant-kiosk/) I set up a raspberry pi 4 running chromium in kiosk mode
to show home assistant dashboard on a wall mounted screen.

It used a PoE converter for power and connects therefore via internet.

However - even with ram disks - an SD card has a finite lifetime in a pi. It finally died.

## The rebuild

Updated hardware:

* Raspberry Pi 5 4GB
* Waveshare PoE M.2 hat
* Disk - Crucial P310 SSD - 2TB - M.2 2230 - PCIe 4.0
* Screen - the original Pi 1.1 7" touchscreen from the previous build. You will need the Pi 5 compatible "Display Cable" - and note - the display and camera cables look very similar - but they are not the same - luckily it says either Camera or Display on the cable.

## Install

* Use raspberry pi flasher to choose the 64 bit full desktop version.
* Set up user and ssh keys in options - no wifi - this is PoE so will be ethernet
* Install to the SSD
* Install the SSD to the hat and the hat on the pi and boot the pi
* Connect the display cable to Cam/Disp 0 port on the pi and to the screen
* Connect 5v power and ground pins from the adapter to the GPIO 5v and GND headers (if you look at the pi with the ports nearest you and the GPIO header on the right - then the first three pins from the top right corner moving towards the front are 5V, 5V and GND - so - use second and third pins).
* After boot update apps (`apt update && apt full-upgrade`)

## Configuration

This is a lot simpler than it used to be.

On boot it auto logs in to the desktop.

There are some changes to suit my dashboard:

### Portrait mode

You can change this manually (to test) with:

```shell
wlr-randr --output DSI-1 --transform 90
```

On the pi5 install - the screen display and the touchscreen turn together - so we don't need to turn the touchscreen at all.

To make it permanent:

Edit the file `.config/labwc/autostart` (create if not present) and add the same line.

Add a 1 second sleep afterwards - I found that without that it would move on before the screen completed its rotateion.

### Chromium in kiosk mode

At the end of the autostart - add the following:

```shell
chromium URL_OF_YOUR_HOME_ASSISTANT \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --no-first-run \
    --enable-features=OverlayScrollbar \
    --start-maximized \
    --enable-features=WebContentsForceDark &
```

The last line is only needed for forcing dark mode.

### Custom SSL

My home net uses a local CA - this was done before letsencrypt supported dns01 challenges - which I would recommend now.

But - if you need to add a custom CA - then:

Copy the CA cert (pem format) to `/usr/local/share/ca-certificates/` - and the filename must end `.crt`
Then run:

```shell
sudo update-ca-certificates
```

Test with openssl:

```shell
openssl s_client -connect URL_OF_YOUR_HOME_ASSISTANT_INCLUDING_PORT -CApath /etc/ssl/certs
```

Then we need to make chromium trust it - we'll add it to the kiosk user<s nssdb:

```shell
sudo apt install libnss3-tools

certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "Name of CA" -i /usr/local/share/ca-certificates/filename_of_ca.crt
```

You can list the contents of the nssdb with:

```shell
certutil -d sql:$HOME/.pki/nssdb -L
```

### VNC

Use raspi-config to enable VNC (under interfacing options > VNC).

This starts wayvnc - and the service will read the config from `/etc/wayvnc`

Mine listened on IPv6 by default. If you prefer IPv4 - change `/etc/wayvnc/config`

Change the line:

```shell
address = ::
```

to 

```shell
address = 0.0.0.0
```

and restart the service with `sudo systemctl restart wayvnc`.

You can check it with:

```shell
ss -lntp | grep 5900
```

## Finishing

Currently - it is up and running. The only issue is that it takes a few seconds after chromium starts before
it stops saying "no internet" and shows the dashboard.

That's fine for now - I don't reboot it very often.