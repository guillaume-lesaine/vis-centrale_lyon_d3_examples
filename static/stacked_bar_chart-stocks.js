var d3 = require('d3')

var margin = {
  top: 30,
  right: 90,
  bottom: 10,
  left: 50
}

var height = 400 - margin.top - margin.bottom
var width = 600 - margin.left - margin.right

var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)

d3.csv('./data/stocks.csv').then(function(raw) {
  raw.forEach(function(d, i) {
    var parseDate_raw = d3.timeParse("%b %Y");
    var parseDate_year = d3.timeParse("%Y");
    d.price = +d.price;
    d.date = parseDate_raw(d.date);
    var formatDate = d3.timeFormat("%Y")
    d.date = +formatDate(d.date)
  })

  var nested_data_stacked = d3.nest()
    .key(function(d) {
      return d.date;
    })
    .key(function(d) {
      return d.symbol;
    })
    .rollup(function(x) {
      return d3.mean(x, function(z) {
        return z.price
      })
    })
    .entries(raw)

  var xScale = d3.scaleBand()
    .domain(d3.range(d3.min(raw, d => d.date), d3.max(raw, d => d.date) + 1))
    .paddingInner(0.05)
    .range([margin.left, width + margin.left])

  var color = d3.scaleOrdinal(d3.schemeCategory10)

  var yScale_stacked = d3.scaleLinear()
    .domain([0, d3.max(nested_data_stacked, function(d) {
      var s = d3.sum(d.values, function(e) {
        return e.value
      })
      return s
    })])
    .range([height, margin.top])

  var xAxis = d3.axisBottom()
    .scale(xScale)

  var yAxis = d3.axisLeft()
    .scale(yScale_stacked)

  var layers = d3.stack().keys(d3.range(4))(nested_data_stacked.map(function(d) {
    var x = d.values.map(function(e) {
      return e.value
    })
    return x
  }));

  layers["dates"] = nested_data_stacked.map(function(d) {
    return +d.key
  })

  svg.append("g").selectAll("g")
    .data(layers)
    .enter().append("g")
    .style("fill", function(d, i) {
      return color(i);
    })
    .selectAll("rect")
    .data(function(d) {
      return d;
    })
    .enter().append("rect")
    .attr("x", function(d, i) {
      return xScale(layers["dates"][i]);
    })
    .attr("y", function(d) {
      return yScale_stacked(d[1]);
    })
    .attr("height", function(d) {
      return yScale_stacked(d[0]) - yScale_stacked(d[1]);
    })
    .attr("width", xScale.bandwidth());

  svg.append("g")
    .selectAll("text")
    .data(nested_data_stacked[0].values)
    .enter()
    .append("text")
    .text(d => d.key)
    .attr("x", width + margin.left + 30)
    .attr("y", (d, i) => 40 * i + 40)

  svg.append("g")
    .selectAll("rect")
    .data(nested_data_stacked[0].values)
    .enter()
    .append("rect")
    .attr("x", width + margin.left + 10)
    .attr("y", (d, i) => 40 * i + 30)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", (d, i) => color(i))

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (0) + ", " + (height) + ")")
    .call(xAxis)

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (margin.left) + ", 0)")
    .call(yAxis)
});