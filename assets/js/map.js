$(document).ready(function() {

    // ****************************************************
    //              Dimension calculation
    //   calculate the height for pages and sections
    // ****************************************************
    var userName = $("#user-id").html();
    var scenarioName = $("#scenario-name").html();
    var scenarioID = $("#scenario-id").html();


    var scenarioInfo = new Object();
    scenarioInfo.userName = userName.trim();
    scenarioInfo.scenarioName = scenarioName.trim();
    scenarioInfo.scenarioID = scenarioID.trim();


    var wascobToField = [68,
        113,
        113,
        64,
        64,
        113,
        113,
        113,
        54,
        113,
        113,
        53,
        113,
        113,
        113,
        102,
        126,
        126,
        126,
        92,
        35,
        133,
        86,
        133,
        88,
        85,
        85,
        85,
        84,
        85,
        85,
        132
    ];
    var wascobToSubbasin = [1,
        4,
        7,
        9,
        10,
        14,
        15,
        20,
        21,
        22,
        23,
        25,
        27,
        28,
        29,
        32,
        36,
        40,
        41,
        42,
        43,
        44,
        46,
        48,
        50,
        53,
        55,
        56,
        57,
        59,
        60,
        64,
    ];

    var progress = "bmpSelection";
    var resizePage = 1;

    function setHeight() {
        var windowHeight = $(window).innerHeight;


        $('#bmp-select-table').css('height', $(".map-size-adjust").height() - $("#model-run-btn").height() - 20);


        $("#model-result-page").css('height', $('#bmp-select-page').outerHeight());
        $(".scenario-task").css('height', $('#bmp-select-page').outerHeight() - $("#process-control").outerHeight());
        $("#result-issues").css('height', $('.scenario-task').outerHeight() - $(".model-issue-management").outerHeight() - 40);
        $("#responsive-timeline").css('height', $("#result-issues").outerHeight() - $(".report-generate").outerHeight());
        $('.model-result-map').css('height', $(".scenario-task").height() - $("#model-result-chart").height() - $(".map-tool-bar").height() * 2 - 20);


        $("#model-compare-page").css('height', $('#bmp-select-page').outerHeight());
        $("#result-issues2").css('height', $('.scenario-task').outerHeight() - $(".model-issue-management").outerHeight() - 40);
        $("#responsive-timeline2").css('height', $("#result-issues2").outerHeight() - $(".report-generate").outerHeight());
        $('.model-result-map').css('height', $(".scenario-task").height() - $("#model-compare-chart").height() - $(".map-tool-bar").height() * 2 - 20);

        $('#accordianmenu').css('height', $(".map-size-adjust").height() - $("#model-compare-btn").height() - 50);

        $('#bmp-optimize-table').css('height', $(".model-result-map").height() + $("#model-optimize-chart").height() - $("#model-optimize-input").height() - $(".report-generate").height() - 60);


        $("#loading-page").css('height', $("#bmp-select-page").height() + 150);
        $("#loading-info").css('margin-top', ($("#loading-page").height() - 400) / 2);

        $("#result-issue-talk").css('height', $("#responsive-timeline").height() + 5);
        $("#result-issue-talk").css('width', $("#result-issues").width());
        var h = $("#result-issue-talk").height() - 190;
        $("#talk-content").css('height', h + "px");
        $("#result-issue-talk2").css('height', $("#responsive-timeline2").height() + 5);
        $("#result-issue-talk2").css('width', $("#result-issues2").width());
        var h2 = $("#result-issue-talk2").height() - 190;
        $("#talk-content2").css('height', h2 + "px");

        // $("#view-report").css('top', position.top);

        // $("#result-issue-talk").css('left', $(".scenario-task").position().left);

        switch (resizePage) {
            case 1:
                $("html, body").animate({ scrollTop: $('#bmp-select-page').offset().top }, 'slow');
                break;
            case 2:
                $("html, body").animate({ scrollTop: $('#model-result-page').offset().top }, 'slow');
                break;
            case 3:
                $("html, body").animate({ scrollTop: $('#bmp-compare-page').offset().top }, 'slow');
                break;
            case 4:
                $("html, body").animate({ scrollTop: $('#model-compare-page').offset().top }, 'slow');
                break;
            case 5:
                $("html, body").animate({ scrollTop: $('#model-optimize-page').offset().top }, 'slow');
                break;
            default:
                // $("html, body").animate({ scrollTop: $('#model-result-page').offset().top }, 1000);
                break;
        }

    }

    $(".report_exit").hide();

    setHeight();

    $(window).resize(function() {
        setHeight();
    });

    $("html, body").animate({ scrollTop: $('#bmp-select-page').offset().top }, 500);


    $("#result-issue-talk").hide();
    $("#result-issue-talk2").hide();

    $("#generate-report-btn").click(function(event) {
        /* Act on the event */
        $(".report_enter").slideUp("slow", function() {
            $(".report_exit").show("slow");
        });

    });

    $("#generate-report-btn2").click(function(event) {
        /* Act on the event */
        $(".report_enter").slideUp("slow", function() {
            $(".report_exit").show("slow");
        });

    });

    $("#close-report").click(function(event) {
        /* Act on the event */
        $(".report_exit").hide();
        $(".report_enter").show("slow");
    });

    $("#close-report2").click(function(event) {
        /* Act on the event */
        $(".report_exit").hide();
        $(".report_enter").show("slow");
    });

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

    var boundaryStyle = new ol.style.Style({
        // fill: new ol.style.Fill({
        //     color: 'rgba(17,34,68,0.6)'
        // }),
        stroke: new ol.style.Stroke({
            color: 'black',
        })
    });

    var boundaryJsonp = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/boundary.geojson',
            format: new ol.format.GeoJSON()
        }),
        style: boundaryStyle
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
            color: 'rgba(17,34,68,0.6)'
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
            color: 'rgba(87,178,47,0.6)'
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
        condition: ol.events.condition.pointerMove,
        filter: function(feature, layer) {
            if (layer === fieldJsonp) {
                if (feature.getProperties().Name > 600) {
                    return false;
                }
                return true;
            }
            return true;
        },
    });

    var selectSingleClick = new ol.interaction.Select({
        layers: [fieldJsonp, subbasinJsonp],
        filter: function(feature, layer) {
            if (layer === fieldJsonp) {
                if (feature.getProperties().Name > 600) {
                    return false;
                }
                return true;
            }
            return true;
        },
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
        layers: [tiledRaster, streamJsonp, subbasinJsonp],
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
        element: $('#select-panel1').get(0)
    });

    map.addOverlay(bmpOverlay);

    var bmpOverlay2 = new ol.Overlay({
        element: $('#select-panel2').get(0)
    });

    map.addOverlay(bmpOverlay2);

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
            color: 'rgba(242,146,52,0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: 'white'
        })
    });

    var searchedStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(0, 108, 23, 0.6)'
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


    selectSingleClick.on('select', function(event) {
        // $(element).hide();
        $("#select-panel1").hide();
        $("#select-panel2").hide();
        $("#bmp-select-table table tr").removeClass('rowSelected');
        if (selectedFeature) {
            selectedFeature.setStyle(null);
        }
        selectedFeature = event.selected[0];
        if (selectedFeature) {

            var coordinate = ol.extent.getCenter(selectedFeature.getGeometry().getExtent());
            var offsetCoordinate = [coordinate[0] + 400, coordinate[1] + 400];
            var wascobExist = false;
            if (selectedLayer == "subbasin") {
                for (var i = 1; i < wascobToSubbasin.length; i++) {
                    if (selectedFeature.getProperties().Name == wascobToSubbasin[i]) {
                        $("#select-panel1").show();
                        bmpOverlay.setPosition(offsetCoordinate);
                        wascobExist = true;

                    }
                }
                if (wascobExist === false) {
                    $("#select-panel2").show();
                    bmpOverlay2.setPosition(offsetCoordinate);

                }

            }

            if (selectedLayer == "field") {
                for (var i = 1; i < wascobToField.length; i++) {
                    if (selectedFeature.getProperties().Name == wascobToField[i]) {
                        wascobExist = true;
                        $("#select-panel1").show();
                        bmpOverlay.setPosition(offsetCoordinate);
                    }
                }
                if (wascobExist === false) {

                    $("#select-panel2").show();
                    bmpOverlay2.setPosition(offsetCoordinate);

                }

            }

            // $(".bmp-select-tool").css('visibility', 'visible');

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
            // if (selectedFeature)
            // {
            //     selectedFeature.setStyle(null);
            // }
            // $(".bmp-select-tool").hide();

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
        $(".bmp-select-tool").hide();
        subbasinTable = $('#bmp-select-table').html();
        // alert(subbasinTable);
        if (selectedFeature) {
            selectedFeature.setStyle(null);
        }
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
        $(".bmp-select-tool").hide();
        fieldTable = $('#bmp-select-table').html();
        if (selectedFeature) {
            selectedFeature.setStyle(null);
        }
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
    $("#select-panel1 button").click(function(event) {
        selectedFeatureID.length = 0;
        $(element).hide();
        var bmpCode;
        var ccSelected = 'N';
        var ctSelected = 'N';
        var nmSelected = 'N';
        var wascobSelected = 'N';

        var selectedID = selectedFeature.getProperties().Name;
        if ($("#ct").prop("checked") && $("#nm").prop("checked") && $("#cc").prop("checked")) {
            bmpCode = 9;
            ctSelected = 'Y';
            nmSelected = 'Y';
            ccSelected = 'Y';
            checkWascob();

        } else if ($("#ct").prop("checked") && $("#nm").prop("checked")) {
            bmpCode = 6;
            ctSelected = 'Y';
            nmSelected = 'Y';
            checkWascob();

        } else if ($("#ct").prop("checked") && $("#cc").prop("checked")) {
            bmpCode = 7;
            ctSelected = 'Y';
            ccSelected = 'Y';
            checkWascob();

        } else if ($("#nm").prop("checked") && $("#cc").prop("checked")) {
            bmpCode = 8;
            nmSelected = 'Y';
            ccSelected = 'Y';
            checkWascob();

        } else if ($("#ct").prop("checked")) {
            bmpCode = 3;
            ctSelected = 'Y';
            checkWascob();

        } else if ($("#nm").prop("checked")) {
            bmpCode = 4;
            nmSelected = 'Y';
            checkWascob();

        } else if ($("#cc").prop("checked")) {
            bmpCode = 5;
            ccSelected = 'Y';
            checkWascob();
        } else if ($("#wascobs").prop("checked")) {
            wascobSelected = 'Y';
        } else bmpCode = null;

        function checkWascob() {
            if ($("#wascobs").prop("checked")) {
                wascobSelected = 'Y';
            } else wascobSelected = 'N';
        }

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
                $('#bmp-select-table table').append('<tr class="table-data rowSelected"><td style="padding-top:11px;" class="selectedFeatureID">' + selectedID + '</td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ccSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ctSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + nmSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + wascobSelected + '</a></td><td class="deletescenario" style="white-space: nowrap;width: 1%;"><a class="btn btn-danger" aria-label="Delete"><i class="fa fa-trash-o " aria-hidden="true"></i></a></td><td style="display:none;" class="bmp_code">' + bmpCode + '</td></tr>');
            } else {
                $('#bmp-select-table table').append('<tr class="table-data"><td style="padding-top:11px;" class="selectedFeatureID">' + selectedID + '</td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ccSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ctSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + nmSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + wascobSelected + '</a></td><td class="deletescenario" style="white-space: nowrap;width: 1%;"><a class="btn btn-danger" aria-label="Delete"><i class="fa fa-trash-o " aria-hidden="true"></i></a></td><td style="display:none;" class="bmp_code">' + bmpCode + '</td></tr>');
            }

            $(".bmp-select-tool").hide();
            addTableEvent();
            selectSingleClick.getFeatures().clear();
        } else {
            $(".bmp-select-tool").hide();
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

    $("#select-panel2 button").click(function(event) {
        selectedFeatureID.length = 0;
        $(element).hide();
        var bmpCode;
        var ccSelected = 'N';
        var ctSelected = 'N';
        var nmSelected = 'N';

        var selectedID = selectedFeature.getProperties().Name;
        if ($("#ct2").prop("checked") && $("#nm2").prop("checked") && $("#cc2").prop("checked")) {
            bmpCode = 9;
            ctSelected = 'Y';
            nmSelected = 'Y';
            ccSelected = 'Y';
        } else if ($("#ct2").prop("checked") && $("#nm2").prop("checked")) {
            bmpCode = 6;
            ctSelected = 'Y';
            nmSelected = 'Y';
        } else if ($("#ct2").prop("checked") && $("#cc2").prop("checked")) {
            bmpCode = 7;
            ctSelected = 'Y';
            ccSelected = 'Y';
        } else if ($("#nm2").prop("checked") && $("#cc2").prop("checked")) {
            bmpCode = 8;
            nmSelected = 'Y';
            ccSelected = 'Y';
        } else if ($("#ct2").prop("checked")) {
            bmpCode = 3;
            ctSelected = 'Y';
        } else if ($("#nm2").prop("checked")) {
            bmpCode = 4;
            nmSelected = 'Y';
        } else if ($("#cc2").prop("checked")) {
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
                $('#bmp-select-table table').append('<tr class="table-data rowSelected"><td style="padding-top:11px;" class="selectedFeatureID">' + selectedID + '</td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ccSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ctSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + nmSelected + '</a></td><td style="padding-top:11px;"><a">' + 'N' + '</a></td><td class="deletescenario" style="white-space: nowrap;width: 1%;"><a class="btn btn-danger" aria-label="Delete"><i class="fa fa-trash-o " aria-hidden="true"></i></a></td><td style="display:none;" class="bmp_code">' + bmpCode + '</td></tr>');
            } else {
                $('#bmp-select-table table').append('<tr class="table-data"><td style="padding-top:11px;" class="selectedFeatureID">' + selectedID + '</td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ccSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + ctSelected + '</a></td><td style="padding-top:11px;"><a class="table-edit" data-type="select">' + nmSelected + '</a></td><td style="padding-top:11px;"><a>' + 'N' + '</a></td><td class="deletescenario" style="white-space: nowrap;width: 1%;"><a class="btn btn-danger" aria-label="Delete"><i class="fa fa-trash-o " aria-hidden="true"></i></a></td><td style="display:none;" class="bmp_code">' + bmpCode + '</td></tr>');

            }

            $(".bmp-select-tool").hide();
            addTableEvent();
            selectSingleClick.getFeatures().clear();
        } else {
            $(".bmp-select-tool").hide();
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
            $(".bmp-select-tool").hide();
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
                lastfadeinBox = thetruefinalfadeinBox;
                thetruefinalfadeinBox = finalfadeinBox;
                finalfadeinBox = fadeoutBox;
                fadeoutBox = temp;
                setTimeout(fade, 10000);
            });
        }, 10000);
    });

    var outletSediment = [];
    var outletFlow = [];
    var outletTp = [];
    var outletTn = [];
    var outletCompareSediment = [];
    var outletCompareFlow = [];
    var outletCompareTp = [];
    var outletCompareTn = [];
    var bmpAssignmentArray = [];
    var outletSedimentAverage = 0;
    var outletFlowAverage = 0;
    var outletTpAverage = 0;
    var outletTnAverage = 0;
    $("#model-run-btn").click(function(event) {
        $("#process-control").html('<div class="stepwizard-row">' + '<div class="liner"></div>' + '<div class="stepwizard-step">' + '<a id="process-icon1" class="btn icon-btn btn-danger"><span class="glyphicon btn-glyphicon glyphicon-grain img-circle text-danger"></span><span id="process-status1"></span></a>' + '</div>' + '<div class="stepwizard-step">' + '<a id="process-icon2" class="btn icon-btn btn-default"><span  class="glyphicon btn-glyphicon glyphicon-cog img-circle text-default"></span><span id="process-status2"></span></a>' + '</div>' + '<div class="stepwizard-step">' + '<a id="process-icon3" class="btn icon-btn btn-default" ><span class="glyphicon btn-glyphicon glyphicon-random img-circle text-default"></span><span id="process-status3"></span></a>' + '<p>' + '<small class="text-muted"><i class="glyphicon glyphicon-time"></i> Optional</small>' + '</p>' + '</div>' + '<div class="stepwizard-step">' + '<a id="process-icon4" class="btn icon-btn btn-default" ><span class="glyphicon btn-glyphicon glyphicon-usd img-circle text-default"></span><span id="process-status4"></span></a>' + '<p>' + '<small class="text-muted"><i class="glyphicon glyphicon-time"></i> Optional</small>' + '</p>' + '</div>' + '<div class="stepwizard-step">' + '<a id="process-icon5" class="btn icon-btn btn-default" ><span class="glyphicon btn-glyphicon glyphicon-save-file img-circle text-default"></span><span id="process-status5"></span></a>' + '</div>' + '</div>');
        $("#process-icon1").on('click', function(event) {
            resizePage = 1;
            $("html, body").animate({ scrollTop: $('#bmp-select-page').offset().top }, 'slow');
        });

        $("#process-icon2").on('click', function(event) {
            if (progress == "bmpEvaluation" || progress == "checkScenario" || progress == "compareScenario" || progress == "optimizeScenario") {
                resizePage = 2;
                $("html, body").animate({ scrollTop: $('#model-result-page').offset().top }, 'slow');
            }
        });

        $("#process-icon3").on('click', function(event) {
            if (progress == "checkScenario" || progress == "compareScenario" || progress == "optimizeScenario") {
                resizePage = 3;
                $("html, body").animate({ scrollTop: $('#bmp-compare-page').offset().top }, 'slow');
            }
        });

        $("#process-icon4").on('click', function(event) {
            if (progress == "compareScenario" || progress == "optimizeScenario") {
                resizePage = 4;
                $("html, body").animate({ scrollTop: $('#model-compare-page').offset().top }, 'slow');
            }
        });

        $("#process-icon5").on('click', function(event) {
            if (progress == "optimizeScenario") {
                resizePage = 5;
                $("html, body").animate({ scrollTop: $('#model-optimize-page').offset().top }, 'slow');
            }
        });

        $(document).trigger('show-loading-page');
        bmpAssignmentArray.length = 0;

        $('#bmp-select-table table .selectedFeatureID').each(function(index, el) {
            var bmpAssignment = new Object();
            bmpAssignment.featureID = parseInt($(this).text());
            var cc, ct, nm, wascob;
            cc = $(this).next().text();
            ct = $(this).next().next().text();
            nm = $(this).next().next().next().text();
            wascob = $(this).next().next().next().next().text();
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
            bmpAssignment.wascob = wascob;
            // bmpAssignment.config = $("#bmp-select-table").html();
            bmpAssignmentArray.push(bmpAssignment);
        });

        var bmpConfig = $("#bmp-select-table").html();
        scenarioInfo.Config = bmpConfig.trim();
        var scenarioConfig = JSON.stringify(scenarioInfo);


        $.ajax({
            url: '/writeconfig',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: scenarioConfig,
            dataType: 'json',
            success: function(r) {
                console.log("hello");
            },
        });

        var jsonArray = JSON.stringify(bmpAssignmentArray);
        $.ajax({
            url: '/runmodel',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: jsonArray,
            dataType: 'json',
            success: function(r) {
                resizePage = 2;
                progress = "bmpEvaluation";
                var b = resultMap.getLayers().getArray()[1];
                b.setStyle(outletSelectStyle);
                $("#process-icon1").removeClass('btn-danger').addClass('btn-success');
                $("#process-icon1 span:first").removeClass('text-danger').addClass('text-success');

                $("#process-icon2").removeClass('btn-default').addClass('btn-danger');
                $("#process-icon2 span:first").removeClass('text-default').addClass('text-danger');

                outletSediment = r[0].ResultData;
                outletFlow = r[1].ResultData;
                outletTp = r[2].ResultData;
                outletTn = r[3].ResultData;

                outletSedimentAverage = 0;
                outletFlowAverage = 0;
                outletTpAverage = 0;
                outletTnAverage = 0;

                for (var i = 0; i < outletSediment.length; i++) {
                    outletSedimentAverage = outletSedimentAverage + outletSediment[i];
                    outletFlowAverage = outletFlowAverage + outletFlow[i];
                    outletTpAverage = outletTpAverage + outletTp[i];
                    outletTnAverage = outletTnAverage + outletTn[i];
                }

                outletSedimentAverage = outletSedimentAverage / 10;
                outletFlowAverage = outletFlowAverage / 10;
                outletTpAverage = outletTpAverage / 10;
                outletTnAverage = outletTnAverage / 10;


                outlet.setProperties({
                    'sediment': outletSedimentAverage,
                    'flow': outletFlowAverage,
                    'tp': outletTpAverage,
                    'tn': outletTnAverage,
                    'name': 'outlet'
                });


                resultMap.removeLayer(resultMap.getLayers().getArray()[2]);
                // refreshBasinSource(subbasinOutput);
                // refreshFieldSource(fieldOutput);
                subbasinOutput.getSource().clear();
                fieldOutput.getSource().clear();

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

                $("#loading-page").css("visibility", "hidden");
                $("#model-result-page").css('visibility', 'visible');
                $("html, body").animate({ scrollTop: $('#model-result-page').offset().top }, 1000);
                $("#progress-info").empty();
                $("#progress-info").append('<div id="box1"><p><span> Preparing modeling files ... </span></p></div><div id="box2"><p><span> Modeling BMPs ... </span></p></div>  <div id="box3"><p><span> Writing results to database ... </span></p></div>  <div id="box4"><p><span> Visualizing the output ... </span></p></div><div id="box5"><p><span> Thanks for your patience ... </span></p></div><div id="box6"><p><span> Finishing in seconds ... </span></p></div>   ');

            }
        });
    });

    function refreshBasinSource(vectorLayer) {
        var now = Date.now();
        var source = vectorLayer.getSource();
        var format = new ol.format.GeoJSON();
        var url = '/assets/data/geojson/basinoutput.json';
        var loader = ol.featureloader.xhr(url, format);

        source.clear();
        loader.call(source, [], 1, 'EPSG:3857');
    }

    function refreshFieldSource(vectorLayer) {
        var now = Date.now();
        var source = vectorLayer.getSource();
        var format = new ol.format.GeoJSON();
        var url = '/assets/data/geojson/fieldoutput.json';
        var loader = ol.featureloader.xhr(url, format);

        source.clear();
        loader.call(source, [], 1, 'EPSG:3857');
    }
    // ************************************************************************************************************************************************************
    //
    //                                                                      BMP RESULT PAGE
    //                                  
    // ************************************************************************************************************************************************************

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

    function styleCostFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().costlevel;
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

    function styleRevenueFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().revenuelevel;
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

    function styleNetReturnFunction(feature, resolution) {
        var properties = feature.getProperties();
        var level = feature.getProperties().netreturnlevel;
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

    var subbasinOutput = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/basinoutput.json',
            format: new ol.format.GeoJSON()
        }),
        style: styleFlowFunction
    });

    // ****************************************************
    // Outlet layer loaded from geoserver in Jsonp format
    // Be sure to enable the Jsonp function in the web.xml
    // of Geoserver     
    // ****************************************************

    var outletDefaultStyle = new ol.style.Style({
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: [247, 161, 49, 1]
            }),
            stroke: new ol.style.Stroke({
                color: 'white',
                width: 1
            }),
            radius: 5
        }),
        fill: new ol.style.Fill({
            color: [247, 161, 49, 1]
        }),
        stroke: new ol.style.Stroke({
            color: 'white',
            width: 1
        })
    });

    var outletSelectStyle = [
        new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: [247, 161, 49, 1]
                }),
                stroke: new ol.style.Stroke({
                    color: [230, 230, 100, 1],
                    width: 1
                }),
                radius: 10
            }),
            fill: new ol.style.Fill({
                color: [247, 161, 49, 1]
            }),
            stroke: new ol.style.Stroke({
                color: [230, 230, 100, 1],
                width: 2
            })
        }),
        new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: [247, 161, 49, 1]
                }),
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: 5
                }),
                radius: 10
            }),
            fill: new ol.style.Fill({
                color: [247, 161, 49, 1]
            }),
            stroke: new ol.style.Stroke({
                color: 'white',
                width: 5
            })
        })
    ];

    var outlet = new ol.Feature({});
    var point_geom = new ol.geom.Point(
        ol.proj.transform([-81.7132830619812, 43.61527726000183], 'EPSG:4326', 'EPSG:3857')
    );
    outlet.setGeometry(point_geom);

    var outletLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [outlet]
        }),
        zIndex: 10
    });

    outletLayer.setStyle(outletDefaultStyle);
    // var outlet = new ol.Feature({ geometry: new ol.geom.Point(ol.proj.transform([43.569678, -81.709828], 'EPSG:4326', 'EPSG:3857')) });
    // var outletLayer = new ol.layer.Vector({
    //     source: new ol.source.Vector({
    //         features: [outlet]
    //     }),
    //     style: outletDefaultStyle,
    //     zIndex:10
    // });

    var resultMapPointerMove = new ol.interaction.Select({
        layers: [fieldOutput, outletLayer, subbasinOutput],
        condition: ol.events.condition.pointerMove
    });

    var resultMapSingleClick = new ol.interaction.Select({
        layers: [fieldOutput, subbasinOutput],
    });

    var resultMap = new ol.Map({
        target: 'model-result-map',
        layers: [tiledRaster, outletLayer, fieldJsonp],
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

            if ($('#show-c-result').prop("disabled") === true) {
                num = hoveredResultFeature.getProperties().cost;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(resultInfo).html("FeatureID: " + hoveredResultFeature.getProperties().name + "<br />" + "Cost " + num);
            }
            if ($('#show-nr-result').prop("disabled") === true) {
                num = hoveredResultFeature.getProperties().netreturn;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(resultInfo).html("FeatureID: " + hoveredResultFeature.getProperties().name + "<br />" + "NetReturn " + num);
            }
            if ($('#show-r-result').prop("disabled") === true) {
                num = hoveredResultFeature.getProperties().revenue;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(resultInfo).html("FeatureID: " + hoveredResultFeature.getProperties().name + "<br />" + "Revenue " + num);
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
            var b = resultMap.getLayers().getArray()[1];
            b.setStyle(outletDefaultStyle);
            drawFeatureChart();
        } else {
            var a = resultMap.getLayers().getArray()[1];
            a.setStyle(outletSelectStyle);
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
            if ($('#show-c-result').prop("disabled") === true) {
                drawOutletChart("cost");
            }
            if ($('#show-r-result').prop("disabled") === true) {
                drawOutletChart("revenue");
            }
            if ($('#show-nr-result').prop("disabled") === true) {
                drawOutletChart("netreturn");
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
        if ($('#show-c-result').prop("disabled") === true) {
            return "cost";
        }
        if ($('#show-r-result').prop("disabled") === true) {
            return "revenue";
        }
        if ($('#show-nr-result').prop("disabled") === true) {
            return "netreturn";
        }
    }

    $("#show-flow-result").click(function(event) {
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[2];
        a.setStyle(styleFlowFunction);
        var b = resultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        drawOutletChart("flow");
        $('#show-flow-result').attr("disabled", true);
        $('#show-flow-result').siblings().attr("disabled", false);

    });
    $("#show-sediment-result").click(function(event) {
        /* Act on the event */
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[2];
        a.setStyle(styleSedimentFunction);
        var b = resultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        drawOutletChart("sediment");
        $('#show-sediment-result').attr("disabled", true);
        $('#show-sediment-result').siblings().attr("disabled", false);
    });
    $("#show-n-result").click(function(event) {
        /* Act on the event */
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[2];
        a.setStyle(styleTnFunction);
        var b = resultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        drawOutletChart("tn");
        $('#show-n-result').attr("disabled", true);
        $('#show-n-result').siblings().attr("disabled", false);

    });
    $("#show-p-result").click(function(event) {
        /* Act on the event */
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[2];
        a.setStyle(styleTpFunction);
        var b = resultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        drawOutletChart("tp");
        $('#show-p-result').attr("disabled", true);
        $('#show-p-result').siblings().attr("disabled", false);
    });


    $("#show-c-result").click(function(event) {
        /* Act on the event */
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[2];
        a.setStyle(styleCostFunction);
        var b = resultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        drawOutletChart("cost");
        $('#show-c-result').attr("disabled", true);
        $('#show-c-result').siblings().attr("disabled", false);
    });

    $("#show-r-result").click(function(event) {
        /* Act on the event */
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[2];
        a.setStyle(styleRevenueFunction);
        var b = resultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        drawOutletChart("revenue");
        $('#show-r-result').attr("disabled", true);
        $('#show-r-result').siblings().attr("disabled", false);
    });

    $("#show-nr-result").click(function(event) {
        /* Act on the event */
        resultMapSingleClick.getFeatures().clear();
        var a = resultMap.getLayers().getArray()[2];
        a.setStyle(styleNetReturnFunction);
        var b = resultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        drawOutletChart("netreturn");
        $('#show-nr-result').attr("disabled", true);
        $('#show-nr-result').siblings().attr("disabled", false);
    });


    $("#show-field-map-result").click(function(event) {
        var a = resultMap.getLayers().getArray()[1];
        a.setStyle(outletSelectStyle);

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
        var a = resultMap.getLayers().getArray()[1];
        a.setStyle(outletSelectStyle);
        resultMapSingleClick.getFeatures().clear();
        resultMap.removeLayer(fieldOutput);
        resultMap.addLayer(subbasinOutput);
        $('#show-subbasin-map-result').attr("disabled", true);
        $('#show-field-map-result').attr("disabled", false);
        $('#show-flow-result').attr("disabled", true);
        $('#show-flow-result').siblings().attr("disabled", false);
        drawOutletChart("flow");
    });


    function drawOutletChart(s) {
        resultMapSingleClick.getFeatures().clear();

        $("#offsite-chart").attr("disabled", true);
        $("#onsite-chart").attr("disabled", false);

        var data = [];
        if (s === "sediment") {
            data = outletSediment;
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
                        text: 'Value' + " ( Outlet )"
                    },
                    lineWidth: 1,
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
        if (s === "flow") {
            data = outletFlow;
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
                        text: 'Value' + " ( Outlet )"
                    },
                    lineWidth: 1,
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
        if (s === "tp") {
            data = outletTp;
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
                        text: 'Value' + " ( Outlet )"
                    },
                    lineWidth: 1,
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
        if (s === "tn") {
            data = outletTn;
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
                        text: 'Value' + " ( Outlet )"
                    },
                    lineWidth: 1,
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

        if (s === "cost") {
            var ecoType = JSON.stringify(s);
            $.ajax({
                url: '/drawecooutletchart',
                type: "post",
                contentType: 'application/json; charset=utf-8',
                data: ecoType,
                dataType: 'json',
                success: function(r) {
                    // console.log(r);
                    var averageCost = 0;

                    for (i = 0; i < r.length; i++) {
                        data.push(r[i]);
                        averageCost += r[i];
                    }

                    outlet.setProperties({
                        "cost": averageCost / r.length,
                    });

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
                                text: 'Value' + " ( Outlet )"
                            },
                            lineWidth: 1,
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
            });
        }
        if (s === "revenue") {
            var ecoType = JSON.stringify(s);
            $.ajax({
                url: '/drawecooutletchart',
                type: "post",
                contentType: 'application/json; charset=utf-8',
                data: ecoType,
                dataType: 'json',
                success: function(r) {
                    // console.log(r);

                    var averageRevenue = 0;
                    for (i = 0; i < r.length; i++) {
                        data.push(r[i]);
                        averageRevenue += r[i];
                    }

                    outlet.setProperties({
                        "revenue": averageRevenue / r.length,
                    });

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
                                text: 'Value' + " ( Outlet )"
                            },
                            lineWidth: 1,
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
            });
        }
        if (s === "netreturn") {
            var ecoType = JSON.stringify(s);
            $.ajax({
                url: '/drawecooutletchart',
                type: "post",
                contentType: 'application/json; charset=utf-8',
                data: ecoType,
                dataType: 'json',
                success: function(r) {
                    // console.log(r);

                    var averageNetreturn = 0;

                    for (i = 0; i < r.length; i++) {
                        data.push(r[i]);
                        averageNetreturn += r[i];
                    }


                    outlet.setProperties({
                        "netreturn": averageNetreturn / r.length,
                    });

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
                                text: 'Value' + " ( Outlet )"
                            },
                            lineWidth: 1,
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
            });
        }
        // console.log(data);
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
                    r[i] = parseFloat(Math.round(r[i] * 100) / 100).toFixed(6);
                    dataArray[i] = parseFloat(r[i]);
                }
                // alert(r);

                var average = [];
                var averageNum;

                if (feature.ResultType == "sediment") {
                    averageNum = selectedResultFeature.getProperties().sediment;
                    averageNum = parseFloat((Math.round(averageNum * 100) / 100).toFixed(6));
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "flow") {
                    averageNum = selectedResultFeature.getProperties().flow;
                    averageNum = parseFloat((Math.round(averageNum * 100) / 100).toFixed(6));
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "tn") {
                    averageNum = selectedResultFeature.getProperties().tn;
                    averageNum = parseFloat((Math.round(averageNum * 100) / 100).toFixed(6));
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "tp") {
                    averageNum = selectedResultFeature.getProperties().tp;
                    averageNum = parseFloat((Math.round(averageNum * 100) / 100).toFixed(6));
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "cost") {
                    averageNum = selectedResultFeature.getProperties().cost;
                    averageNum = parseFloat((Math.round(averageNum * 100) / 100).toFixed(6));
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "revenue") {
                    averageNum = selectedResultFeature.getProperties().revenue;
                    averageNum = parseFloat((Math.round(averageNum * 100) / 100).toFixed(6));
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "netreturn") {
                    averageNum = selectedResultFeature.getProperties().netreturn;
                    averageNum = parseFloat((Math.round(averageNum * 100) / 100).toFixed(6));
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
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
                        lineWidth: 1,

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
                        data: dataArray,
                        color: '#99EAA4'
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
            $("#result-issue-timeline .timeline-inverted").click(function(event) {
                $("#talk-title").html("");
                $("#result-issue-talk").css('height', $("#responsive-timeline").height() + 5);
                $("#result-issue-talk").css('width', $("#result-issues").width());
                var issueTitle = $(this).find(".timeline-body").children('p').html();
                // alert(issueTitle);
                $("#talk-title").append('<p><span style="font-weight:bold"> Issue title : ' + issueTitle + '</span></p>');
                var h = $("#result-issue-talk").height() - 190;
                $("#talk-content").css('height', h + "px");
                $("#result-issue-talk").show("slow");

            });
        }
    });

    $("#result-issue-comment-reply").click(function(event) {
        $("#talk-content").append(' <hr> ' + $("#issue-comment").val());
        $("#issue-comment").val("");
    });

    $("#result-issue-comment-close").click(function(event) {
        $("#result-issue-talk").hide();
    });

    $("#bmp-compare-btn").click(function(event) {
        $("#process-icon2").removeClass('btn-danger').addClass('btn-success');
        $("#process-icon2 span:first").removeClass('text-danger').addClass('text-success');
        $("#process-icon3").removeClass('btn-default').addClass('btn-danger');
        $("#process-icon3 span:first").removeClass('text-default').addClass('text-danger');
        $("html, body").animate({ scrollTop: $('#bmp-compare-page').offset().top }, 1000);
        $("#bmp-compare-page").css('visibility', 'visible');
        $("#model-compare-btn").css('disabled', 'true');
        progress = "checkScenario";
        resizePage = 3;

        $('#bmp-compare-page .map-btn').prop({
            disabled: 'true',
        });
    });


    $("#report-html").click(function(event) {
        /* Act on the event */


        scenarioInfo.state = "modelruncomplete";

        var url = window.location.href + "/report/" + scenarioInfo.state;

        var win = window.open(url, '_blank');
        win.focus();

        // window.location.replace(url + "/report/" + scenarioInfo.state);

        // alert("hello");

        // $.ajax({
        //     url: '/reportgenerator',
        //     type: "post",
        //     contentType: 'application/json; charset=utf-8',
        //     data: scenario,
        //     dataType: 'json',
        //     success: function(r) {
        //         alert(r);
        //     },
        // });

    });

    $("#report-html2").click(function(event) {
        /* Act on the event */


        scenarioInfo.state = "modelcompare";

        var url = window.location.href + "/report/" + scenarioInfo.state;

        var win = window.open(url, '_blank');
        win.focus();

        // window.location.replace(url + "/report/" + scenarioInfo.state);

        // alert("hello");

        // $.ajax({
        //     url: '/reportgenerator',
        //     type: "post",
        //     contentType: 'application/json; charset=utf-8',
        //     data: scenario,
        //     dataType: 'json',
        //     success: function(r) {
        //         alert(r);
        //     },
        // });

    });

    // ************************************************************************************************************************************************************
    //
    //                                                                      BMP COMPARE PAGE
    //                                  
    // ************************************************************************************************************************************************************


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

    // ****************************************************
    // Outlet layer loaded from geoserver in Jsonp format
    // Be sure to enable the Jsonp function in the web.xml
    // of Geoserver     
    // ****************************************************

    var outlet2 = new ol.Feature({});
    var point_geom2 = new ol.geom.Point(
        ol.proj.transform([-81.7132830619812, 43.61527726000183], 'EPSG:4326', 'EPSG:3857')
    );
    outlet2.setGeometry(point_geom2);

    var outletLayer2 = new ol.layer.Vector({
        source: new ol.source.Vector({}),
        zIndex: 10
    });

    outletLayer2.setStyle(outletSelectStyle);

    var compareMapPointerMove = new ol.interaction.Select({
        layers: [fieldCompare, outletLayer2, subbasinCompare],
        condition: ol.events.condition.pointerMove
    });

    var compareMapSingleClick = new ol.interaction.Select({
        layers: [fieldCompare, subbasinCompare],
    });

    var compareMap = new ol.Map({
        target: 'model-compare-map',
        layers: [tiledRaster, outletLayer2, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    compareMap.addInteraction(compareMapSingleClick);
    compareMap.addInteraction(compareMapPointerMove);

    var compareInfoElement = document.getElementById('compare-feature-info');

    var compareInfoOverlay = new ol.Overlay({
        element: document.getElementById('compare-feature-info'),
        positioning: 'bottom-center',
        stopEvent: false
    });

    compareMap.addOverlay(compareInfoOverlay);

    var hoveredCompareFeature;
    compareMapPointerMove.on('select', function(event) {
        hoveredCompareFeature = event.selected[0];
        var num;
        if (hoveredCompareFeature) {
            var coordinate = ol.extent.getCenter(hoveredCompareFeature.getGeometry().getExtent());
            var offsetCoordinate = [coordinate[0], coordinate[1] + 500];
            compareInfoOverlay.setPosition(offsetCoordinate);
            if ($('#show-flow2').prop("disabled") === true) {
                num = hoveredCompareFeature.getProperties().flow;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(compareInfoElement).html("FeatureID: " + hoveredCompareFeature.getProperties().name + "<br />" + "Flow " + num);
            }
            if ($('#show-sediment2').prop("disabled") === true) {
                num = hoveredCompareFeature.getProperties().sediment;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(compareInfoElement).html("FeatureID: " + hoveredCompareFeature.getProperties().name + "<br />" + "Sediment " + num);
            }
            if ($('#show-n2').prop("disabled") === true) {
                num = hoveredCompareFeature.getProperties().tn;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(compareInfoElement).html("FeatureID: " + hoveredCompareFeature.getProperties().name + "<br />" + "Total N " + num);
            }
            if ($('#show-p2').prop("disabled") === true) {
                num = hoveredCompareFeature.getProperties().tp;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(compareInfoElement).html("FeatureID: " + hoveredCompareFeature.getProperties().name + "<br />" + "Total P " + num);
            }

            if ($('#show-c2').prop("disabled") === true) {
                num = hoveredCompareFeature.getProperties().cost;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(compareInfoElement).html("FeatureID: " + hoveredCompareFeature.getProperties().name + "<br />" + "Cost " + num);
            }
            if ($('#show-r2').prop("disabled") === true) {
                num = hoveredCompareFeature.getProperties().revenue;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(compareInfoElement).html("FeatureID: " + hoveredCompareFeature.getProperties().name + "<br />" + "Revenue " + num);
            }
            if ($('#show-nr2').prop("disabled") === true) {
                num = hoveredCompareFeature.getProperties().netreturn;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(compareInfoElement).html("FeatureID: " + hoveredCompareFeature.getProperties().name + "<br />" + "NetReturn " + num);
            }

            $(compareInfoElement).show();
            compareInfoOverlay.setPosition(offsetCoordinate);
        } else {
            $(compareInfoElement).hide();
        }
    });

    $("#show-flow2").click(function(event) {
        compareMapSingleClick.getFeatures().clear();
        var a = compareMap.getLayers().getArray()[2];
        a.setStyle(styleFlowFunction);

        $('#show-flow2').attr("disabled", true);
        $('#show-flow2').siblings().attr("disabled", false);

    });
    $("#show-sediment2").click(function(event) {
        /* Act on the event */
        compareMapSingleClick.getFeatures().clear();

        var a = compareMap.getLayers().getArray()[2];
        a.setStyle(styleSedimentFunction);

        $('#show-sediment2').attr("disabled", true);
        $('#show-sediment2').siblings().attr("disabled", false);
    });
    $("#show-n2").click(function(event) {
        /* Act on the event */
        compareMapSingleClick.getFeatures().clear();

        var a = compareMap.getLayers().getArray()[2];
        a.setStyle(styleTnFunction);

        $('#show-n2').attr("disabled", true);
        $('#show-n2').siblings().attr("disabled", false);

    });
    $("#show-p2").click(function(event) {
        /* Act on the event */
        compareMapSingleClick.getFeatures().clear();

        var a = compareMap.getLayers().getArray()[2];
        a.setStyle(styleTpFunction);

        $('#show-p2').attr("disabled", true);
        $('#show-p2').siblings().attr("disabled", false);
    });

    $("#show-c2").click(function(event) {
        /* Act on the event */
        compareMapSingleClick.getFeatures().clear();

        var a = compareMap.getLayers().getArray()[2];
        a.setStyle(styleCostFunction);

        $('#show-c2').attr("disabled", true);
        $('#show-c2').siblings().attr("disabled", false);
    });
    $("#show-r2").click(function(event) {
        /* Act on the event */
        compareMapSingleClick.getFeatures().clear();

        var a = compareMap.getLayers().getArray()[2];
        a.setStyle(styleRevenueFunction);

        $('#show-r2').attr("disabled", true);
        $('#show-r2').siblings().attr("disabled", false);

    });
    $("#show-nr2").click(function(event) {
        /* Act on the event */
        compareMapSingleClick.getFeatures().clear();

        var a = compareMap.getLayers().getArray()[2];
        a.setStyle(styleNetReturnFunction);

        $('#show-nr2').attr("disabled", true);
        $('#show-nr2').siblings().attr("disabled", false);
    });

    $("#show-field-map2").click(function(event) {
        compareMapSingleClick.getFeatures().clear();

        compareMap.removeLayer(subbasinCompare);
        compareMap.addLayer(fieldCompare);
        $('#show-subbasin-map2').attr("disabled", false);
        $('#show-field-map2').attr("disabled", true);
        $('#show-flow2').attr("disabled", true);
        $('#show-flow2').siblings().attr("disabled", false);
        var a = compareMap.getLayers().getArray()[2];
        a.setStyle(styleNetReturnFunction);

    });

    $("#show-subbasin-map2").click(function(event) {
        compareMapSingleClick.getFeatures().clear();

        compareMap.removeLayer(fieldCompare);
        compareMap.addLayer(subbasinCompare);
        $('#show-subbasin-map2').attr("disabled", true);
        $('#show-field-map2').attr("disabled", false);
        $('#show-flow2').attr("disabled", true);
        $('#show-flow2').siblings().attr("disabled", false);
        var a = compareMap.getLayers().getArray()[2];
        a.setStyle(styleNetReturnFunction);
        /* Act on the event */
    });

    $("#accordianmenu p").click(function() {
        compareMapSingleClick.getFeatures().clear();
        // $("#model-compare-btn").css('disabled', 'false');
        $("#accordianmenu p").css({ "background-color": "white", "color": "black" });
        $(this).css({ "background-color": "rgb(66,139,202)", "color": "white" });
        $("#accordianmenu ul ul").slideUp();
        if (!$(this).next().next().is(":visible")) {
            $(this).next().next().slideDown();
        }
        // var getScenario = new Object();
        // getScenario.scenarioName = $(this).text();
        // alert(getScenario.scenarioName);
        scenarioInfo.scenarioGet = $(this).text().toLowerCase();

        var scenario = JSON.stringify(scenarioInfo);
        $.ajax({
            url: '/readmodelresult',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: scenario,
            dataType: 'json',
            success: function(r) {
                outletLayer2.getSource().clear();
                outletLayer2.getSource().addFeature(outlet2);

                fieldCompare.getSource().clear();
                subbasinCompare.getSource().clear();

                $('#show-subbasin-map2').attr("disabled", true);
                $('#show-field-map2').attr("disabled", false);
                compareMap.removeLayer(compareMap.getLayers().getArray()[2]);

                if (selectedLayer === "field") {
                    compareMap.addLayer(fieldCompare);
                    var a = compareMap.getLayers().getArray()[2];
                    a.setStyle(styleFlowFunction);
                    $("#show-field-map2").attr('disabled', true);
                    $("#show-subbasin-map2").attr('disabled', false);
                    $('#show-flow2').attr("disabled", true);
                    $('#show-flow2').siblings().attr("disabled", false);

                }
                if (selectedLayer === "subbasin") {
                    compareMap.addLayer(subbasinCompare);
                    var a = compareMap.getLayers().getArray()[2];
                    a.setStyle(styleFlowFunction);
                    $("#show-subbasin-map2").attr('disabled', true);
                    $("#show-field-map2").attr('disabled', false);
                    $('#show-flow2').attr("disabled", true);
                    $('#show-flow2').siblings().attr("disabled", false);
                }

                outletSediment = r[0].ResultData;
                outletFlow = r[1].ResultData;
                outletTp = r[2].ResultData;
                outletTn = r[3].ResultData;

                // alert(outletSediment);

                outletSedimentAverage = 0;
                outletFlowAverage = 0;
                outletTpAverage = 0;
                outletTnAverage = 0;

                for (var i = 0; i < outletSediment.length; i++) {
                    outletSedimentAverage = outletSedimentAverage + outletSediment[i];
                    outletFlowAverage = outletFlowAverage + outletFlow[i];
                    outletTpAverage = outletTpAverage + outletTp[i];
                    outletTnAverage = outletTnAverage + outletTn[i];
                }

                outletSedimentAverage = outletSedimentAverage / 10;
                outletFlowAverage = outletFlowAverage / 10;
                outletTpAverage = outletTpAverage / 10;
                outletTnAverage = outletTnAverage / 10;

                var fieldFeatures = fieldCompare.getSource().getFeatures();
                var outletCost;
                var outletRevenue;
                var outletNetreturn;


                $.ajax({
                    url: '/readoutletecoresult',
                    type: "post",
                    contentType: 'application/json; charset=utf-8',
                    data: scenario,
                    dataType: 'json',
                    success: function(response) {
                        console.log(response[0]);
                        outletCost = response[0];
                        outletRevenue = response[1];
                        outletNetreturn = response[2];

                        outlet2.setProperties({
                            'sediment': outletSedimentAverage,
                            'flow': outletFlowAverage,
                            'tp': outletTpAverage,
                            'tn': outletTnAverage,
                            'name': 'outlet',
                            'cost': outletCost,
                            'revenue': outletRevenue,
                            'netreturn': outletNetreturn
                        });
                    }
                });
            }
        });
    });

    var selectedCompareFeature;
    $('#search-compare-prevent').submit(function(e) {
        e.preventDefault();
    });

    $('#search-compare-feature').keyup(function(e) {
        if (e.keyCode == 13) {
            var id = $(this).val();
            // alert(typeof id);
            if ($('#show-subbasin-map2').prop("disabled") === true) {
                subbasinFeatureCollections = subbasinCompare.getSource().getFeatures();
                for (i = 0; i < subbasinFeatureCollections.length; i++) {
                    var temp = subbasinFeatureCollections[i].getProperties().name;
                    // alert(typeof temp);
                    if (id == temp) {
                        selectedCompareFeature = subbasinFeatureCollections[i];
                    }
                }
            }
            if ($('#show-field-map2').prop("disabled") === true) {
                fieldFeatureCollections = fieldCompare.getSource().getFeatures();
                for (i = 0; i < fieldFeatureCollections.length; i++) {

                    if (id == fieldFeatureCollections[i].getProperties().name) {
                        selectedCompareFeature = fieldFeatureCollections[i];
                    }
                }
            }

            compareMapSingleClick.getFeatures().clear();
            compareMapSingleClick.getFeatures().push(selectedCompareFeature);
        }
    });

    $("#model-compare-btn").click(function(event) {
        /* Act on the event */
        compareresultMapSingleClick.getFeatures().clear();

        var jsonArray = JSON.stringify(scenarioInfo);
        $.ajax({
            url: '/comparemodelresult',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: jsonArray,
            dataType: 'json',
            success: function(r) {
                resizePage = 4;

                progress = "compareScenario";

                var b = compareresultMap.getLayers().getArray()[1];
                b.setStyle(outletSelectStyle);


                $("#process-icon3").removeClass('btn-danger').addClass('btn-success');
                $("#process-icon3 span:first").removeClass('text-danger').addClass('text-success');

                $("#process-icon4").removeClass('btn-default').addClass('btn-danger');
                $("#process-icon4 span:first").removeClass('text-default').addClass('text-danger');

                outletCompareSediment = r[0].ResultData;
                outletCompareFlow = r[1].ResultData;
                outletCompareTp = r[2].ResultData;
                outletCompareTn = r[3].ResultData;


                outletSedimentAverage = 0;
                outletFlowAverage = 0;
                outletTpAverage = 0;
                outletTnAverage = 0;

                for (var i = 0; i < outletSediment.length; i++) {
                    outletSedimentAverage = outletSedimentAverage + outletCompareSediment[i];
                    outletFlowAverage = outletFlowAverage + outletCompareFlow[i];
                    outletTpAverage = outletTpAverage + outletCompareTp[i];
                    outletTnAverage = outletTnAverage + outletCompareTn[i];
                }

                outletSedimentAverage = outletSedimentAverage / 10;
                outletFlowAverage = outletFlowAverage / 10;
                outletTpAverage = outletTpAverage / 10;
                outletTnAverage = outletTnAverage / 10;

                outlet3.setProperties({
                    'sediment': outletSedimentAverage,
                    'flow': outletFlowAverage,
                    'tp': outletTpAverage,
                    'tn': outletTnAverage,
                    'name': 'outlet',
                });

                compareresultMap.removeLayer(compareresultMap.getLayers().getArray()[2]);

                $("html, body").animate({ scrollTop: $('#model-compare-page').offset().top }, 1000);

                if (selectedLayer === "subbasin") {
                    // refreshComparedBasinSource(subbasinCompareResult);
                    subbasinCompareResult.getSource().clear();
                    compareresultMap.addLayer(subbasinCompareResult);
                    $("#show-flow-compare-result").attr("disabled", true);
                    $("#show-flow-compare-result").siblings().attr("disabled", false);
                }
                if (selectedLayer === "field") {
                    // refreshComparedFieldSource(fieldCompareResult);
                    fieldCompareResult.getSource().clear();
                    compareresultMap.addLayer(fieldCompareResult);
                    $("#show-flow-compare-result").attr("disabled", true);
                    $("#show-flow-compare-result").siblings().attr("disabled", false);
                }

                drawCompareOutletChart("flow");
            }
        });
    });

    function refreshComparedBasinSource(vectorLayer) {
        var now = Date.now();
        var source = vectorLayer.getSource();
        var format = new ol.format.GeoJSON();
        var url = '/assets/data/geojson/basincompareresult.json';
        var loader = ol.featureloader.xhr(url, format);

        source.clear();
        loader.call(source, [], 1, 'EPSG:3857');
    }

    function refreshComparedFieldSource(vectorLayer) {
        var now = Date.now();
        var source = vectorLayer.getSource();
        var format = new ol.format.GeoJSON();
        var url = '/assets/data/geojson/fieldcompareresult.json';
        var loader = ol.featureloader.xhr(url, format);

        source.clear();
        loader.call(source, [], 1, 'EPSG:3857');
    }




    // ************************************************************************************************************************************************************
    //
    //                                                                      COMPARE RESULT PAGE
    //                                  
    // ************************************************************************************************************************************************************

    // var Great = 'rgba(53, 191, 0, 0.6)';
    // var Good = 'rgba(115, 197, 0, 0.6)';
    // var Normal = 'rgba(181, 203, 0, 0.6)';
    // var Slight = 'rgba(210, 168, 0, 0.6)';
    // var Bad = 'rgba(216, 170, 0, 0.6)';
    // var Severe = 'rgba(229, 0, 26, 0.6)';
    var customizedStyleGreat = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(53, 191, 0, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: "white",
            width: 1
        })
    });

    var customizedStyleHigh = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(115, 197, 0, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: "white",
            width: 1
        })
    });

    var customizedStyleMedium = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(181, 203, 0, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: "white",
            width: 1
        })
    });

    var customizedStyleLow = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(216, 170, 0, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: "white",
            width: 1
        })
    });

    var customizedStyleBad = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(229, 0, 26, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: "white",
            width: 1
        })
    });

    var compareDefaultStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(34, 44, 85, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(220, 220, 220, 1)',
            width: 1
        })
    });

    function compareStyleFlowFunction(feature, resolution) {
        var featureID = feature.getProperties().name;
        for (var i = 0; i < bmpAssignmentArray.length; i++) {
            if (featureID == bmpAssignmentArray[i].featureID) {
                var level = feature.getProperties().flow;
                level = parseFloat(level.toFixed(2));
                if (level > 0) {
                    return [customizedStyleBad];
                } else if (0 >= level && level > -1) {
                    return [customizedStyleLow];
                } else if (-1 >= level && level > -2) {
                    return [customizedStyleMedium];
                } else if (-2 >= level && level > -2.5) {
                    return [customizedStyleHigh];
                } else {
                    return [customizedStyleGreat];
                }
            }
        }
        return [compareDefaultStyle];
    }

    function compareStyleSedimentFunction(feature, resolution) {
        var featureID = feature.getProperties().name;
        var level = feature.getProperties().sedimentlevel;
        for (var i = 0; i < bmpAssignmentArray.length; i++) {
            if (featureID == bmpAssignmentArray[i].featureID) {
                var level = feature.getProperties().sediment;
                level = parseFloat(level.toFixed(2));
                if (level > 0) {
                    return [customizedStyleBad];
                } else if (0 >= level && level > -10) {
                    return [customizedStyleLow];
                } else if (-10 >= level && level > -20) {
                    return [customizedStyleMedium];
                } else if (-20 >= level && level > -50) {
                    return [customizedStyleHigh];
                } else {
                    return [customizedStyleGreat];
                }


            }
        }
        return [compareDefaultStyle];
    }

    function compareStyleTnFunction(feature, resolution) {
        var featureID = feature.getProperties().name;
        var level = feature.getProperties().tnlevel;
        for (var i = 0; i < bmpAssignmentArray.length; i++) {
            if (featureID == bmpAssignmentArray[i].featureID) {
                var level = feature.getProperties().tn;
                level = parseFloat(level.toFixed(2));
                if (level > 0) {
                    return [customizedStyleBad];
                } else if (0 >= level && level > -5) {
                    return [customizedStyleLow];
                } else if (-5 >= level && level > -10) {
                    return [customizedStyleMedium];
                } else if (-10 >= level && level > -20) {
                    return [customizedStyleHigh];
                } else {
                    return [customizedStyleGreat];
                }
            }
        }
        return [compareDefaultStyle];
    }

    function compareStyleTpFunction(feature, resolution) {
        var featureID = feature.getProperties().name;
        var level = feature.getProperties().tplevel;
        for (var i = 0; i < bmpAssignmentArray.length; i++) {
            if (featureID == bmpAssignmentArray[i].featureID) {
                var level = feature.getProperties().tp;
                level = parseFloat(level.toFixed(2));
                if (level > 0) {
                    return [customizedStyleBad];
                } else if (0 >= level && level > -5) {
                    return [customizedStyleLow];
                } else if (-5 >= level && level > -10) {
                    return [customizedStyleMedium];
                } else if (-10 >= level && level > -20) {
                    return [customizedStyleHigh];
                } else {
                    return [customizedStyleGreat];
                }
            }
        }
        return [compareDefaultStyle];
    }

    function compareStyleCFunction(feature, resolution) {
        var featureID = feature.getProperties().name;
        for (var i = 0; i < bmpAssignmentArray.length; i++) {
            if (featureID == bmpAssignmentArray[i].featureID) {
                var cost = feature.getProperties().cost;
                if (cost > 0) {
                    return [customizedStyleBad];
                } else if (cost < 0) {
                    return [customizedStyleHigh];
                } else if (cost === 0) {
                    return [customizedStyleMedium];
                } else {
                    return [compareDefaultStyle];
                }
            }
        }
        return [compareDefaultStyle];
    }

    function compareStyleRFunction(feature, resolution) {
        var featureID = feature.getProperties().name;
        for (var i = 0; i < bmpAssignmentArray.length; i++) {
            if (featureID == bmpAssignmentArray[i].featureID) {
                var revenue = feature.getProperties().revenue;
                if (revenue < 0) {
                    return [customizedStyleBad];
                } else if (revenue > 0) {
                    return [customizedStyleHigh];
                } else if (revenue == 0) {
                    return [customizedStyleMedium];
                } else {
                    return [compareDefaultStyle];
                }
            }
        }
        return [compareDefaultStyle];
    }

    function compareStyleNRFunction(feature, resolution) {
        var featureID = feature.getProperties().name;
        for (var i = 0; i < bmpAssignmentArray.length; i++) {
            if (featureID == bmpAssignmentArray[i].featureID) {
                var netreturn = feature.getProperties().netreturn;
                if (netreturn < 0) {
                    return [customizedStyleBad];
                } else if (netreturn > 0) {
                    return [customizedStyleHigh];
                } else if (netreturn === 0) {
                    return [customizedStyleMedium];
                } else {
                    return [compareDefaultStyle];
                }
            }
        }
        return [compareDefaultStyle];
    }

    var fieldCompareResult = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/fieldcompareresult.json',
            format: new ol.format.GeoJSON()
        }),
        style: compareStyleFlowFunction
    });

    var subbasinCompareResult = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/assets/data/geojson/basincompareresult.json',
            format: new ol.format.GeoJSON()
        }),
        style: compareStyleFlowFunction
    });


    // ****************************************************
    // Outlet layer loaded from geoserver in Jsonp format
    // Be sure to enable the Jsonp function in the web.xml
    // of Geoserver     
    // ****************************************************

    var outlet3 = new ol.Feature({});
    var point_geom3 = new ol.geom.Point(
        ol.proj.transform([-81.7132830619812, 43.61527726000183], 'EPSG:4326', 'EPSG:3857')
    );
    outlet3.setGeometry(point_geom3);

    var outletLayer3 = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [outlet3]
        }),
        zIndex: 10
    });

    outletLayer3.setStyle(outletDefaultStyle);

    var compareresultMapPointerMove = new ol.interaction.Select({
        layers: [fieldCompareResult, outletLayer3, subbasinCompareResult],
        condition: ol.events.condition.pointerMove,
        filter: function(feature, layer) {
            if (layer === fieldCompareResult || layer === subbasinCompareResult) {
                for (var i = 0; i < bmpAssignmentArray.length; i++) {
                    if (bmpAssignmentArray[i].featureID == feature.getProperties().name) {
                        return true;
                    }
                }
                return false;
            }
            return true;
        },
    });

    var compareresultMapSingleClick = new ol.interaction.Select({
        layers: [fieldCompareResult, subbasinCompareResult],
        filter: function(feature, layer) {
            for (var i = 0; i < bmpAssignmentArray.length; i++) {
                if (bmpAssignmentArray[i].featureID == feature.getProperties().name) {
                    return true;
                }
            }
            return false;
        },
    });

    var compareresultMap = new ol.Map({
        target: 'compare-result-map',
        layers: [tiledRaster, outletLayer3, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });

    compareresultMap.addInteraction(compareresultMapSingleClick);
    compareresultMap.addInteraction(compareresultMapPointerMove);


    var compareResultInfoElement = document.getElementById('compare-result-feature-info');

    var compareResultInfoOverlay = new ol.Overlay({
        element: document.getElementById('compare-result-feature-info'),
        positioning: 'bottom-center',
        stopEvent: false
    });

    compareresultMap.addOverlay(compareResultInfoOverlay);

    var hoveredCompareResultFeature;
    compareresultMapPointerMove.on('select', function(event) {
        hoveredCompareResultFeature = event.selected[0];
        var num;
        if (hoveredCompareResultFeature) {

            if (hoveredCompareResultFeature.getProperties().name == "outlet") {
                var coordinate = ol.extent.getCenter(hoveredCompareResultFeature.getGeometry().getExtent());
                var offsetCoordinate = [coordinate[0], coordinate[1] + 500];
                compareResultInfoOverlay.setPosition(offsetCoordinate);
                if ($('#show-flow-compare-result').prop("disabled") === true) {
                    num = hoveredCompareResultFeature.getProperties().flow;
                    num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                    $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Flow " + num);
                }
                if ($('#show-sediment-compare-result').prop("disabled") === true) {
                    num = hoveredCompareResultFeature.getProperties().sediment;
                    num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                    $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Sediment " + num);
                }
                if ($('#show-tn-compare-result').prop("disabled") === true) {
                    num = hoveredCompareResultFeature.getProperties().tn;
                    num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                    $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Total N " + num);
                }
                if ($('#show-tp-compare-result').prop("disabled") === true) {
                    num = hoveredCompareResultFeature.getProperties().tp;
                    num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                    $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Total P " + num);
                }

                if ($('#show-c-compare-result').prop("disabled") === true) {
                    num = hoveredCompareResultFeature.getProperties().cost;
                    num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                    $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Cost " + num);
                }
                if ($('#show-r-compare-result').prop("disabled") === true) {
                    num = hoveredCompareResultFeature.getProperties().revenue;
                    num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                    $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Revenue " + num);
                }
                if ($('#show-nr-compare-result').prop("disabled") === true) {
                    num = hoveredCompareResultFeature.getProperties().netreturn;
                    num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                    $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Net Return " + num);
                }

                $(compareResultInfoElement).show();
                compareResultInfoOverlay.setPosition(offsetCoordinate);
            }

            for (var i = 0; i < bmpAssignmentArray.length; i++) {
                if (bmpAssignmentArray[i].featureID == parseInt(hoveredCompareResultFeature.getProperties().name)) {
                    var coordinate = ol.extent.getCenter(hoveredCompareResultFeature.getGeometry().getExtent());
                    var offsetCoordinate = [coordinate[0], coordinate[1] + 500];
                    compareResultInfoOverlay.setPosition(offsetCoordinate);
                    if ($('#show-flow-compare-result').prop("disabled") === true) {
                        num = hoveredCompareResultFeature.getProperties().flow;
                        num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                        $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Flow " + num);
                    }
                    if ($('#show-sediment-compare-result').prop("disabled") === true) {
                        num = hoveredCompareResultFeature.getProperties().sediment;
                        num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                        $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Sediment " + num);
                    }
                    if ($('#show-tn-compare-result').prop("disabled") === true) {
                        num = hoveredCompareResultFeature.getProperties().tn;
                        num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                        $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Total N " + num);
                    }
                    if ($('#show-tp-compare-result').prop("disabled") === true) {
                        num = hoveredCompareResultFeature.getProperties().tp;
                        num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                        $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Total P " + num);
                    }
                    if ($('#show-c-compare-result').prop("disabled") === true) {
                        num = hoveredCompareResultFeature.getProperties().cost;
                        num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                        $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Cost " + num + "<br />" + "CE-F " + hoveredCompareResultFeature.getProperties().CEF+ "<br />" + "CE-S " + hoveredCompareResultFeature.getProperties().CES+ "<br />" + "CE-N " + hoveredCompareResultFeature.getProperties().CEN+ "<br />" + "CE-P " + hoveredCompareResultFeature.getProperties().CEP);
                    }
                    if ($('#show-r-compare-result').prop("disabled") === true) {
                        num = hoveredCompareResultFeature.getProperties().revenue;
                        num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                        $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Revenue " + num);
                    }
                    if ($('#show-nr-compare-result').prop("disabled") === true) {
                        num = hoveredCompareResultFeature.getProperties().netreturn;
                        num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                        $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Net Return " + num);
                    }

                    $(compareResultInfoElement).show();
                    compareResultInfoOverlay.setPosition(offsetCoordinate);
                }
            }


        } else {
            $(compareResultInfoElement).hide();
        }
    });


    $("#sel2").prop('disabled', true);


    $("#show-flow-compare-result").click(function(event) {
        compareresultMapSingleClick.getFeatures().clear();
        var a = compareresultMap.getLayers().getArray()[2];
        a.setStyle(compareStyleFlowFunction);
        var b = compareresultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        $('#show-flow-compare-result').attr("disabled", true);
        $('#show-flow-compare-result').siblings().attr("disabled", false);
        drawCompareOutletChart("flow");
    });
    $("#show-sediment-compare-result").click(function(event) {
        /* Act on the event */
        compareresultMapSingleClick.getFeatures().clear();
        var a = compareresultMap.getLayers().getArray()[2];
        a.setStyle(compareStyleSedimentFunction);
        var b = compareresultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        $('#show-sediment-compare-result').attr("disabled", true);
        $('#show-sediment-compare-result').siblings().attr("disabled", false);
        drawCompareOutletChart("sediment");
    });
    $("#show-tn-compare-result").click(function(event) {
        /* Act on the event */
        compareresultMapSingleClick.getFeatures().clear();
        var a = compareresultMap.getLayers().getArray()[2];
        a.setStyle(compareStyleTnFunction);
        var b = compareresultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        $('#show-tn-compare-result').attr("disabled", true);
        $('#show-tn-compare-result').siblings().attr("disabled", false);
        drawCompareOutletChart("tn");
    });
    $("#show-tp-compare-result").click(function(event) {
        /* Act on the event */
        compareresultMapSingleClick.getFeatures().clear();
        var a = compareresultMap.getLayers().getArray()[2];
        a.setStyle(compareStyleTpFunction);
        var b = compareresultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        $('#show-tp-compare-result').attr("disabled", true);
        $('#show-tp-compare-result').siblings().attr("disabled", false);
        drawCompareOutletChart("tp");
    });

    $("#show-c-compare-result").click(function(event) {
        /* Act on the event */
        compareresultMapSingleClick.getFeatures().clear();
        var a = compareresultMap.getLayers().getArray()[2];
        a.setStyle(compareStyleCFunction);
        var b = compareresultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        $('#show-c-compare-result').attr("disabled", true);
        $('#show-c-compare-result').siblings().attr("disabled", false);
        drawCompareOutletChart("cost");
        updateCostEffectiveness();

    });
    $("#show-r-compare-result").click(function(event) {
        /* Act on the event */
        compareresultMapSingleClick.getFeatures().clear();
        var a = compareresultMap.getLayers().getArray()[2];
        a.setStyle(compareStyleRFunction);
        var b = compareresultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        $('#show-r-compare-result').attr("disabled", true);
        $('#show-r-compare-result').siblings().attr("disabled", false);
        drawCompareOutletChart("revenue");
    });

    $("#show-nr-compare-result").click(function(event) {
        /* Act on the event */
        compareresultMapSingleClick.getFeatures().clear();
        var a = compareresultMap.getLayers().getArray()[2];
        a.setStyle(compareStyleNRFunction);
        var b = compareresultMap.getLayers().getArray()[1];
        b.setStyle(outletSelectStyle);
        $('#show-nr-compare-result').attr("disabled", true);
        $('#show-nr-compare-result').siblings().attr("disabled", false);
        drawCompareOutletChart("netreturn");
    });


    function updateCostEffectiveness() {
        var featureArray = getSelectedFeatureIDs();
        for (var i = 0; i < featureArray.length; i++) {
            var feature = new Object();
            feature.featureType = determineFeatureType();
            feature.featureID = parseInt(featureArray[i]);
            console.log(featureArray[i],determineFeatureType());
            var data = JSON.stringify(feature);
            $.ajax({
                url: '/getcosteffectiveness',
                type: "post",
                contentType: 'application/json; charset=utf-8',
                data: data,
                dataType: 'json',
                success: function(r) {
                    var compareFeatures = fieldCompareResult.getSource().getFeatures();
                    var updateFeature;
                    for (var j = 0; j < compareFeatures.length; j++) {
                        // console.log(r[4].toString());
                        if(compareFeatures[j].getProperties().name == r[4].toString()){
                            updateFeature = compareFeatures[j];
                        }
                    }
                    updateFeature.setProperties({
                        'CEF': r[0].toFixed(4),
                        'CES': r[1].toFixed(4),
                        'CEN': r[2].toFixed(4),
                        'CEP': r[3].toFixed(4)
                    });
                }
            });
        }
    }

    var selectedCompareResultFeature;
    compareresultMapSingleClick.on('select', function(event) {

        selectedCompareResultFeature = event.selected[0];
        var b = compareresultMap.getLayers().getArray()[1];

        if (selectedCompareResultFeature) {
            drawCompareFeatureChart();
            b.setStyle(outletDefaultStyle);
        } else {
            compareresultMapSingleClick.getFeatures().clear();
            if ($('#show-flow-compare-result').prop("disabled") === true) {
                drawCompareOutletChart("flow");
            }
            if ($('#show-sediment-compare-result').prop("disabled") === true) {
                drawCompareOutletChart("sediment");
            }
            if ($('#show-tn-compare-result').prop("disabled") === true) {
                drawCompareOutletChart("tn");
            }
            if ($('#show-tp-compare-result').prop("disabled") === true) {
                drawCompareOutletChart("tp");
            }
            if ($('#show-c-compare-result').prop("disabled") === true) {
                drawCompareOutletChart("cost");
            }
            if ($('#show-r-compare-result').prop("disabled") === true) {
                drawCompareOutletChart("revenue");
            }
            if ($('#show-nr-compare-result').prop("disabled") === true) {
                drawCompareOutletChart("netreturn");
            }
            b.setStyle(outletSelectStyle);
        }
    });

    function drawCompareOutletChart(s) {
        compareresultMapSingleClick.getFeatures().clear();
        $("#offsite-compare-chart").attr("disabled", true);
        $("#onsite-compare-chart").attr("disabled", false);
        var data = [];
        if (s === "sediment") {
            data = outletCompareSediment;
            $('#model-compare-chart').highcharts({
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
                    lineWidth: 1,
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
        if (s === "flow") {
            data = outletCompareFlow;
            $('#model-compare-chart').highcharts({
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
                    lineWidth: 1,
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
        if (s === "tp") {
            data = outletCompareTp;
            $('#model-compare-chart').highcharts({
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
                    lineWidth: 1,
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
        if (s === "tn") {
            data = outletCompareTn;
            $('#model-compare-chart').highcharts({
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
                    lineWidth: 1,
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

        if (s == "cost") {
            var ecoType = JSON.stringify(s);
            $.ajax({
                url: '/drawecooutletcomparechart',
                type: "post",
                contentType: 'application/json; charset=utf-8',
                data: ecoType,
                dataType: 'json',
                success: function(r) {
                    // console.log(r);

                    var averageCost = 0;

                    for (i = 0; i < r.length; i++) {
                        data.push(r[i]);
                        averageCost += r[i];
                    }


                    outlet3.setProperties({
                        "cost": averageCost / r.length,
                    });

                    $('#model-compare-chart').highcharts({
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
                                text: 'Value' + " ( Outlet )"
                            },
                            lineWidth: 1,
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
            });
        }
        if (s == "revenue") {
            var ecoType = JSON.stringify(s);
            $.ajax({
                url: '/drawecooutletcomparechart',
                type: "post",
                contentType: 'application/json; charset=utf-8',
                data: ecoType,
                dataType: 'json',
                success: function(r) {
                    // console.log(r);

                    var averageRevenue = 0;

                    for (i = 0; i < r.length; i++) {
                        data.push(r[i]);
                        averageRevenue += r[i];
                    }


                    outlet3.setProperties({
                        "revenue": averageRevenue / r.length,
                    });

                    $('#model-compare-chart').highcharts({
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
                                text: 'Value' + " ( Outlet )"
                            },
                            lineWidth: 1,
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
            });
        }
        if (s == "netreturn") {
            var ecoType = JSON.stringify(s);
            $.ajax({
                url: '/drawecooutletcomparechart',
                type: "post",
                contentType: 'application/json; charset=utf-8',
                data: ecoType,
                dataType: 'json',
                success: function(r) {
                    // console.log(r);

                    var averageNetreturn = 0;

                    for (i = 0; i < r.length; i++) {
                        data.push(r[i]);
                        averageNetreturn += r[i];
                    }


                    outlet3.setProperties({
                        "netreturn": averageNetreturn / r.length,
                    });

                    $('#model-compare-chart').highcharts({
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
                                text: 'Value' + " ( Outlet )"
                            },
                            lineWidth: 1,
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
            });
        }
    }

    function drawCompareFeatureChart() {
        var feature = new Object();
        feature.ID = parseInt(selectedCompareResultFeature.getProperties().name);
        feature.Type = selectedLayer;
        feature.ResultType = determineFeatureCompareResultType();

        var featureJson = JSON.stringify(feature);
        $.ajax({
            url: '/comparechart',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: featureJson,
            dataType: 'json',
            success: function(r) {
                var dataArray = [];

                for (var i = 0; i < r.length; i++) {
                    r[i] = parseFloat(Math.round(r[i] * 100) / 100).toFixed(2);
                    dataArray[i] = parseFloat(r[i]);
                }

                var average = [];
                var averageNum;
                if (feature.ResultType == "sediment") {
                    averageNum = selectedCompareResultFeature.getProperties().sediment;
                    averageNum = parseFloat((Math.round(averageNum * 100) / 100).toFixed(2));

                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }


                }
                if (feature.ResultType == "flow") {
                    averageNum = selectedCompareResultFeature.getProperties().flow;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(2);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "tn") {
                    averageNum = selectedCompareResultFeature.getProperties().tn;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(2);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "tp") {
                    averageNum = selectedCompareResultFeature.getProperties().tp;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(2);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "cost") {
                    averageNum = selectedCompareResultFeature.getProperties().cost;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(2);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "revenue") {
                    averageNum = selectedCompareResultFeature.getProperties().revenue;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(2);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                if (feature.ResultType == "netreturn") {
                    averageNum = selectedCompareResultFeature.getProperties().netreturn;
                    averageNum = parseFloat(Math.round(averageNum * 100) / 100).toFixed(2);
                    averageNum = parseFloat(averageNum);
                    for (i = 0; i < 10; i++) {
                        average[i] = averageNum;
                    }
                }
                $('#model-compare-chart').highcharts({
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
                        lineWidth: 1,
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
                        data: dataArray,
                        color: '#99EAA4'
                    }]
                });
                $("#sel2").val(selectedCompareResultFeature.getProperties().name);
            }
        });
    }


    function determineFeatureCompareResultType() {
        if ($('#show-flow-compare-result').prop("disabled") === true) {
            return "flow";
        }
        if ($('#show-sediment-compare-result').prop("disabled") === true) {
            return "sediment";
        }
        if ($('#show-tn-compare-result').prop("disabled") === true) {
            return "tn";
        }
        if ($('#show-tp-compare-result').prop("disabled") === true) {
            return "tp";
        }
        if ($('#show-c-compare-result').prop("disabled") === true) {
            return "cost";
        }
        if ($('#show-r-compare-result').prop("disabled") === true) {
            return "revenue";
        }
        if ($('#show-nr-compare-result').prop("disabled") === true) {
            return "netreturn";
        }
    }

    $("#result-issue-submit2").click(function(event) {
        $("#result-issue-talk2").hide();
        if ($("#result-issue-title2").val().length === 0) {
            $("#result-issue-title2").addClass("input-err");
            $("#result-issue-title2").prop("placeholder", "Please write issue title");
        } else {
            $("#result-issue-title2").removeClass("input-err");
        }
        if ($("#sel2").val().length === 0) {
            $("#sel2").addClass("input-err");
            $("#sel2").prop("placeholder", "Please select a feature");
        } else {
            $("#sel2").removeClass("input-err");

        }
        if ($("#sel2").val().length !== 0 && $("#result-issue-title2").val().length !== 0) {
            var s = $("#user-id").html();
            var currentdate = new Date();
            var datetime = " " + currentdate.getDate() + "/" + (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
            $("#result-issue-timeline2").append(' <li class="timeline-inverted"><div class="timeline-badge"><i class="glyphicon glyphicon-check"></i></div><div class="timeline-panel"><div class="timeline-heading"><p><small class="text-muted"><i class="glyphicon glyphicon-time"></i>' + datetime + " via " + s + '</small></p></div><div class="timeline-body"><p>' + $("#result-issue-title2").val() + '</p></div></li>');
            $("#result-issue-timeline2 .timeline-inverted").click(function(event) {
                $("#talk-title2").html("");
                $("#result-issue-talk2").css('height', $("#responsive-timeline2").height() + 5);
                $("#result-issue-talk2").css('width', $("#result-issues2").width());
                var issueTitle = $(this).find(".timeline-body").children('p').html();
                // alert(issueTitle);
                $("#talk-title2").append('<p><span style="font-weight:bold"> Issue title : ' + issueTitle + '</span></p>');
                var h = $("#result-issue-talk2").height() - 190;
                $("#talk-content2").css('height', h + "px");
                $("#result-issue-talk2").show("slow");

            });
        }
    });

    $("#result-issue-comment-reply2").click(function(event) {
        if ($("#issue-comment2").val().length === 0) {
            $("#issue-comment2").prop("placeholder", "Comment empty");
            $("#issue-comment2").addClass('input-err');
        } else {
            $("#issue-comment2").removeClass('input-err');
            $("#talk-content2").append(' <hr> ' + $("#issue-comment2").val());
            $("#issue-comment2").val("");
        }
    });

    $("#result-issue-comment-close2").click(function(event) {
        $("#result-issue-talk2").hide();
    });

    $("#model-optimize-btn").click(function(event) {
        /* Act on the event */
        // getSelectedFeatures(scenarioID);
        addLayertoOptimizeresultMap(selectedLayer);

        $("#process-icon4").removeClass('btn-danger').addClass('btn-success');
        $("#process-icon4 span:first").removeClass('text-danger').addClass('text-success');
        $("#process-icon5").removeClass('btn-default').addClass('btn-danger');
        $("#process-icon5 span:first").removeClass('text-default').addClass('text-danger');
        progress = "optimizeScenario";
        resizePage = 5;

        $("html, body").animate({ scrollTop: $('#model-optimize-page').offset().top }, 1000);

    });

    function addLayertoOptimizeresultMap(selectedLayer) {
        if (selectedLayer === "subbasin") {
            optimizeresultMap.removeLayer(optimizeresultMap.getLayers().getArray()[1]);
            optimizeresultMap.addLayer(subbasinJsonp);
        }
        if (selectedLayer === "field") {
            optimizeresultMap.removeLayer(optimizeresultMap.getLayers().getArray()[1]);
            optimizeresultMap.addLayer(fieldJsonp);
        }
    }

    function getSelectedFeatureIDs() {
        var selectedFeatureIDs = [];
        $('#bmp-select-table table .selectedFeatureID').each(function() {
            var m = $(this).html();
            selectedFeatureIDs.push(m);
        });
        return selectedFeatureIDs;
    }
    // ************************************************************************************************************************************************************
    //
    //                                                                      BMP OPTIMIZE PAGE
    //                                  
    // ************************************************************************************************************************************************************

    $("#runOptimizationModel").attr('disabled', true);

    function optStyleSedimentFunction(feature, resolution) {
        var properties = feature.getProperties();
        var value = feature.getProperties().sediment;
        if (value !== 0) {
            return selectedStyle;
        } else {
            return fieldStyle;
        }
    }

    function optStyleFlowFunction(feature, resolution) {
        var properties = feature.getProperties();
        var value = feature.getProperties().flow;
        if (value !== 0) {
            return selectedStyle;
        } else {
            return fieldStyle;
        }
    }

    function optStyleTpFunction(feature, resolution) {
        var properties = feature.getProperties();
        var value = feature.getProperties().tp;
        if (value !== 0) {
            return selectedStyle;
        } else {
            return fieldStyle;
        }
    }

    function optStyleTnFunction(feature, resolution) {
        var properties = feature.getProperties();
        var value = feature.getProperties().tn;
        if (value !== 0) {
            return selectedStyle;
        } else {
            return fieldStyle;
        }
    }



    var optimizationMapPointerMove = new ol.interaction.Select({
        condition: ol.events.condition.pointerMove,
        filter: function(feature, layer) {

            for (var i = 0; i < bmpAssignmentArray.length; i++) {
                if (bmpAssignmentArray[i].featureID == feature.getProperties().name) {
                    return true;
                }
            }
            return false;
        },
    });



    var optimizeresultMap = new ol.Map({
        target: 'optimize-result-map',
        layers: [tiledRaster, fieldJsonp],
        view: new ol.View({
            center: ol.proj.transform([-81.6555, 43.614], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
    });


    optimizeresultMap.addInteraction(optimizationMapPointerMove);


    var optimizationConfig = new Object();


    $("#environmentLimit").focus(function(event) {
        /* Act on the event */
        $("#environmentLimit").prop('disabled', false);
        $("#budgetLimit").prop('disabled', true);

    });

    var optResultInfoElement = document.getElementById('optimization-result-feature-info');

    var optResultInfoOverlay = new ol.Overlay({
        element: document.getElementById('optimization-result-feature-info'),
        positioning: 'bottom-center',
        stopEvent: false
    });

    optimizeresultMap.addOverlay(optResultInfoOverlay);

    var hoveredOptimizationResultFeature;
    optimizationMapPointerMove.on('select', function(event) {
        hoveredOptimizationResultFeature = event.selected[0];
        var num;
        if (hoveredOptimizationResultFeature) {

            // if (hoveredCompareResultFeature.getProperties().name == "outlet") {
            //     var coordinate = ol.extent.getCenter(hoveredCompareResultFeature.getGeometry().getExtent());
            //     var offsetCoordinate = [coordinate[0], coordinate[1] + 500];
            //     compareResultInfoOverlay.setPosition(offsetCoordinate);
            //     if ($('#show-flow-compare-result').prop("disabled") === true) {
            //         num = hoveredCompareResultFeature.getProperties().flow;
            //         num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
            //         $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Flow " + num);
            //     }
            //     if ($('#show-sediment-compare-result').prop("disabled") === true) {
            //         num = hoveredCompareResultFeature.getProperties().sediment;
            //         num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
            //         $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Sediment " + num);
            //     }
            //     if ($('#show-tn-compare-result').prop("disabled") === true) {
            //         num = hoveredCompareResultFeature.getProperties().tn;
            //         num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
            //         $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Total N " + num);
            //     }
            //     if ($('#show-tp-compare-result').prop("disabled") === true) {
            //         num = hoveredCompareResultFeature.getProperties().tp;
            //         num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
            //         $(compareResultInfoElement).html("FeatureID: " + hoveredCompareResultFeature.getProperties().name + "<br />" + "Total P " + num);
            //     }

            //     $(compareResultInfoElement).show();
            //     compareResultInfoOverlay.setPosition(offsetCoordinate);
            // }



            var coordinate = ol.extent.getCenter(hoveredOptimizationResultFeature.getGeometry().getExtent());
            var offsetCoordinate = [coordinate[0], coordinate[1] + 500];
            optResultInfoOverlay.setPosition(offsetCoordinate);
            if ($('#show-opt-flow-result').prop("disabled") === true) {
                num = hoveredOptimizationResultFeature.getProperties().flow;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(optResultInfoElement).html("FeatureID: " + hoveredOptimizationResultFeature.getProperties().name + "<br />" + "Flow " + num);
            }
            if ($('#show-opt-sediment-result').prop("disabled") === true) {
                num = hoveredOptimizationResultFeature.getProperties().sediment;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(optResultInfoElement).html("FeatureID: " + hoveredOptimizationResultFeature.getProperties().name + "<br />" + "Sediment " + num);
            }
            if ($('#show-opt-tn-result').prop("disabled") === true) {
                num = hoveredOptimizationResultFeature.getProperties().tn;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(optResultInfoElement).html("FeatureID: " + hoveredOptimizationResultFeature.getProperties().name + "<br />" + "Total N " + num);
            }
            if ($('#show-opt-tp-result').prop("disabled") === true) {
                num = hoveredOptimizationResultFeature.getProperties().tp;
                num = parseFloat(Math.round(num * 100) / 100).toFixed(2);
                $(optResultInfoElement).html("FeatureID: " + hoveredOptimizationResultFeature.getProperties().name + "<br />" + "Total P " + num);
            }

            $(optResultInfoElement).show();
            optResultInfoOverlay.setPosition(offsetCoordinate);


        } else {
            $(optResultInfoElement).hide();
        }
    });

    $("#show-opt-flow-result").click(function(event) {
        var a = optimizeresultMap.getLayers().getArray()[1];
        a.setStyle(optStyleFlowFunction);
        // var b = optimizeresultMap.getLayers().getArray()[1];
        // b.setStyle(outletSelectStyle);
        $('#show-opt-flow-result').attr("disabled", true);
        $('#show-opt-flow-result').siblings().attr("disabled", false);
    });
    $("#show-opt-sediment-result").click(function(event) {
        /* Act on the event */
        var a = optimizeresultMap.getLayers().getArray()[1];
        a.setStyle(optStyleSedimentFunction);
        $('#show-opt-sediment-result').attr("disabled", true);
        $('#show-opt-sediment-result').siblings().attr("disabled", false);
    });
    $("#show-opt-tn-result").click(function(event) {
        /* Act on the event */
        var a = optimizeresultMap.getLayers().getArray()[1];
        a.setStyle(optStyleTpFunction);
        $('#show-opt-tn-result').attr("disabled", true);
        $('#show-opt-tn-result').siblings().attr("disabled", false);

    });
    $("#show-opt-tp-result").click(function(event) {
        /* Act on the event */
        var a = optimizeresultMap.getLayers().getArray()[1];
        a.setStyle(optStyleTnFunction);
        $('#show-opt-tp-result').attr("disabled", true);
        $('#show-opt-tp-result').siblings().attr("disabled", false);
    });



    $('#environmentType1').change(function(event) {
        /* Act on the event */
        $('#budgetLimit').attr('placeholder', "Loading suggested value");

        optimizationConfig.selectedLayer = selectedLayer;
        optimizationConfig.selectedFeatureIDs = getSelectedFeatureIDs();
        optimizationConfig.selectedType = $(this).find(':selected').text();
        optimizationConfig.optimizationMode = "Budget";

        var jsonArray = JSON.stringify(optimizationConfig);
        $.ajax({
            url: '/getlowerupperlimites',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: jsonArray,
            dataType: 'json',
            success: function(r) {
                // console.log(r.lowerLimit);
                // console.log(r.lowerLimit + r.upperLimit);
                console.log(r.LowerLimit);
                console.log(r.UpperLimit);
                optimizationConfig.lowerLimit = r.LowerLimit;
                optimizationConfig.upperLimit = r.UpperLimit;
                $('#budgetLimit').attr('placeholder', "Between:" + r.UpperLimit + " to " + r.LowerLimit);

                $("#runOptimizationModel").attr('disabled', false);

            },
        });
    });

    $('#environmentType2').change(function(event) {
        $('#environmentLimit').attr('placeholder', "Loading suggested value");

        /* Act on the event */
        optimizationConfig.selectedLayer = selectedLayer;
        optimizationConfig.selectedFeatureIDs = getSelectedFeatureIDs();
        optimizationConfig.selectedType = $(this).find(':selected').text();
        optimizationConfig.optimizationMode = "Environmental";
        var jsonArray = JSON.stringify(optimizationConfig);
        $.ajax({
            url: '/getlowerupperlimites',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: jsonArray,
            dataType: 'json',
            success: function(r) {
                // console.log(r.lowerLimit);
                // console.log(r.lowerLimit + r.upperLimit);
                console.log(r.LowerLimit);
                console.log(r.UpperLimit);
                optimizationConfig.lowerLimit = r.LowerLimit;
                optimizationConfig.upperLimit = r.UpperLimit;
                $('#environmentLimit').attr('placeholder', "Between:" + r.UpperLimit + " to " + r.LowerLimit);

                $("#runOptimizationModel").attr('disabled', false);

            },
        });
    });



    $("#budgetCheck").change(function() {
        if (this.checked) {

            $("#environmentLimit").prop('disabled', true);
            $("#budgetLimit").prop('disabled', false);
        }
        $("#environmentCheck").prop('checked', false);

    });

    $("#environmentCheck").change(function() {

        if (this.checked) {


            $("#environmentLimit").prop('disabled', false);
            $("#budgetLimit").prop('disabled', true);
        }
        $("#budgetCheck").prop('checked', false);
    });

    $("#runOptimizationModel").click(function(event) {
        /* Act on the event */
        // optimizationConfig.upperLimit = document.getElementById();

        if (optimizationConfig.optimizationMode === "Budget") {
            optimizationConfig.lowerLimit = $("#budgetLimit").val();
        }
        if (optimizationConfig.optimizationMode === "Environmental") {
            optimizationConfig.lowerLimit = $("#environmentLimit").val();
        }


        $("#runOptimizationModel").html('Calculating ...');
        var jsonArray = JSON.stringify(optimizationConfig);
        $.ajax({
            url: '/runoptimizationmodel',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: jsonArray,
            dataType: 'json',
            success: function(r) {
                // console.log(r.lowerLimit);
                // console.log(r.lowerLimit + r.upperLimit);
                console.log(r[0].IterationNum);
                console.log(r[0].Water);
                console.log(r[0].NetReturn);
                console.log("optimization done");

                drawOptimizationChart(r);
                var optimizationLayer = renderOptimizationMap("01", optimizationConfig.selectedType);
                drawOptimizationTable(optimizationLayer);
                $("#runOptimizationModel").html('Completed');
            },
        });
    });


    function drawOptimizationChart(result) {

        var chartData = new Object();
        var chartBudgetData = new Object();

        chartData.name = optimizationConfig.selectedType;
        chartBudgetData.name = "Cost";

        var resultArray = [];
        var budgetResultArray = [];
        var yAxisValue = "";
        if (optimizationConfig.selectedType === "Water") {
            for (i = 0; i < result.length; i++) {
                resultArray.push(result[i].Water);
                budgetResultArray.push(result[i].NetReturn);
            }
            yAxisValue = "Water m^3";
            unit = "m^3";
        }
        if (optimizationConfig.selectedType === "Sediment") {
            for (i = 0; i < result.length; i++) {
                resultArray.push(result[i].Sediment);
                budgetResultArray.push(result[i].NetReturn);

            }
            yAxisValue = "Sediment ton";
            unit = "ton";

        }
        if (optimizationConfig.selectedType === "Total P") {
            for (i = 0; i < result.length; i++) {
                resultArray.push(result[i].TP);
                budgetResultArray.push(result[i].NetReturn);

            }
            yAxisValue = "Total P kg";
            unit = "kg";
        }
        if (optimizationConfig.selectedType === "Total N") {
            for (i = 0; i < result.length; i++) {
                resultArray.push(result[i].TN);
                budgetResultArray.push(result[i].NetReturn);

            }
            yAxisValue = "Total N kg";
            unit = "kg";
        }

        chartData.data = resultArray;
        chartBudgetData.data = budgetResultArray;

        // Highcharts.chart('model-optimize-chart', {

        //     title: {
        //         text: 'Pollution Reduction by Constraint'
        //     },
        //     xAxis: {
        //         categories: ['Reduction:100% Reduction', 'Reduction:90%', 'Reduction:80%', 'Reduction:70%', 'Reduction:60%', 'Reduction:50%',
        //             'Reduction:40%', 'Reduction:30%', 'Reduction:20%', 'Reduction:10%'
        //         ],
        //     },
        //     yAxis: {
        //         title: {
        //             text: yAxisValue
        //         }
        //     },
        //     legend: {
        //         layout: 'vertical',
        //         align: 'right',
        //         verticalAlign: 'middle'
        //     },

        //     credits: {
        //         enabled: false
        //     },
        //     plotOptions: {
        //         series: {
        //             pointStart: 1
        //         }
        //     },

        //     series: [chartData]

        // });


        // var optimizationChart = Highcharts.chart('model-optimize-chart', {
        //     chart: {
        //         type: 'line'
        //     },
        //     title: {
        //         text: 'Net Return Change on Reduction Constraint',
        //         style: { "fontsize": "8px" }
        //     },
        //     // subtitle: {
        //     //     text: 'Source: WorldClimate.com'
        //     // },
        //     xAxis: [{
        //         categories: chartData.data,
        //     }],
        //     yAxis: [{ // Primary yAxis
        //         labels: {
        //             format: '$ {value}',
        //             style: {
        //                 color: Highcharts.getOptions().colors[0]
        //             }
        //         },
        //         title: {
        //             text: 'Net Return Change',
        //             style: {
        //                 color: Highcharts.getOptions().colors[0]
        //             }
        //         }
        //     }, ],
        //     tooltip: {
        //         shared: true
        //     },
        //     credits: {
        //         enabled: false
        //     },
        //     legend: {
        //         layout: 'vertical',
        //         align: 'left',
        //         x: 120,
        //         verticalAlign: 'top',
        //         y: 10,
        //         floating: true,
        //         backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        //     },
        //     series: [{
        //         name: 'NetReturn',
        //         data: chartBudgetData.data,
        //         tooltip: {
        //             valueSuffix: ' $'
        //         },
        //         point: {
        //             events: {
        //                 select: function() {
        //                     // alert('Category: ' + this.category + ', value: ' + this.y);
        //                     var optimizationLayer;

        //                     if (optimizationChart.series[0].data[0].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("01", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }

        //                     if (optimizationChart.series[0].data[1].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("02", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }
        //                     if (optimizationChart.series[0].data[2].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("03", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }
        //                     if (optimizationChart.series[0].data[3].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("04", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }
        //                     if (optimizationChart.series[0].data[4].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("05", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }
        //                     if (optimizationChart.series[0].data[5].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("06", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }
        //                     if (optimizationChart.series[0].data[6].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("07", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }
        //                     if (optimizationChart.series[0].data[7].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("08", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }
        //                     if (optimizationChart.series[0].data[8].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("09", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }
        //                     if (optimizationChart.series[0].data[9].selected === true) {
        //                         optimizationLayer = renderOptimizationMap("10", optimizationConfig.selectedType);
        //                         drawOptimizationTable(optimizationLayer);
        //                     }
        //                 }
        //             }
        //         }



        //     }],
        //     plotOptions: {
        //         series: {
        //             cursor: 'pointer',

        //         }
        //     },
        // });


        var optimizationChart = $('#model-optimize-chart').highcharts({
            title: {
                text: 'Net Return Change on Reduction Constraint',
                style: { "fontsize": "8px" }
            },
            xAxis: {
                categories: chartData.data
            },
            credits: {
                enabled: false
            },

            plotOptions: {
                series: {
                    allowPointSelect: true
                }
            },
            series: [{
                data: chartBudgetData.data,
                showInLegend: false,

                point: {
                    events: {
                        select: function(event) {

                            // console.log(this.series.data[1].selected);
                            // console.log(this == this.series.data[1]);
                            var optimizationLayer;

                            if (this == this.series.data[0]) {
                                optimizationLayer = renderOptimizationMap("01", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }

                            if (this == this.series.data[1]) {
                                optimizationLayer = renderOptimizationMap("02", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }
                            if (this == this.series.data[2]) {
                                optimizationLayer = renderOptimizationMap("03", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }
                            if (this == this.series.data[3]) {
                                optimizationLayer = renderOptimizationMap("04", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }
                            if (this == this.series.data[4]) {
                                optimizationLayer = renderOptimizationMap("05", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }
                            if (this == this.series.data[5]) {
                                optimizationLayer = renderOptimizationMap("06", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }
                            if (this == this.series.data[6]) {
                                optimizationLayer = renderOptimizationMap("07", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }
                            if (this == this.series.data[7]) {
                                optimizationLayer = renderOptimizationMap("08", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }
                            if (this == this.series.data[8]) {
                                optimizationLayer = renderOptimizationMap("09", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }
                            if (this == this.series.data[9]) {
                                optimizationLayer = renderOptimizationMap("10", optimizationConfig.selectedType);
                                drawOptimizationTable(optimizationLayer);
                            }
                            // if (optimizationChart.series[0].data[1] === this) {
                            //     optimizationLayer = renderOptimizationMap("02", optimizationConfig.selectedType);
                            //     drawOptimizationTable(optimizationLayer);
                            // }                        
                        },
                        // unselect: function(event) {
                        //     var p = this.series.chart.getSelectedPoints();
                        //     if(p.length > 0 && p[0].x == this.x) {
                        //         $('#label').text('point unselected');
                        //     }
                        // }
                    }
                }
            }]
        });
    }


    var fieldOptimizationResult = function(iterationNum, selectedOptimizationType) {

        if (selectedOptimizationType === "Water") {
            $("#show-opt-flow-result").attr("disabled", true);
            $('#show-opt-flow-result').siblings().attr("disabled", false);

            return new ol.layer.Vector({
                source: new ol.source.Vector({
                    url: '/assets/data/geojson/optfield20' + iterationNum + '.json',
                    format: new ol.format.GeoJSON()
                }),
                style: optStyleFlowFunction
            });
        }
        if (selectedOptimizationType === "Sediment") {
            $("#show-opt-sediment-result").attr("disabled", true);
            $('#show-opt-sediment-result').siblings().attr("disabled", false);

            return new ol.layer.Vector({
                source: new ol.source.Vector({
                    url: '/assets/data/geojson/optfield20' + iterationNum + '.json',
                    format: new ol.format.GeoJSON()
                }),
                style: optStyleSedimentFunction
            });
        }
        if (selectedOptimizationType === "Total P") {
            $("#show-opt-tp-result").attr("disabled", true);
            $('#show-opt-tp-result').siblings().attr("disabled", false);

            return new ol.layer.Vector({
                source: new ol.source.Vector({
                    url: '/assets/data/geojson/optfield20' + iterationNum + '.json',
                    format: new ol.format.GeoJSON()
                }),
                style: optStyleTpFunction
            });
        }
        if (selectedOptimizationType === "Total N") {
            $("#show-opt-tn-result").attr("disabled", true);
            $('#show-opt-tn-result').siblings().attr("disabled", false);

            return new ol.layer.Vector({
                source: new ol.source.Vector({
                    url: '/assets/data/geojson/optfield20' + iterationNum + '.json',
                    format: new ol.format.GeoJSON()
                }),
                style: optStyleTnFunction
            });
        }
    };

    function renderOptimizationMap(iterationNum, selectedOptimizationType) {
        var optimizationFieldLayer = fieldOptimizationResult(iterationNum, selectedOptimizationType);
        optimizeresultMap.removeLayer(optimizeresultMap.getLayers().getArray()[1]);
        optimizeresultMap.addLayer(optimizationFieldLayer);
        return optimizationFieldLayer;
    }



    function drawOptimizationTable(optimizationLayer) {

        var optTableHeader = '<tr><th style="padding-top:11px;">ID</th><th style="padding-top:11px;">CC</th><th style="padding-top:11px;">CT</th><th style="padding-top:11px;">NM</th><th style="padding-top:11px;">WasCobs</th></tr>';
        var optTableString = '<table class="table table-condensed table-hover" id="optmizationTable">' + optTableHeader;
        var optimizationFeatures;
        setTimeout(function() {
            optimizationFeatures = optimizationLayer.getSource().getFeatures();
            for (var i = 0; i < optimizationFeatures.length; i++) {
                if (optimizationFeatures[i].getProperties().OptBMPs.length !== 0) {
                    optTableString += '<tr><td style="padding-top:11px;">' + optimizationFeatures[i].getProperties().name + '</td><td style="padding-top:11px;">' + hasCrp(optimizationFeatures[i].getProperties().OptBMPs) + ' </td><td style="padding-top:11px;">' + hasCov(optimizationFeatures[i].getProperties().OptBMPs) + '</td><td style="padding-top:11px;">' + hasNMAN(optimizationFeatures[i].getProperties().OptBMPs) + '</td><td style="padding-top:11px;">' + hasWAS(optimizationFeatures[i].getProperties().OptBMPs) + '</td></tr>';
                }
            }
            optTableString += "</table>";

            document.getElementById("bmp-optimize-table").innerHTML = optTableString;
        }, 1000);

        // for (var i = 0; i < bmpAssignmentArray.length; i++) {
        //      if (featureID == bmpAssignmentArray[i].featureID) {
        //          var level = feature.getProperties().flow;
        //          level = parseFloat(level.toFixed(2));
        //          if (level > 0) {
        //              return [customizedStyleBad];
        //          } else if (0 >= level && level > -1) {
        //              return [customizedStyleLow];
        //          } else if (-1 >= level && level > -2) {
        //              return [customizedStyleMedium];
        //          } else if (-2 >= level && level > -2.5) {
        //              return [customizedStyleHigh];
        //          } else {
        //              return [customizedStyleGreat];
        //          }
        //      }
        //  }
    }

    function hasCov(s) {
        var str = s;
        var n = str.search(/All/i);
        if (n !== -1) {
            return "Y";
        }
        n = str.search(/Til/i);
        if (n !== -1) {
            return "Y";
        }
        return "N";
    }

    function hasNMAN(s) {
        var str = s;

        var n = str.search(/All/i);
        if (n !== -1) {
            return "Y";
        }
        n = str.search(/NMAN/i);
        if (n !== -1) {
            return "Y";
        }
        return "N";

    }

    function hasCrp(s) {
        var str = s;
        var n = str.search(/All/i);
        if (n !== -1) {
            return "Y";
        }
        n = str.search(/Crp/i);
        if (n !== -1) {
            return "Y";
        }
        return "N";

    }

    function hasWAS(s) {
        var str = s;

        var n = str.search(/All/i);
        if (n !== -1) {
            return "Y";
        }
        n = str.search(/Was/i);
        if (n !== -1) {
            return "Y";
        }
        return "N";
    }
    // document.getElementById("environmentLimit").addEventListener("change", function(event) {
    //     /* Act on the event */
    //     console.log("this.value");
    //     document.getElementById("budgetLimit").disabled = true;
    // });
    // document.getElementById("environmentLimit").addEventListener("focus", function(event) {
    //     /* Act on the event */
    //     document.getElementById("environmentLimit").disabled = false;
    //     document.getElementById("budgetLimit").disabled = true;
    // });

    // document.getElementById("budgetLimit").addEventListener("focus", function(event) {
    //     document.getElementById("budgetLimit").disabled = false;
    //     document.getElementById("environmentLimit").disabled = true;
    // });



    // ****************************************************
    //                      DRAW CHART
    // ****************************************************



    $('#model-compare-chart').highcharts({
        title: {
            text: '',
            x: -20 //center
        },

        xAxis: {
            categories: ['Iter:10', 'Iter:9', 'Iter:8', 'Iter:7', 'Iter:6', 'Iter:5',
                'Iter:4', 'Iter:3', 'Iter:2', 'Iter:1'
            ],
        },
        yAxis: {
            title: {
                text: 'Value'
            },
            lineWidth: 1,
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
            data: []
        }, {
            name: 'Yr',
            data: []
        }]
    });

    Highcharts.chart('model-optimize-chart', {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: 'Pollution Reduction on Constraint',
            style: { "fontsize": "8px" }
        },
        // subtitle: {
        //     text: 'Source: WorldClimate.com'
        // },
        credits: {
            enabled: false
        },
        xAxis: [{
            categories: ['Iter:10', 'Iter:9', 'Iter:8', 'Iter:7', 'Iter:6', 'Iter:5',
                'Iter:4', 'Iter:3', 'Iter:2', 'Iter:1'
            ],
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '$ ',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: 'Net Return',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }, { // Secondary yAxis
            title: {
                text: "",
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 120,
            verticalAlign: 'top',
            y: 20,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            enabled: false
        },
        series: [{
            name: 'NetReturn',
            type: 'column',
            yAxis: 1,
            data: [],
            tooltip: {
                valueSuffix: ' $'
            }

        }, {
            name: "",
            type: 'spline',
            data: [],
            tooltip: {
                valueSuffix: " "
            }
        }]
    });


    $("#generate-report-btn3").click(function(event) {
        /* Act on the event */
        $(".report_enter").slideUp("slow", function() {
            $(".report_exit").show("slow");
        });

    });
    $("#close-report3").click(function(event) {
        /* Act on the event */
        $(".report_exit").hide();
        $(".report_enter").show("slow");
    });

});
