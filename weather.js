// Michael Rochlin
// Some code adapted from D3 tutorials and other online material

const margin = {
    top: 40,
    right: 50,
    bottom: 30,
    left: 50
  },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


function movein(d) {
  const m = d3.mouse(this)
    // console.log("in: m", m, "d", d)
}

function moveout(d) {
  const m = d3.mouse(this)
    // console.log("out: m", m, "d", d)
}

// makes an svg button attached to elem
// relies on the underlying data having a .name
function svgbutton(elem) {
  var buttonColor = "#428bca";

  var width = 40,
    height = 20, // rect dimensions
    fontSize = 1.38 * height / 3, // font fills rect if fontSize  = 1.38*rectHeight
    x0 = 4,
    y0 = -8,
    x0Text = x0 + width / 2,
    y0Text = y0 + 0.66 * height

  elem.append("rect") // button background
    .attr("width", width + "px")
    .attr("height", height + "px")
    .attr("class", "button button-on buttonBackground")
    .attr("id", d => "but_" + d.name)
    .attr("x", x0)
    .attr("y", y0)
    .attr("ry", height / 10);

  var text = elem.append("text") // button text
    .attr("class", "buttonText")
    .attr("id", d => "buttext_" + d.name)
    .attr("x", x0Text)
    .attr("dy", y0Text)
    .style("text-anchor", "middle")
    .style("stroke", "none")
    .style("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif")
    .style("font-size", fontSize + "px")
    .text(d => d.name);

  elem.append("rect") // transparent overlay to catch mouse events
    .attr("id", "myButton")
    .attr("width", width + "px")
    .attr("height", height + "px")
    .style("opacity", 0)
    .style("pointer-events", "all")
    .attr("x", x0)
    .attr("y", y0)
    .attr("ry", height / 2)
    .on("click", runningButton);

  // toggles classes and css handles the show/hide
  function runningButton(e, d) {
    const textelem = d3.select("#buttext_" + e.name)
    textelem.classed("button-on", !textelem.classed("button-on"));
    textelem.classed("button-off", !textelem.classed("button-off"));

    const backgroud = d3.select("#but_" + e.name)
    backgroud.classed("button-on", !backgroud.classed("button-on"));
    backgroud.classed("button-off", !backgroud.classed("button-off"));

    const curve = d3.select("path.curve_" + e.name)
    curve.classed("hidden", !curve.classed("hidden"));
  };
};



