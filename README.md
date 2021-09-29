## [WIP] EXPLORATION OF USING VECTOR TILES for RENDERING LARGE-SCALE DATASETS in the BROWSER

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

#### Different geographic boundaries at the same zoom level
tippecanoe -z13 -y GEN --generate-ids --no-tile-compression --output-to-directory tiles/gemeinden-zAll-ids ./german-administrative-areas/gemeinden.geo.json

tippecanoe -z13 -y GEN --generate-ids --no-tile-compression --output-to-directory tiles/laender-zAll-ids ./german-administrative-areas/laender.geo.json

tippecanoe -z13 -y GEN --generate-ids --no-tile-compression --output-to-directory tiles/kreise-zAll-ids ./german-administrative-areas/kreise.geo.json

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

```
   
### TO DO
1. ~~example rendering and animating only gemeinden level with fake data~~
    * ~~generate fake data at each date~~
    * ~~load data as needed~~ (preload? use webworkers?)
2. ~~Dynamically load and display data based on features being currently rendered~~
3. Add example `metadata.json` 
4. document folder structure (update version below)
5. Generate example `id-lookup.csv` for each vector tileset. (File that associates a specific geoid with a specific array index. All datasets that reference this tileset should use the given id lookup. Possibly also create an `id-lookup-extended.csv` that contains more properties from vector features. )
separate file for each date + geographic level (not spit into vectors)

### QUESTIONS
* is it reasonable to use the same order as id array from each tileset in order to generate ordered arrays of values for each dataset? 
* should each dataset and tileset have its own `metadata.json`, should there be one for 'datasets' and one for 'tilesets', or just one for all? This might affect data pipeline. Ideally, datasets shown and labelling, etc. could be updated just by updating the data files. Is there a way that is most efficient in terms of diffing and versioning? Datasets are likely to change often (each day as is updated), where as tilesets will very rarely if ever change. 

### Optimizations
pre-calculated color scale as in : https://github.com/visgl/deck.gl/blob/8.4-release/examples/website/geojson/app.js



#### (OLD, NEED TO REWRITE) Test Data format:
--Timeseries data with a separate folder for each geographic level, and a separate file for each geographic region
--my-sample-data
    metadata.json
    gemeinden
        mobility-by-date
            2020-01-12.csv
            2020-02-13
            .....
        mobility-by-region
            geoid0.csv
            geoid1.csv
            .....

format for metadata.json:
```
 dataset: {
     geoLevel: {
         geoFile: 'my_gemeinden_vectors.geojson',
         numFeatures: -----,
         startDate:
         endDate:
     }
 } 