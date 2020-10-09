// Store our API endpoint inside variable
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(earthquakeURL, function(data) {
    // Console log the data to make sure pulled in
    console.log(data);
    // send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(features) {

    // Define a function for markerSize based on magnitude of the earthquake
    function markerSize(magnitude) {
        return magnitude * 5
    }

    // Define a function for markerColor based on depth of the earthquake
    function markerColor(depth) {
        switch (true) {
            case depth > 90:
              return "#ff0000";
            case depth > 70:
              return "#ff9933";
            case depth > 50:
              return "#ffdb4d";
            case depth > 30:
              return "#b3ff66";
            case depth > 10:
              return "#4d9900";
            default:
              return "#20B2AA";
            }
    }

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place, magnitude, depth and time of the earthquake
    function onEachFeature(feature, layer) {  
        layer.bindPopup("<h2>" + feature.properties.place +
        "</h2><hr><h4>Magnitude: " + feature.properties.mag + "</h4><hr><h4>Depth: " + feature.geometry.coordinates[2] + "km</h4><hr><p>" + new Date(feature.properties.time) + "</p>")
    };

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array and return a circleMarker with markerSize and markerColor passed in
    var earthquakes = L.geoJSON(features, {
        onEachFeature: onEachFeature,
        style: function(feature) {
            return {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "black",
                fillOpacity: .75,
                stroke: true,
                weight: .5
            }
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng)
        }
    });

    // Send the earthquakes layer to the createMap function
    createMap(earthquakes);
};

// Define a function to create our map with the following layers, controls and legend
function createMap(earthquakes) {

    // Define greyscale, satellite and outdoors layers
    var greyscalemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    var outdoorsmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold the base layers
    var baseMaps = {
        "Satellite": satellitemap,
        "Greyscale": greyscalemap,
        "Outdoors": outdoorsmap     
    };

    // Create an overlayMaps object to hold the overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Create the map, giving it the satellitemap and earthquakes layers to display on load
    var myMap = L.map('mapid', {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [satellitemap, earthquakes]
    });

    // Create a layer control
    // Pass in the baseMaps and overlayMaps layers
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var colors = ["#20B2AA", "#4d9900", "#b3ff66", "#ffdb4d", "#ff9933", "#ff0000"]
        var labels = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
        for (var i = 0; i < colors.length; i++) {
            div.innerHTML += "<li style='background-color: " + colors[i] + "'>" + labels[i] + "</li>"       
    }

    return div;
    
    };

    // Adding legend to the map
    legend.addTo(myMap);
};