/*
* To do:
* - how to update tooltip when date is updated? 
* - definition file for datasets
* - make dataset files that only contain values, not geoid
* - implement start date and end date
* - add sample data for timeseries
* - loading spinner while data is loading
* - show selected elements as separate array
* 
* assumptions: geo id in tileset refers to data order (?)
* are there datasets that only exist at certain geolevels?
* https://deck.gl/docs/api-reference/geo-layers/mvt-layer
*/
const {DeckGL, MVTLayer} = deck;
//import { csv } from 'd3'
import {load} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';
import html from 'nanohtml'

let viz
let geoRegion
let dataset = 'mobility'

const baseURL = window.location.href.replace('/example-data-loading/', '')

const datasetPath = `/sample-data/datasets/`

const tilesetPath = `/sample-data/tilesets/`

// sets of vector tilesets representing different geo-regions
const tilesets = [{
  label: 'gemeinden', // 
  id: 'gemeinden',// 
  url: 'gemeinden',
  numEntries: 11431,
}, {
  label: 'kreise',
  id: 'kreise',
  url: 'kreise',
  numEntries: 432
},
 {
  label: 'laender',
  id: 'laender',
  url: 'laender',
  numEntries: 34
}
]

const datasets = [{
  label: 'Mobility by Date',
  id: 'mobility',
  url: '',
  startDate: '2021-05-23',
  endDate: '2021-08-30',
  tilesets: ['laendergeo', 'kreisegeo', 'gemeindengeo']
}]

tilesets.forEach((tileset, i) => {
  const URL = `${baseURL}${tilesetPath}${tileset.url}/{z}/{x}/{y}.pbf`
  tileset.tiles = [ URL ]
  tileset.visibile = false
  tileset.mobility = new Array(tileset.numEntries).fill(0).map((_, i) => Math.random())
})

const numDates = 100
let currentDateIndex = 0
selectGeoLevel('gemeinden')
//geoRegion = tilesets[0]

console.log('base url', tilesets, geoRegion)

const footer = html`<div style="position:absolute;bottom:0px;right:0px;width:100%"></div>`
const generateDate = (date = 'hi') => `<div style="font-size:4rem;color:white;background:rgba(0, 0, 0, 0.4)">${date}</div>`
const dateEl = document.createElement('div')

const geoSelect = html`<label for="geolevel">Select map geo level</label>
<select label="geolevel" onchange=${(e) => { selectGeoLevel(e.target.value)}} id="geolevel">
 ${tilesets.map((tileset) => html`<option value="${tileset.id}" ${tileset.id === geoRegion.id?'selected':''}>${tileset.label}</option>`)}
</select>`

footer.appendChild(geoSelect)
footer.appendChild(dateEl)


// optimizations for this: load directly as an array and do not parse into objects
// store already loaded data in some way and only load new data as necessary
// read more about deckgl / webgl performance
// show loading animation while loading
async function getData() {
  currentDateIndex++
  if(currentDateIndex > numDates) currentDateIndex = 0
  const d = new Date()
  d.setDate(-numDates + currentDateIndex)
  const dateStr = d.toLocaleDateString('en-CA') //date.format(d, 'YYYY-MM-DD')
  dateEl.innerHTML = generateDate(dateStr)
  const newData = await load(`${baseURL}${datasetPath}${dataset}/${geoRegion.id}/values-by-date/${dateStr}.csv`, CSVLoader);
  // console.log('loaded', newData, geoRegion)
  geoRegion.mobility =  geoRegion.mobility.map((_, i) => newData[i].mobility)
//gemeinden: new Array(11431).fill(0).map((_, i) => Math.random()),
//kreise: new Array(432).fill(0).map((_, i) => Math.random())
  render()
}
getData()

function selectGeoLevel (id) {
  tilesets.forEach((tileset) => {
    if(tileset.id === id) {
      tileset.visible = true
      geoRegion = tileset
    } else {
      tileset.visible = false
    }
  })
}

