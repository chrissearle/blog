---
title: Deploy digital ocean agent via ansible
date: 2020-09-16 08:51 +0200
tags: [ansible, linux, debian]
intro: Ansible script for installing the digital ocean metrics agent to get dashboard metrics
---

Digital Ocean provide a metrics agent that you can install to provide metrics that can be displayed on their dashboard.

It is currently setup by downloading an install script from https://repos.insights.digitalocean.com/install.sh

The script does provide support for detecing apt vs yum etc - but I only need the apt version.

I try to keep my droplets provisioned by ansible - so for debian at least the following ansible snippet works fine.

```yml
---
- name: add apt key
  apt_key:
    url: https://repos.insights.digitalocean.com/sonar-agent.asc
    state: present

- name: add repository
  apt_repository:
    repo: deb https://repos.insights.digitalocean.com/apt/do-agent main main
    filename: digitalocean-agent
    state: present

- name: install agent
  apt:
    pkg: do-agent
    state: present
```
