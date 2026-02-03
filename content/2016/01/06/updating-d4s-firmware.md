---
title: Updating D4S firmware
date: 2016-01-06 21:53 +0100
tags: [nikon, d4s, firmware]
category: Photography
image: /images/posts/2016/01/installer.png
intro: Dealing with issues when upgrading firmware on a Nikon D4S
---

My Nikon D4S had the C firmware 1.20 and L firmware (Distortion Control Data) 2.005. [C 1.30](http://downloadcenter.nikonimglib.com/en/download/fw/172.html) and [L 2.009](http://downloadcenter.nikonimglib.com/en/download/fw/140.html) were available.

I need to do the update from a mac.

## C Firmware

Downloading the C firmware was simple.

It downloads a F-D4S-V130M.dmg which contains a D4SUpdate directory that has a D4S_0130.bin file.

- copy that to the root of your memory card
- plug that back into the camera
- Menu -> Setup -> Firmware Version -> Update

## L Firmware

This was harder.

Downloading gives you a S-DCDATA-002009MF-ALLIN-32BIT\_.dmg which in turn contains a S-DCDATA-002009MF-ALLIN-32BIT\_ app.

Starting this prompts you to select language (and if you need it region) - and then starts an installer.

This installer fails with the following error:

![The installer could not install the software because there was no software found to install](/images/posts/2016/01/installer.png)

OK - so - some googling - here's how I did it.

With the dmg still open - crack open a terminal.

```shell
cd /Volumes/S-DCDATA-002009MF-ALLIN-32BIT_/Packages/Distortion\ Control\ Data.pkg/Contents
cp Archive.pax.gz ~
cd
gzip -d Archive.pax.gz
pax -r < Archive.pax
cd tmp/jp.co.nikon.installer.apppkg/Nikon
open .
```

That should open a finder window with the .bin file sitting in it. Did for me - then you just do the same thing as for C above.

That is:

- change to the directory on disk that is the mounted dmg file - then into a Packages/Distortion\ Control\ Data.pkg/Contents directory within that. Note that if you mount more than once or have a different version of the .dmg then the path here will need adjusting
- get the Archive.pax.gz file and copy it to home directory
- change to home directory
- uncompress the pax file from gzip format
- expand the pax file to its component files - this creates in this case a relative directory called tmp
- change to tmp/jp.co.nikon.installer.apppkg/Nikon
- open it in finder
