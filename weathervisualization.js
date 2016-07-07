const {years, glob, nhem, shem, npole, spole, nequ, sequ, maxRegionWithTemps, minRegionWithTemps, maxRegions, minRegions, maxTemps, minTemps} = 
    require('./courseraweatherdata.js')

const _ = require('lodash')

const regionIsMax = maxRegions.reduce((prev, curr) => {
        prev[curr] = (prev[curr] || 0) + 1
        return prev
    }, {})

console.log(regionIsMax)

const regionIsMaxWithTemps = _.zip(years, maxRegions, maxTemps)
console.log(regionIsMaxWithTemps)