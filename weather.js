const margin = {top: 20, right: 50, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


const y = d3.scale.linear()
    .range([height, 0]);

const yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

const color = d3.scale.category10();


// makes a line graph based on a specific [key, value] pair
// text is the text for the y axis
const lineGraph = (elem) => (depKey,indKeys) => text => {
  const svg = elem.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  console.log(svg)
  const x = ((depKey === "Year") ? 
    d3.time.scale() : d3.scale.linear())
    .range([0, width])

  const xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

 
  return (error, data) => {
    if (error) throw error;

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

    console.log(areas)

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
      .attr("class", "line")
      .attr("d", function(d) { console.log(d); return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });
  

  area.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temp) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });
    }
}

const elems = (d) => {
  Object.keys(d).forEach(k => { if (k !== "Year") { d[k] = +d[k] } })
  d["Year"] = d3.time.format("%Y").parse("" + d["Year"])
  return d
}

// vis 1: Plot global, nhem, shem vs year as continuous
d3.csv("data/ExcelFormattedGISTEMPData2CSV.csv", elems, lineGraph(d3.select(".big-area"))("Year", ["Glob", "NHem", "SHem"])("Temp"))

// vis 2a: Plot maxTemp in a region
// vis 2b: Plot maxTemp in a region

// vis 3a: Plot number of years each region was max
// vis 3b: Plot number of years each region was min

// vis 4a: Plot poles and equators