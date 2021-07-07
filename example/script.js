/*
* https://deck.gl/docs/api-reference/geo-layers/mvt-layer
*/
const {DeckGL, MVTLayer} = deck;

let shouldUpdate = 1
let viz

const gemeindenURL = `${window.location.origin}/tiles/gemeinden-z7-ids/{z}/{x}/{y}.pbf`

const gemeindenData = [ gemeindenURL]

const kreiseURL = `${window.location.origin}/tiles/kreise-z8-Z6-filtered-ai/{z}/{x}/{y}.pbf`

const kreiseData = [ kreiseURL]

const laenderURL = `${window.location.origin}/tiles/laender-z6-ids/{z}/{x}/{y}.pbf`

const laenderData = [ laenderURL]

const fakeData = {
  laender: new Array(34).fill(0).map((_, i) => Math.random()),
  gemeinden: new Array(11431).fill(0).map((_, i) => Math.random()),
  kreise: new Array(432).fill(0).map((_, i) => Math.random())
}

function render () {
const gemeinden = new MVTLayer({
  id: 'gemeindengeo',
  data: gemeindenData,
  pickable: true,
  getFillColor: (obj) => {
    const j = fakeData.gemeinden[obj.id]
   return [j * 255, j * 255, j * 255]
   //return [Math.random() * 255, Math.random() * 255, Math.random() * 255]
  },
  // getLineColor:  [Math.random() * 255, Math.random() * 255, Math.random() * 255],
  getLineWidth: 4,
  transitions: {
    getFillColor: 100,
  },
  updateTriggers: {
    // if showLibraries changes, recompute getFillColor for each point
    getFillColor: [shouldUpdate]
  },
  lineWidthMinPixels: 1,
  maxZoom: 13,
  minZoom: 8,
});

const kreise = new MVTLayer({
  id: 'kreisegeo',
  data: kreiseData,
  pickable: true,
  getFillColor: (obj) => {
   //return [Math.random() * 255, Math.random() * 255, Math.random() * 255]
   const j = fakeData.kreise[obj.id]
   return [j * 255, j * 255, j * 255]
  },
  // getLineColor: [Math.random() * 255, Math.random() * 255, Math.random() * 255],
  getLineWidth: 4,
  transitions: {
    getFillColor: 100,
  },
  updateTriggers: {
    // if showLibraries changes, recompute getFillColor for each point
    getFillColor: [shouldUpdate]
  },
  lineWidthMinPixels: 1,
  maxZoom: 8,
  minZoom: 7
});

const laender = new MVTLayer({
  id: 'laendergeo',
  data: laenderData,
  pickable: true,
  getFillColor: (obj) => {
   //console.log('fill', obj.id)
   const j = fakeData.laender[obj.id]
   return [j * 255, j * 255, j * 255]
  },
  // getLineColor: [Math.random() * 255, Math.random() * 255, Math.random() * 255],
  getLineWidth: 4,
  transitions: {
    getFillColor: 100,
  },
  updateTriggers: {
    // if showLibraries changes, recompute getFillColor for each point
    getFillColor: [shouldUpdate]
  },
  lineWidthMinPixels: 1,
  maxZoom: 6,
  minZoom: 0,
});


  viz.setProps({layers: [laender, kreise, gemeinden]})
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
     // console.log(object)

      return object.properties.GEN
    }
    return null
  }
  //layers: [layer]
});
  
setInterval(() => {
//  console.log(shouldUpdate)
fakeData.laender = fakeData.laender.map((_, i) => Math.random())
fakeData.kreise = fakeData.kreise.map((_, i) => Math.random())
fakeData.gemeinden = fakeData.gemeinden.map((_, i) => Math.random())
//gemeinden: new Array(11431).fill(0).map((_, i) => Math.random()),
//kreise: new Array(432).fill(0).map((_, i) => Math.random())
  render()
  shouldUpdate ++}, 2000)



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