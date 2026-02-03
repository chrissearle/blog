---
title: Monitor CPU temp over MQTT in Home Assistant
date: 2023-01-02 09:27 +0100
tags: [mqtt, homeassistant, debian, linux, NUC]
intro: A quick fix to get CPU temperature over time from a couple of Intel NUC units
image: /images/posts/2023/01/temperatures.png
---

One of two Intel NUC units had a failing fan. To make sure that the replacement was working as expected - some kind of graph was needed. The other NUC is fanless - so runs at a higher temperature.

Various systems exist for this - grafana etc. - but this was a quick fix and home assistant with MQTT was already available.

## Prerequisites

- Home assistant running
- MQTT addon to home assistant running and configured (with at least one "local user")
- mosquitto-clients package installed on both NUCs

## Getting the temperature

Both NUCs are running debian linux. In both cases - there is some information under `/sys/class/thermal/thermal_zone*`

After some digging around and using lm-sensors to find out what the current temperature on the CPU was - it turned out that on both boxes it was `/sys/class/thermal/thermal_zone2/temp`

## Sending the temperature

A simple script to post the data (values of MQTT\_\* variables need to be set in the script for running):

```shell
HOSTNAME=`hostname`

CPU=$(</sys/class/thermal/thermal_zone2/temp)
CPU=$((CPU/1000))
mosquitto_pub -h $MQTT_HOST -p $MQTT_PORT -u "$MQTT_USER" -P "$MQTT_PASS" -t "$HOSTNAME/CPU/temp" -m $CPU -q 1
```

This is then trigged via cron every 5 minutes.

## Displaying the data

### Creating the sensors

Add the following to home assistant configuration.yaml

```yaml
mqtt:
  sensor:
    - state_topic: "hostname1/CPU/temp"
      device_class: "temperature"
      name: "Hostname 1 CPU Temperature"
      state_class: "measurement"
      unit_of_measurement: "°C"
    - state_topic: "hostname2/CPU/temp"
      device_class: "temperature"
      name: "Hostname 2 CPU Temperature"
      state_class: "measurement"
      unit_of_measurement: "°C"
```

### Lovelace card

This uses [mini graph card](https://github.com/kalkih/mini-graph-card)

```yaml
type: custom:mini-graph-card
name: CPU Temperatures
height: 200
entities:
  - entity: sensor.hostname_1_cpu_temperature
    show_state: true
    name: Hostname 1
  - entity: sensor.hostname_2_cpu_temperature
    show_state: true
    name: Hostname 2
show:
  points: true
```

Given my actual hostnames - this generates the following graph:

![Home assistant dashboard card showing CPU temperatures](/images/posts/2023/01/temperatures.png)

The NUC with the new fan is holding at approx 40C which is fine.
