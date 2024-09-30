// Initialize the map and set the view to Manhattan, NYC
var map = L.map('map').setView([40.7831, -73.9712], 12);  // Centered on Manhattan

// Add OpenStreetMap tiles as the base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let allRestaurants;  // Store all restaurant data
let restaurantLayer;  // Store and manage restaurant markers layer

// Custom icon for the restaurant pins
var customIcon = L.icon({
    iconUrl: 'img/1.png',  // Path to your custom pin image
    iconSize: [25, 41],  // Size of the icon
    iconAnchor: [12, 41],  // Point of the icon corresponding to the marker's location
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null
});

// Function to display restaurants on the map
function displayRestaurants(data) {
    // Clear any existing layer from the map
    if (restaurantLayer) {
        map.removeLayer(restaurantLayer);
    }

    // Add new markers for the filtered data
    restaurantLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { icon: customIcon });
        },
        onEachFeature: function (feature, layer) {
            // Bind a popup to display restaurant information when a pin is clicked
            layer.on('click', function() {
                document.getElementById('restaurantInfo').innerHTML = `
                    <b>Name:</b> ${feature.properties.restaurant_name}<br>
                    <b>Address:</b> ${feature.properties.address}<br>
                    <b>Cuisine:</b> ${feature.properties.cuisine_type}<br>
                    <b>Zip Code:</b> ${feature.properties.zipcode}<br>
                    <b>Grade:</b> ${feature.properties.grade}
                `;
            });
        }
    }).addTo(map);
}

function filterRestaurants(zipcode, cuisine) {
    if (!allRestaurants) return;  // Ensure data is loaded before filtering

    // Normalize and filter restaurants by zip code and/or cuisine type
    const filteredData = allRestaurants.features.filter(feature => {
        // Check if the feature has zipcode and cuisine_type properties, and handle undefined cases
        const restaurantZipcode = feature.properties.zipcode ? feature.properties.zipcode.trim() : '';
        const restaurantCuisine = feature.properties.cuisine_type ? feature.properties.cuisine_type.trim().toLowerCase() : '';

        const matchesZipcode = zipcode === '' || restaurantZipcode === zipcode;
        const matchesCuisine = cuisine === '' || restaurantCuisine.includes(cuisine);

        return matchesZipcode && matchesCuisine;
    });

    console.log("Filtered Data:", filteredData);  // Debug filtered data

    // Display a message if no restaurants match the criteria
    if (filteredData.length === 0) {
        alert("No restaurants found for the given search criteria.");
    } else {
        // Wrap filtered data in GeoJSON format and display it on the map
        displayRestaurants({ type: 'FeatureCollection', features: filteredData });
    }
}


// Load GeoJSON data for restaurant inspections
fetch('data/DOHMH New York City Restaurant Inspection Results_20240929 (1).geojson')  // Ensure this path is correct
    .then(response => response.json())
    .then(data => {
        allRestaurants = data;  // Store the complete dataset
        // Display all restaurants by default when the map loads
        displayRestaurants(allRestaurants);
    })
    .catch(error => console.error('Error loading the GeoJSON file:', error));

// Search functionality for filtering by zip code and cuisine type
// Search functionality for filtering by zip code and cuisine type
document.getElementById('searchBtn').addEventListener('click', function() {
    console.log("allRestaurants:", allRestaurants);  // Check if data is loaded
    const zipcode = document.getElementById('zipcodeSearch').value.trim();  // Get the zip code input
    const cuisine = document.getElementById('cuisineSearch').value.trim().toLowerCase();  // Get the cuisine type input

    // Call the filtering function with the input values
    filterRestaurants(zipcode, cuisine);
});

