$(document).ready(function() {

    var layerSwitch = 1;

    var Great = 'rgba(53, 191, 0, 0.6)';
    var Good = 'rgba(115, 197, 0, 0.6)';
    var Normal = 'rgba(181, 203, 0, 0.6)';
    var Slight = 'rgba(210, 168, 0, 0.6)';
    var Bad = 'rgba(216, 170, 0, 0.6)';
    var Severe = 'rgba(229, 0, 26, 0.6)';

    var SeverityLevel = {
        "Great": Great,
        "Good": Good,
        "Normal": Normal,
        "Slight": Slight,
        "Bad": Bad,
        "Severe": Severe
    };

    var defaultStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: [250, 250, 250, 0.6]
        }),
        stroke: new ol.style.Stroke({
            color: [220, 220, 220, 1],
            width: 1
        })
    });

    var styleCache = {};

    function styleSedimentFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().sedimentlevel;
        var value = feature.getProperties().sediment;
        value = value.toFixed(2);
        if (!level || !SeverityLevel[level]) {
            return [defaultStyle];
        }
        if (!styleCache[level]) {
            styleCache[level] = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: SeverityLevel[level]
                }),
                stroke: new ol.style.Stroke({
                    color: "white",
                    width: 1
                }),
                text: new ol.style.Text({
                    // text: value,

                    font: '12px Calibri,sans-serif',
                    fill: new ol.style.Fill({ color: '#000' }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 2
                    }),
                    // get the text from the feature - `this` is ol.Feature
                })
            });
        }
        styleCache[level].getText().setText(value);

        return [styleCache[level]];
    }

    function styleFlowFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().flowlevel;
        var value = feature.getProperties().flow;
        value = value.toFixed(2);
        if (!level || !SeverityLevel[level]) {
            return [defaultStyle];
        }
        if (!styleCache[level]) {
            styleCache[level] = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: SeverityLevel[level]
                }),
                stroke: new ol.style.Stroke({
                    color: "white",
                    width: 1
                }),
                text: new ol.style.Text({
                    // text: value,

                    font: '12px Calibri,sans-serif',
                    fill: new ol.style.Fill({ color: '#000' }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 2
                    }),
                    // get the text from the feature - `this` is ol.Feature
                })
            });
        }
        styleCache[level].getText().setText(value);

        return [styleCache[level]];
    }

    function styleTpFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().tplevel;
        var value = feature.getProperties().tp;
        value = value.toFixed(2);
        if (!level || !SeverityLevel[level]) {
            return [defaultStyle];
        }
        if (!styleCache[level]) {
            styleCache[level] = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: SeverityLevel[level]
                }),
                stroke: new ol.style.Stroke({
                    color: "white",
                    width: 1
                }),
                text: new ol.style.Text({
                    // text: value,

                    font: '12px Calibri,sans-serif',
                    fill: new ol.style.Fill({ color: '#000' }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 2
                    }),
                    // get the text from the feature - `this` is ol.Feature
                })
            });
        }
        styleCache[level].getText().setText(value);

        return [styleCache[level]];
    }

    function styleTnFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().tnlevel;
        var value = feature.getProperties().tn;
        value = value.toFixed(2);
        if (!level || !SeverityLevel[level]) {
            return [defaultStyle];
        }
        if (!styleCache[level]) {
            styleCache[level] = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: SeverityLevel[level]
                }),
                stroke: new ol.style.Stroke({
                    color: "white",
                    width: 1
                }),
                text: new ol.style.Text({
                    // text: value,
                    font: '12px Calibri,sans-serif',
                    fill: new ol.style.Fill({ color: '#000' }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 2
                    }),
                })
            });
        }
        styleCache[level].getText().setText(value);
        return [styleCache[level]];
    }

    var tiledRaster = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    var streamStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(99,179,235,0.6)',
            width: 2
        }),

    });

    var streamJsonp = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/stream.geojson',
            format: new ol.format.GeoJSON()
        }),
        style: streamStyle,
        zIndex: 20
    });
    var subbasinStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(17,34,68,0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: 'white'
        })
    });

    var subbasinJsonp = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/basinoutput.json',
            format: new ol.format.GeoJSON()
        }),
        style: subbasinStyle
    });

    var fieldStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(87,178,47,0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: 'white'
        })
    });

    var fieldJsonp = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/fieldoutput.json',
            format: new ol.format.GeoJSON()
        }),
        style: fieldStyle
    });

    var map = new ol.Map({
        target: 'result-map',
        layers: [tiledRaster, streamJsonp, fieldJsonp],
        // interactions: ol.interaction.defaults({mouseWheelZoom:false}),

        view: new ol.View({
            center: ol.proj.transform([-81.6695, 43.615], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    $(".btn-group a").first().addClass('text-highlight');

    $(".btn-group a").click(function(event) {
        $(this).addClass('text-highlight');
        $(this).siblings().removeClass('text-highlight');
    });



    $(".btn-group .layer-switch a").first().click(function(event) {
        if (layerSwitch === 0) {
            map.removeLayer(subbasinJsonp);
            map.addLayer(fieldJsonp);
        }

        layerSwitch = 1;
    });

    $(".btn-group .layer-switch a").first().next().click(function(event) {
        if (layerSwitch === 1) {
            map.removeLayer(fieldJsonp);
            map.addLayer(subbasinJsonp);
        }
        layerSwitch = 0;

    });


    $(".btn-group .result-switch a").first().click(function(event) {
        var a = map.getLayers().getArray()[2];
        a.setStyle(styleFlowFunction);
    });
    $(".btn-group .result-switch a").first().next().click(function(event) {
        var a = map.getLayers().getArray()[2];
        a.setStyle(styleSedimentFunction);
    });
    $(".btn-group .result-switch a").first().next().next().click(function(event) {
        var a = map.getLayers().getArray()[2];
        a.setStyle(styleTpFunction);
    });
    $(".btn-group .result-switch a").first().next().next().next().click(function(event) {
        var a = map.getLayers().getArray()[2];
        a.setStyle(styleTnFunction);
    });
});
