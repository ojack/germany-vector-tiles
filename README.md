## [WIP] Exploration of using vector tiles for rendering large-scale datasets in the browser

This repository is an exploration of strategies for:
- simplifying geographic polygons based on visible area
- compressing large data for browser rendering
- dynamic browser styling / rendering using WebGL
- file structure for storing large amounts of data
git add 
### What are vector tiles?
https://geovation.github.io/build-your-own-static-vector-tile-pipeline


> Mapbox Vector Tiles are a modern way of storing and transmitting the same sort of feature data you might ordinarily find in a shapefile, GeoJSON or TopoJSON file.
>
>There are two features of vector tiles that make them particularly interesting as a source format for displaying data on maps:
>
> 1. In preparing the tiles, the data for the features the tileset represents is chopped up into individual tiles. This means the data for a large feature like a coastline will no longer exist as a single complex shape, but instead each tile that needs to display a portion of it will contain just the information needed to render the part of the coastline it is responsible for.
> 2. Mapbox Vector Tiles are a compact binary encoding of the vector data called Google Protocol Buffers that is smaller than corresponding JSON, and usually smaller than a corresponding traditional raster tile too.
>
>Because of these innovations, vector tiles have a major advantage over non-tiled formats like GeoJSON and TopoJSON:
>
> 1. Map clients only need to download the data for the tiles they need to display, not all the data for all features that have some part on the map (as they would with GeoJSON or TopoJSON)
> 2. Even if source GeoJSON or TopoJSON was prepared as separate tiles, Vector tiles can be obtained by browsers more quickly because they are a more compact binary format so file sizes are lower.
>
> Being a vector format (containing portions of the actual source data), vector tiles have advantages over traditional raster tiles (just pictures of the pre-coloured data) too:
>
> 1. Map clients can access the vector data directly so have the ability to re-colour or style the data dynamically themselves without needing to load more data from the server (something that can’t be done with raster tiles, which are just images of the data)
> 2. Map clients can zoom in and out smoothly between the different zoom levels because the data can be easily scaled while new data is loaded. This is known as over-zooming or under-zooming.
> 3. Vector tiles often have smaller file sizes than raster tiles. For example imagine you want to draw a line. In an image, you’d need to colour in each pixel between the start and end point (perhaps 20 numbers), whereas as a vector, you just specify numbers for the start and end point.


### Generating vector tiles

Using Tippecanoe:

Example dataset: https://github.com/juliuste/german-administrative-areas

```
tippecanoe --no-feature-limit --no-tile-size-limit --no-tile-compression --output-to-directory gemeinden-uncompressed ./german-administrative-areas/gemeinden.geo.json
```

#### Using different geographic boundaries at different zoom levels
output gemeinden at higher zoom levels (zoom 13 to 8)
```
tippecanoe -z13 -Z8 -y GEN --generate-ids --no-tile-compression --output-to-directory gemeinden-z7-ids ./german-administrative-areas/gemeinden.geo.json
```

kreise (zoom 8 to 6)
```
tippecanoe -z8 -Z6 -y GEN --generate-ids --no-tile-compression --output-to-directory kreise-z8-Z6-filtered-ai ./german-administrative-areas/kreise.geo.json
```

laender (zoom 6 to 0)
```
tippecanoe -z6 -y GEN --generate-ids --no-tile-compression --output-to-directory laender-z6-ids ./german-administrative-areas/laender.geo.json
```



### Notes
- compression in tippecanoe refers to whether or not the output is g-zipped. this results in smaller file sizes, but requires special headings on server requests


### Rendering Options
- DeckGL 
- OpenLayers https://openlayers.org/en/latest/examples/osm-vector-tiles.html
- Mapbox 
- Leaflet http://leaflet.github.io/Leaflet.VectorGrid/vectorgrid-api-docs.html
- Tangram
- d3 

helpful https://deck.gl/docs/developer-guide/performance

### Loading and animating data
Dynamically load and display data based on features being currently rendered

separate file for each date + geographic level (not spit into vectors)

separate tiled layer for each data source?

### Optimizations
pre-calculated color scale as in : https://github.com/visgl/deck.gl/blob/8.4-release/examples/website/geojson/app.js
