// const fs = require('fs');

// const d3 = require('d3');

// const data = require('./data/ExcelFormattedGISTEMPData2JS.js').data

// const years = data.map(x => x.Year)

// const glob = data.map(x => x.Glob)

// const nhem = data.map(x => x.NHem)
// const shem = data.map(x => x.SHem)

// const npole = data.map(x => x["24N-90N"])
// const spole = data.map(x => x["90S-64S"])

// const nequ = data.map(x => x["EQU-24N"])
// const sequ = data.map(x => x["24S-EQU"])

// const getRegionsOnly = elem => Object.keys(elem).filter(k => !(["Year", "Glob", "NHem", "SHem"].includes(k))).map(k => [k,elem[k]])

// const edgeRegion = function(elem, fn) {
//     return getRegionsOnly(elem).reduce((prev, pair) => fn(prev[1],pair[1]) ? prev : pair)
// }


// const maxRegionWithTemps = data.map(e => edgeRegion(e, (x,y) => x >= y))
// const minRegionWithTemps = data.map(e => edgeRegion(e, (x,y) => x <= y))

// const maxRegions = maxRegionWithTemps.map(e => e[0])
// const minRegions = minRegionWithTemps.map(e => e[0])

// const maxTemps = maxRegionWithTemps.map(e => e[1])
// const minTemps = minRegionWithTemps.map(e => e[1])


// module.exports = {years, glob, nhem, shem, npole, spole, nequ, sequ, maxRegionWithTemps, minRegionWithTemps, maxRegions, minRegions, maxTemps, minTemps}