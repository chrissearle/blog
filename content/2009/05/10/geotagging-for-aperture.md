---
title: Geotagging for aperture
date: 2009-05-10 21:31:32 +0200
tags: [aperture, gps, photography, geotagging, gpsphotolinker, houdahgeo, maperture]
---

## What is geotagging?

[Geotagging](http://en.wikipedia.org/wiki/Geotagging) is simply inserting geographic location data in a media file so that it can be placed on a map or otherwise related geographically with other images, services etc. It is the technology used by flickr maps, the Places categorization in iPhoto and many other services.

## Aperture

[Aperture](http://www.apple.com/aperture/) is Apples professional photo management tool

## Where does the data get stored?

The geographical information has to be stored in the metadata of the photo. For a camera that has GPS support built in (e.g. the iPhone) this is embedded in the [EXIF](http://en.wikipedia.org/wiki/EXIF) metadata - this is the metadata that the camera embeds when the shot is taken.

This EXIF metadata is _not_ editable in Aperture (or in many other apps) - the user editable metadata is the [IPTC](http://en.wikipedia.org/wiki/IPTC) fields (caption, copyright, keywords etc). Geotagging can be added to the IPTC set.

[This article](http://www.organizepictures.com/2009/01/methods-for-geotagging-pictures) gave a pretty simple comparison of these methods. Here the author has the following that is a good rule of thumb:

<blockquote>Here is an easy way to remember the difference between EXIF and IPTC: EXIF metadata is intended for machines while IPTC metadata is intended for humans.</blockquote>

### Aperture

What does aperture want? Well - for aperture to work without issues - if you can get the geotagging info into the _EXIF_ metadata _before_ you import to aperture then things will work much smoother. In particular - it appears (this is an empirical observation based on symptoms) that when you export a file it exports EXIF from the master and IPTC from the versions so if the geotagging metadata is in the EXIF of a version (and the aperture API's do not allow the master EXIF to be edited) then the information will be lost.

## Software

### HoudahGeo

This is commercial software from [houdah.com](http://www.houdah.com/houdahGeo/). It has a very simple workflow - import, geotag, export.

Import is from disk or from your photo library (aperture, iphoto).

Geotagging from GPX, NMEA data or from direct connection to a GPS or via reverse geocoding, google earth or via placement on a map. I've always used it with GPX files.

Importantly - it can write back to the EXIF data.

Exports to flickr, locr, google earth - but for me - I just use it to update the files metadata prior to aperture import.

### GPSPhotoLinker

Free (but donations appreciated) from [Early Innovations](http://www.earlyinnovations.com/gpsphotolinker/). It is primarily a GPS track/photo timestamp matcher and for this it works very well. You load up tracks and photos - and then let it match them up based on timestamp (this is how all track/photo timestamp matchers work).

### Maperture and Maperture pro beta

This is an edit plugin inside aperture itself from [Übermind](http://www.uberplugins.com/products/maperturepro.php). Maperture allows some geotagging but the primary benefit of the pro version (albeit that it is still in beta) is that it will import GPS tracks (GPX files).

It fits well inside aperture - editing/displaying images selected from the aperture library.

It has one **major** drawback. GPS data added by maperture pro is lost when you export versions or share (via any of the share/export plugins I have tried). Übermind say that this is a limitation of the Aperture APIs themselves.

It will happily read data present in the file at import and this data **will** be exported. So it seems best to geotag externally - and then use maperture internally for viewing. If they can fix this then maperture pro (which I believe will be commercial when it leaves beta) may well be worth having - otherwise - plain maperture (which is free - at least at the moment) will do.

## Hardware

All the above software has been based around using GPS tracks from a handheld GPS and cross referencing to the unit based on time. [Derrick Storey](http://www.thedigitalstory.com/blog/2009/03/a_quick_primer_on_ge.html) has a series of reviews of geotagging - and has tested the Jobo photoGPS (amongst other things) - this uses the hotshoe signal (that would normally fire a flash - at least so I understand it - it may be doing a full track - not sure) to trigger a recording of the location and can then re-assemble the photos and the signal data at processing time. However - there are more and more cameras that support GPS information coming onto the market. A fair number of the Nikon DSLRs have support for NMEA signals (GPS signal) and Nikon have now released a hotshoe GPS - the GP-1.

### GP-1

![GP-1](https://www.europe-nikon.com/tmp/eu/2419865273/3760176746/2327365364/27184057/1391280926/3864574427/2811668887/2187440206/3919017901/2136552956.png)

This device connects directly to a range of Nikon digital SLR's and is a small hotshoe mountable gps that instead of recording the position and time for later matching sends the data into the camera where it is embedded into the EXIF fields. This dramatically simplifies the workflow when bringing the shots into aperture.

The unit can be supported by the hotshoe or clipped into a hotshoe socket on the strap (included in the GP-1 box). It draws all power from the camera - and you can see the status in the camera's LCD.

When a shot is taken - you can see the geolocation data in the info pages for the shot on the back of the camera.

It acquires pretty much as advertised - 45-60s from cold - very fast (5s or so) from warm.

I've just shot 231 images in an open square in Oslo. There are high buildings around the square and it was very cloudy - so the signal may have been poor - and I had the unit on the strap rather than the hotshoe - so not optimal placed. I know that at that latitude and with that weather - in that part of town my handheld and car GPS's also struggle.

Of the 231 shots - 43 were not tagged. The other 188 were all well placed - not just in the square but at the right point (halfway along one side). So - location - seems accurate.

However - the altitude measurements ranged from -36m to 143m. A good altitude depends on a good set of satellites and good signal - but I was a little disappointed in the variation here.

I do have one issue. This is an issue I meet time and again - and is not specific to the GP-1 - but it annoys me all the same - **The status LED**. Red/Green LEDs are a nightmare for red/green colourblind people like myself :(

## Conclusion

For my usage - I will be using the GP-1 device to embed directly to the EXIF at capture. This means that geolocation information simply _just works_. In cases where manual geotagging is required - I'll be using HoudahGeo prior to import. Inside aperture for viewing I will use maperture (unless Apple adds places to aperture) - however - not for editing - since this does not work for exports.

In summary - the definitive geotagging software for aperture has yet to be written - but the tools are available to work around issues. Of them all - if Maperture can fix the fact that the data doesn't stick at export when applied after import - then I'll be sticking with that.
