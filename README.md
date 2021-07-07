## [WIP] EXPLORATION OF USING VECTOR TILES for RENDERING LARGE-SCALE DATASETS in the BROWSER

### What are vector tiles?
https://geovation.github.io/build-your-own-static-vector-tile-pipeline


Strategies for:
- simplifying geographic polygons based on visible area
- compressing large data for browser rendering
- dynamic browser styling / rendering using WebGL
- file structure for storing large amounts of data

### Generating vector tiles

Using Tippecanoe:

Example dataset: https://github.com/juliuste/german-administrative-areas

```
tippecanoe --no-feature-limit --no-tile-size-limit --no-tile-compression --output-to-directory gemeinden-uncompressed ./german-administrative-areas/gemeinden.geo.json
```
To try:
Use nuts3, states at higher zoom levels
https://github.com/mapbox/tippecanoe#show-countries-at-low-zoom-levels-but-states-at-higher-zoom-levels

output gemeinden at higher zoom levels
```
tippecanoe -z13 -Z8 -y GEN --generate-ids --no-tile-compression --output-to-directory gemeinden-z7-ids ./german-administrative-areas/gemeinden.geo.json
```
```
tippecanoe -z6 -y GEN --generate-ids --no-tile-compression --output-to-directory laender-z6-ids ./german-administrative-areas/laender.geo.json
```

```
tippecanoe -z8 -Z6 -y GEN --generate-ids --no-tile-compression --output-to-directory kreise-z8-Z6-filtered-ai ./german-administrative-areas/kreise.geo.json
```

(compression gzips the output which requires different headings on server requests)


### Rendering
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
