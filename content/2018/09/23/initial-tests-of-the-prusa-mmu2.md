---
title: Initial tests of the Prusa MMU2
date: 2018-09-23 23:47 +0200
tags: [3d printing, prusa, mk3, mmu2]
category: 3D Printing - Laser Cutting - CNC
image: /images/posts/2018/09/lizard1.jpg
intro: Multi material unit v2 on the Prusa MK3
---

## MMU2

The [multi material unit v2 from Prusa](https://www.prusaprinters.org/multi-material-upgrade-2-0-is-here/) (MMU2) was recently released - and for those of us that pre-ordered it way back when it was announced - it's actually started arriving.

I assembled mine on Saturday - it took about 4 hours to do so. The [instructions on the website](https://manual.prusa3d.com/c/Original_Prusa_i3_MK3_to_Multi_Material_2_upgrade) were easy to follow and although the unit is complex - it wasn't too hard to assemble. They also provide the newer extruder/hot end plastic components so I was able to upgrade mine from the original parts at the same time.

I then tried to perform the z-calibration (success) and first layer calibration (failed). It wasn't feeding filament into the extruder gears/hot end. After some testing I found that the short PTFE tube inside the filament cover assembly was slightly misaligned (see [new filament sensor cover assembly in the electronics and mmu2 unit assembly instructions](https://manual.prusa3d.com/Guide/3.+Electronics+and+MMU2+unit+assembly/757?lang=en#s12492)).

Once that was done - I found that the filament was entering the filament sensor but not quite reaching the bondtech gears. That was easily solved by following the [bowden length setting procedure](https://manual.prusa3d.com/Guide/Service+menu+-+bowden+length/821?lang=en).

This allowed me to complete the first layer calibration.

## Testing

The first test print was to be the striped lizard from the [list of sample multi material prints](https://www.prusa3d.com/printable-3d-models/).

It got about half way through then I started getting warnings on the MMU2 about loading/unloading.

After a bit of dismantling - I found that the cutter blade inside the selector (see [blade-holder assembly in the pulley body assembly instructions](https://manual.prusa3d.com/Guide/2.+Pulley+body+assembly/755?lang=en#s12414)) had slipped. I'd tightened the bolts but had been afraid of overdoing it and cracking the plastic. So - remounted this tighter and refitted everything.

The second print completed well.


![Lizard](/images/posts/2018/09/lizard1.jpg)

![Lizard](/images/posts/2018/09/lizard2.jpg)

### Failures

However - I have seen some different failure modes while testing.

* One model had a layer shift. This is something that happens from time to time on belt driven printers - luckily for me its a rare occurrance. But this time it did happen.
* One false crash detection - can't see any reason for it but it auto recovered without issue
* One model where one colour about half way thru stopped reaching the bondtech gears - while the other colours all were OK. Have seen some reports of this on the github repo. This left a model with some parts printed and some not - not able to save this one
* Twice I got a really odd filament feed error (see below)
* Finally - I had the issue with not reaching the gears again - but this time - it was down to the last part with only one colour so it's flat. I will be able to cut the model at the height reached and print just the missing bits which I can then glue together.

### Filament feed error

This one hit twice. It gives a load or unload warning - but - fixing it moves the wrong filament. It seems that the MMU2 can get into a situation where the selector and the idler pulley body are not in agreement on which filament is current. So in my second example - the idler pressed down and moved filament 1 while the selector (and LEDs) were all set up for filament 5.

For more information - see [my comment on this github issue](https://github.com/prusa3d/Prusa-Firmware/issues/1181#issuecomment-423849313).

## Conclusions

It's a fun piece of kit. When it completes a print - it looks good - the quality is the same as on the non MMU2 enabled mark 3 and there is very little colour bleed.

But - it is very early days with this in the market - there are some issues that they will have to fix. One is the not feeding into the hot end (apparently it doesn't use the filament sensor when the MMU2 is in use - which would have detected that the filament wasn't moving). The other is the idler and selector disagreeing about where they are.

So - it's not ready for long many-hour overnight jobs - you need to babysit the device. And multi material prints are slow - the filament changeover adds time.

But for small models that you can watch and handle any filament feed errors for - it's already fun - and I hope that they will continue working on the programming for it - with firmware releases to fix the bugs that have already been found.

The next thing I want to test is using soluble supports - especially just soluble interface layer between the model and the supports.

## Troubleshooting

Prusa has a [troubleshooting guide](https://manual.prusa3d.com/c/MMU2_Troubleshooting) which I expect they will keep updating.

Chris Warkocki (one of the beta testers) has released a couple of videos [on his youtube channel](https://www.youtube.com/channel/UC3PX8aZvkadWgz9yrqONlGQ) which are of interest - especially the troubleshooting 101 video.
