const margin = {top: 40, right: 50, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;




// makes a line graph based on a specific [key, value] pair
// text is the text for the y axis
const lineGraph = (elem) => title => (depKey,indKeys) => text => {
  const y = d3.scale.linear()
    .range([height, 0]);

  const yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  const color = d3.scale.category10();

  const svg = elem.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x = ((depKey.toLowerCase() === "year") ? 
    d3.time.scale() : d3.scale.linear())
    .range([0, width])

  const xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

 
  return (error, data) => {
    if (error) throw error;

    console.log("data", data)
    d3.svg.line()
    .x(function(d) { return x(d[depKey]); })
    .y(function(d) { return y(d.temp); });

    const line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temp); });

    color.domain(d3.keys(data[0]).filter(key => indKeys.includes(key)))


    const areas = color.domain().map(name => {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d[depKey], temp: +d[name]};
        })
      };
    });

    console.log("areas",areas)

    x.domain(d3.extent(data, function(d) { return d[depKey]; }));

    y.domain([
      d3.min(areas, function(c) { return d3.min(c.values, function(v) { return v.temp; }); }),
      d3.max(areas, function(c) { return d3.max(c.values, function(v) { return v.temp; }); })
    ]);

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

  var area = svg.selectAll(".area")
      .data(areas)
    .enter().append("g")
      .attr("class", "area");

  
  area.append("path")
      .attr("class", d => "line " + d.name)
      .attr("d", function(d) { console.log(d); return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });
  

  area.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temp) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });
    
  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")  
        .attr("class", "chart-title")
        .text(title);


  }


}

const elems = (d) => {
  Object.keys(d).forEach(k => { if (k !== "Year") { d[k] = +d[k] } })
  d["Year"] = d3.time.format("%Y").parse("" + d["Year"])
  d.zero = 0
  return d
}


const maxMinBarGraph = (elem) => title => (labels, valuesFn) => text => {

  const chart = elem
    .attr("width", width)
    .attr("height", height);

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);


  const color = d3.scale.category10();

  const svg = elem.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 
  return (error, data) => {
    if (error) throw error;

    const barWidth = width / data.length

    let {max, min} = valuesFn(labels, data)
    min = min.map(x => x || 0).map(x => -x)
    max = max.map(x => x || 0)
    x.domain(labels);
    const r = data.length
    console.log(r)
    y.domain([-135, 135]);

    const combo = d3.zip(labels, max, min, labels.map(_ => 0))
    console.log(combo)

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
      .text("Frequency");

    svg.selectAll("line.horizontalGrid").data(y.ticks(135/5)).enter()
    .append("line")
        .attr(
        {
            "class":"horizontalGrid",
            "x1" : 0,
            "x2" : width,
            "y1" : function(d){ return y(d);},
            "y2" : function(d){ return y(d);},
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "black",
            "stroke-width" : "1px"
        });




    svg.selectAll(".max-bar")
      .data(combo)
    .enter().append("rect")
      .attr("class", "bar max-bar")
      .attr("x", d => x(d[0]))
      .attr("width", x.rangeBand())
      .attr("y", d => y(Math.max(0, d[1])))
      .attr("height", d => Math.abs(y(d[1]) - y(0)))
    
    svg.selectAll(".min-bar")
      .data(combo)
    .enter().append("rect")
      .attr("class", "bar min-bar")
      .attr("x", d => x(d[0]))
      .attr("width", x.rangeBand())
      .attr("y", d => y(Math.max(0, d[2])))
      .attr("height", d => Math.abs(y(d[2]) - y(0)))

    const x2 = d3.scale.linear().range([0, width])
    x2.domain(labels.map((_, i) => i))

    svg.selectAll(".zero")
      .data(combo)
    .enter().append("path")
      .attr("class", "line zero hello")
      .attr("d", 
        d3.svg.line().interpolate("basis")
        .x((d,i) => x2(i))
        .y(d => y(0))); 

      svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(title);


  }

}



const middleRegions = ["24N-90N","24S-24N","90S-24S"]
const regionNames = ["64N-90N","44N-64N","24N-44N","EQU-24N","24S-EQU","44S-24S","64S-44S","90S-64S"]


// vis 1: Plot global, nhem, shem vs year as continuous
d3.csv("data/ExcelFormattedGISTEMPData2CSV.csv", elems, 
  lineGraph(d3.select(".big-area"))
  ("Global and Hemispherical Mean Temps")
  ("Year", ["Glob", "NHem", "SHem", "zero"])
  ("Temp"))
d3.csv("data/ExcelFormattedGISTEMPData2CSV.csv", elems, 
  lineGraph(d3.select(".big-area"))
  ("Regional Mean Temps")
  ("Year", regionNames + ["zero"])
  ("Temp"))
d3.csv("data/ExcelFormattedGISTEMPData2CSV.csv", elems, 
  lineGraph(d3.select(".big-area"))
  ("Thirds of the world Mean Temps")
  ("Year", middleRegions + ["zero"])
  ("Temp"))

// vis 2a: Plot maxTemp in a region
// vis 2b: Plot maxTemp in a region

const getRegionsOnly = labels => elem => Object.keys(elem).filter(k => labels.includes(k)).map(k => [k,elem[k]])

const edgeRegion = labels => (elem, fn) => {
    return getRegionsOnly(labels)(elem).reduce((prev, pair) => fn(prev[1],pair[1]) ? prev : pair)
}

const getMaxAndMinRegions = (labels, data) => {
  return { 
    max: maxRegionWithTemps = data.map(e => edgeRegion(labels)(e, (x,y) => x >= y)).map(x => { return { region : x[0], temp: x[1] } }),
    min: minRegionWithTemps = data.map(e => edgeRegion(labels)(e, (x,y) => x <= y)).map(x => { return { region : x[0], temp: x[1] } })
  }
}

const getMaxMinsTemps = labels => d => { return { 
  min : d3.min(labels.map(x => +d[x])), 
  max : d3.max(labels.map(x => +d[x])), 
  year: d3.time.format("%Y").parse(d.Year),
  zero: 0
  } 
}

d3.csv("data/ExcelFormattedGISTEMPData2CSV.csv", getMaxMinsTemps(regionNames), 
  lineGraph(d3.select(".big-area"))("Max and Min Mean Temps over Time")("year", ["zero", "max", "min"])("Temp"))



// vis 3a: Plot number of years each region was max
// vis 3b: Plot number of years each region was min

const countOf = (labels, data) => {
  const {max, min} = getMaxAndMinRegions(labels, data)
  return {
    max: labels.map(name => 
      max
      .reduce((prev, x) => {
        prev[x.region] = (prev[x.region] || 0) + 1
        return prev
      }, {})[name])
      ,
    min: labels.map(name => 
      min
      .reduce((prev, x) => {
        prev[x.region] = (prev[x.region] || 0) + 1
        return prev
      }, {})[name])
  }
}

d3.csv("data/ExcelFormattedGISTEMPData2CSV.csv", elems, maxMinBarGraph(d3.select(".region-max"))("# Times region was Max/Min Mean Temp")
      (regionNames, countOf)("#Times Max"))

d3.csv("data/ExcelFormattedGISTEMPData2CSV.csv", elems, maxMinBarGraph(d3.select(".region-2"))("# Times region was Max/Min Mean Temp")
      (middleRegions, countOf)("#Times Max"))




// vis 4a: Plot poles and equators