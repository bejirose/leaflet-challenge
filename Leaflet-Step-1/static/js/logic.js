// Store our API endpoint inside queryUrl
// var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//   "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function

  console.log(data);

  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  function circleColor(mag)
  {
        var color = "";
        if (mag > 4) {
          color = "red";
        }
        else if (mag > 3) {
          color = "orange";
        }
        else if (mag > 2) {
          color = "yellow";
        }
        else {
          color = "#98ee00";
        }
        return color;
  }

  function circleStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: circleColor(feature.properties.mag),
      color: "#000000",
      radius: feature.properties.mag * 4,
      stroke: true,
      weight: 0.5
    };
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
      },
      style: circleStyle,
      // Define a function we want to run once for each feature in the features array
      // Give each feature a popup describing the place and time of the earthquake
      onEachFeature: function(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p><b>Time: </b>" + new Date(feature.properties.time) + "</p>" + 
            "<p><b> Magnitude: </b>" + feature.properties.mag +"</p>");
      }
  
    });

    
  createMap(earthquakes);
  
}

function createMap(earthquakes) {



  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes

  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    //layers: [streetmap, earthquakes]
    layers: [streetmap]
  });

  earthquakes.addTo(myMap);

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // add legends
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var magnitude = [1, 2, 3, 4];
    var colors = [
      "#98ee00",
       "yellow",
       "orange",
       "red"
    ];

    labels = [];

    var legendInfo = "<h2>Magnitude Info</h2>" +
      "<div class=\"labels\">" +
        "<div class=\"max\">max=" + (magnitude[3]) + "+</div>" +
        "<div class=\"min\">min=" + magnitude[0] + "</div>" +
       "</div>";

    div.innerHTML = legendInfo;

    magnitude.forEach(function(mag, index) {
      labels.push("<li style=\"background-color: " + colors[index] + "\">" + "&nbsp;" + mag + "</li>" );
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  
    };

    // Adding legend to the map
    legend.addTo(myMap);
} 
