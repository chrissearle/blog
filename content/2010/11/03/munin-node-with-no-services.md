---
title: Munin - node with no services
date: 2010-11-03 09:41:03 +0100
tags: [munin]
---

Note to self - when munin shows no services for a node yet all testing (telnet to 4949 from the munin server to the node) etc show OK - check you've spelt the nodename correctly and use the host_name value in the node's munin-node.conf if you need to override it on the node.