function render () {
  // console.log(tilesets, 'tilesets')
  const layers = tilesets.map((tileset) => new MVTLayer({
    // id: tileset.id,
    id: tileset.id,
    data: tileset.tiles,
    pickable: tileset.visible,
    getFillColor: (obj) => {
      //console.log('getting mobility at', obj.id, tileset.mobility)
      const j = tileset.mobility[obj.id]
     return [j * 255, j * 255, j * 255]
     //return [Math.random() * 255, Math.random() * 255, Math.random() * 255]
    }, 
    getLineWidth: 4,
  transitions: {
    getFillColor: 100,
  },
  updateTriggers: {
    // if currentDateIndex changes, recompute getFillColor for each point
    getFillColor: [currentDateIndex]
  },
  visible: tileset.visible,
  lineWidthMinPixels: 0,
  maxZoom: 13,
  minZoom: 0,
}))

  viz.setProps({layers: layers})
}
viz = new DeckGL({
  
  initialViewState: {
    // longitude: -122.4,
    latitude: 51.66403781658121,
    longitude: 10.6460952758789,
    // latitude: 37.74,
   // longitude: 13.765869,
    //13.765869,54.117382
    zoom: 6,
    maxZoom: 20,
    pitch: 30,
    bearing: 0
  },
  controller: true,
  getTooltip: ({ object }) => { 
    if(object) {
      console.log(object)

      return `${object.properties.GEN} mobility ${geoRegion.mobility[object.id]}`
    }
    return null
  }
  //layers: [layer]
});
  
setInterval(() => {
//  console.log(shouldUpdate)
// fakeData.laender = fakeData.laender.map((_, i) => Math.random())
// fakeData.kreise = fakeData.kreise.map((_, i) => Math.random())
//fakeData[geoRegion] = fakeData[geoRegion].map((_, i) => Math.random())
//gemeinden: new Array(11431).fill(0).map((_, i) => Math.random()),
//kreise: new Array(432).fill(0).map((_, i) => Math.random())
  //render()
getData()
 // shouldUpdate ++
}, 2000)


document.body.appendChild(footer)

//   const tileURL = `${window.location.origin}/gemeinden-z7-uncompressed/{z}/{x}/{y}.pbf`

// const DATA = [
//     tileURL
//     //'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt'
//   ]

// function render () {
// const gemeinden = new MVTLayer({
//   id: 'gemeindengeo',
//   data: DATA,
//   pickable: true,
//   getFillColor: () => {
//    // console.log(shouldUpdate)
//    return [Math.random() * 255, Math.random() * 255, Math.random() * 255]
//   },
//   getLineColor: () => [Math.random() * 255, Math.random() * 255, Math.random() * 255],
//   getLineWidth: 4,
//   transitions: {
//     getFillColor: 100,
//   },
//   updateTriggers: {
//     // if showLibraries changes, recompute getFillColor for each point
//     getFillColor: [shouldUpdate]
//   },
//   lineWidthMinPixels: 1,
  
//   /* props from MVTLayer class */
  
//   // binary: false,
//   // highlightedFeatureId: null,
//   // loaders: ,
//   // uniqueIdProperty: '',
  
//   /* props inherited from TileLayer class */
  
//   // extent: null,
//   // getTileData: null,
//   // maxCacheByteSize: null,
//   // maxCacheSize: null,
//   // maxRequests: 6,
//   maxZoom: 13,
//   minZoom: 7,
//   // onTileError: null,
//   // onTileLoad: null,
//   // onTileUnload: null,
//   // onViewportLoad: null,
//   // refinementStrategy: 'best-available',
//   // renderSubLayers: null,
//   // tileSize: 512,
//   // zRange: null,
  
//   /* props inherited from Layer class */
  
//   // autoHighlight: false,
//   // coordinateOrigin: [0, 0, 0],
//   // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
//   // highlightColor: [0, 0, 128, 128],
//   // modelMatrix: null,
//   // opacity: 1,
//   // pickable: false,
//   // visible: true,
//   // wrapLongitude: false,
// });