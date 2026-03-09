
// Initialize map
const map = L.map('map').setView([53.55, 10.0], 13);

// Add WMS layer - Hamburg Historical Map 1980s
L.tileLayer.wms('https://geodienste.hamburg.de/HH_WMS_Historische_Karte_1_5000', {
    layers: 'jahrgang_1980-1990',
    format: 'image/jpeg',
    transparent: true,
    version: '1.1.1',
    srs: 'EPSG:3857',
    attribution: '1980er Kartenhintergrund: LGV Hamburg, Lizenz <a href="https://www.govdata.de/dl-de/by-2-0" target="_blank">dl-de/by-2-0</a>',
    zIndex: 1
}).addTo(map);

map.attributionControl.setPrefix('Karte von <a href="https://a-thousand-channels.xyz" target="_blank">A Thousand Channels </a>');

map.on('popupopen', function (e) {
  if (window.innerWidth <= 768) {
    const popupEl = e.popup.getElement();
    // The close button is the next sibling inside .leaflet-popup-pane
    const closeBtn = popupEl.querySelector('.leaflet-popup-close-button');

    document.body.appendChild(popupEl);

    // Re-attach close button inside the popup wrapper so it moves with it
    if (closeBtn) {
      const wrapper = popupEl.querySelector('.leaflet-popup-content-wrapper');
      wrapper.insertBefore(closeBtn, wrapper.firstChild);
    }
  }
});

map.on('popupclose', function (e) {
  const popupEl = e.popup.getElement();
  if (popupEl && popupEl.parentNode === document.body) {
    document.body.removeChild(popupEl);
  }
});

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
            let uid = 0;
            const tooltip_class = 'tooltip-orient'
            const DivIconLayer = L.geoJSON([data], {
                style(feature) {
                    return feature.properties && feature.properties.style;
                },

                pointToLayer(feature, latlng) {
                    // console.log("Set marker for "+feature.properties.name + " " + uid);
                    uid++;

                    let berth_icon = L.divIcon({
                        className: 'berth-marker berth-marker-'+feature.properties.id+' layer-'+name,
                        html: `<svg
                        width="27"
                        height="48"
                        viewBox="0 0 9.5250003 17.197917"
                        version="1.1"
                        id="svg955"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:svg="http://www.w3.org/2000/svg">
                        <g
                        transform="translate(-45.037906,-244.4065)">
                        <g
                            transform="matrix(0.97734571,0,0,0.97223334,-156.08824,114.17017)">
                            <path
                            class="marker_shadow"
                            style="opacity:0.8;fill:#808080;fill-opacity:1;stroke-width:0.432578;stroke-linejoin:bevel;stroke-dasharray:0.432578, 0.865158;paint-order:stroke fill markers"
                            d="m 207.93885,134.97565 3.16945,-0.27113 3.40993,-0.29166 c 1.00015,-0.0762 1.05377,0.0297 1.00255,0.99571 l -0.32807,4.02177 -0.56023,6.86792 -4.42218,5.34666 -4.02772,-4.87641 0.39143,-10.4702 c 0.0796,-1.07374 0.23097,-1.23472 1.36484,-1.32265 z"
                            sodipodi:nodetypes="ccccccccccc" />
                            <path
                            class="marker"
                            style="opacity:0.8;fill:${color};fill-opacity:0.947811;stroke-width:0.440654;stroke-linejoin:bevel;stroke-dasharray:0.440654, 0.881309;paint-order:stroke fill markers"
                            d="m 207.07481,133.9562 h 3.13549 l 3.37339,3e-5 c 0.98992,0.01 1.04879,0.12574 1.04879,1.13438 v 11.20765 l -4.42218,5.34666 -4.42217,-5.34666 v -11.07712 c 0.0225,-1.11915 0.16448,-1.27441 1.28668,-1.26491 z"
                            sodipodi:nodetypes="cccccccccc" />
                        </g>
                        <g>
                        <text transform="matrix(1 0 0 1 49.5 249)" fill="transparent" text-anchor="middle">`+feature.properties.name+`</text>
                            
                        </g>
                        </g>
                    </svg>`,
                        /* iconAnchor: [20, 98], */
                        iconAnchor: [18, 74],
                    });
                    let marker = L.marker(latlng, {
                    icon: berth_icon,
                    uniqueID: feature.properties.id,
                    });
                    marker.bindTooltip("<div class='"+tooltip_class+"'><h4>"+feature.properties.name+"</h4>", {
                    direction: 'top',
                    opacity: 0.9,
                    className: 'leaflet-tooltip-audio',
                    offset: [-3, -66],
                    interactive: true,
                    permanent: false
                    });
                    // TODO open popup with more info,
                    const popupContent = PopUpContent(feature.properties);
                    marker.bindPopup(popupContent, {
                        offset: [-3, -50],
                    })
                    marker.on('click', function (event) {
                        console.log('clicked');
                        marker.openPopup();
                    });
                    return marker;
                }
                });
            console.log('Layer ID '+DivIconLayer._leaflet_id);
            DivIconLayer.addTo(layerGroup);
 
    

            /* tooltip custom */
            /*
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
            */
            /* work with data */
            /*
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
                        const popupContent = PopUpContent(properties);
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
            */
        })
        .catch(error => console.error(`Error loading GeoJSON from ${url}:`, error));
}

function PopUpContent(properties) {
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
    return popupContent;
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
