---
title: Follow up to Resize google map to show all points - making space at the top
date: 2008-03-13 07:32:29 +0100
tags: [web, google maps, maps, javascript]
---

In [Resize google map to show all points](/2008/03/10/resize-google-map-to-show-all-points/) it shows how to rescale the map based on added overlays. But - it sometimes puts points a little too close to the top. The point is shown but since the icon has size - this disappears out of the visible frame.

Here's a method to add a little space before calling the setZoom. I call this anyway - it could be enhanced to see if there is a point in the danger zone but I haven't bothered.

    function growTopBound(map, bounds) {
      var latlngNorthEast = bounds.getNorthEast();
      var pointNorthEast = map.fromLatLngToDivPixel(latlngNorthEast);
      bounds.extend(map.fromDivPixelToLatLng(new GPoint(pointNorthEast.x, pointNorthEast.y - 75)));
      return bounds;
    }

Where I used to call

    // Zoom to bounds
    map.setZoom(map.getBoundsZoomLevel(bounds));
    map.setCenter(bounds.getCenter());

I now call

    // Zoom to bounds
    map.setZoom(map.getBoundsZoomLevel(bounds));
    map.setCenter(bounds.getCenter());
    // Based on that - grow top by a small amount
    bounds = growTopBound(map, bounds);
    // And re-do the zoom
    map.setZoom(map.getBoundsZoomLevel(bounds));
    map.setCenter(bounds.getCenter());
