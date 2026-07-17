---
title: Depth curves for the lakes of the Halden river system
date: 2026-07-17 11:36 +0200
tags: [gis, qgis, geojson, gurumaps, maps, halden]
intro: I wanted to get the depth curves for the lakes in Haldenvassdraget (Halden rivers/lakes) into geojson format.
image: /images/posts/2026/07/17/depth_curves.png
---

[NVE](https://www.nve.no/) have a lot of data available via [atlas](atlas.nve.no).

Under the beta area (*Tema (beta)*) is the water area (*Tema vann*) with access to the inland lakes database (*innsjødatabase*).

Amongst other things - this has depth points and curves for most of the lakes in the system of lakes and rivers here in Halden.

I wanted to have this data available to me while on the lakes - and preferably in an offline format.

I already had several mapping apps - and some have support for geojson data. In this instance I decided to use [Guru Maps](https://gurumaps.app/). This can have up to 3 offline maps in the free version - but - importantly for this use case - it also supports geojson and mapcss too.

## Retrieval

So - the data in innsjødatabase is available and can be queried. Each lake has a water ID (vatnlnr) - which you can see by clicking on the atlas map.

For example - depth curves for Femsjøen which is 316:

```
curl -o depth_curves.json 'https://kart.nve.no/enterprise/rest/services/Innsjodatabase2/MapServer/2/query?where=vatnlnr+IN+(316)&outFields=*&f=geojson'
```

You can extend the IN clause to cover several lakes in one response. You can alse switch `MapServer/2` with `MapServer/1` for depth points.

So - that gave me a geojson file that is almost but not quite what I needed.

## Customization

The Guru Maps can can show fields in the data on the curve - but - I could not get it to play well with doing calculations in the geojson (using eval). So - my depth curves were showing as `10,500000` rather than `10,5`  - it's correct but was a little crowded. The depth data is stored as a number so is formatted on display.

Rather than trying again and again - I decided to add a preformatted field to the data set using QGis.

Load the data into a new vector layer in qgis. Open the attribute table and enter edit mode. Look for the Field Calculator and add a new field - depth_label - of type text(string) with the following expression: `format_number(dybde_m, 1)`

That adds a pre-calculated value for each row to one decimal place - using a string - so that it is not formatted for display - just shown as is.

Now - export that layer as geojson.

## Styling

Now we need to style it. I used the following mapcss file to give me colours that worked for this data set:

```
line[dybde_m] {
    width: 1px;
    text: eval(tag('depth_label'));
    text-color: #FFFFFF;
    font-size: 10;
    font-stroke-width: 1px;
    font-stroke-color: #000000;
}
line[dybde_m>=0][dybde_m<2]   { color: #D6EAF8; width: 1px; }
line[dybde_m>=2][dybde_m<5]   { color: #AED6F1; width: 1px; }
line[dybde_m>=5][dybde_m<10]  { color: #5DADE2; width: 1.5px; }
line[dybde_m>=10][dybde_m<20] { color: #2E86C1; width: 1.5px; }
line[dybde_m>=20][dybde_m<30] { color: #1B4F72; width: 2px; }
line[dybde_m>=30]             { color: #0B2942; width: 2.5px; }
```

Finally - you need to get the geojson and mapcss into Guru Maps. To start with - as long as the files were of the same name (`foo.geojson`/`foo.mapcss`) it figured it out - but after a while it starting creating a single layer per file.

## Creating the import

So - merge them into a .ms file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<customMapSource overlay="true">
  <name>Display Name</name>
  <geojson><![CDATA[
  CONTENTS_OF_GEOJSON_FILE
  ]]></geojson>
  <style><![CDATA[
  CONTENTS_OF_MAPCSS_FILE
  ]]></style>
</customMapSource>
```

Then drag that into Guru Maps and you have the data.

## Result

![Femsjøen - Depth Curve](/images/posts/2026/07/17/depth_curves.png)
