var d3 = require('d3')

var margin = {
  top: 30,
  right: 30,
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
    var parseDate = d3.timeParse("%b %Y");
    d.price = +d.price;
    d.date = parseDate(d.date);
  })

  data = raw

  var nested_data = d3.nest()
    .key(function(d) {
      return d.symbol;
    })
    .entries(raw)


  var xScale = d3.scaleTime()
    .domain([d3.min(raw, d => d.date), d3.max(raw, d => d.date)])
    .range([margin.left, width])


  var yScale = d3.scaleLinear()
    .domain(d3.extent(raw, function(d) {
      return d.price
    }))
    .range([height, margin.top])

  var xAxis = d3.axisBottom()
    .scale(xScale)

  var yAxis = d3.axisLeft()
    .scale(yScale)

  var color = d3.scaleOrdinal(d3.schemeCategory10)

  var line = d3.line()
    .x(function(d) {
      return xScale(d.date)
    })
    .y(function(d) {
      return yScale(d.price)
    })

  svg.append("g")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .selectAll("path")
    .data(nested_data)
    .enter()
    .append("path")
    .attr("id", d => d.key)
    .attr("class", "line")
    .attr("d", d => line(d.values))
    .attr("stroke", (d, i) => color(i))
    .attr("fill", "none")

  svg.append("g")
    .selectAll("rect")
    .data(nested_data)
    .enter()
    .append("rect")
    .attr('x', 70)
    .attr('y', function(d, i) {
      return 10 + i * 25
    })
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', function(d, i) {
      return color(i)
    })

  svg.append("g")
    .selectAll("text")
    .data(nested_data)
    .enter()
    .append("text")
    .attr('x', 90)
    .attr('y', function(d, i) {
      return 20 + i * 25
    })
    .text(d => d.key)

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (0) + ", " + (height) + ")")
    .call(xAxis)

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (margin.left) + ", 0)")
    .call(yAxis)
});