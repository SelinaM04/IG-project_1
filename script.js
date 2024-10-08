var map = L.map('map').setView([40.7128, -74.0060], 13); // Centered on NYC

var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});
var satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri, Sources: Esri, DeLorme, NAVTEQ, USGS, and others'
});

streetMap.addTo(map);

let restaurantLayer; // Layer for filtered restaurants
let allRestaurantsLayer; // Layer for all restaurants

var baseMaps = {
    "Street Map": streetMap,
    "Satellite Map": satelliteMap
};

var overlayMaps = {}; 

var controlLayers = L.control.layers(baseMaps, overlayMaps).addTo(map);

function displayAllRestaurants(data) {
    if (allRestaurantsLayer) {
        map.removeLayer(allRestaurantsLayer);  
    }

    var customIcon = L.icon({
        iconUrl: 'img/1.png',  
        iconSize: [25, 41],  
        iconAnchor: [12, 41]  
    });

    allRestaurantsLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: customIcon });
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', function() {
                document.getElementById('restaurantInfo').innerHTML = `
                    <b>Name:</b> ${feature.properties.restaurant_name}<br>
                    <b>Address:</b> ${feature.properties.address}<br>
                    <b>Cuisine:</b> ${feature.properties.cuisine_type}<br>
                    <b>Zip Code:</b> ${feature.properties.zipcode}<br>
                    <b>Grade:</b> ${feature.properties.grade}<br>
                    <b>Violation:</b> ${feature.properties.violation_description}
                `;
            });
        }
    }).addTo(map);

    controlLayers.addOverlay(allRestaurantsLayer, 'Show All Restaurants');

    // Define filter function inside displayAllRestaurants
    function filterRestaurants(zipcode, cuisine) {
        if (!allRestaurants) return;

        const filteredData = allRestaurants.features.filter(feature => {
            const restaurantZipcode = feature.properties.zipcode ? feature.properties.zipcode.trim() : '';
            const restaurantCuisine = feature.properties.cuisine_type ? feature.properties.cuisine_type.trim().toLowerCase() : '';

            const matchesZipcode = zipcode === '' || restaurantZipcode.includes(zipcode);
            const matchesCuisine = cuisine === '' || restaurantCuisine.includes(cuisine);

            return matchesZipcode && matchesCuisine;
        });

        if (filteredData.length === 0) {
            document.getElementById('errorMessage').textContent = "No restaurants found for the given search criteria.";
        } else {
            document.getElementById('errorMessage').textContent = "";  
            displayRestaurants({ type: 'FeatureCollection', features: filteredData });
        }
    }

}

function displayRestaurants(data) {
    if (restaurantLayer) {
        map.removeLayer(restaurantLayer);  
    }

    restaurantLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: customIcon });
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', function() {
                document.getElementById('restaurantInfo').innerHTML = `
                    <b>Name:</b> ${feature.properties.restaurant_name}<br>
                    <b>Address:</b> ${feature.properties.address}<br>
                    <b>Cuisine:</b> ${feature.properties.cuisine_type}<br>
                    <b>Zip Code:</b> ${feature.properties.zipcode}<br>
                    <b>Grade:</b> ${feature.properties.grade}
                    <b>Violation:</b> ${feature.properties.violation_description}
                `;
            });
        }
    }).addTo(map);

    controlLayers.addOverlay(restaurantLayer, 'Filtered Restaurants');
}

fetch('data/DOHMH New York City Restaurant Inspection Results_20240929 (1).geojson')  
    .then(response => response.json())
    .then(data => {
        allRestaurants = data;  
        displayAllRestaurants(allRestaurants);  
    })
    .catch(error => console.error('Error loading the GeoJSON file:', error));


document.getElementById('searchBtn').addEventListener('click', function() {
    const zipcode = document.getElementById('zipcodeSearch').value.trim();
    const cuisine = document.getElementById('cuisineSearch').value.trim().toLowerCase();

    filterRestaurants(zipcode, cuisine);
});
