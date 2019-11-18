// Selectable backgrounds of the map - tile layers:
// Grayscale background
var graymap= L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  // var graymap= L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg?access_token={accessToken}", {
  //attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  //maxZoom: 18,
  //id: "mapbox.light", 
  accessToken: API_KEY  
  });

// Satellite background
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
    accessToken: API_KEY
  });

// Outdoors background
var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    accessToken: API_KEY
  });

// Map object to the above array of layers
var map = L.map("map", {
  center: [37.09, -95.71],
  zoom: 5,
  layers: [graymap, satellitemap, outdoorsmap]
});

// Layers for earthquakes and tectonicplates datasets
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Base layers
var baseMaps = {
  "Satellite": satellitemap,
  "Grayscale": graymap,
  "Outdoors": outdoorsmap
};

// Overlays 
var overlayMaps = {
  "Tectonic Plates": tectonicplates,
  "Earthquakes": earthquakes
};

// Control which layers are visible
 L.control
  .layers(baseMaps, overlayMaps)
  .addTo(map);

// Retrieve earthquake geoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", function(data) {

// Create initial function to reflect the earthquakes' magnitude in their size and color 
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  };

  // Define the color of the marker based on the magnitude of the earthquake
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "#ea2c2c";
      case magnitude > 4:
        return "#ea822c";
      case magnitude > 3:
        return "#ee9c00";
      case magnitude > 2:
        return "#eecc00";
      case magnitude > 1:
        return "#d4ee00";
      default:
        return "#98ee00";
    };
  };

  // Define the radius of the marker based on the magnitude of the earthquake
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    };
    return magnitude * 3;
  };

  // Add tooltip to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup(feature.properties.type + "<br>Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(earthquakes);

  earthquakes.addTo(map);

  // Create legend
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00", 
      "#d4ee00", 
      "#eecc00", 
      "#ee9c00", 
      "#ea822c", 
      "#ea2c2c"
    ];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Add legend to the map
  legend.addTo(map);

  // Retrive Tectonic Plate geoJSON data
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
 
      L.geoJson(platedata, {
        color: "green",
        weight: 2
      }).addTo(tectonicplates);

      // Add the tectonicplates layer to the map
      tectonicplates.addTo(map);
    });
});