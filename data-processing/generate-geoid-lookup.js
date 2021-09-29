// generate a csv containing a geoid and the corresponding index
const fs = require('fs')
const date = require('date-and-time');

const l = require('./../german-administrative-areas/gemeinden.geo.json')



const agsArray = l.map((feature) => {
    if(feature.properties) {
        return feature.properties.AGS
    } else {
       // return Object.keys(feature)
       if(feature.type === 'FeatureCollection') {
        const f = feature.features[0]
        return f.properties.AGS
       }
    }
})

console.log('laender', agsArray)

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