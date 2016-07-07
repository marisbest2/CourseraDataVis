const http = require('http')
const port = 3000
const serverUrl = "localhost";

var server = http.createServer((req, res) => {
    console.log("Req: ", req.url)   
})


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



var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// makes a line graph based on a specific [key, value] pair
// text is the text for the y axis
const lineGraph = (data, text) => {
    console.log("hello", data)
    d3.svg.line()
    .x(function(d) { return x(data[0]); })
    .y(function(d) { return y(data[1]); });

    var line = d3.svg.line()
        .x(function(d) { return x(d[0]); })
        .y(function(d) { return y(d[1]); });

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(data, function(d) { return d[0]; }));
    y.domain(d3.extent(data, function(d) { return d[1]; }));

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(text || "Temp");

    svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);
}




// vis 1: Plot global, nhem, shem vs year as continuous
lineGraph(_.zip(years, maxTemps))

// vis 2a: Plot maxTemp in a region
// vis 2b: Plot maxTemp in a region

// vis 3a: Plot number of years each region was max
// vis 3b: Plot number of years each region was min

// vis 4a: Plot poles and equators