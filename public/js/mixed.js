

function showalert(alert_placeholder, message) {

    $('#'+alert_placeholder).html(
        '<div id="alertdiv" class="alert alert-warning alert-dismissible" role="alert">'
        + '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
        +'<span aria-hidden="true">&times;</span></button>'
        +message+'</div>');

    setTimeout(function() {
        // this will automatically close the alert and remove this
        // if the users doesnt close it in 5 secs
        $("#alertdiv").remove();
    }, 5000);
}


function set_onpopstate()
{
    window.onpopstate = function(e)
    {
        if(e.state)
        {
            //$("#searchresults").html(e.state.searchresults);
            //
            lastqueryresult = e.state.lastqueryresult;
            displayQueryResults(lastqueryresult, false, e.state.query);
            toggleAnnotations();

           //console.log("query poped "+e.state.query);
            $("#q").val(decodeURIComponent(e.state.query));

            var s = lastqueryresult.responseHeader.params.start;

            if(s!==undefined)
                $("#startfrom").val(parseInt(s)+1);

            var r = lastqueryresult.responseHeader.params.rows;

            if(r!==undefined)
                $("#rows").val(r);

            //onclickhandlersForFilterCheckboxes();
        }
    };
}


// reusable sort functions, sort by any field
// ex1: homes.sort(sort_by('price', true, parseInt));
// ex2: homes.sort(sort_by('city', false, function(a){return a.toUpperCase()}));
var sort_by = function(field, reverse, primer)
{
   var key = primer ?
       function(x) {return primer(x[field]);} :
       function(x) {return x[field];};

   reverse = !reverse ? 1 : -1;

   return function (a, b) {
       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
     };
};