// starting with d3 selection elem
// creates a chart with title 
// plots the indKeys values against depKey
// using text as a label
const lineGraph = (elem) => title => (depKey, indKeys) => text => {
  // set up the svg and axes
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

  const y = d3.scale.linear()
    .range([height, 0]);

  const yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


  // this is the callback
  return (error, data) => {
    if (error) throw error;

    const line = d3.svg.line()
      .interpolate("basis")
      .x(d => x(d.date))
      .y(d => y(d.temp))

    const color = d3.scale.category10();
    color.domain(d3.keys(data[0]).filter(key => indKeys.includes(key)))


    const areas = color.domain().map(name => {
      return {
        name: name,
        values: data.map(d => {
          return {
            date: d[depKey],
            temp: +d[name]
          };
        })
      };
    });

    x.domain(d3.extent(data, d => d[depKey]));

    y.domain([
      d3.min(areas, c => d3.min(c.values, v => v.temp)),
      d3.max(areas, c => d3.max(c.values, v => v.temp))
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

    const area = svg.selectAll(".area")
      .data(areas)
      .enter().append("g")
      .attr("class", d => "area");


    area.append("path")
      .attr("class", d => "curve curve_" + d.name)
      .attr("d", d => line(d.values))
      .style("stroke", d => color(d.name));



    area.append("g")
      .datum(d => {
        return {
          name: d.name,
          value: d.values[d.values.length - 1],
        };
      })
      .attr("transform", d => "translate(" + x(d.value.date) + "," + y(d.value.temp) + ")")
      .attr("x", 3)
      .attr("dy", ".35em")
      .attr("id", d => "line_" + d.name)
      .attr("name", d => d.name)
      .style("fill", "black")
      .attr("class", "legend")
      .call(function(d) {
        svgbutton(this, d.name, d.name)
      })

    // add a zeros line
    svg.selectAll(".zero")
      .data([{
        name: "",
        values: data.map(d => {
          return {
            date: d[depKey],
            temp: 0
          }
        })
      }])
      .enter().append("path")
      .attr("class", "line zero")
      .attr("d", d => line(d.values));

    // add a title
    svg.append("text")
      .attr("x", (width / 2))
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("class", "chart-title")
      .text(title);

    area.on("mouseover", movein)
    area.on('mouseout', moveout)

  }
}

const elems = (d) => {
  Object.keys(d).forEach(k => {
    if (k !== "Year") {
      d[k] = +d[k]
    }
  })
  d["Year"] = d3.time.format("%Y").parse("" + d["Year"])
  return d
}

// tooltip for bargraphs
const tip = (key, name) => d3.tip()
  .attr('class', 'd3-tip')
    .offset(d => d[key] <= 0 ? [10, 0] : [-10, 0])
  .direction(d => d[key] <= 0 ? 's' : 'n')
  .html(d => "<span class='tooltip-name'>" + name + ":</span> <span class='tooltip-val'>" + Math.abs(d[key]) + "</span>")


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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  const maxTip = tip(1, "Times Max")
  const minTip = tip(2, "Times Min")
  svg.call(maxTip)
  svg.call(minTip)

  return (error, data) => {
    if (error) throw error;

    const barWidth = width / data.length

    let {
      max,
      min
    } = valuesFn(labels, data)
    min = min.map(x => x || 0).map(x => -x)
    max = max.map(x => x || 0)
    x.domain(labels);
    const r = data.length
    y.domain([-135, 135]);

    const combo = d3.zip(labels, max, min, labels.map(_ => 0))

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

    svg.selectAll("line.horizontalGrid").data(y.ticks(135 / 5)).enter()
      .append("line")
      .attr({
        "class": "horizontalGrid",
        "x1": 0,
        "x2": width,
        "y1": d => y(d),
        "y2": d => y(d),
        "fill": "none",
        "shape-rendering": "crispEdges",
        "stroke": "black",
        "stroke-width": "1px"
      });



    svg.selectAll(".max-bar")
      .data(combo)
      .enter().append("rect")
      .attr("class", "bar max-bar")
      .attr("x", d => x(d[0]))
      .attr("width", x.rangeBand())
      .attr("y", d => y(Math.max(0, d[1])))
      .attr("height", d => Math.abs(y(d[1]) - y(0)))
      .on('mouseover', maxTip.show)
      .on('mouseout', maxTip.hide)


    svg.selectAll(".min-bar")
      .data(combo)
      .enter().append("rect")
      .attr("class", "bar min-bar")
      .attr("x", d => x(d[0]))
      .attr("width", x.rangeBand())
      .attr("y", d => y(Math.max(0, d[2])))
      .attr("height", d => Math.abs(y(d[2]) - y(0)))
      .on('mouseover', minTip.show)
      .on('mouseout', minTip.hide)


    const x2 = d3.scale.linear().range([0, width])
    x2.domain(labels.map((_, i) => i))

    svg.selectAll(".zero")
      .data(combo)
      .enter().append("path")
      .attr("class", "line zero")
      .attr("d",
        d3.svg.line().interpolate("basis")
        .x((d, i) => x2(i))
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



const middleRegions = ["24N-90N", "24S-24N", "90S-24S"]
const regionNames = ["64N-90N", "44N-64N", "24N-44N", "EQU-24N", "24S-EQU", "44S-24S", "64S-44S", "90S-64S"]



const getRegionsOnly = labels => elem => Object.keys(elem).filter(k => labels.includes(k)).map(k => [k, elem[k]])

const edgeRegion = labels => (elem, fn) => getRegionsOnly(labels)(elem).reduce(
  (prev, pair) => fn(prev[1], pair[1]) ? prev : pair)


const getMaxAndMinRegions = (labels, data) => {
  return {
    max: maxRegionWithTemps = data.map(e => edgeRegion(labels)(e, (x, y) => x >= y)).map(x => {
      return {
        region: x[0],
        temp: x[1]
      }
    }),
    min: minRegionWithTemps = data.map(e => edgeRegion(labels)(e, (x, y) => x <= y)).map(x => {
      return {
        region: x[0],
        temp: x[1]
      }
    })
  }
}


const plotRegions = function() {
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
}


// vis 2a: Plot maxTemp in a region
// vis 2b: Plot minTemp in a region
const plotMaxTemp = function() {

  const getMaxMinsTemps = labels => d => {
    return {
      min: d3.min(labels.map(x => +d[x])),
      max: d3.max(labels.map(x => +d[x])),
      year: d3.time.format("%Y").parse(d.Year),
    }
  }

  d3.csv("data/ExcelFormattedGISTEMPData2CSV.csv", getMaxMinsTemps(regionNames),
    lineGraph(d3.select(".big-area"))("Max and Min Mean Temps over Time")("year", ["max", "min"])("Temp"))
}


// vis 3a: Plot number of years each region was max
// vis 3b: Plot number of years each region was min
const plotCountBarGraph = function() {
  const countOf = (labels, data) => {
    const {
      max,
      min
    } = getMaxAndMinRegions(labels, data)
    return {
      max: labels.map(name =>
        max
        .reduce((prev, x) => {
          prev[x.region] = (prev[x.region] || 0) + 1
          return prev
        }, {})[name]),
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
}


// vis 4a: Plot poles and equators


plotRegions()
plotMaxTemp()
plotCountBarGraph()