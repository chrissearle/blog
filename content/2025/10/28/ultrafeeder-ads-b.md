---
title: Ultrafeeder - ADS-B
date: 2025-10-28 10:26 +0100
tags: [ads-b, sdr, raspberry pi, rtl-sdr, ultrafeeder]
intro: Monitoring plane ADS-B position signals with SDR and feeding the data to external services
image: /images/posts/2025/10/aircraft.png
---

If you're interested in using apps like FlightRadar24 or FlightAware - how about listening to your local ADS-B signals directly?

You can even feed that information onwards - and both FR and FA will upgrade your account if you do so.

![Aircraft](/images/posts/2025/10/aircraft.png)

## Hardware

The simplest setup is a raspberry pi and a cheap software defined radio (SDR) USB dongle.

My current setup is:

- Raspberry pi 5 - 2gb memory (the cheapest pi 5 model)
- Waveshare POE M.2 HAT+ for pi 5 (allows me to power the pi over PoE and also use a small M.2 SATA disk instead of SD card)
- RTLSDR radio (both the RTL-SDR blog v3 or v4) - these I get from RTL-SDR's own store - they have amazon, ebay and aliexpress entry points
- A cheap 1090Mhz/ADSB antenna + a cable that connects from the antenna to the RTL-SDR - so - whatever connecter the antenna needs to the dongle's SMA port.

## Software

