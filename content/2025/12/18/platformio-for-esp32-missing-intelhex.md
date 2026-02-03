---
title: PlatformIO for ESP32 - missing intelhex
date: 2025-12-18 10:03 +0100
tags: [ arduino, esp32, platformio, intelhex ]
intro: Updating the ESP32 platform in PlatformIO to later than 1.40501 gave an error about missing intelhex.
---

After updating the espttool inside platformio from 1.40501 to a later version, I encountered the following error:

```
ModuleNotFoundError: No module named 'intelhex'
```

One fix is to pin the esptool version back to 1.40501 in the `platformio.ini` file:

```ini
platform_packages =
    tool-esptoolpy@~1.40501.0
```

The other workaround seems to be installing the python package `intelhex` manually. You can do this by running (at least
on a linux or mac system):

```bash
cd .platformio/penv
source bin/activate
pip install intelhex
```

After this - the error disappears - and it now works fine with 2.40900.250804 (4.9.0).

I have no idea why this is needed, nor if this is the "correct" solution - but it works for me.
