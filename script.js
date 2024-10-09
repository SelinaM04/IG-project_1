var map = L.map('map').setView([40.7128, -74.0060], 13); 

var streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});
var satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri, Sources: Esri, DeLorme, NAVTEQ, USGS, and others'
});
streetMap.addTo(map);

let restaurantLayer, allRestaurantsLayer;
var baseMaps = { "Street Map": streetMap, "Satellite Map": satelliteMap };
var controlLayers = L.control.layers(baseMaps).addTo(map);

function createRestaurantIcon() {
    return L.icon({
        iconUrl: 'img/1.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
}

function onRestaurantClick(feature, layer) {
    layer.on('click', function() {
        document.getElementById('restaurantInfo').innerHTML = `
            <h3>Restaurant Information</h3>
            <b>Name:</b> ${feature.properties.dba}<br>
            <b>Address:</b> ${feature.properties.building} ${feature.properties.street}<br>
            <b>Cuisine:</b> ${feature.properties.cuisine_description}<br>
            <b>Zip Code:</b> ${feature.properties.zipcode}<br>
            <b>Grade:</b> ${feature.properties.grade}<br>
            <b>Violation:</b> ${feature.properties.violation_description || "None"}
        `;
    });
}

function displayAllRestaurants(data) {
    console.log("displayAllRestaurants function called");

    if (allRestaurantsLayer) {
        map.removeLayer(allRestaurantsLayer);
    }

    if (!data || !data.features) {
        console.error("No valid data passed to displayAllRestaurants");
        return;
    }

    const markers = L.markerClusterGroup(); 

    const limitedData = data.features.slice(0, 500); 

    console.log("Displaying first 500 restaurants out of", data.features.length);

    limitedData.forEach(feature => {
        const latlng = [parseFloat(feature.properties.latitude), parseFloat(feature.properties.longitude)];
        if (!isNaN(latlng[0]) && !isNaN(latlng[1])) {
            const marker = L.marker(latlng, { icon: createRestaurantIcon() });
            marker.on('click', function() {
                document.getElementById('restaurantInfo').innerHTML = `
                    <h3>Restaurant Information</h3>
                    <b>Name:</b> ${feature.properties.dba}<br>
                    <b>Address:</b> ${feature.properties.building} ${feature.properties.street}<br>
                    <b>Cuisine:</b> ${feature.properties.cuisine_description}<br>
                    <b>Zip Code:</b> ${feature.properties.zipcode}<br>
                    <b>Grade:</b> ${feature.properties.grade}<br>
                    <b>Violation:</b> ${feature.properties.violation_description || "None"}
                `;
            });
            markers.addLayer(marker); 
        }
    });

    map.addLayer(markers); 
    controlLayers.addOverlay(markers, 'Show All Restaurants');
}

function displayRestaurants(data) {
    if (restaurantLayer) {
        map.removeLayer(restaurantLayer);
    }

    data.features.forEach(feature => {
        feature.geometry = {
            type: 'Point',
            coordinates: [
                parseFloat(feature.properties.longitude),
                parseFloat(feature.properties.latitude)
            ]
        };
    });

    restaurantLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => L.marker(latlng, { icon: createRestaurantIcon() }),
        onEachFeature: onRestaurantClick
    }).addTo(map);
}

function filterRestaurants() {
    const zipcode = document.getElementById('zipcodeSearch').value.trim();
    const cuisine = document.getElementById('cuisineSearch').value.trim().toLowerCase();
    const numRestaurants = document.getElementById('numRest').value.trim();
    if (!allRestaurants) return;

    const filteredData = allRestaurants.features
        .filter(feature => {
            const lat = parseFloat(feature.properties.latitude);
            const lon = parseFloat(feature.properties.longitude);
            if (isNaN(lat) || isNaN(lon)) return false;

            const restaurantZipcode = feature.properties.zipcode?.trim() || '';
            const restaurantCuisine = feature.properties.cuisine_description?.trim().toLowerCase() || '';

            const matchesZipcode = !zipcode || restaurantZipcode.includes(zipcode);
            const matchesCuisine = !cuisine || restaurantCuisine.includes(cuisine);

            return matchesZipcode && matchesCuisine;
        })
        .slice(0, numRestaurants); 

    if (filteredData.length === 0) {
        document.getElementById('errorMessage').textContent = "No restaurants found for the given search criteria.";
    } else {
        document.getElementById('errorMessage').textContent = "";
        displayRestaurants({ type: 'FeatureCollection', features: filteredData });
    }
}

fetch('data/data.geojson')
    .then(response => response.json())
    .then(data => {
        console.log("GeoJSON data loaded successfully"); 
        allRestaurants = data;
        displayAllRestaurants(allRestaurants);
    })
    .catch(error => console.error('Error loading the GeoJSON file:', error));
