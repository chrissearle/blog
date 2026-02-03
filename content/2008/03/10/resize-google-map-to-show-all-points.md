---
title: Resize google map to show all points
date: 2008-03-10 20:45:52 +0100
tags: [web, google maps, maps, javascript]
---

I needed to get a google map to center and scale based on the added points.

I found a tutorial here: [http://econym.googlepages.com/basic14.htm](http://econym.googlepages.com/basic14.htm)

This gave me exactly what I needed.

In short, given a GMap2 object called map and a map of locations (name -> object with lat and lng properties):

    map.setCenter(new GLatLng(0,0),0);

    var bounds = new GLatLngBounds();

    for (name in locs) {
        var loc = locs[name];
        var latlng = new GLatLng(loc.lat, loc.lng);
        var marker = new GMarker(latlng);

        bounds.extend(latlng);

        map.addOverlay(marker);
    }

    map.setZoom(map.getBoundsZoomLevel(bounds));

    map.setCenter(bounds.getCenter());
