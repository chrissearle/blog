---
title: IE Conditional Comments
date: 2005-06-30 11:27:38 +0200
tags: [design, internet explorer]
---

Something new learned today:

[http://virtuelvis.com/archives/2004/02/css-ie-only](http://virtuelvis.com/archives/2004/02/css-ie-only)

Example - include an IE specific stylesheet (to correct for IE's CSS border model) without hacking the stylesheet to pieces:

```xml
<!--[if IE]><link rel="stylesheet" type="text/css" href="ie.css"/><![endif]-->
```
