---
title: Stale IPv6 Default Route After a Gateway Swap
date: 2026-09-06 16:20 +0200
category: Technology
tags: [ home-assistant, unifi, networking, ipv6, debugging ]
intro: Home Assistant Cloud stopped working after replacing a USG Pro 4 with a UDM Pro Max. The cause was a static IPv6 default route pointing at the old gateway's link-local address.
---

I replaced my USG Pro 4 + Cloud Key Gen2 Plus setup with a UDM Pro Max. Migration went fine — backup restored, switches and APs re-adopted themselves, Protect came up on new disks. Home Assistant Cloud then stopped working, and the cause was a static IPv6 default route pointing at the old gateway.

## Symptoms

Repeated in the log:

```
ERROR [homeassistant.components.cloud.subscription]
A timeout of 10 was reached while trying to fetch subscription information
```

With this traceback:

```
File "hass_nabucasa/auth/cognito.py", line 362, in _async_renew_access_token
    await self.cloud.run_executor(cognito.renew_access_token)
asyncio.exceptions.CancelledError
...
hass_nabucasa.auth.cognito.AuthTimeoutError: Timeout while renewing access token
```

This is a `CancelledError` at the executor await — which means the 10s timeout fired while the worker thread was still running.

Other symptoms:

* `relayer_connected: false`
* `iot_state: disconnected`
* `iot_tries: 0`
* The three `can_reach_*` health probes never resolved past `pending`.

Signing out and back in also timed out, so it wasn't a stale token. And now I was stuck logged out too.

Another symptom I found: `tts.cloud_say` made the Google speakers play their "about to speak" chime and then nothing. The speaker got a media URL and started preparing but when it tried to send the audio it never arrived.

## Diagnosis

`curl` from inside the Home Assistant container reached every Nabu Casa endpoint in under half a second. You need to be careful here - running these tests against some nabu casa addresses were fine - as they didn't have IPv6 addresses.

But - running curl verbosely against the host in the traceback:

```
* Trying [2600:1f18:257:8001:3297:9a85:5e50:a1e]:443...
* Trying 100.55.237.87:443...
* Connected to cognito-idp.us-east-1.amazonaws.com (100.55.237.87) port 443
```

curl fell back to IPv4 - IPv6 just stalled.

The route table:

```
$ ip -6 route show default
default via fe80::feec:daff:fed1:10b7 dev end0 proto static metric 20100
```

```
$ ip -6 neighbor show fe80::feec:daff:fed1:10b7
fe80::feec:daff:fed1:10b7 dev end0 FAILED
```

Aha - that's the fe80 address for MAC `FC:EC:DA:D1:10:B7` — the old USG Pro 4 which was no longer powered on.

Also - `proto static` - this was something I set up originally - it wasn't something the system had found. This is most likely because when I originally set up IPv6 (a DHCPv6 from my ISP with a /56 prefix) I had no RA in the system. I later added radvd to my LAN. After the fix (below) it is now `proto ra`.

## Fix

```bash
ip -6 route del default via fe80::feec:daff:fed1:10b7 dev end0
```

Then, to persist:

```bash
ha network update end0 --ipv6-method auto
```

Result:

```
$ ip -6 route show default
default via fe80::76fa:29ff:fe60:5807 dev end0 proto ra metric 20100 pref high
default proto ra metric 20101 pref medium
        nexthop via fe80::ceba:62fb:5d1e:be15 dev end0 weight 1
        nexthop via fe80::4d7e:f757:2f83:f11f dev end0 weight 1
```

So - `proto ra`, and `fe80::76fa:29ff:fe60:5807` maps to `74:FA:29:60:58:07` — the UDM.

## Things I tried that didn't work

- **MTU.** Ruled out by pulling a few hundred KB in 0.22s.
- **Executor pool saturation.** Would produce the same traceback shape, but there were no blocking-call warnings in the log.
- **IMDS.** `pycognito` builds a boto3 client, and boto3 tries `169.254.169.254` for credentials at construction. From the container that address timed out at 8s rather than refusing. I added a LAN In reject rule for `169.254.0.0/16` on the UDM so it fails fast - so this is better than it was without - but it was not the real issue.
- **IPv6, tested against the wrong hosts.** `cloud.nabucasa.com` and `accounts.nabucasa.com` have no AAAA records, so early IPv6 tests came back clean. Everything after that used `-4`, which hid the failing path entirely.
