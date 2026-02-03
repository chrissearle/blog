---
title: Monitoring and updating DNS for IP changes with ddclient
date: 2024-10-12 11:37 +0200
tags: [ipify, cloudflare, ddclient]
intro: Replacing ipify and shell scripts with ddclient
---

Back in [2020](/2020/01/29/monitoring-ip-changes/) I moved a plain cron script to use the cloudflare API to handle changes in my ISP provided external IP address.

Recently - I was seeing an increasing number of failures from ipify - I believe due to load - after all they provide an excellent service and for free.

However - scripting for all possible failure rates was irritating.

But - I decided I wanted to pop in something more direct, that could handle the errors for me - and decided to go with ddclient.

As usual - provisioning with ansible.

First - we need some packages - ddclient and dnsutils:

```yaml
- name: Install dns tools
  ansible.builtin.apt:
    pkg: [dnsutils, ddclient]
    state: present
```

Next up - we need to configure ddclient - installing the config file from a jinja2 template:

```yaml
- name: ddclient config
  ansible.builtin.template:
    src: ddclient.conf.j2
    dest: /etc/ddclient.conf
    mode: "0600"
    owner: root
    group: root
  notify:
    - ddclient | restart
```

Since this calls a handler to restart if the configuration changes - we need a handler:

```yaml
- name: ddclient | restart
  ansible.builtin.service:
    name: ddclient
    state: restarted
```

Finally - it installs that jinja2 template - so we need that too.

Here we'll run every 5 minutes.

Since we're talking to cloudflare - the protocol is cloudflare

For the router - we'll still use ipify - on IPv4. I do have IPv6 connectivity - but for now - this is enough to ensure i can connect back home after an unexpected address change.

Finally - it grabs 3 values from inventory variables using ansible vault where needed.

```text
daemon=300
syslog=yes
mail=root
mail-failure=root
ssl=yes

protocol=cloudflare
use=web, web=ipify-ipv4
zone={{cloudflare_zone}}
password='{{cloudflare_bearer_token_home}}'
{{cloudflare_hostname}}
```

This is enough to get ddclient to replace the hand written shell scripts I was using previously - and it handles ipify issues quite cleanly - I get status report emails for each failure and following success.