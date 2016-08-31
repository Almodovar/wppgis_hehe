// $( document ).ready(function() {
//  $(".delete-scenario").click(function(event) {
//      var scenario_name = $(this).siblings('td:first').text();
//      var scenario_created_time = $(this).siblings('td:first').next().text();

//      $.ajax({
//                     url: '/deletescenario',
//                     type: "post",
//                     contentType: 'application/json; charset=utf-8',
//                     data: JSON.stringify({ ScenarioName: scenario_name, ScenarioCreatedTime: scenario_created_time }),
//                     dataType: 'text',
//                     success: function(r) {
//                      $("table").prepend('');
//                     }
//                 });
//  });


// });

$(document).ready(function() {
    $(".deletescenario").click(function(event) {

        // alert("hello");
        var scenario_name = $(this).siblings('td:first').text();
        var scenario_created_time = $(this).siblings('td:first').next().text();
        var scenario_id = $(this).siblings('td:first').next().next().text();

        var selected_scenario = $(this);

        $.ajax({
            url: '/deletescenario',
            type: "post",
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ ID: scenario_id, Name: scenario_name, CreatedAt: scenario_created_time }),
            dataType: 'text',
            success: function(r) {

                // Update needed: using response to render the div
                $('#scenario-notification').fadeIn('slower').delay(1000).fadeOut('slower');
                selected_scenario.closest('tr').remove();

            }
        });
    });

    $("#scenario-table tr").click(function(event) {

        $(this).siblings().css("background-color", "");
        $(this).css({
            "background-color": "rgba(0, 30, 255, 0.3)",
        });

    });
});
