---
title: Allsky Camera
date: 2026-03-08 11:13 +0100
category: Photography
tags: [raspberry pi, 3d printing, astrophotography, timelapse, allsky, keogram, star trail]
intro: I finally got the allsky camera up and running
image: https://allsky.chrissearle.org/image.jpg
---

A couple of years back I decided to build an [allsky](https://github.com/AllskyTeam/allsky) camera setup.

## Build

I started with a Pi 4 and RPI HQ camera - and I grabbed a plastic dome and waterproof box.

Over time - it got updated to a Pi 5 with Waveshare combined M.2 Sata/PoE hat - so now it takes power from the network cable and has a more stable disk than an SD card.

![3D print showing mounting](/images/posts/2026/03/08/IMG_1427.jpeg)

![Camera mounted](/images/posts/2026/03/08/IMG_1430.jpeg)

![Camera assembly](/images/posts/2026/03/08/IMG_1431.jpeg)

![Assembly on box](/images/posts/2026/03/08/IMG_1582.jpeg)

## Setup

The camera is now on the garage roof.

Public view is available at https://allsky.chrissearle.org/

It contains the latest live image, and nightly generated keograms, timelapses and star trail images.

![Current image](https://allsky.chrissearle.org/image.jpg)

## Timelapse

One per 24 hours - generated when moving from night to day each day.

## Star trail

A single image showing any stars for the night - generated at the end of night each day.

## Keogram

Quoted from https://github.com/AllskyTeam/allsky#keograms

> ![Sample keogram](https://github.com/AllskyTeam/allsky/raw/master/assets/Keogram.png)

> A Keogram is an image giving a quick view of the day's activity. For each image a central vertical column 1 pixel wide is extracted. All these columns are then stitched together from left to right. This results in a timeline that reads from dawn to the end of nighttime (the image above only shows nighttime data since daytime images were turned off).

Since the instance I am running has auto-gain enabled there will be some hops in brightness across the keogram.