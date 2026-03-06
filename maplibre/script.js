
const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {},
        layers: []
    },
    center: [10.0, 53.55],
    zoom: 13,
});

// Reusable function to load and render GeoJSON layers
function addGeoJSONLayer(url, options = {}) {
    const {
        sourceId = 'geojson-source',
        outerLayerId = 'circle-outer',
        innerLayerId = 'circle-inner',
        outerRadius = 18,
        innerRadius = 12,
        color = '#007bff',
        outerOpacity = 0.7,
        tooltipProperty = 'name',
    } = options;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Add GeoJSON source
            map.addSource(sourceId, {
                type: 'geojson',
                data: data,
            });

            // Add outer circle layer with opacity
            map.addLayer({
                id: outerLayerId,
                type: 'circle',
                source: sourceId,
                paint: {
                    'circle-radius': outerRadius,
                    'circle-color': color,
                    'circle-opacity': outerOpacity,
                }
            });

            // Add inner dot layer without opacity
            map.addLayer({
                id: innerLayerId,
                type: 'circle',
                source: sourceId,
                paint: {
                    'circle-radius': innerRadius,
                    'circle-color': color,
                    'circle-opacity': 1,
                }
            });

            // Add popup on click
            map.on('click', outerLayerId, (e) => {
                const feature = e.features[0];
                const properties = feature.properties;
                console.log('Clicked feature properties:', properties);
                
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
                    if (address.length > 0  ) {
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
                popupContent += '<hr />';
                popupContent += '</div>';
                
                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(popupContent)
                    .setMaxWidth('400px')                    
                    .addTo(map);
            });

            // Change cursor to pointer on hover
            map.on('mouseenter', outerLayerId, () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', outerLayerId, () => {
                map.getCanvas().style.cursor = '';
            });

            // Add tooltip on hover
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

            map.on('mousemove', outerLayerId, (e) => {
                const feature = e.features[0];
                const properties = feature.properties;
                
                // Create tooltip text from specified property
                const tooltipText = properties[tooltipProperty] || 'Item';
                tooltip.textContent = tooltipText;
                tooltip.style.display = 'block';
                tooltip.style.left = (e.originalEvent.pageX + 10) + 'px';
                tooltip.style.top = (e.originalEvent.pageY + 10) + 'px';
            });

            map.on('mouseleave', outerLayerId, () => {
                tooltip.style.display = 'none';
            });
        })
        .catch(error => console.error(`Error loading GeoJSON from ${url}:`, error));
}

// Initialize map
map.on('load', () => {
        const layers = map.getStyle().layers;
        // Find the index of the first symbol layer in the map style
        let firstSymbolId;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].type === 'symbol') {
                firstSymbolId = layers[i].id;
                break;
            }
        }    
   
    // Add WMS layer - Hamburg Historical Map 1980s
    map.addSource('hamburg-1980s', {
        type: 'raster',
        tiles: [
            'https://geodienste.hamburg.de/HH_WMS_Historische_Karte_1_5000?&service=WMS&request=GetMap&layers=jahrgang_1980-1990&styles=&format=image%2Fjpeg&transparent=true&version=1.1.1&width=256&height=256&srs=EPSG%3A3857&bbox={bbox-epsg-3857}'
        ],
        tileSize: 256,
    });

    map.addLayer({
        id: 'hamburg-1980s-layer',
        type: 'raster',
        source: 'hamburg-1980s',
        },
        firstSymbolId
    );

    // Load GeoJSON layer with custom options
    addGeoJSONLayer(
        'https://orte-backend.a-thousand-channels.xyz/public/maps/spiegeleinschlaege/layers/toiletten.geojson',
        {
            sourceId: 'toiletten-source',
            outerLayerId: 'toiletten-outer',
            innerLayerId: 'toiletten-inner',
            color: '#007bff',
            tooltipProperty: 'name', // adjust to match actual property name in GeoJSON
        }
    );

    addGeoJSONLayer(
        'https://orte-backend.a-thousand-channels.xyz/public/maps/spiegeleinschlaege/layers/ereignisse.geojson',
        {
            sourceId: 'ereignisse-source',
            outerLayerId: 'ereignisse-outer',
            innerLayerId: 'ereignisse-inner',
            color: '#28a745',
            tooltipProperty: 'name', // adjust to match actual property name in GeoJSON
        }
    );
});
