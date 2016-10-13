$(document).ready(function() {


    $.fn.editable.defaults.mode = 'popup';
    $('.table-edit').editable();



    // ****************************************************
    //              Dimension calculation
    //   calculate the height for pages and sections
    // ****************************************************

    function setHeight() {
        var windowHeight = $(window).height();
        $('#bmp-select-table').css('height', $(".map-size-adjust").height() - $("#model-run-btn").height() - 20);
        $('.model-result-map').css('height', $(".scenario-task").height() - $("#model-result-chart").height() - $(".map-tool-bar").height() * 2 - 20);
        $('#accordianmenu').css('height', $(".map-size-adjust").height() - $("#model-compare-btn").height() - 50);
        $('#bmp-optimize-table').css('height', $(".model-result-map").height() + $("#model-optimize-chart").height() - $("#model-optimize-input").height() - $(".report-generate").height() - 60);
    }
    setHeight();

    $(window).resize(function() {
        setHeight();
    });

    // ****************************************************
    //              BOOTSTRAP PLUGINS
    //   1. toggle switch button - used by bmp-select-tool
    //   2. toolgip - used by bmp-select-tool
    // ****************************************************

    $("[name='my-checkbox']").bootstrapSwitch();
    $('[data-toggle="tooltip"]').tooltip();

    // ****************************************************
    //          VARIABLE DECLARETION
    // ****************************************************


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

    var featureBMPAssignments = [];

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
            color: 'rgba(17,34,68,0.8)'
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
            color: 'rgba(87,178,47,0.8)'
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

    var bmpOverlay = new ol.Overlay({
        element: document.getElementById('bmp-select-tool')
    });

    map.addOverlay(bmpOverlay);

    var element = document.getElementById('feature-info');

    var infoOverlay = new ol.Overlay({
        element: document.getElementById('feature-info'),
        positioning: 'bottom-center',
        stopEvent: false
    });

    map.addOverlay(infoOverlay);
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

    var compareMap = new ol.Map({
        target: 'model-compare-map',
        layers: [tiledRaster, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    var compareresultMap = new ol.Map({
        target: 'compare-result-map',
        layers: [tiledRaster, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    var optimizeresultMap = new ol.Map({
        target: 'optimize-result-map',
        layers: [tiledRaster, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    // ****************************************************
    //                  REGISTER EVENT
    // ****************************************************

    var selectedStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(242,146,52,1)'
        }),
        stroke: new ol.style.Stroke({
            color: 'white'
        })
    });

    var searchedStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0, 108, 23, 1)'
        }),
        stroke: new ol.style.Stroke({
            color: 'white',
            width: 2
        })
    });


    $("#manual-select-btn").on('click', function(event) {
        $(this).removeClass('btn-default').addClass('btn-success');
        $("#select-all-btn").removeClass('btn-success').addClass('btn-default');
    });

    $("#select-all-btn").on('click', function(event) {

        $(this).removeClass('btn-default').addClass('btn-success');
        $("#manual-select-btn").removeClass('btn-success').addClass('btn-default');
    });

    $("#model-run-btn").click(function(event) {
        $("#model-result-page").css('visibility', 'visible');
    });

    $("#model-run-btn").click(function(event) {
        $("#model-result-page").css('visibility', 'visible');
    });

    $("#bmp-compare-btn").click(function(event) {
        $("#bmp-compare-page").css('visibility', 'visible');
    });

    $("#model-compare-btn").click(function(event) {
        $("#model-compare-page").css('visibility', 'visible');
    });

    $("#model-optimize-btn").click(function(event) {
        $("#model-optimize-page").css('visibility', 'visible');
    });



    var fieldTable = '<table class="table table-condensed table-hover" ><tr class="table-title"><th style="padding-top:11px;">ID</th><th style="padding-top:11px;">CC</th><th style="padding-top:11px;">CT</th><th style="padding-top:11px;">NM</th><th style="padding-top:11px;">WasCobs</th><th style="padding-top:11px;">Del</th></tr></table>';
    var subbasinTable = '<table class="table table-condensed table-hover" ><tr class="table-title"><th style="padding-top:11px;">ID</th><th style="padding-top:11px;">CC</th><th style="padding-top:11px;">CT</th><th style="padding-top:11px;">NM</th><th style="padding-top:11px;">WasCobs</th><th style="padding-top:11px;">Del</th></tr></table>';
    var searchedFeature = null;
    var selectedFeature;
    var featureCenter;
    selectSingleClick.on('select', function(event) {
        $(element).hide();

        $("#bmp-select-table table tr").removeClass('rowSelected');
        selectedFeature = event.selected[0];
        if (selectedFeature) {
            $("#bmp-select-tool").css('visibility', 'visible');
            $("#bmp-select-tool").show();

            var coordinate = ol.extent.getCenter(selectedFeature.getGeometry().getExtent());
            var offsetCoordinate = [coordinate[0] + 400, coordinate[1] + 400];
            bmpOverlay.setPosition(offsetCoordinate);

            if (searchedFeature) {
                if (searchedFeatureStyle(searchedFeature.getProperties().Name) === true) {
                    searchedFeature.setStyle(selectedStyle);
                } else {
                    searchedFeature.setStyle(null);
                }
            }
            searchedFeature = selectedFeature;
            if (searchedFeature) {
                if (searchedFeatureStyle(searchedFeature.getProperties().Name) === true) {
                    searchedFeature.setStyle(searchedStyle);
                    $("#bmp-select-table table tr").removeClass('rowSelected');
                    $('#bmp-select-table table .selectedFeatureID').each(function() {
                        if ($(this).html() == selectedFeature.getProperties().Name) {
                            $(this).closest('tr').addClass('rowSelected');
                        }
                    });

                } else {
                    searchedFeature.setStyle(selectedStyle);
                    searchedFeature = null;
                }
            }
        } else {
            bmpOverlay.setPosition(undefined);
        }
    });

    var hoveredFeature;
    selectPointerMove.on('select', function(event) {

        hoveredFeature = event.selected[0];

        if (hoveredFeature) {
            // $("#feature-info").css('visibility', 'visible');
            var coordinate = ol.extent.getCenter(hoveredFeature.getGeometry().getExtent());
            var offsetCoordinate = [coordinate[0], coordinate[1] + 500];
            infoOverlay.setPosition(offsetCoordinate);
            $(element).html("FeatureID: " + hoveredFeature.getProperties().Name);
            $(element).show();
            infoOverlay.setPosition(offsetCoordinate);
            // $(element).popover({
            //     'placement': 'top',
            //     'html': true,
            //     'content': "FeatureID is" + hoveredFeature.getProperties().Name
            // });
            // $(element).popover('show');
        } else {
            $(element).hide();
            // $(element).popover('destroy');
        }
    });


    $('#search-prevent').submit(function(e) {
        e.preventDefault();
    });

    $('#search-feature').keyup(function(e) {
        if (e.keyCode == 13) {
            var id = $(this).val();
            $("#bmp-select-table table tr").removeClass('rowSelected');
            var feature = findFeature(id);
            if (searchedFeature) {
                if (searchedFeatureStyle(searchedFeature.getProperties().Name) === true) {
                    searchedFeature.setStyle(selectedStyle);
                } else {
                    searchedFeature.setStyle(null);
                }
                feature.setStyle(searchedStyle);
                searchedFeature = feature;
            } else {
                feature.setStyle(searchedStyle);
                searchedFeature = feature;
            }

            $('#bmp-select-table table .selectedFeatureID').each(function() {
                if ($(this).html() == id) {
                    $(this).closest('tr').addClass('rowSelected');
                }
            });
        }
    });


    function addTableEvent() {

        $('.table-edit').editable();
        $("#bmp-select-table tr").not(':first').hover(
            function() {
                $(this).css({
                    'background-color': 'rgba(195, 195, 195, 1)',
                    'color':'white'
                });
            },
            function() {
                $(this).css({
                    'background-color': '',
                    'color':''
                });            }
        );

        $("#bmp-select-table .table-data").click(function() {
            if (searchedFeature !== null) {
                if (searchedFeatureStyle(searchedFeature.getProperties().Name) === true) {
                    searchedFeature.setStyle(selectedStyle);
                } else {
                    searchedFeature.setStyle(null);
                }
            }
            $(this).addClass('rowSelected').siblings().removeClass('rowSelected');
            var id = $(this).children(':first').html();
            if ($('#show-subbasin-map').prop("disabled") === true) {
                for (i = 0; i < subbasinArray.length; i++) {
                    if (subbasinArray[i].id == id) {
                        subbasinArray[i].feature.setStyle(searchedStyle);
                        searchedFeature = subbasinArray[i].feature;
                    }
                }
            } else {
                for (i = 0; i < fieldArray.length; i++) {
                    if (fieldArray[i].id == id) {
                        fieldArray[i].feature.setStyle(searchedStyle);
                        searchedFeature = fieldArray[i].feature;
                    }
                }
            }
        });

        $(".deleteScenario").click(function(event) {
            $(this).closest('tr').remove();
            var id = $(this).siblings(":first").text();
            var feature = findFeature(id);
            feature.setStyle(null);
            if (feature == searchedFeature) {
                searchedFeature = null;
            }
            $("#bmp-select-tool").hide();

            selectSingleClick.getFeatures().clear();
        });
    }

    function findFeature(id) {
        if ($('#show-subbasin-map').prop("disabled") === true) {
            for (i = 0; i < subbasinArray.length; i++) {
                if (subbasinArray[i].id == id) {
                    return subbasinArray[i].feature;
                }
            }
        } else {
            for (i = 0; i < fieldArray.length; i++) {
                if (fieldArray[i].id == id) {
                    return fieldArray[i].feature;
                }
            }
        }

    }

    $("#show-field-map").click(function(event) {
        $("#bmp-select-tool").hide();
        subbasinTable = $('#bmp-select-table').html();
        // alert(subbasinTable);

        selectSingleClick.getFeatures().clear();
        map.removeLayer(subbasinJsonp);
        map.addLayer(fieldJsonp);
        $('#show-subbasin-map').attr("disabled", false);
        $('#show-field-map').attr("disabled", true);
        $("#bmp-select-table").html(fieldTable);
        addTableEvent();
    });


    $("#show-subbasin-map").click(function(event) {
        $("#bmp-select-tool").hide();
        fieldTable = $('#bmp-select-table').html();
        // alert(fieldTable);
        selectSingleClick.getFeatures().clear();
        map.removeLayer(fieldJsonp);
        map.addLayer(subbasinJsonp);
        $('#show-field-map').attr("disabled", false);
        $('#show-subbasin-map').attr("disabled", true);
        $("#bmp-select-table").html(subbasinTable);
        addTableEvent();
    });


    var selectedFeatureID = [];

    $("#bmp-select-tool button").click(function(event) {
        selectedFeatureID.length = 0;

        $(element).hide();
        var bmpCode;
        var ccSelected = 'F';
        var ctSelected = 'F';
        var nmSelected = 'F';
        var selectedID = selectedFeature.getProperties().Name;
        if ($("#ct").prop("checked") && $("#nm").prop("checked") && $("#cc").prop("checked")) {
            bmpCode = 9;
            ctSelected = 'T';
            nmSelected = 'T';
            ccSelected = 'T';
        } else if ($("#ct").prop("checked") && $("#nm").prop("checked")) {
            bmpCode = 6;
            ctSelected = 'T';
            nmSelected = 'T';
        } else if ($("#ct").prop("checked") && $("#cc").prop("checked")) {
            bmpCode = 7;
            ctSelected = 'T';
            ccSelected = 'T';
        } else if ($("#nm").prop("checked") && $("#cc").prop("checked")) {
            bmpCode = 8;
            nmSelected = 'T';
            ccSelected = 'T';
        } else if ($("#ct").prop("checked")) {
            bmpCode = 3;
            ctSelected = 'T';
        } else if ($("#nm").prop("checked")) {
            bmpCode = 4;
            nmSelected = 'T';
        } else if ($("#cc").prop("checked")) {
            bmpCode = 5;
            ccSelected = 'T';
        } else bmpCode = null;

        var bmpAssignment = [selectedID, bmpCode];
        featureBMPAssignments.push(bmpAssignment);
        var exist;
        if (bmpCode !== null) {
            $('#bmp-select-table table .selectedFeatureID').each(function() {
                var m = $(this).html();
                if (m == selectedID) {
                    exist = true;
                    $(this).closest('tr').remove();
                }
            });
            if (exist === true) {
                $('#bmp-select-table table').append('<tr class="table-data rowSelected"><td style="padding-top:11px;" class="selectedFeatureID">' + selectedID + '</td><td style="padding-top:11px;"><a class="table-edit" data-type="text">' + ccSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="text">' + ctSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="text">' + nmSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="text">' + '</a></td><td class="deletescenario" style="white-space: nowrap;width: 1%;"><a class="btn btn-danger" aria-label="Delete"><i class="fa fa-trash-o " aria-hidden="true"></i></a></td></tr>');
            } else {
                $('#bmp-select-table table').append('<tr class="table-data"><td style="padding-top:11px;" class="selectedFeatureID">' + selectedID + '</td><td style="padding-top:11px;"><a class="table-edit" data-type="text">' + ccSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="text">' + ctSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="text">' + nmSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="text">' + '</a></td><td class="deletescenario" style="white-space: nowrap;width: 1%;"><a class="btn btn-danger" aria-label="Delete"><i class="fa fa-trash-o " aria-hidden="true"></i></a></td></tr>');

            }

            $("#bmp-select-tool").hide();
            addTableEvent();
            selectSingleClick.getFeatures().clear();
        } else {
            $("#bmp-select-tool").hide();
            selectedFeature.setStyle(null);
            $("#bmp-select-table table tr").removeClass('rowSelected');
            $('#bmp-select-table table .selectedFeatureID').each(function() {
                var m = $(this).html();
                if (m == selectedID) {
                    $(this).closest('tr').remove();
                }
            });

            selectSingleClick.getFeatures().clear();
        }
        // if (searchedFeature) {
        //     if (searchedFeatureStyle(searchedFeature.getProperties().Name) === true) {
        //         searchedFeature.setStyle(selectedStyle);
        //     } else {
        //         searchedFeature.setStyle(null);
        //     }
        // }
    });

    function searchedFeatureStyle(id) {
        var searchedFeatureSelectedFlag;
        if (searchedFeature !== null) {
            selectedFeatureID.length = 0;
            $('#bmp-select-table table .selectedFeatureID').each(function() {
                var m = $(this).html();
                selectedFeatureID.push(m);
            });
            for (m = 0; m < selectedFeatureID.length; m++) {
                if (id === selectedFeatureID[m]) {
                    searchedFeatureSelectedFlag = true;
                }
            }
            if (searchedFeatureSelectedFlag === true) {
                return true;
            } else {
                return false;
            }
        }
    }

    map.on('click', function(event) {
        var pixel = map.getEventPixel(event.originalEvent);
        var hit = map.forEachFeatureAtPixel(pixel, function(feature, layer) {
            return true;
        });
        if (hit !== true) {
            if (searchedFeature) {
                if (searchedFeatureStyle(searchedFeature.getProperties().Name) === true) {
                    searchedFeature.setStyle(selectedStyle);
                } else {
                    searchedFeature.setStyle(null);
                }
                searchedFeature = null;
            } else {
                if (selectedFeature) {
                    searchedFeature = selectedFeature;
                    if (searchedFeatureStyle(searchedFeature.getProperties().Name) === true) {
                        searchedFeature.setStyle(selectedStyle);
                    } else {
                        searchedFeature.setStyle(null);
                    }
                }
                searchedFeature = null;
            }
            $("#bmp-select-tool").hide();
            selectSingleClick.getFeatures().clear();
            $("#bmp-select-table table tr").removeClass('rowSelected');
        }
    });

    $(document).on('click', 'a', function(event) {
        event.preventDefault();

        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 1000);
    });

    $("#accordianmenu p").click(function() {
        $("#accordianmenu p").css({ "background-color": "white", "color": "black" });
        $(this).css({ "background-color": "rgb(66,139,202)", "color": "white" });
        $("#accordianmenu ul ul").slideUp();
        if (!$(this).next().next().is(":visible")) {
            $(this).next().next().slideDown();
        }
    });


    // ****************************************************
    //                      DRAW CHART
    // ****************************************************

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

    $('#model-compare-chart').highcharts({
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

    $('#model-optimize-chart').highcharts({
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
});
