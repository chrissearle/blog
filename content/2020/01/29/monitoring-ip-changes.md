---
title: Monitoring IP changes
date: 2020-01-29 11:49 +0100
tags: [ipify, cloudflare, node-red, mqtt, mosquitto, grafana, influx, cron]
image: /images/posts/2020/01/cron-ip-output.png
intro: My ISP connection to home does not offer a static IP address. It does maintain a stable IP address - but after a period offline (either a fault or a power failure or similar) then that IP address may change. How to monitor this?
---

My ISP connection to home does not offer a static IP address. It does maintain a stable IP address - but after a period offline (either a fault or a power failure or similar) then that IP address may change.

Up until recently - I had a cron job that checked for changes and mailed me if it had changed. But - after moving my site DNS to cloudflare - I could now switch to automatically updating the domain.

## ipify.org

First let's get the current IP using [ipify](https://ipify.org)

```shell
IP=`curl https://api.ipify.org 2> /dev/null`
```

So - at this point - you hopefully have a `$IP` with your current external IP address. But - you may have an error message. So - we need to check that.

I just googled "bash IP regex" and ended up with the following:

```shell
if [[ $IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    # Check to see if IP has changed
else
    # Could not fetch IP from ipify
fi
```

## Cloudflare

So - lets think about the IP address received branch. Next thing we need to do is to get the current value.

My site's main nameserver is ben.ns.cloudflare.com - so we'll use dig to query that. Normal dig output contains a fair amount of information. We'll use the `noall` option to disable all parts - then explicitly turn on just the `answer` option to get just that line. Finally we pipe the rest through sed to strip off all information up to the A record itself:

```shell
 DNS=`dig @BEN.NS.CLOUDFLARE.COM +noall +answer [YOUR_DOMAIN] | sed -e "s/.*A[[:blank:]]*//"`
```

### API

We can now compare the `$IP` and `$DNS` values - if they have changed - then we need to update the cloudflare DNS via their API.

The echo lines (since this is run as a cron script) also trigger an email with the info.

```shell
    if [[ "$DNS" != "$IP" ]]; then
        echo "IP has changed"
        echo "Current public: $DNS"
        echo "Current active: $IP"

         curl -X PUT "https://api.cloudflare.com/client/v4/zones/[ZONE_ID]/dns_records/[HOST_ID]" \
           -H "Authorization: Bearer [TOKEN]" \
           -H "Content-Type: application/json" \
           --data '{"type":"A","name":"[YOUR_DOMAIN]","content":"'$IP'"}'
      fi
```

So - where do you get the `ZONE_ID`, `HOST_ID` and `TOKEN`?

Head to https://dash.cloudflare.com/ - and when logged in - choose your domain. On the overview page - down and to the right there should be an API section with the Zone ID.

Next to that should be a link to get a token.

You will need to create at least a token for the "Zone.DNS" permission on the zone you wish to update. I also added one for "Zone.Zone" - since I used the API to get various information - in fact we'll use it to get the `HOST_ID` using curl to fetch and jq to format:

```shell
curl /client/v4/zones/[ZONE_ID]/dns_records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" | jq .
```

Scroll through the results until you find the json block for the domain you want to manage - and grab it's "id" value - this is the `HOST_ID`.

---

With an echo in the else branch we end up with the following script which can be run via cron (I run mine once a minute):

```shell
#!/bin/bash

IP=`curl https://api.ipify.org 2> /dev/null`

if [[ $IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
    DNS=`dig @BEN.NS.CLOUDFLARE.COM +noall +answer [YOUR_DOMAIN] | sed -e "s/.*A[[:blank:]]*//"`

    if [[ "$DNS" != "$IP" ]]; then
        echo "IP has changed"
        echo "Current public: $DNS"
        echo "Current active: $IP"

        curl -X PUT "https://api.cloudflare.com/client/v4/zones/[ZONE_ID]/dns_records/[HOST_ID]" \
          -H "Authorization: Bearer [TOKEN]" \
          -H "Content-Type: application/json" \
          --data '{"type":"A","name":"[YOUR_DOMAIN]","content":"'$IP'"}'
    fi
else
    echo "Current IP Failed - return was: $IP"
fi
```

So - what sort of emails does this generate?

Well - extremely rarely - an "IP has changed".

A little more often - I get a "Current IP Failed". In all cases the content is an HTML error page from herokucdn (where the ipify api is hosted).

This is still not a very frequent occurrance - I run this call once a minute and I may get a few fails a day or none. But - just for fun - let's track it.

## MQTT

I already have a raspberry pi running node-red, mqtt (mosquitto), influx DB and grafana - based on this youtube video by Andreas Spiess [#255 Node-Red, InfluxDB, and Grafana Tutorial on a Raspberry Pi](https://www.youtube.com/watch?v=JdV4x925au0).

So - if I can post a message when an error occurs - then we can use the same setup to get the information into a graph in grafana.

First - we need `mosquitto_pub` - that's in the `mosquitto_clients` package (at least for me on my debian box).

Then we simply need to add a call to the else clause. The user and password were created during the setup of the raspberry pi - see the video linked above.

```shell
/usr/bin/mosquitto_pub -h [PI_HOST] -p 1883 -u [PI_MQTT_USER] -P [PI_MQTT_PASSWORD] -m "IP Error" -t cron/ip
```

This then posts a hit to MQTT each time an error occurs calling ipify.

## Node-RED

In Node-RED I created a new flow - it subscribes to the MQTT cron/ip topic. Each message there will be a plain text "IP Error" - so it gets passed to a function node that simply wraps it in json:

```javascript
msg = {
  payload: {
    reason: msg.payload,
  },
};

return msg;
```

Finally it gets passed to an influx node which saves it to the `CRON` database under the `ip` measurement

## Grafana

Finally - we can log in to grafana and create a new graph. The query I have used is:

```
SELECT count("reason") FROM "ip" WHERE $timeFilter GROUP BY time($__interval) fill(0)
```

And - that together with a line graph - with a line width of 3 and staircase turned on - gives me the following graph (this was taken after running for about 24 hours):

![Grafana output](/images/posts/2020/01/cron-ip-output.png)

You can see that there is only a few hits on the first day and none on the second.

So - I'm happy with the ipify service (which is free to use and sets no quota or timing limits) - and yet I also get a nice graph which I likely will never look at after the first week :)
