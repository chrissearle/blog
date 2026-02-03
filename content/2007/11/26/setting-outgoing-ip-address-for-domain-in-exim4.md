---
title: Setting outgoing IP address for domain in exim4
date: 2007-11-26 17:29:13 +0100
tags: [exim4, smtp]
---

Thanks to Dave Evans on the exim4 users list for this.

I need to set different IP addresses for different outgoing domains.

Since I only have a few - we took a simple approach

`/etc/exim4/interfaces`

has lines of the form

    domain: ip
    domain: ip
    domain: ip

Then - in `/etc/exim4/conf.d/transport/30_exim4-config_remote_smtp` (or wherever your definition of remote_smtp transport is) add the following to the remote_smtp transport:

    interface = ${lookup{$sender_address_domain}lsearch{/etc/exim4/interfaces}{$value}{default_ip_in_case_no_match}}
