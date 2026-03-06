
// Initialize map
const map = L.map('map').setView([53.55, 10.0], 14);

// Add WMS layer - Hamburg Historical Map 1980s
L.tileLayer.wms('https://geodienste.hamburg.de/HH_WMS_Historische_Karte_1_5000', {
    layers: 'jahrgang_1980-1990',
    format: 'image/jpeg',
    transparent: true,
    version: '1.1.1',
    srs: 'EPSG:3857',
    attribution: 'Karte: LGV Hamburg, Lizenz dl-de/by-2-0',
    zIndex: 1
}).addTo(map);

// Reusable function to load and render GeoJSON layers
function addGeoJSONLayer(url, options = {}) {
    const {
        sourceId = 'geojson-source',
        outerRadius = 18,
        innerRadius = 12,
        color = '#007bff',
        outerOpacity = 0.7,
        tooltipProperty = 'name',
    } = options;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const layerGroup = L.layerGroup().addTo(map);
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                display: none;
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                white-space: nowrap;
                font-family: sans-serif;
            `;
            document.body.appendChild(tooltip);

            data.features.forEach(feature => {
                const coordinates = feature.geometry.coordinates;
                const properties = feature.properties;
                const latlng = [coordinates[1], coordinates[0]];

                // Create circle marker with outer circle
                const outerCircle = L.circleMarker(latlng, {
                    radius: outerRadius,
                    fillColor: color,
                    color: color,
                    weight: 0,
                    opacity: 0.8,
                    fillOpacity: outerOpacity,
                    zIndex: 10
                });

                // Create inner circle (solid dot)
                const innerCircle = L.circleMarker(latlng, {
                    radius: innerRadius,
                    fillColor: color,
                    color: color,
                    weight: 0,
                    opacity: 0.8,
                    fillOpacity: 0.8,
                    zIndex: 11
                });

                layerGroup.addLayer(outerCircle);
                layerGroup.addLayer(innerCircle);

                // Combine both circles for interaction
                const circles = [outerCircle, innerCircle];

                // Add popup on click
                circles.forEach(circle => {
                    circle.on('click', (e) => {
                        let popupContent = '<div class="popup-content-inner">';
                        popupContent += `<h3>${properties['name']}</h3>`;
                        if (properties['subtitle']) {
                            popupContent += `<h4>${properties['subtitle']}</h4>`;
                        }
                        if (properties['address'] || properties['zip'] || properties['city']) {
                            let address = '';
                            if (properties['address']) {
                                address += properties['address'];
                                if (properties['zip']) {
                                    address += `, ${properties['zip']}`;
                                }
                                if (properties['city']) {
                                    address += ` ${properties['city']}`;
                                }
                            }
                            if (address.length > 0) {
                                popupContent += '<div class="address">';
                                popupContent += `<p>${address}</p>`;
                                popupContent += '</div>';
                            }
                        }
                        if (properties['teaser']) {
                            popupContent += `<div class="teaser">${properties['teaser']}</div>`;
                        }
                        if (properties['text']) {
                            popupContent += `<div class="text">${properties['text']}</div>`;
                        }
                        popupContent += '</div>';

                        L.popup({maxWidth: 400})
                            .setLatLng(latlng)
                            .setContent(popupContent)
                            .openOn(map);
                    });
                });

                // Change cursor to pointer on hover
                circles.forEach(circle => {
                    circle.on('mouseenter', () => {
                        map.getContainer().style.cursor = 'pointer';
                    });

                    circle.on('mouseleave', () => {
                        map.getContainer().style.cursor = '';
                    });

                    // Add tooltip on hover
                    circle.on('mousemove', (e) => {
                        const tooltipText = properties[tooltipProperty] || 'Item';
                        tooltip.textContent = tooltipText;
                        tooltip.style.display = 'block';
                        tooltip.style.left = (e.originalEvent.pageX + 10) + 'px';
                        tooltip.style.top = (e.originalEvent.pageY + 10) + 'px';
                    });

                    circle.on('mouseleave', () => {
                        tooltip.style.display = 'none';
                    });
                });
            });
        })
        .catch(error => console.error(`Error loading GeoJSON from ${url}:`, error));
}

// Load GeoJSON layers with custom options
addGeoJSONLayer(
    'https://orte-backend.a-thousand-channels.xyz/public/maps/spiegeleinschlaege/layers/toiletten.geojson',
    {
        sourceId: 'toiletten-source',
        color: '#d275f0',
        tooltipProperty: 'name',
    }
);

addGeoJSONLayer(
    'https://orte-backend.a-thousand-channels.xyz/public/maps/spiegeleinschlaege/layers/ereignisse.geojson',
    {
        sourceId: 'ereignisse-source',
        color: '#3ee3e3',
        tooltipProperty: 'name',
    }
);
