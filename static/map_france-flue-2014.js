var d3 = require('d3')

// var margin = {
//   top: 30,
//   right: 90,
//   bottom: 10,
//   left: 50
// }
//
var height = 600 //- margin.top - margin.bottom
var width = 1000 //- margin.left - margin.right

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

var tooltip = d3.select('body').append('div')
  .attr('class', 'hidden tooltip');

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

  color.domain([0, max])

  d3.json("./data/france_regions.json").then(function(json) {
    d3.select("#map").append("div")
      // .style("float", "left")
      .style("width", "100%")
      .style("height", "100%")
      .style("text-align", "center")
      // .style("align-items", "center")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "svg_map")
    // .attr("display", "block")
    // .attr("margin", "auto")

    d3.select("#svg_map").selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "grey")
      .attr("stroke-width", "0.5")
      .on('mousemove', function(d) {
        console.log(d)
        var mouse = d3.mouse(d3.select("#svg_map").node()).map(function(d) {
          return parseInt(d);
        });
        if ("value" in d.properties === true) {
          tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 25) +
              'px; top:' + (mouse[1] + 120) + 'px')
            .html(d.properties.nom + "<br>I = " + d.properties.value[0]);
        } else {
          tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 95) +
              'px; top:' + (mouse[1] + 130) + 'px')
            .html("NA");
        }
      })
      .on('mouseout', function() {
        tooltip.classed('hidden', true);
      });

    for (var i = 0; i < json.features.length; i++) {
      for (var j = 0; j < nested_data.length; j++) {
        if (json.features[i].properties.nom === nested_data[j].key) {
          json.features[i].properties.value = nested_data[j].value
        } else {}
      }
    }

    d3.select("#svg_map").selectAll("path")
      .data(json.features)
      .style("fill", function(d) {
        if ("value" in d.properties === true) {
          var c = color(d.properties.value[0]);
        } else {
          var c = "grey"
        }
        return c
      });
    json_data = json
  });
})

var update_map = function(m) {
  d3.select("#svg_map").selectAll("path")
    .data(json_data.features)
    .style("fill", function(d) {
      if ("value" in d.properties === true) {
        var c = color(d.properties.value[m]);
      } else {
        var c = "grey"
      }
      return c
    })
    .on('mousemove', function(d) {
      console.log(d)
      var mouse = d3.mouse(d3.select("#svg_map").node()).map(function(d) {
        return parseInt(d);
      });
      if ("value" in d.properties === true) {
        tooltip.classed('hidden', false)
          .attr('style', 'left:' + (mouse[0] + 15) +
            'px; top:' + (mouse[1] + 120) + 'px')
          .html(d.properties.nom + "<br>I = " + d.properties.value[m]);
      } else {
        tooltip.classed('hidden', false)
          .attr('style', 'left:' + (mouse[0] + 95) +
            'px; top:' + (mouse[1] + 130) + 'px')
          .html("NA");
      }
    })
    .on('mouseout', function() {
      tooltip.classed('hidden', true);
    });

}

d3.select("#slider_range")
  .on("input", function(d) {
    update_map(this.value)
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    document.getElementById("month_name").innerHTML = months[this.value];

  })