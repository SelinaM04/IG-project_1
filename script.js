var map = L.map('map').setView([40.7128, -74.0060], 12);

// Add OpenStreetMap tiles as the base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Ensure the map resizes correctly when the window is resized
window.addEventListener('load', function() {
    map.invalidateSize();
});

window.addEventListener('resize', function() {
    map.invalidateSize();
});

fetch('img/DOHMH_New_York_City_Restaurant_Inspection_Results_20240925.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<b>Restaurant Name:</b> ' + feature.properties.restaurant_name + 
                                '<br><b>Address:</b> ' + feature.properties.address);
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error loading the GeoJSON file:', error));
