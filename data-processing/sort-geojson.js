// generate a csv containing a geoid and the corresponding index
const fs = require('fs')
const date = require('date-and-time');

const GEOREGION = 'gemeinden'

const l = require(`./../german-administrative-areas/${GEOREGION}.geo.json`)

//const l = require(`./../german-administrative-areas/${GEOREGION}.geo.json`)
const csvPath = `data/${GEOREGION}-lookup.csv`
const jsonPath = `data/${GEOREGION}-sorted.json`

// const agsArray = l.map((feature) => {
//     if(feature.properties) {
//         return feature.properties.AGS
//     } else {
//        // return Object.keys(feature)
//        if(feature.type === 'FeatureCollection') {
//         const f = feature.features[0]
//         return f.properties.AGS
//        }
//     }
// }).sort((a, b) => a.localeCompare(b))

const getAGS = (feature) => {
  if(feature.properties) {
    return feature.properties.AGS
} else {
   // return Object.keys(feature)
   if(feature.type === 'FeatureCollection') {
    const f = feature.features[0]
    return f.properties.AGS
   }
}
}

// const addProperty = (feature, label, val) => {
//   if(feature.properties) {
//     feature.properties[label] = 
// } else {
//    // return Object.keys(feature)
//    if(feature.type === 'FeatureCollection') {
//     const f = feature.features[0]
//     return f.properties.AGS
//    }
// }
// }

const sortedGeoJSON = l.sort((a, b) => getAGS(a).localeCompare(getAGS(b)))

sortedGeoJSON.forEach((feature, i) => feature.id = i)

const agsArray = sortedGeoJSON.map((feature) => [feature.id, getAGS(feature)])

let data = JSON.stringify(sortedGeoJSON);

fs.writeFileSync(jsonPath, data);
console.log(agsArray)
//.map((ags, i) => ([i, ags]))

const header = ['index', 'AGS']

    const writeStream = fs.createWriteStream(csvPath)
    writeStream.on('finish', () => {
        console.log(`wrote test to file`);
    });
  writeStream.write(header.join(','))
  writeStream.write('\n')
  agsArray.forEach((row) => {
    writeStream.write(row.join(','))
    writeStream.write('\n')
  })
 
  writeStream.end()

// console.log('laender', agsArray)

//const FILEPATH = 'mobility-by-date/'


// const numRowsGemeinden = 11431
// const numDates = 100

// const dataSources  = [
//     { name: 'laender', numRows: 34 },
//     { name: 'gemeinden', numRows: 11431 },
//     { name: 'kreise', numRows: 432}
// ]

// const filepath = (geolevel, filetype, date) => `${geolevel}/${fileType}/${date}.csv`

// //d.setDate(-numDates)

// const createCSV = (date = "1", numRows = 10, fullPath) => {
  
//     //const csvPath = filepath(geolevel, 'mobility-by-date', date)
//     const csvPath = `${fullPath}/${date}.csv`
//     const writeStream = fs.createWriteStream(csvPath)
//     writeStream.on('finish', () => {
//         console.log(`wrote ${date} to file`);
//     });
//   const header = ['id', 'mobility']
//   writeStream.write(header.join(','))
//   writeStream.write('\n')
//   for(let i = 0; i < numRows; i++) {
//       const row = [i, Math.random()]
//       writeStream.write(row.join(','))
//       writeStream.write('\n')
//   }
//   writeStream.end()
// }

// dataSources.forEach((source) => {
//     const dir = `./${source.name}`
//     const fullPath = `${dir}/mobility-by-date`

//     console.log('creating', fullPath, fs.existsSync(fullPath))
    
//     if (!fs.existsSync(dir)){
//         fs.mkdirSync(dir);
//         //if (!fs.existsSync(fullPath)){
//             console.log('doesnt exist, creating', fullPath)

//             fs.mkdirSync(fullPath, { recursive: true });
//        // }
//     }
//     for(let i = 0; i < numDates; i++) {
//         const d = new Date()
//         d.setDate(-numDates + i)
        
//         const dateStr = date.format(d, 'YYYY-MM-DD')
//         //console.log( )
//         createCSV(dateStr, source.numRows, fullPath)
//     }
// })

// //createCSV(4, numRowsGemeinden)