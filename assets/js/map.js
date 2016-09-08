$(document).ready(function() {

    function setHeight() {
        var windowHeight = $(window).height();
        $('#bmp-select-table').css('height',  $(".map-size-adjust").height() - $("#model-run-btn").height()-20);
         $('.model-result-map').css('height',  $(".scenario-task").height() - $("#model-result-chart").height()-$("#resultmap-tool-bar").height() * 2-20);
    }
    setHeight();

    $(window).resize(function() {
        setHeight();
    });

    var fieldArray = [];
    var subbasinArray = [];

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
    // ****************************************************
    // Basemap using openstreet map with projection EPSG:3857
    // ****************************************************

    var tiledRaster = new ol.layer.Tile({
        source: new ol.source.OSM()
    });
    // ****************************************************
    // Subbasin layer loaded from geoserver in Jsonp format
    // Be sure to enable the Jsonp function in the web.xml
    // of Geoserver 
    // ****************************************************

    var subbasinStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(10,8,114,0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: 'white'
        })
    });

    var subbasinJsonp = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/basin.json',
            format: new ol.format.GeoJSON()
        }),
        style: subbasinStyle
    });

    subbasinJsonp.getSource().on('addfeature', function(event) {

        subbasinFeatures = subbasinJsonp.getSource().getFeatures();

        for (i = 0; i < subbasinFeatures.length; i++) {
            var subbasin = new Subbasin();
            subbasin.id = subbasinFeatures[i].getProperties().Name;
            subbasin.feature = subbasinFeatures[i];
            subbasinArray.push(subbasin);
        }

    });

    // ****************************************************
    // Field layer loaded from geoserver in Jsonp format
    // Be sure to enable the Jsonp function in the web.xml
    // of Geoserver     
    // ****************************************************

    var fieldStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(47,195,96,0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: 'white'
        })
    });

    var fieldJsonp = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/field.json',
            format: new ol.format.GeoJSON()
        }),
        style: fieldStyle
    });

    fieldJsonp.getSource().on('addfeature', function(event) {

        fieldFeatures = fieldJsonp.getSource().getFeatures();

        for (i = 0; i < fieldFeatures.length; i++) {
            var field = new Field();
            field.id = fieldFeatures[i].getProperties().Name;
            field.feature = fieldFeatures[i];
            fieldArray.push(field);
        }

    });

    // ****************************************************
    // the select interaction allows us to select features 
    // through two methods: hover and single click.  
    // ****************************************************

    var selectPointerMove = new ol.interaction.Select({
        layers: [fieldJsonp, subbasinJsonp],
        condition: ol.events.condition.pointerMove
    });

    var selectSingleClick = new ol.interaction.Select({
        layers: [fieldJsonp, subbasinJsonp],
    });


    // ****************************************************
    // the draganddrop interaction allows us to drop files
    // onto the browser window. If the file matches one of the
    // format constructors, it will automatically extract
    // the features from the file and trigger an event
    // ****************************************************

    var vectorStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(47,195,96,0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: 'white'
        })
    });


    var dragAndDrop = new ol.interaction.DragAndDrop({
        formatConstructors: [
            ol.format.GPX,
            ol.format.GeoJSON,
            ol.format.IGC,
            ol.format.KML,
            ol.format.TopoJSON
        ]
    });


    dragAndDrop.on('addfeatures', function(event) {
        var vectorSource = new ol.source.Vector({
            features: event.features,
            projection: event.projection
        });
        map.addLayer(new ol.layer.Vector({
            source: vectorSource,
            style: vectorStyle
        }));
        var view = map.getView();
        view.fitExtent(vectorSource.getExtent(), map.getSize());
    });

    // ****************************************************
    // create a map instance, add layers to the map, set 
    // map center and add the dragAndDrop interaction to
    // the map 
    // ****************************************************

    var map = new ol.Map({
        target: 'map',
        layers: [tiledRaster, subbasinJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    map.addInteraction(dragAndDrop);
    map.addInteraction(selectSingleClick);
    map.addInteraction(selectPointerMove);

    map.addLayer(new ol.layer.Heatmap({
        source: new ol.source.Vector({
            url: 'pollution.json',
            format: new ol.format.GeoJSON({
                defaultDataProjection: 'EPSG:3857'
            })
        })
    }));

    // ****************************************************
    // register map-btn listener
    // 1: map switch
    // 2: result switch
    // 3: BMP selection type switch
    // 2: process switch
    // ****************************************************

    $("#manual-select-btn").on('click', function(event) {
        $(this).removeClass('btn-default').addClass('btn-success');
        $("#select-all-btn").removeClass('btn-success').addClass('btn-default');
    });

    $("#select-all-btn").on('click', function(event) {

        $(this).removeClass('btn-default').addClass('btn-success');
        $("#manual-select-btn").removeClass('btn-success').addClass('btn-default');
    });


    // ****************************************************
    // create a map instance, add layers to the map, set 
    // map center and add the dragAndDrop interaction to
    // the map 
    // ****************************************************

    var resultMap = new ol.Map({
        target: 'model-result-map',
        layers: [tiledRaster, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    $('#model-result-chart').highcharts({
        legend: {
            enabled: false
        },
        chart: {
            type: 'column'
        },
        title: {
            text: null
        },
        xAxis: {
            categories: ['Flow', 'Sediment', 'Phosphorus', 'Nitrigen']
        },
        credits: {
            enabled: false
        },

        series: [{
            name: 'John',
            data: [5, 3, 4, 7]
        }, {
            name: 'Jane',
            data: [2, -2, -3, 2]
        }, {
            name: 'Joe',
            data: [3, 4, 4, -2]
        }]
    });

    $(document).on('click', 'a', function(event) {
        event.preventDefault();

        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 1000);
    });

});
