$(document).ready(function() {

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
        $("#loading-page").css('height', $("#bmp-select-page").height() + 150);
        $("#loading-info").css('margin-top', ($("#loading-page").height() - 400) / 2);
        $("#result-issue-talk").css('height', $("#responsive-timeline").height() + 5);
        $("#result-issue-talk").css('width', $("#result-issues").width());
        var h = $("#result-issue-talk").height() - 190;
        $("#talk-content").css('height', h + "px");
        // $("#result-issue-talk").css('left', $(".scenario-task").position().left);

    }
    setHeight();

    $(window).resize(function() {
        setHeight();
    });

    $("#result-issue-talk").hide();

    // ****************************************************
    //              BOOTSTRAP PLUGINS
    //   1. toggle switch button - used by bmp-select-tool
    //   2. toolgip - used by bmp-select-tool
    // ****************************************************

    $("[name='my-checkbox']").bootstrapSwitch();
    $('[data-toggle="tooltip"]').tooltip();
    $.fn.editable.defaults.mode = 'popup';
    $('.table-edit').editable();

    // ****************************************************
    //          VARIABLE DECLARETION
    // ****************************************************
    var selectedLayer = "";
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
    //                  EVENT HANDLER
    // ****************************************************



    $("#model-compare-btn").click(function(event) {
        $("#model-compare-page").css('visibility', 'visible');
    });

    $("#model-optimize-btn").click(function(event) {
        $("#model-optimize-page").css('visibility', 'visible');
    });

    // ****************************************************
    // Basemap using openstreet map with projection EPSG:3857
    // ****************************************************

    var tiledRaster = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    // ************************************************************************************************************************************************************
    //
    //                                                                      BMP SELECT PAGE
    //                                  
    // ************************************************************************************************************************************************************

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

    selectedLayer = "subbasin";

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
    //
    //            BMP SELECT PAGE EVENT HANDLER
    //
    // ****************************************************
    var fieldTable = '<table class="table table-condensed table-hover" ><tr class="table-title"><th style="padding-top:11px;">ID</th><th style="padding-top:11px;">CC</th><th style="padding-top:11px;">CT</th><th style="padding-top:11px;">NM</th><th style="padding-top:11px;">WasCobs</th><th style="padding-top:11px;">Del</th></tr></table>';
    var subbasinTable = '<table class="table table-condensed table-hover" ><tr class="table-title"><th style="padding-top:11px;">ID</th><th style="padding-top:11px;">CC</th><th style="padding-top:11px;">CT</th><th style="padding-top:11px;">NM</th><th style="padding-top:11px;">WasCobs</th><th style="padding-top:11px;">Del</th></tr></table>';
    var searchedFeature = null;
    var selectedFeature;
    var preselectedFeature = null;
    var featureCenter;
    var hoveredFeature;


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
            width: 4
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


    selectSingleClick.on('select', function(event) {
        $(element).hide();
        $("#bmp-select-table table tr").removeClass('rowSelected');
        if (selectedFeature) {
            selectedFeature.setStyle(null);
        }
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

    selectPointerMove.on('select', function(event) {
        hoveredFeature = event.selected[0];
        if (hoveredFeature) {
            var coordinate = ol.extent.getCenter(hoveredFeature.getGeometry().getExtent());
            var offsetCoordinate = [coordinate[0], coordinate[1] + 500];
            infoOverlay.setPosition(offsetCoordinate);
            $(element).html("FeatureID: " + hoveredFeature.getProperties().Name);
            $(element).show();
            infoOverlay.setPosition(offsetCoordinate);
        } else {
            $(element).hide();
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
        $('.table-edit').editable({
            value: 2,
            source: [
                { value: 1, text: 'Y' },
                { value: 2, text: 'N' },
            ]
        });

        $("#bmp-select-table tr").not(':first').hover(
            function() {
                $(this).css({
                    'background-color': 'rgba(195, 195, 195, 0.6)',
                    'color': ''
                });
            },
            function() {
                $(this).css({
                    'background-color': '',
                    'color': ''
                });
            }
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
        selectedLayer = "field";
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
        selectedLayer = "subbasin";

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
        var ccSelected = 'N';
        var ctSelected = 'N';
        var nmSelected = 'N';
        var selectedID = selectedFeature.getProperties().Name;
        if ($("#ct").prop("checked") && $("#nm").prop("checked") && $("#cc").prop("checked")) {
            bmpCode = 9;
            ctSelected = 'Y';
            nmSelected = 'Y';
            ccSelected = 'Y';
        } else if ($("#ct").prop("checked") && $("#nm").prop("checked")) {
            bmpCode = 6;
            ctSelected = 'Y';
            nmSelected = 'Y';
        } else if ($("#ct").prop("checked") && $("#cc").prop("checked")) {
            bmpCode = 7;
            ctSelected = 'Y';
            ccSelected = 'Y';
        } else if ($("#nm").prop("checked") && $("#cc").prop("checked")) {
            bmpCode = 8;
            nmSelected = 'Y';
            ccSelected = 'Y';
        } else if ($("#ct").prop("checked")) {
            bmpCode = 3;
            ctSelected = 'Y';
        } else if ($("#nm").prop("checked")) {
            bmpCode = 4;
            nmSelected = 'Y';
        } else if ($("#cc").prop("checked")) {
            bmpCode = 5;
            ccSelected = 'Y';
        } else bmpCode = null;

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
                $('#bmp-select-table table').append('<tr class="table-data rowSelected"><td style="padding-top:11px;" class="selectedFeatureID">' + selectedID + '</td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ccSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ctSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + nmSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + '</a></td><td class="deletescenario" style="white-space: nowrap;width: 1%;"><a class="btn btn-danger" aria-label="Delete"><i class="fa fa-trash-o " aria-hidden="true"></i></a></td><td style="display:none;" class="bmp_code">' + bmpCode + '</td></tr>');
            } else {
                $('#bmp-select-table table').append('<tr class="table-data"><td style="padding-top:11px;" class="selectedFeatureID">' + selectedID + '</td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ccSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ctSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + nmSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + '</a></td><td class="deletescenario" style="white-space: nowrap;width: 1%;"><a class="btn btn-danger" aria-label="Delete"><i class="fa fa-trash-o " aria-hidden="true"></i></a></td><td style="display:none;" class="bmp_code">' + bmpCode + '</td></tr>');

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
        selectedFeature = null;

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
            if (selectedFeature) {
                selectedFeature.setStyle(null);
                selectedFeature = null;
            }
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


    $(document).on('show-loading-page', function() {

        $("#loading-page").css("visibility", "visible");
        var fadeoutBox = $("#box1");
        var fadeinBox = $("#box2");
        var nextfadeinBox = $("#box3");
        var lastfadeinBox = $("#box4");
        var finalfadeinBox = $("#box5");
        var thetruefinalfadeinBox = $("#box6");


        setTimeout(function fade() {
            fadeinBox.stop(true, true).fadeIn(1500);
            fadeoutBox.stop(true, true).fadeOut(1500, function() {
                var temp = fadeinBox;
                fadeinBox = nextfadeinBox;
                nextfadeinBox = lastfadeinBox;
                lastfadeinBox = finalfadeinBox;
                finalfadeinBox = thetruefinalfadeinBox;
                thetruefinalfadeinBox = fadeoutBox;
                fadeoutBox = temp;
                setTimeout(fade, 9000);
            });
        }, 9000);
    });

    var outletSediment = [];
    var outletFlow = [];
    var outletTp = [];
    var outletTn = [];

    $("#model-run-btn").click(function(event) {
        $(document).trigger('show-loading-page');
        var bmpAssignmentArray = [];
        // $('#bmp-select-table table tr').not(":first").each(function() {
        //     var bmpAssignment = new Object();
        //     var m = $("td:nth-child(7)", this).text();
        //     var n = $("td:nth-child(1)", this).text();
        //     bmpAssignment.featureID = parseInt(n);
        //     bmpAssignment.bmpCode = parseInt(m);

        //     bmpAssignment.featureType = selectedLayer;
        //     bmpAssignmentArray.push(bmpAssignment);
        // });

        // alert(bmpAssignmentArray);
        $('#bmp-select-table table .selectedFeatureID').each(function(index, el) {
            var bmpAssignment = new Object();
            bmpAssignment.featureID = parseInt($(this).text());
            var cc, ct, nm, wascob;
            cc = $(this).next().text();
            ct = $(this).next().next().text();
            nm = $(this).next().next().next().text();
            if (cc === 'Y' && nm === 'Y' && ct === 'Y') {
                bmpAssignment.bmpCode = 9;
            } else if (cc === 'N' && nm === 'Y' && ct === 'Y') {
                bmpAssignment.bmpCode = 6;
            } else if (cc === 'Y' && nm === 'N' && ct === 'Y') {
                bmpAssignment.bmpCode = 7;
            } else if (cc === 'Y' && nm === 'Y' && ct === 'N') {
                bmpAssignment.bmpCode = 8;
            } else if (cc === 'N' && nm === 'N' && ct === 'Y') {
                bmpAssignment.bmpCode = 3;
            } else if (cc === 'N' && nm === 'Y' && ct === 'N') {
                bmpAssignment.bmpCode = 4;
            } else if (cc === 'Y' && nm === 'N' && ct === 'N') {
                bmpAssignment.bmpCode = 5;
            } else bmpAssignment.bmpCode = null;
            bmpAssignment.featureType = selectedLayer;
            bmpAssignmentArray.push(bmpAssignment);
        });

        var jsonArray = JSON.stringify(bmpAssignmentArray);
        $.ajax({
            url: '/runmodel',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: jsonArray,
            dataType: 'json',
            success: function(r) {

                outletSediment = r[0].ResultData;
                outletFlow = r[1].ResultData;
                outletTp = r[2].ResultData;
                outletTn = r[3].ResultData;

                // alert(outletSediment);
                // alert(outletFlow);
                // alert(outletTp);
                // alert(outletTn);

                // alert(typeof outletTn[1]);

                resultMap.removeLayer(resultMap.getLayers().getArray()[1]);

                if ($('#show-field-map').prop("disabled") === true) {
                    resultMap.addLayer(fieldOutput);
                    $("#show-field-map-result").attr('disabled', true);
                    $("#show-subbasin-map-result").attr('disabled', false);
                    $('#show-flow-result').attr("disabled", true);
                    $('#show-flow-result').siblings().attr("disabled", false);

                }
                if ($('#show-subbasin-map').prop("disabled") === true) {
                    resultMap.addLayer(subbasinOutput);
                    $("#show-subbasin-map-result").attr('disabled', true);
                    $("#show-field-map-result").attr('disabled', false);
                    $('#show-flow-result').attr("disabled", true);
                    $('#show-flow-result').siblings().attr("disabled", false);
                }

                drawOutletChart("flow");

                // $('#model-result-chart').highcharts({
                //     title: {
                //         text: '',
                //         x: -20 //center
                //     },

                //     xAxis: {
                //         categories: ['2002', '2003', '2004', '2005', '2006', '2007',
                //             '2008', '2009', '2010', '2011'
                //         ]
                //     },
                //     yAxis: {
                //         title: {
                //             text: 'Value'
                //         },
                //         plotLines: [{
                //             value: 0,
                //             width: 1,
                //             color: '#808080'
                //         }]
                //     },
                //     credits: {
                //         enabled: false
                //     },
                //     tooltip: {
                //         valueSuffix: ''
                //     },
                //     legend: {
                //         enabled: false
                //     },
                //     series: [{
                //         name: 'Average',
                //         data: outletFlow
                //     }]
                // });
                $("#loading-page").css("visibility", "hidden");
                $("#model-result-page").css('visibility', 'visible');

                $("html, body").animate({ scrollTop: $('#model-result-page').offset().top }, 1000);
                // alert(r);
                $("#progress-info").empty();
                $("#progress-info").append('<div id="box1"><p><span> Preparing modeling files ... </span></p></div><div id="box2"><p><span> Modeling BMPs ... </span></p></div>  <div id="box3"><p><span> Writing results to database ... </span></p></div>  <div id="box4"><p><span> Visualizing the output ... </span></p></div><div id="box5"><p><span> Thanks for your patience ... </span></p></div><div id="box6"><p><span> Finishing in seconds ... </span></p></div>   ');
            }
        });
    });

    // $(document).on('click', 'a', function(event) {
    //     event.preventDefault();

    //     $('html, body').animate({
    //         scrollTop: $($.attr(this, 'href')).offset().top
    //     }, 1000);
    // });




    // ************************************************************************************************************************************************************
    //
    //                                                                      BMP RESULT PAGE
    //                                  
    // ************************************************************************************************************************************************************
    var Great = [53, 191, 0, 1];
    var Good = [115, 197, 0, 1];
    var Normal = [181, 203, 0, 1];
    var Slight = [210, 168, 0, 1];
    var Bad = [216, 170, 0, 1];
    var Severe = [229, 0, 26, 1];

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
            color: [250, 250, 250, 1]
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
                })
            });
        }
        return [styleCache[level]];
    }

    function styleFlowFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().flowlevel;
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
                })
            });
        }
        return [styleCache[level]];
    }

    function styleTpFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().tplevel;
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
                })
            });
        }
        return [styleCache[level]];
    }

    function styleTnFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().tnlevel;
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
                })
            });
        }
        return [styleCache[level]];
    }

    var fieldOutput = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/fieldoutput.json',
            format: new ol.format.GeoJSON()
        }),
        style: styleFlowFunction
    });


    // var fieldResultArray = [];

    // fieldOutput.getSource().on('addfeature', function(event) {
    //     var fieldResultFeatures = fieldOutput.getSource().getFeatures();
    //     for (i = 0; i < fieldResultFeatures.length; i++) {
    //         var field = new Field();
    //         field.id = fieldResultFeatures[i].getProperties().Name;
    //         field.feature = fieldResultFeatures[i];
    //         fieldResultArray.push(field);
    //     }
    // });

    var subbasinOutput = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/basinoutput.json',
            format: new ol.format.GeoJSON()
        }),
        style: styleFlowFunction
    });

    // var subbasinResultArray = [];

    // subbasinOutput.getSource().on('addfeature', function(event) {
    //     var subbasinResultFeatures = subbasinOutput.getSource().getFeatures();
    //     for (i = 0; i < subbasinResultFeatures.length; i++) {
    //         var subbasin = new Subbasin();
    //         subbasin.id = subbasinResultFeatures[i].getProperties().Name;
    //         subbasin.feature = subbasinResultFeatures[i];
    //         subbasinResultArray.push(subbasin);
    //     }
    // });

    var resultMapPointerMove = new ol.interaction.Select({
        layers: [fieldOutput, subbasinOutput],
        condition: ol.events.condition.pointerMove
    });

    var resultMapSingleClick = new ol.interaction.Select({
        layers: [fieldOutput, subbasinOutput],
    });

    var resultMap = new ol.Map({
        target: 'model-result-map',
        layers: [tiledRaster, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    resultMap.addInteraction(resultMapSingleClick);
    resultMap.addInteraction(resultMapPointerMove);

    var resultInfo = document.getElementById('result-feature-info');

    var resultInfoOverlay = new ol.Overlay({
        element: document.getElementById('result-feature-info'),
        positioning: 'bottom-center',
        stopEvent: false
    });

    resultMap.addOverlay(resultInfoOverlay);

    $("#sel1").prop('disabled', true);


    // ****************************************************
    //              ResultMap Event Handler
    // ****************************************************


    // Map hover event, when hovering the map and feature existis, show the result information by the type of selected category

    var hoveredResultFeature;
    resultMapPointerMove.on('select', function(event) {
        hoveredResultFeature = event.selected[0];
        var num;
        if (hoveredResultFeature) {
            var coordinate = ol.extent.getCenter(hoveredResultFeature.getGeometry().getExtent());
            var offsetCoordinate = [coordinate[0], coordinate[1] + 500];
            resultInfoOverlay.setPosition(offsetCoordinate);
            if ($('#show-flow-result').prop("disabled") === true) {
                num = hoveredResultFeature.getProperties().flow;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(resultInfo).html("FeatureID: " + hoveredResultFeature.getProperties().name + "<br />" + "Flow " + num);
            }
            if ($('#show-sediment-result').prop("disabled") === true) {
                num = hoveredResultFeature.getProperties().sediment;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(resultInfo).html("FeatureID: " + hoveredResultFeature.getProperties().name + "<br />" + "Sediment " + num);
            }
            if ($('#show-n-result').prop("disabled") === true) {
                num = hoveredResultFeature.getProperties().tn;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(resultInfo).html("FeatureID: " + hoveredResultFeature.getProperties().name + "<br />" + "Total N " + num);
            }
            if ($('#show-p-result').prop("disabled") === true) {
                num = hoveredResultFeature.getProperties().tp;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(resultInfo).html("FeatureID: " + hoveredResultFeature.getProperties().name + "<br />" + "Total P " + num);
            }

            $(resultInfo).show();
            resultInfoOverlay.setPosition(offsetCoordinate);
        } else {
            $(resultInfo).hide();
        }
    });

    // Map select event, when select a feature, draw chart and show the feature ID to the task creation panel 
    var selectedResultFeature;
    resultMapSingleClick.on('select', function(event) {

        selectedResultFeature = event.selected[0];
        if (selectedResultFeature) {
            drawFeatureChart();

            // var feature = new Object();
            // feature.ID = parseInt(selectedResultFeature.getProperties().name);
            // feature.Type = determineFeatureType();
            // feature.ResultType = determineFeatureResultType();

            // var featureJson = JSON.stringify(feature);
            // $.ajax({
            //     url: '/chart',
            //     type: "post",
            //     contentType: 'application/json; charset=utf-8',
            //     data: featureJson,
            //     dataType: 'json',
            //     success: function(r) {
            //         var dataArray = [];

            //         for (var i = 0; i < r.length; i++) {
            //             r[i] = parseFloat(Math.round(r[i] * 100) / 100).toFixed(1);
            //             dataArray[i] = parseFloat(r[i]);
            //         }
            //         // alert(r);

            //         var average = [];
            //         var averageNum;

            //         if (feature.ResultType == "sediment") {
            //             averageNum = selectedResultFeature.getProperties().sediment;
            //             averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(1);
            //             averageNum = parseFloat(averageNum);
            //             for (i = 0; i < 10; i++) {
            //                 average[i] = averageNum;
            //             }
            //         }
            //         if (feature.ResultType == "flow") {
            //             averageNum = selectedResultFeature.getProperties().flow;
            //             averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(1);
            //             averageNum = parseFloat(averageNum);
            //             for (i = 0; i < 10; i++) {
            //                 average[i] = selectedResultFeature.getProperties().flow;
            //             }
            //         }
            //         if (feature.ResultType == "tn") {
            //             averageNum = selectedResultFeature.getProperties().tn;
            //             averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(1);
            //             averageNum = parseFloat(averageNum);
            //             for (i = 0; i < 10; i++) {
            //                 average[i] = selectedResultFeature.getProperties().tn;
            //             }
            //         }
            //         if (feature.ResultType == "tp") {
            //             averageNum = selectedResultFeature.getProperties().tp;
            //             averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(1);
            //             averageNum = parseFloat(averageNum);
            //             for (i = 0; i < 10; i++) {
            //                 average[i] = selectedResultFeature.getProperties().tp;
            //             }
            //         }

            //         $("#offsite-chart").attr("disabled", false);
            //         $("#onsite-chart").attr("disabled", true);

            //         $('#model-result-chart').highcharts({
            //             title: {
            //                 text: '',
            //                 x: -20 //center
            //             },

            //             xAxis: {
            //                 categories: ['2002', '2003', '2004', '2005', '2006', '2007',
            //                     '2008', '2009', '2010', '2011'
            //                 ]
            //             },
            //             yAxis: {
            //                 title: {
            //                     text: 'Value' + " ( " + feature.Type + " " + feature.ID + " )"
            //                 },
            //                 plotLines: [{
            //                     value: 0,
            //                     width: 1,
            //                     color: '#808080'
            //                 }]
            //             },
            //             credits: {
            //                 enabled: false
            //             },
            //             tooltip: {
            //                 valueSuffix: ''
            //             },
            //             legend: {
            //                 enabled: false
            //             },
            //             series: [{
            //                 name: 'Average',
            //                 data: average
            //             }, {
            //                 name: 'Yr',
            //                 data: dataArray
            //             }]
            //         });

            //     }
            // });


        } else {
            resultMapSingleClick.getFeatures().clear();
            if ($('#show-flow-result').prop("disabled") === true) {
                drawOutletChart("flow");
            }
            if ($('#show-sediment-result').prop("disabled") === true) {
                drawOutletChart("sediment");
            }
            if ($('#show-n-result').prop("disabled") === true) {
                drawOutletChart("tn");
            }
            if ($('#show-p-result').prop("disabled") === true) {
                drawOutletChart("tp");
            }
        }
    });


    function determineFeatureType() {
        if ($('#show-field-map-result').prop("disabled") === true) {
            return "field";
        } else
            return "subbasin";
    }

    function determineFeatureResultType() {
        if ($('#show-flow-result').prop("disabled") === true) {
            return "flow";
        }
        if ($('#show-sediment-result').prop("disabled") === true) {
            return "sediment";
        }
        if ($('#show-n-result').prop("disabled") === true) {
            return "tn";
        }
        if ($('#show-p-result').prop("disabled") === true) {
            return "tp";
        }
    }

    $("#show-flow-result").click(function(event) {
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[1];
        a.setStyle(styleFlowFunction);
        drawOutletChart("flow");
        $('#show-flow-result').attr("disabled", true);
        $('#show-flow-result').siblings().attr("disabled", false);

    });
    $("#show-sediment-result").click(function(event) {
        /* Act on the event */
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[1];
        a.setStyle(styleSedimentFunction);
        drawOutletChart("sediment");
        $('#show-sediment-result').attr("disabled", true);
        $('#show-sediment-result').siblings().attr("disabled", false);
    });
    $("#show-n-result").click(function(event) {
        /* Act on the event */
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[1];
        a.setStyle(styleTnFunction);
        drawOutletChart("tn");
        $('#show-n-result').attr("disabled", true);
        $('#show-n-result').siblings().attr("disabled", false);

    });
    $("#show-p-result").click(function(event) {
        /* Act on the event */
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[1];
        a.setStyle(styleTpFunction);
        drawOutletChart("tp");
        $('#show-p-result').attr("disabled", true);
        $('#show-p-result').siblings().attr("disabled", false);
    });


    $("#show-field-map-result").click(function(event) {
        resultMapSingleClick.getFeatures().clear();
        resultMap.removeLayer(subbasinOutput);
        resultMap.addLayer(fieldOutput);
        $('#show-subbasin-map-result').attr("disabled", false);
        $('#show-field-map-result').attr("disabled", true);
        $('#show-flow-result').attr("disabled", true);
        $('#show-flow-result').siblings().attr("disabled", false);
        drawOutletChart("flow");
    });

    $("#show-subbasin-map-result").click(function(event) {
        resultMapSingleClick.getFeatures().clear();
        resultMap.removeLayer(fieldOutput);
        resultMap.addLayer(subbasinOutput);
        $('#show-subbasin-map-result').attr("disabled", true);
        $('#show-field-map-result').attr("disabled", false);
        $('#show-flow-result').attr("disabled", true);
        $('#show-flow-result').siblings().attr("disabled", false);
        drawOutletChart("flow");
        /* Act on the event */
    });


    function drawOutletChart(s) {
        resultMapSingleClick.getFeatures().clear();

        $("#offsite-chart").attr("disabled", true);
        $("#onsite-chart").attr("disabled", false);

        var data = [];
        if (s === "sediment") {
            data = outletSediment;
        }
        if (s === "flow") {
            data = outletFlow;
        }
        if (s === "tp") {
            data = outletTp;
        }
        if (s === "tn") {
            data = outletTn;
        }
        $('#model-result-chart').highcharts({
            title: {
                text: '',
                x: -20 //center
            },

            xAxis: {
                categories: ['2002', '2003', '2004', '2005', '2006', '2007',
                    '2008', '2009', '2010', '2011'
                ]
            },
            yAxis: {
                title: {
                    text: 'Value'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            credits: {
                enabled: false
            },
            tooltip: {
                valueSuffix: ''
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Yr',
                data: data
            }]
        });
    }

    function drawFeatureChart() {
        var feature = new Object();
        feature.ID = parseInt(selectedResultFeature.getProperties().name);
        feature.Type = determineFeatureType();
        feature.ResultType = determineFeatureResultType();

        var featureJson = JSON.stringify(feature);
        $.ajax({
            url: '/chart',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: featureJson,
            dataType: 'json',
            success: function(r) {
                var dataArray = [];

                for (var i = 0; i < r.length; i++) {
                    r[i] = parseFloat(Math.round(r[i] * 100) / 100).toFixed(1);
                    dataArray[i] = parseFloat(r[i]);
                }
                // alert(r);

                var average = [];
                var averageNum;

                if (feature.ResultType == "sediment") {
                    averageNum = selectedResultFeature.getProperties().sediment;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(1);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "flow") {
                    averageNum = selectedResultFeature.getProperties().flow;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(1);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = selectedResultFeature.getProperties().flow;
                    }
                }
                if (feature.ResultType == "tn") {
                    averageNum = selectedResultFeature.getProperties().tn;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(1);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = selectedResultFeature.getProperties().tn;
                    }
                }
                if (feature.ResultType == "tp") {
                    averageNum = selectedResultFeature.getProperties().tp;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(1);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = selectedResultFeature.getProperties().tp;
                    }
                }

                $("#offsite-chart").attr("disabled", false);
                $("#onsite-chart").attr("disabled", true);

                $('#model-result-chart').highcharts({
                    title: {
                        text: '',
                        x: -20 //center
                    },

                    xAxis: {
                        categories: ['2002', '2003', '2004', '2005', '2006', '2007',
                            '2008', '2009', '2010', '2011'
                        ]
                    },
                    yAxis: {
                        title: {
                            text: 'Value' + " ( " + feature.Type + " " + feature.ID + " )"
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        valueSuffix: ''
                    },
                    legend: {
                        enabled: false
                    },
                    series: [{
                        name: 'Average',
                        data: average
                    }, {
                        name: 'Yr',
                        data: dataArray
                    }]
                });
                $("#sel1").val(selectedResultFeature.getProperties().name);

            }
        });
    }

    $('#search-result-prevent').submit(function(e) {
        e.preventDefault();
    });

    var subbasinFeatureCollections = [];
    var fieldFeatureCollections = [];
    $('#search-result-feature').keyup(function(e) {
        if (e.keyCode == 13) {
            var id = $(this).val();
            // alert(typeof id);
            if ($('#show-subbasin-map-result').prop("disabled") === true) {
                subbasinFeatureCollections = subbasinOutput.getSource().getFeatures();
                for (i = 0; i < subbasinFeatureCollections.length; i++) {
                    var temp = subbasinFeatureCollections[i].getProperties().name;
                    // alert(typeof temp);
                    if (id == temp) {
                        selectedResultFeature = subbasinFeatureCollections[i];
                    }
                }
            }
            if ($('#show-field-map-result').prop("disabled") === true) {
                fieldFeatureCollections = fieldOutput.getSource().getFeatures();
                for (i = 0; i < fieldFeatureCollections.length; i++) {

                    if (id == fieldFeatureCollections[i].getProperties().name) {
                        selectedResultFeature = fieldFeatureCollections[i];
                    }
                }
            }

            resultMapSingleClick.getFeatures().clear();
            resultMapSingleClick.getFeatures().push(selectedResultFeature);

            drawFeatureChart();
        }
    });




    $("#result-issue-submit").click(function(event) {

        $("#result-issue-talk").hide();

        if ($("#result-issue-title").val().length === 0) {
            $("#result-issue-title").addClass("input-err");
            $("#result-issue-title").prop("placeholder", "Please write issue title");
        } else {
            $("#result-issue-title").removeClass("input-err");
        }
        if ($("#sel1").val().length === 0) {
            $("#sel1").addClass("input-err");
            $("#sel1").prop("placeholder", "Please select a feature");
        } else {
            $("#sel1").removeClass("input-err");

        }

        if ($("#sel1").val().length !== 0 && $("#result-issue-title").val().length !== 0) {
            var s = $("#user-id").html();
            var currentdate = new Date();
            var datetime = " " + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
            $("#result-issue-timeline").append(' <li class="timeline-inverted"><div class="timeline-badge"><i class="glyphicon glyphicon-check"></i></div><div class="timeline-panel"><div class="timeline-heading"><p><small class="text-muted"><i class="glyphicon glyphicon-time"></i>' + datetime + " via " + s + '</small></p></div><div class="timeline-body"><p>' + $("#result-issue-title").val() + '</p></div></li>');
            $(".timeline-inverted").click(function(event) {
                $("#result-issue-talk").css('height', $("#responsive-timeline").height() + 5);
                $("#result-issue-talk").css('width', $("#result-issues").width());
                // $("#talk-reply").css('top', $("#result-issue-talk") - 200);

                var h = $("#result-issue-talk").height() - 190;
                $("#talk-content").css('height', h + "px");

                // $("#talk-content").css('height', $("#result-issue-talk") - 200);
                $("#result-issue-talk").show("slow");
                // $("#talk-title").append('<p>Issue Titile:' + $(this) + '' + '</p><p>Description: </p>')


                // alert("hello");
            });
        }
    });


    $("#result-issue-comment-reply").click(function(event) {
        /* Act on the event */
        $("#talk-content").append(' <hr> ' + $("#issue-comment").val());
        $("#issue-comment").val("");
    });

    $("#result-issue-comment-close").click(function(event) {
        /* Act on the event */
        $("#result-issue-talk").hide();

    });

    $("#bmp-compare-btn").click(function(event) {
        /* Act on the event */
        $("html, body").animate({ scrollTop: $('#bmp-compare-page').offset().top }, 1000);
        $("#bmp-compare-page").css('visibility', 'visible');


    });


    // ************************************************************************************************************************************************************
    //
    //                                                                      BMP COMPARE PAGE
    //                                  
    // ************************************************************************************************************************************************************
    var userName = $("#user-id").html();
    var scenarioName = $("#scenario-name").html();
    var scenarioID = $("#scenario-id").html();

    var scenarioInfo = new Object();
    scenarioInfo.userName = userName;
    scenarioInfo.scenarioName = scenarioName;
    scenarioInfo.scenarioID = scenarioID;


    var fieldCompare = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/fieldcompare.json',
            format: new ol.format.GeoJSON()
        }),
        style: styleFlowFunction
    });


    var subbasinCompare = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/basincompare.json',
            format: new ol.format.GeoJSON()
        }),
        style: styleFlowFunction
    });

    var compareMap = new ol.Map({
        target: 'model-compare-map',
        layers: [tiledRaster, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });


    $("#show-flow2").click(function(event) {
        var a = compareMap.getLayers().getArray()[1];
        a.setStyle(styleFlowFunction);
        $('#show-flow2').attr("disabled", true);
        $('#show-flow2').siblings().attr("disabled", false);

    });
    $("#show-sediment2").click(function(event) {
        /* Act on the event */
        var a = compareMap.getLayers().getArray()[1];
        a.setStyle(styleSedimentFunction);
        $('#show-sediment2').attr("disabled", true);
        $('#show-sediment2').siblings().attr("disabled", false);
    });
    $("#show-n2").click(function(event) {
        /* Act on the event */
        var a = compareMap.getLayers().getArray()[1];
        a.setStyle(styleTnFunction);
        $('#show-n2').attr("disabled", true);
        $('#show-n2').siblings().attr("disabled", false);

    });
    $("#show-p2").click(function(event) {
        /* Act on the event */
        var a = compareMap.getLayers().getArray()[1];
        a.setStyle(styleTpFunction);
        $('#show-p2').attr("disabled", true);
        $('#show-p2').siblings().attr("disabled", false);
    });


    $("#show-field-map2").click(function(event) {
        compareMap.removeLayer(subbasinCompare);
        compareMap.addLayer(fieldCompare);
        $('#show-subbasin-map2').attr("disabled", false);
        $('#show-field-map2').attr("disabled", true);
        $('#show-flow2').attr("disabled", true);
        $('#show-flow2').siblings().attr("disabled", false);
    });

    $("#show-subbasin-map2").click(function(event) {
        compareMap.removeLayer(fieldCompare);
        compareMap.addLayer(subbasinCompare);
        $('#show-subbasin-map2').attr("disabled", true);
        $('#show-field-map2').attr("disabled", false);
        $('#show-flow2').attr("disabled", true);
        $('#show-flow2').siblings().attr("disabled", false);
        /* Act on the event */
    });

    $("#accordianmenu p").click(function() {
        $("#accordianmenu p").css({ "background-color": "white", "color": "black" });
        $(this).css({ "background-color": "rgb(66,139,202)", "color": "white" });
        $("#accordianmenu ul ul").slideUp();
        if (!$(this).next().next().is(":visible")) {
            $(this).next().next().slideDown();
        }

        var scenario = JSON.stringify(scenarioInfo);
        $.ajax({
            url: '/readmodelresult',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: scenario,
            dataType: 'json',
            success: function(r) {

                // outletSediment = r[0].ResultData;
                // outletFlow = r[1].ResultData;
                // outletTp = r[2].ResultData;
                // outletTn = r[3].ResultData;

                $('#show-subbasin-map2').attr("disabled", true);
                $('#show-field-map2').attr("disabled", false);
                compareMap.removeLayer(compareMap.getLayers().getArray()[1]);

                if ($('#show-field-map2').prop("disabled") === true) {
                    compareMap.addLayer(fieldCompare);
                    $("#show-field-map2").attr('disabled', true);
                    $("#show-subbasin-map2").attr('disabled', false);
                    $('#show-flow2').attr("disabled", true);
                    $('#show-flow2').siblings().attr("disabled", false);

                }
                if ($('#show-subbasin-map2').prop("disabled") === true) {
                    compareMap.addLayer(subbasinCompare);
                    $("#show-subbasin-map2").attr('disabled', true);
                    $("#show-field-map2").attr('disabled', false);
                    $('#show-flow2').attr("disabled", true);
                    $('#show-flow2').siblings().attr("disabled", false);
                }

                alert("hello");
            }
        });

    });

    // ************************************************************************************************************************************************************
    //
    //                                                                      COMPARE RESULT PAGE
    //                                  
    // ************************************************************************************************************************************************************

    var compareresultMap = new ol.Map({
        target: 'compare-result-map',
        layers: [tiledRaster, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    // ************************************************************************************************************************************************************
    //
    //                                                                      BMP OPTIMIZE PAGE
    //                                  
    // ************************************************************************************************************************************************************

    var optimizeresultMap = new ol.Map({
        target: 'optimize-result-map',
        layers: [tiledRaster, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });




    // ****************************************************
    //                      DRAW CHART
    // ****************************************************



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
