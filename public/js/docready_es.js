
index = "hspsdb-test";
server = window.location.origin + "/esr/";

function selecttab(a)
{
    $("li",$(a).parent().parent()).removeClass("active");
    $(a).parent().addClass("active");
}


function tabclick(event)
{
    var id = $(this).attr("id");
    event.preventDefault();

    if(id==="browse")
    {
        $("#staticcontent").hide();
        $("#searchresults").show();
        executeQueryDisplayResults(server, index, '*', false);
        return;
    }
    selecttab(this);

    var file = $(this).attr("href");
    if(file!=="#")
    {
        tabload(file.substr(1)+".html");
    }
    return;
};


function tabload(file){
    $("#staticcontent").load(file);
    $("#staticcontent").show();
    $("#searchresults").hide();
    $("#navigation").hide();
    $("#exprvals").hide();
    if(file === "statistics.html") annotstats();
};


function queryformsubmit( event )
{
    if(event!==undefined)
    {
        event.preventDefault();
        if(event.originalEvent===undefined)
            return;

        $("#startfrom").val(1);
    }

    $("#staticcontent").hide();
    $("#searchresults").show();
    executeFormQuery(false);
}


function ncbiimport(event)
{
    if(event!==undefined)
    {
        event.preventDefault();
        if(event.originalEvent===undefined)
            return;        
    }
    
    var jobid = $("#ncbijobid").val();
    $.ajax({
        url: server+"ncbiimport?jobid=" + jobid,
        type: "GET",
        success: function(data)
        {
            $('#msg').text("import req returned: " + data);
        },
        error: function(err)
        {
            $('#msg').text("import req returned error: " + err);
        },
        timeout: 14000
    });
}


function documentready()
{
    if("index" in window) autocompleteConfig_es();
    $("#ncbiimport").submit(ncbiimport);

    if($("#searchresults").size() > 0)
    {
        var tables = document.getElementById('tablescontainer');
        $(tables).hide();
        $("#leftcontent").hide();
        $("#query-form").submit(queryformsubmit);
        

        $("#query-form a").click(function(event)
        {
            event.preventDefault();
            term = $(this).text();
            $("#q").val(term);
            executeFormQuery(false);
        });
    }

    var query = getURLParam("q");

    if(query===undefined)
    {
        //var page = getURLParam("page");
        //tabload((page===undefined?"home":page)+".html");
        query = $("#q").val();
    }

    if(query===undefined)
        query="*";
    
    if("index" in window) {
        $("#staticcontent").hide();
        $("#searchresults").show();
        executeQueryDisplayResults(server, index, query, false);
    };

    $("#startfrom, #rows").keydown(changeSetOfResultsDisplayed);

    $("#emax").keydown(function( event )
    {
        if( event.which === 13 )
        {
            event.preventDefault();
            executeFormQuery(false);
        }
    });
    
    
    var attrfilter = getURLParam("attrfilter");
    var attrfilterval = getURLParam("attrfilterval");
    if(attrfilter!==undefined)
    {
        addAttrFilterCheckbox(attrfilter, attrfilterval);
    }
};


function changeSetOfResultsDisplayed( event )
{
    if( event.which === 13 )
    {
        event.preventDefault();
        if(checkResultSetBounds())
            executeFormQuery(true);
    }
}


function autocompleteConfig_es()
{
    var searchurl =  server + index + "/_suggest";

    $("#q").autocomplete(
    {
        source: function(request, response)
        {
            var charstyped = request.term.toLowerCase();
            var postData =
            {
                "text": charstyped,
                "termsuggestion": {
                    "term": {
                        //"prefix_length": 2,
                        "field": "_all",
                        //"max_inspections": 4000,
                        //"min_word_length": 3,
                        "size": 200
                    }
                }//,
//                "complsuggestion":
//                {
//                    "completion":
//                    {
//                        "field": "suggest",
//                        size: 10
//                    }
//                }
            };
            $.ajax({
                url: searchurl,
                type: "POST",
                dataType: "JSON",
                contentType:"application/json; charset=utf-8",
                data: JSON.stringify(postData),
                success: function(data)
                {
                    var i;
                    var a = new Array();
                    if(data.termsuggestion!==null)
                    {
                        for(i=0; i<data.termsuggestion.length; i++)
                            Array.prototype.push.apply(a, data.termsuggestion[i].options);
                    }
//                    if(data.complsuggestion!==null && data.complsuggestion.length>0)
//                        Array.prototype.push.apply(a, data.complsuggestion[0].options);
                    response($.map(a, function(item)
                    {
                        return {
                            label: item.text
                        };
                    }));
                }
            });
        },
        minLength: 1
    });
}


$(document).ready(function(){documentready();});


jQuery["postJSON"] = function( url, data, callback )
{
    // shift arguments if data argument was omitted
    if ( jQuery.isFunction( data ) ) {
        callback = data;
        data = undefined;
    }

    return jQuery.ajax({
        url: url,
        type: "POST",
        contentType:"application/json; charset=utf-8",
        dataType: "json",
        data: data,
        success: callback,
        timeout: 14000
    });
};


function getURLParam(name)
{
   var r = new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)');
   var ret = r.exec(location.search);
   if(ret!==null)
      return decodeURIComponent(ret[1]);
}


function executeFormQuery(prevnextq)
{
    var query = $("#q").val();
    executeQueryDisplayResults(server, index, query, prevnextq);
}
