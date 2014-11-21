var from_ = "", to_ = "";
autofunc = function(field_name, select_func) {
    $("#autocomplete_"+field_name).autocomplete({
        source: function(request, response) {
            $.ajax({
                type: "get",
                url: "/places",
                dataType: "json",
                data: {
                    q: request.term,
                },
                success: function(data) {
                    response(
                        $.map(data, function(item) {
                            return {
                                label: item.name,
                        value: item.name,
                        id: item.id
                            }
                        }))
                }
            })
        },
            minLength: 2,
            select: select_func,
            open: function() {
                $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
            },
            close: function() {
                $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
            }
    });
}

call_journeys = function() {
    $.ajax({
        type: "get",
    url: "journeys",
    dataType: "json",
    data: {
        from: from_, to: to_
    },
    success: function(data) {
        var line_points = [];
        var featureGroup = L.featureGroup().addTo(map_);
        $.map(data, function(section) {
            line_points = [];
            if (!section.hasOwnProperty("geojson")) {
                return;
            }
            if (!section.geojson.hasOwnProperty("coordinates")) {
                return;
            }
            color = '#000';
            if ("display_informations" in section && "color" in section.display_informations) {
                color = "#"+section.display_informations.color;
            }
            $.map(section.geojson.coordinates, function(point) { line_points.push([point[1], point[0]]); });
            var polyline_options = {
                color: color
            };
            L.polyline(line_points, polyline_options).addTo(map_);
        });
    }
    });
}

$(document).ready(function () {
    autofunc("from", function(event, ui){from_ = ui.item.id});
    autofunc("to", function(event, ui){to_ = ui.item.id; call_journeys();});

    L.mapbox.accessToken = 'pk.eyJ1IjoibC12aW5jZW50LWwiLCJhIjoiaDJfM05UMCJ9.l9oR075SSzJY9hXEqaRvoQ';
    map_ = L.mapbox.map('map', 'examples.map-i86nkdio')
    .setView([48.8, 2.3], 11);

});
