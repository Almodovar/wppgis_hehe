$(document).ready(function() {

    var features = [];

    var featureType = $.trim($("#feature-type").html());

    $(".row-data").each(function() {
        var s = $(this).children('td').first().text();
        features.push(s);
    });
    var fieldArray = [];
    var subbasinArray = [];
    var fieldArray2 = [];
    var subbasinArray2 = [];
    function Subbasin(id, feature, flow, sediment, tn, tp) {
        this.id = id;
        this.feature = feature;
        this.flow = flow;
        this.sediment = sediment;
        this.tn = tn;
        this.tp = tp;
    }

    function Field(id, feature, flow, sediment, tn, tp) {
        this.id = id;
        this.feature = feature;
        this.flow = flow;
        this.sediment = sediment;
        this.tn = tn;
        this.tp = tp;
    }
    // var fieldArray = [];
    // var subbasinArray = [];

    var layerSwitch = 1;
    var layerSwitch2 = 1;


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

    var boundaryStyle = new ol.style.Style({
        // fill: new ol.style.Fill({
        //     color: 'rgba(17,34,68,0.6)'
        // }),
        stroke: new ol.style.Stroke({
            color: 'black',
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

    subbasinJsonp.getSource().on('change', function(event) {
       var subbasinFeatures = subbasinJsonp.getSource().getFeatures();
        for (i = 0; i < subbasinFeatures.length; i++) {
            var subbasin = new Subbasin();
            subbasin.id = subbasinFeatures[i].getProperties().name;
            subbasin.feature = subbasinFeatures[i];
            subbasin.flow = subbasinFeatures[i].getProperties().flow;
            subbasin.sediment = subbasinFeatures[i].getProperties().sediment;
            subbasin.tp = subbasinFeatures[i].getProperties().tp;
            subbasin.tn = subbasinFeatures[i].getProperties().tn;
            subbasinArray.push(subbasin);
        }
        if (featureType == "subbasin") {
            for (var m = 0; m < features.length; m++) {
                for (var n = 0; n < subbasinArray.length; n++) {
                    if (features[m] === subbasinArray[n].id) {


                        $("#result-table table tbody").append('<tr><td>' + subbasinArray[n].id + '</td><td>' + subbasinArray[n].flow + '</td><td>' + subbasinArray[n].sediment + '</td><td>' + subbasinArray[n].tp + '</td><td>' + subbasinArray[n].tn + '</td> </tr>');

                    }
                }
            }

        }

    });

    var fieldStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(113,113,113,0.8)'
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

    fieldJsonp.getSource().on('change', function(event) {
        var fieldFeatures = fieldJsonp.getSource().getFeatures();
        for (i = 0; i < fieldFeatures.length; i++) {
            var field = new Field();
            field.id = fieldFeatures[i].getProperties().name;
            field.feature = fieldFeatures[i];
            field.flow = fieldFeatures[i].getProperties().flow;
            field.sediment = fieldFeatures[i].getProperties().sediment;
            field.tp = fieldFeatures[i].getProperties().tp;
            field.tn = fieldFeatures[i].getProperties().tn;
            fieldArray.push(field);
        }
        if (featureType === "field") {
            for (var m = 0; m < features.length; m++) {
                for (var n = 0; n < fieldArray.length; n++) {
                    if (features[m] === fieldArray[n].id) {
                        $("#result-table table tbody").append('<tr><td>' + fieldArray[n].id + '</td><td>' + fieldArray[n].flow + '</td><td>' + fieldArray[n].sediment + '</td><td>' + fieldArray[n].tp + '</td><td>' + fieldArray[n].tn + '</td> </tr>');
                        // fieldArray[n].feature.setStyle(boundaryStyle);
                    }
                }
            }
        }

    });


    var map;

    if (featureType == "field") {
        map = new ol.Map({
            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            }),
            target: 'result-map',
            layers: [tiledRaster, streamJsonp, fieldJsonp],

            view: new ol.View({
                center: ol.proj.transform([-81.6695, 43.615], 'EPSG:4326', 'EPSG:3857'),
                zoom: 13
            })
        });
        $("#result-btn-group a").first().addClass('text-highlight');
        layerSwitch = 1;
    }

    if (featureType == "subbasin") {
        map = new ol.Map({
            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            }),
            target: 'result-map',
            layers: [tiledRaster, streamJsonp, subbasinJsonp],

            view: new ol.View({
                center: ol.proj.transform([-81.6695, 43.615], 'EPSG:4326', 'EPSG:3857'),
                zoom: 13
            })
        });
        $("#result-btn-group a").first().next().addClass('text-highlight');
        layerSwitch = 0;
    }



    map.addControl(new ol.control.FullScreen());



    $("#result-btn-group a").click(function(event) {
        $(this).addClass('text-highlight');
        $(this).siblings().removeClass('text-highlight');
    });



    $("#result-btn-group .layer-switch a").first().click(function(event) {
        if (layerSwitch === 0) {
            map.removeLayer(subbasinJsonp);
            map.addLayer(fieldJsonp);
        }

        layerSwitch = 1;
        var length = fieldArray.length;

    });

    $("#result-btn-group .layer-switch a").first().next().click(function(event) {
        if (layerSwitch === 1) {
            // addBoundary();
            map.removeLayer(fieldJsonp);
            map.addLayer(subbasinJsonp);
        }
        layerSwitch = 0;
        var length = subbasinArray.length;

    });


    $("#result-btn-group .result-switch a").first().click(function(event) {
        var a = map.getLayers().getArray()[2];
        a.setStyle(styleFlowFunction2);
    });
    $("#result-btn-group .result-switch a").first().next().click(function(event) {
        var a = map.getLayers().getArray()[2];
        a.setStyle(styleSedimentFunction2);
    });
    $("#result-btn-group .result-switch a").first().next().next().click(function(event) {
        var a = map.getLayers().getArray()[2];
        a.setStyle(styleTpFunction2);
    });
    $("#result-btn-group .result-switch a").first().next().next().next().click(function(event) {
        var a = map.getLayers().getArray()[2];
        a.setStyle(styleTnFunction2);
    });


    // if (featureType == "subbasin") {
    //     for (var m = 0; m < features.length; m++) {
    //         for (var n = 0; n < subbasinArray.length; n++) {
    //             if (features[m] == subbasinArray[n].id) {
    //                 $("#result-table table tbody").append('<tr><th>ID</th><th>CC</th><th>CT</th><th>NM</th><th>WasCobs</th> </tr>');

    //             }
    //         }
    //     }
    // }

    // var len = fieldArray.length;

    // if (featureType == "field") {
    //     for (var m = 0; m < features.length; m++) {
    //         for (var n = 0; n < fieldArray.length; n++) {
    //             if (features[m] == fieldArray[n].id) {
    //                 $("#result-table table tbody").append('<tr><th>ID</th><th>CC</th><th>CT</th><th>NM</th><th>WasCobs</th> </tr>');

    //             }
    //         }
    //     }
    // }
    // -----------------------------------------------------------------------------------------------------------


    function styleSedimentFunction2(feature, resolution) {
        var featureid = feature.getProperties().name;
        var flag = 0;
        for (i = 0; i < features.length; i++) {
            var featuredf = features[i];
            if (features[i] === feature.getProperties().name) {
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
                flag = 1;
            } 
        }

        if (flag == 1){
        	return [styleCache[level]];
        }else{return [fieldStyle];}

    }

    function styleFlowFunction2(feature, resolution) {
        var featureid = feature.getProperties().name;
        var flag = 0;
        for (i = 0; i < features.length; i++) {
            var featuredf = features[i];
            if (features[i] === feature.getProperties().name) {
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
                flag = 1;
            } 
        }

        if (flag == 1){
        	return [styleCache[level]];
        }else{return [fieldStyle];}

    }

        function styleTpFunction2(feature, resolution) {
        var featureid = feature.getProperties().name;
        var flag = 0;
        for (i = 0; i < features.length; i++) {
            var featuredf = features[i];
            if (features[i] === feature.getProperties().name) {
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
                flag = 1;
            } 
        }

        if (flag == 1){
        	return [styleCache[level]];
        }else{return [fieldStyle];}

    }

        function styleTnFunction2(feature, resolution) {
        var featureid = feature.getProperties().name;
        var flag = 0;
        for (i = 0; i < features.length; i++) {
            var featuredf = features[i];
            if (features[i] === feature.getProperties().name) {
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
                            // get the text from the feature - `this` is ol.Feature
                        })
                    });
                }
                styleCache[level].getText().setText(value);
                flag = 1;
            } 
        }

        if (flag == 1){
        	return [styleCache[level]];
        }else{return [fieldStyle];}

    }

    var subbasinCompare = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/basincompareresult.json',
            format: new ol.format.GeoJSON()
        }),
        style: subbasinStyle
    });

    subbasinCompare.getSource().on('change', function(event) {
        var subbasinFeatures = subbasinCompare.getSource().getFeatures();
        for (i = 0; i < subbasinFeatures.length; i++) {
            var subbasin = new Subbasin();
            subbasin.id = subbasinFeatures[i].getProperties().name;
            subbasin.feature = subbasinFeatures[i];
            subbasin.flow = subbasinFeatures[i].getProperties().flow;
            subbasin.sediment = subbasinFeatures[i].getProperties().sediment;
            subbasin.tp = subbasinFeatures[i].getProperties().tp;
            subbasin.tn = subbasinFeatures[i].getProperties().tn;
            subbasinArray2.push(subbasin);
        }
        if (featureType == "subbasin") {
            for (var m = 0; m < features.length; m++) {
                for (var n = 0; n < subbasinArray2.length; n++) {
                    if (features[m] === subbasinArray2[n].id) {
                        $("#compare-table table tbody").append('<tr><td>' + subbasinArray2[n].id + '</td><td>' + subbasinArray2[n].flow + '</td><td>' + subbasinArray2[n].sediment + '</td><td>' + subbasinArray2[n].tp + '</td><td>' + subbasinArray2[n].tn + '</td> </tr>');
                    }
                }
            }

        }

    });


    var fieldCompare = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/fieldcompareresult.json',
            format: new ol.format.GeoJSON()
        }),
        style: fieldStyle
    });

    fieldCompare.getSource().on('change', function(event) {
        var fieldFeatures = fieldCompare.getSource().getFeatures();
        for (i = 0; i < fieldFeatures.length; i++) {
            var field = new Field();
            field.id = fieldFeatures[i].getProperties().name;
            field.feature = fieldFeatures[i];
            field.flow = fieldFeatures[i].getProperties().flow;
            field.sediment = fieldFeatures[i].getProperties().sediment;
            field.tp = fieldFeatures[i].getProperties().tp;
            field.tn = fieldFeatures[i].getProperties().tn;
            fieldArray2.push(field);
        }
        if (featureType === "field") {
            for (var m = 0; m < features.length; m++) {
                for (var n = 0; n < fieldArray2.length; n++) {
                    if (features[m] === fieldArray2[n].id) {
                        $("#compare-table table tbody").append('<tr><td>' + fieldArray2[n].id + '</td><td>' + fieldArray2[n].flow + '</td><td>' + fieldArray2[n].sediment + '</td><td>' + fieldArray2[n].tp + '</td><td>' + fieldArray2[n].tn + '</td> </tr>');
                        // fieldArray[n].feature.setStyle(boundaryStyle);
                    }
                }
            }
        }

    });


    var map2;

    if (featureType == "field") {
        map2 = new ol.Map({
            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            }),
            target: 'compare-map',
            layers: [tiledRaster, streamJsonp, fieldCompare],

            view: new ol.View({
                center: ol.proj.transform([-81.6695, 43.615], 'EPSG:4326', 'EPSG:3857'),
                zoom: 13
            })
        });
    }

    if (featureType == "subbasin") {
        map2 = new ol.Map({
            controls: ol.control.defaults({
                attribution: false,
                zoom: false,
            }),
            target: 'compare-map',
            layers: [tiledRaster, streamJsonp, subbasinCompare],

            view: new ol.View({
                center: ol.proj.transform([-81.6695, 43.615], 'EPSG:4326', 'EPSG:3857'),
                zoom: 13
            })
        });
    }


    map2.addControl(new ol.control.FullScreen());


    $("#compare-btn-group a").first().addClass('text-highlight');

    $("#compare-btn-group a").click(function(event) {
        $(this).addClass('text-highlight');
        $(this).siblings().removeClass('text-highlight');
    });



    $("#compare-btn-group .layer-switch a").first().click(function(event) {
        if (layerSwitch2 === 0) {
            map2.removeLayer(subbasinCompare);
            map2.addLayer(fieldCompare);
        }

        layerSwitch2 = 1;
    });

    $("#compare-btn-group .layer-switch a").first().next().click(function(event) {
        if (layerSwitch2 === 1) {
            map2.removeLayer(fieldCompare);
            map2.addLayer(subbasinCompare);
        }
        layerSwitch2 = 0;

    });


    $("#compare-btn-group .result-switch a").first().click(function(event) {
        var a = map2.getLayers().getArray()[2];
        a.setStyle(styleFlowFunction2);
    });
    $("#compare-btn-group .result-switch a").first().next().click(function(event) {
        var a = map2.getLayers().getArray()[2];
        a.setStyle(styleSedimentFunction2);
    });
    $("#compare-btn-group .result-switch a").first().next().next().click(function(event) {
        var a = map2.getLayers().getArray()[2];
        a.setStyle(styleTpFunction2);
    });
    $("#compare-btn-group .result-switch a").first().next().next().next().click(function(event) {
        var a = map2.getLayers().getArray()[2];
        a.setStyle(styleTnFunction2);
    });

});
