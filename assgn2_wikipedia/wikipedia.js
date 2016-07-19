/* this code is kinda ugly right now 
Much of it is based on Mike Bostock's D3 examples
http://bl.ocks.org/mbostock/1046712
*/


const nodelinker = () => {

	var diameter = $(window).height(),
		radius = diameter / 2,
		innerRadius = radius - 200;

	var cluster = d3.layout.cluster()
		.size([360, innerRadius])
		.sort(null)
		.value(function(d) {
			return 500;
		});

	var bundle = d3.layout.bundle();

	var line = d3.svg.line.radial()
		.interpolate("bundle")
		.tension(.85)
		.radius(function(d) {
			return d.y;
		})
		.angle(function(d) {
			return d.x / 180 * Math.PI;
		});

	var svg = d3.select("body").append("svg")
		.attr("width", radius * 2)
		.attr("height", radius * 2)
		// .attr("")
		.append("g")
		.attr("transform", "translate(" + radius + "," + radius + ")");

	var link = svg.append("g").selectAll(".link"),
		node = svg.append("g").selectAll(".node");

	d3.json('./data/wikispeedia_paths-and-graph/output.json', (error, graph) => {
		if (error) throw error

		const subjects = [
			"President"
		]

		const filterfunc = (el, getter) => {
			getter = (getter || ((x) => x))
				// console.log(getter(el))

			for (let i = 0; i < subjects.length; i++) {
				if (getter(el).indexOf(subjects[i]) >= 0) {
					return true
				}
			}
			return false
		}

		const classes = graph.connections.filter(y => filterfunc(y, x => x.name))
			.map(({
				name,
				imports
			}) => {
				return {
					"name": decodeURI(name),
					"imports": imports.filter(y => filterfunc(y, x => x))
				}
			})
			// console.log(classes)

		var nodes = cluster.nodes(packageHierarchy(classes)),
			links = packageImports(nodes);

		link = link
			.data(bundle(links))
			.enter().append("path")
			.each(function(d) {
				d.source = d[0], d.target = d[d.length - 1];
			})
			.attr("class", "link")
			.attr("d", line);

		node = node
			.data(nodes.filter(function(n) {
				return !n.children;
			}))
			.enter().append("text")
			.attr("class", "node")
			.attr("dy", ".31em")
			.attr("transform", function(d) {
				return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
			})
			.style("text-anchor", function(d) {
				return d.x < 180 ? "start" : "end";
			})
			.text(function(d) {
				return d.key;
			})
			.on("mouseover", mouseovered)
			.on("mouseout", mouseouted);
	});

	function mouseovered(d) {
		node
			.each(function(n) {
				n.target = n.source = false;
			});

		link
			.classed("link--target", function(l) {
				if (l.target === d) return l.source.source = true;
			})
			.classed("link--source", function(l) {
				if (l.source === d) return l.target.target = true;
			})
			.filter(function(l) {
				return l.target === d || l.source === d;
			})
			.each(function() {
				this.parentNode.appendChild(this);
			});

		node
			.classed("node--target", function(n) {
				return n.target;
			})
			.classed("node--source", function(n) {
				return n.source;
			});
	}

	function mouseouted(d) {
		link
			.classed("link--target", false)
			.classed("link--source", false);

		node
			.classed("node--target", false)
			.classed("node--source", false);
	}

	d3.select(self.frameElement).style("height", diameter + "px");

	// Lazily construct the package hierarchy from class names.
	function packageHierarchy(classes) {
		var map = {};

		function find(name, data) {
			var node = map[name],
				i;
			if (!node) {
				node = map[name] = data || {
					name: name,
					children: []
				};
				if (name.length) {
					node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
					node.parent.children.push(node);
					node.key = name.substring(i + 1);
				}
			}
			return node;
		}

		classes.forEach(function(d) {
			find(d.name, d);
		});

		return map[""];
	}

	// Return a list of imports for the given array of nodes.
	function packageImports(nodes) {
		var map = {},
			imports = [];

		// Compute a map from name to node.
		nodes.forEach(function(d) {
			map[d.name] = d;
		});

		// For each import, construct a link from the source to target node.
		nodes.forEach(function(d) {
			if (d.imports) d.imports.forEach(function(i) {
				imports.push({
					source: map[d.name],
					target: map[i]
				});
			});
		});

		return imports;
	}
}

