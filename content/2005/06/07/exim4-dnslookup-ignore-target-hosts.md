---
title: exim4 - dnslookup - ignore_target_hosts
date: 2005-06-07 11:33:05 +0200
tags: [linux, exim4, dns]
---

The dnslookup section of the exim4 config contains

```text
# ignore private rfc1918 and APIPA addresses
ignore_target_hosts = 0.0.0.0 : 127.0.0.0/8 : 192.168.0.0/16 :\
                    172.16.0.0/12 : 10.0.0.0/8 : 169.254.0.0/16
```

To allow one specific subnet thru change it:

```text
# ignore private rfc1918 and APIPA addresses
ignore_target_hosts = !192.168.3.0/24 : 0.0.0.0 : 127.0.0.0/8 : 192.168.0.0/16 :\
                    172.16.0.0/12 : 10.0.0.0/8 : 169.254.0.0/16
```

Here it allows the 192.168.3.x network.
