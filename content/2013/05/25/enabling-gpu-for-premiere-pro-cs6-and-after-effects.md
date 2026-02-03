---
title: Enabling GPU for Premiere Pro CS6 and After Effects
date: 2013-05-25 17:50:28 +0200
tags: [mac, adobe, premiere, after effects, nvidia, cuda]
---

Got a modern mac with a good nvidia graphics card but premiere and after effects won't use your GPU?

All the details - [http://www.vidmuze.com/how-to-enable-gpu-cuda-in-adobe-cs6-for-mac/](http://www.vidmuze.com/how-to-enable-gpu-cuda-in-adobe-cs6-for-mac/)

Short form:

- Install cuda driver from nvidia - [http://www.nvidia.com/object/mac-driver-archive.html](http://www.nvidia.com/object/mac-driver-archive.html)

- Use GPUSniffer to get the card name (both of the apps have a copy of the GPUSniffer - choose one of the following):

```shell
/Applications/Adobe\ Premiere\ Pro\ CS6/Adobe\ Premiere\ Pro\ CS6.app/Contents/GPUSniffer.app/Contents/MacOS/GPUSniffer
/Applications/Adobe\ After\ Effects\ CS6/Adobe\ After\ Effects\ CS6.app/Contents/GPUSniffer.app/Contents/MacOS/GPUSniffer
```

- Add the card name to both

```shell
/Applications/Adobe\ Premiere\ Pro\ CS6/Adobe\ Premiere\ Pro\ CS6.app/Contents/cuda_supported_cards.txt
/Applications/Adobe\ After\ Effects\ CS6/Adobe\ After\ Effects\ CS6.app/Contents/raytracer_supported_cards.txt
```