const chordstuff = () => {
	var outerRadius = $(window).height() / 2,
		innerRadius = outerRadius - 200;

	var fill = d3.scale.category20c();

	var chord = d3.layout.chord()
		.padding(.04)
		.sortSubgroups(d3.descending)
		.sortChords(d3.descending);

	var arc = d3.svg.arc()
		.innerRadius(innerRadius)
		.outerRadius(innerRadius + 20);

	var svg = d3.select("body").append("svg")
		.attr("width", outerRadius * 2)
		.attr("height", outerRadius * 2)
		// .attr("")
		.append("g")
		.attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

	d3.json("./data/wikispeedia_paths-and-graph/output.json", function(error, graph) {
		if (error) throw error;

		const subjects = [
			"Sports_events"
		]

		const filterfunc = (el, getter) => {
			getter = (getter || ((x) => x))
				// console.log(getter(el))

			for (let i = 0; i < subjects.length; i++) {
				if (getter(el).indexOf(subjects[i]) >= 0) {
					return true
				}
			}
			return false
		}

		const imports = graph.connections.filter(y => filterfunc(y, x => x.name))
			.map(({
				name,
				imports
			}) => {
				return {
					"name": name,
					"imports": imports.filter(y => filterfunc(y, x => x))
				}
			})

		var indexByName = d3.map(),
			nameByIndex = d3.map(),
			matrix = [],
			n = 0;

		// Returns the Flare package name for the given class name.
		function name(name) {
			return decodeURIComponent(name.substring(name.lastIndexOf(".")+1, name.length))
				.split('_').join(" ")
		}

		// Compute a unique index for each package name.
		imports.forEach(function(d) {
			if (!indexByName.has(d = name(d.name))) {
				nameByIndex.set(n, d);
				indexByName.set(d, n++);
			}
		});

		// Construct a square matrix counting package imports.
		imports.forEach(function(d) {
			var source = indexByName.get(name(d.name)),
				row = matrix[source];
			if (!row) {
				row = matrix[source] = [];
				for (var i = -1; ++i < n;) row[i] = 0;
			}
			d.imports.forEach(function(d) {
				row[indexByName.get(name(d))]++;
			});
		});

		chord.matrix(matrix);

		var g = svg.selectAll(".group")
			.data(chord.groups)
			.enter().append("g")
			.attr("class", "group");

		g.append("path")
			.style("fill", function(d) {
				return fill(d.index);
			})
			.style("stroke", function(d) {
				return fill(d.index);
			})
			.attr("d", arc);

		g.append("text")
			.each(function(d) {
				d.angle = (d.startAngle + d.endAngle) / 2;
			})
			.attr("dy", ".35em")
			.attr("transform", function(d) {
				return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" + "translate(" + (innerRadius + 26) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
			})
			.style("text-anchor", function(d) {
				return d.angle > Math.PI ? "end" : null;
			})
			.text(function(d) {
				return nameByIndex.get(d.index);
			});

		svg.selectAll(".chord")
			.data(chord.chords)
			.enter().append("path")
			.attr("class", "chord")
			.style("stroke", function(d) {
				return d3.rgb(fill(d.source.index)).darker();
			})
			.style("fill", function(d) {
				return fill(d.source.index);
			})
			.attr("d", d3.svg.chord().radius(innerRadius));

	});

	d3.select(self.frameElement).style("height", outerRadius * 2 + "px");

}



nodelinker()
chordstuff()