This is a set of docker containers provided by the [SDR enthusiasts project](https://sdr-enthusiasts.gitbook.io/ads-b/intro/overview).

They provide an example [docker-compose.yml](https://github.com/sdr-enthusiasts/docker-adsb-ultrafeeder/blob/main/docker-compose.yml) with many different sources and aggregators (you can also use this to display other feeds in your local web instance).

I want only to use my own ADS-B data and then add on two more images to feed to flight radar and flight aware.

### Ultrafeeder

This spins up the ultrafeeder image as well as providing the tar1090 web interface.

```yaml
services:
  ultrafeeder:
    image: ghcr.io/sdr-enthusiasts/docker-adsb-ultrafeeder:latest
    container_name: ultrafeeder
    hostname: ultrafeeder
    restart: unless-stopped
    device_cgroup_rules:
      - "c 189:* rwm" # allow USB
    ports:
      - "80:80" # tar1090 / graphs1090 web UI
    environment:
      # --- General ---
      - LOGLEVEL=${LOGLEVEL-verbose}
      - TZ=${FEEDER_TZ}

      # --- SDR (your dongle only) ---
      - READSB_DEVICE_TYPE=rtlsdr
      - READSB_GAIN=${ADSB_SDR_GAIN-auto}
      - READSB_RTLSDR_DEVICE=${ADSB_SDR_SERIAL} # e.g. 00000001 or leave empty for device 0
      - READSB_RTLSDR_PPM=${ADSB_SDR_PPM-0}

      # --- Decoder / location ---
      - READSB_LAT=${FEEDER_LAT}
      - READSB_LON=${FEEDER_LONG}
      - READSB_ALT=${FEEDER_ALT_M}m
      - READSB_RX_LOCATION_ACCURACY=2
      - READSB_STATS_RANGE=true

      # --- tar1090 / UI niceties (optional) ---
      - UPDATE_TAR1090=true
      - TAR1090_DEFAULTCENTERLAT=${FEEDER_LAT}
      - TAR1090_DEFAULTCENTERLON=${FEEDER_LONG}
      - TAR1090_PAGETITLE=${FEEDER_NAME}
      - TAR1090_MESSAGERATEINTITLE=true
      - TAR1090_PLANECOUNTINTITLE=true
      - TAR1090_ENABLE_AC_DB=true
      - TAR1090_SITESHOW=true

      # graphs1090
      - GRAPHS1090_DARKMODE=true

    volumes:
      - /opt/adsb/ultrafeeder/globe_history:/var/globe_history
      - /opt/adsb/ultrafeeder/graphs1090:/var/lib/collectd
      - /proc/diskstats:/proc/diskstats:ro
      - /dev/bus/usb:/dev/bus/usb
    tmpfs:
      - /run:exec,size=256M
      - /tmp:size=128M
      - /var/log:size=32M
```

I also provide a .env file alongside compose:

```shell
# Basics
FEEDER_NAME=Some_relevant_name
FEEDER_TZ=Local timezone - e.g. Europe/Oslo
FEEDER_LAT=Accurate latitude of the pi - 5 or 6 decimal places
FEEDER_LONG=Accurate longitude of the pi - 5 or 6 decimal places
FEEDER_ALT_M=Accurate height in meters

# Your RTL-SDR
ADSB_SDR_SERIAL=00000001
ADSB_SDR_PPM=0
ADSB_SDR_GAIN=auto
```

The serial here will likely be the same unless you have several RTL-SDRs connected to the same pi.

### Flight Radar 24

Prerequisite - an existing account - the free version is fine.

We need to add a container to the compose file and some env entries.

Service:

```yaml
services:
  fr24:
    image: ghcr.io/sdr-enthusiasts/docker-flightradar24:latest
    container_name: fr24
    restart: unless-stopped
    ports:
      - "8754:8754" # FR24 local status page
    environment:
      - BEASTHOST=ultrafeeder # pull Beast from ultrafeeder:30005
      - FR24KEY=${FR24_SHARING_KEY} # set in .env (see below)
    tmpfs:
      - /var/log
```

Env:

```
# Flightradar24
FR24_SHARING_KEY=...
```

To get the sharing key follow [the guide](https://sdr-enthusiasts.gitbook.io/ads-b/feeder-containers/feeding-flightradar24)

Currently that says to run:

```shell
docker run -it --rm ghcr.io/sdr-enthusiasts/docker-baseimage:qemu bash -c "$(curl -sSL https://raw.githubusercontent.com/sdr-enthusiasts/docker-flightradar24/main/get_adsb_key.sh)"
```

- 1.1 Enter your email address (username@domain.tld): Your FlightRadar24 account email address
- 1.2 If you used to feed FR24 with ADS-B data before, enter your sharing key.: Leave blank and press enter
- 1.3 Would you like to participate in MLAT calculations?: no
- 3.A: your latitude
- 3.B: your longitude
- 3.C: your height above sea level - in feet
- Continue with these settings? yes.
- 4.1 Receiver selection: 4 (ModeS Beast USB/Network)
- 4.2 Connection Type: 1 - network
- 4.3A address/hostname: ultrafeeder
- 4.3B port: 30005
- 5.1 RAW feed: no
- 5.2 Basestation feed: no

It should then communicate with flight radar 24 and return two things:

- Your sharing key (XXXX) has been configured and emailed to you for backup purposes.
- Your radar id is XXXX, please include it in all email communication with us.

Flight radar 24 ask that if you are feeding other locations then to not enable mlat which is why the answer in 1.3 is no.

### Flight Aware

For this we'll use piaware.

There is a set of instructions [on the guide](https://sdr-enthusiasts.gitbook.io/ads-b/feeder-containers/feeding-flightaware-piaware) - but there are some small changes that you will probably need to make.

First step is to get a feeder ID.

```shell
docker pull ghcr.io/sdr-enthusiasts/docker-piaware:latest
source ./.env
timeout 60 docker run --rm -e LAT="$FEEDER_LAT" -e LONG="$FEEDER_LONG" ghcr.io/sdr-enthusiasts/docker-piaware:latest | grep "my feeder ID"
```

This should get you a feeder ID.

#### Claiming the feeder

The guide suggests heading to https://flightaware.com/adsb/piaware/claim to claim it - but - for me that provided an empty page - only the headers were present.

However - in the flight aware forums a workaround is posted that you simply append the feeder ID https://flightaware.com/adsb/piaware/claim/feeder_id_here

This worked.

Now we can add the piaware service to the compose file:

```yaml
services:
  piaware:
    image: ghcr.io/sdr-enthusiasts/docker-piaware:latest
    container_name: piaware
    restart: unless-stopped
    ports:
      - "8080:8080" # FlightAware skyaware map (optional)
    environment:
      - BEASTHOST=ultrafeeder # pull Beast from ultrafeeder:30005
      - TZ=${FEEDER_TZ}
      - FEEDER_ID=${PIAWARE_FEEDER_ID} # set in .env (see below)
    tmpfs:
      - /run:exec,size=64M
      - /var/log
```

We also need to extend the environment for the ultrafeeder service:

```yaml
# Provide MLAT results back to ultrafeeder from the piaware sidecar:
- ULTRAFEEDER_CONFIG=mlathub,piaware,30105,beast_in
```

And we need to add the feeder id to the environment file:

```shell
# FlightAware
PIAWARE_FEEDER_ID=
```

Once done (and when the feeder is sending information) you will want to head to your feeder page on flight aware (this can take a few hours)

The link is somewhat hidden - but you can find it by heading to https://www.flightaware.com/adsb/stats/user/your_user_name

We want to add accurat location and height so that it will enable MLAT synchroization.

At the top - just under the profile - is a bar with SITE that has a settings button (cog wheel) on the right hand.

Click on the cog and enter the location manually - accurately - and also set the height - then save.

After a while you should see on the page:

`Multilateration (MLAT): Supported / Enabled (synchronized with XX nearby receivers)`

## Upgraded accounts

Both flight radar 24 and flight aware should now upgrade your account. It may take a few hours/couple of days - but it should happen automatically.
