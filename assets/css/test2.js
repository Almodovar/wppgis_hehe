$(document).ready(function() {
    $(".deletescenario").click(function(event) {

        // alert("hello");
        var name = $(this).siblings('td:first').text();
        var name2 = $(this).siblings('td:first').next().text();

        $('#scenario-notification').fadeIn('slower').delay(1000).fadeOut('slower');

        $(this).closest('tr').remove();

    });

    $("#scenario-table tr").click(function(event) {

        $(this).siblings().css("background-color", "");
        $(this).css({
            "background-color": "rgba(0, 30, 255, 0.3)",
        });

    });
});
