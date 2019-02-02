var d3 = require('d3')
// var margin = {
//   top: 30,
//   right: 90,
//   bottom: 10,
//   left: 50
// }
//
var height = 600 //- margin.top - margin.bottom
var width = 800 //- margin.left - margin.right

var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2])

var path = d3.geoPath()
  .projection(projection)

var projection = d3.geoConicConformal()
  .center([2.454071, 46.279229])
  .scale(2800)

var path = d3.geoPath()
  .projection(projection)


var color = d3.scaleLinear()
  .range(["white", "red"])

var parseDate = d3.timeParse("%d/%m/%y");
var monthFormat = d3.timeFormat("%m")

var json_data

d3.csv("./data/flue_france_2014.csv").then(function(data) {
  var min = 0,
    max = 0

  var nested_data = d3.nest()
    .key(function(d) {
      return d.region;
    })
    .rollup(function(x) {
      var sums = d3.range(1, 13).map(function(month) {
        var sum_flue = d3.sum(d3.keys(x[0]).map(function(date) {
          value = 0
          if (parseDate(date) != null && month == monthFormat(parseDate(date))) {
            value = +x[0][date]
          } else {
            value = 0
          }
          return value
        }))
        if (sum_flue > max) {
          max = sum_flue
        }
        if (sum_flue < min) {
          min = sum_flue
        }
        return sum_flue
      })
      return sums
    })
    .entries(data)

  color.domain([min, max])
  d3.json("./data/france_regions.json").then(function(json) {
    d3.select("#map").append("div")
      .style("float", "left")
      .style("width", "100%")
      .style("height", height + "px")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "fuckit")

    d3.select("#fuckit").selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path);

    for (var i = 0; i < json.features.length; i++) {
      for (var j = 0; j < nested_data.length; j++) {
        if (json.features[i].properties.nom === nested_data[j].key) {
          json.features[i].properties.value = nested_data[j].value
        } else {}
      }
    }

    d3.select("#fuckit").selectAll("path")
      .data(json.features)
      .style("fill", function(d) {
        if ("value" in d.properties === true) {
          var c = color(d.properties.value[0]);
        } else {
          var c = "blue"
        }
        return c
      });
    json_data = json
  });
})

var update_map = function(m) {
  d3.select("#fuckit").selectAll("path")
    .data(json_data.features)
    .style("fill", function(d) {
      if ("value" in d.properties === true) {
        var c = color(d.properties.value[m]);
      } else {
        var c = "blue"
      }
      return c
    });
}

d3.select("#slider_range")
  .on("input", function(d) {
    update_map(this.value)

  })