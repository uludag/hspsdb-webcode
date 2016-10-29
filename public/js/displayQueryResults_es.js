

function displayQueryResults(result, nextprevq, query)
{
    var esqhits = result.hits.hits;
    var nhits = result.hits.total;
    var aggs = result.aggregations;

    //Hide graph tabs until the data ready
    $("#pivottabletab").hide();

    //remove previous results if any
    $("#tablescontainer").empty();

    if(nhits > 0) {
        var ptinput = new Array();
        ptinput.push(ptGetHeaders());
        var tables = document.getElementById('tablescontainer');
        $(tables).show();
        if(nhits>1)$("#navigation").show();
        else $("#navigation").hide();
        $("#nresults").html(
            "Number of read mappings found: "
            + "<span style='color:#333;'>" + nhits
            + "</span>"

            +"&nbsp;&nbsp;&nbsp;&nbsp;Number of SAM files: "
            + "<span style='color:#333;'>" + aggs.file.buckets.length
            + "</span>"
            +"<span style='padding-left:1em'>Query was: </span>"
            +"<span style='color:#333;'>" + query + "</span>"
            );
        $("#notifications").text("");
        $("#rows").val(esqhits.length);

        aggs.file.buckets.forEach(displaySAMfile);

        if(nextprevq===undefined || nextprevq===false)
            update_facetcounts(query, aggs);
    }
    else
    {
        $("#nresults").text("");
        $("#notifications").html("No results found."
                +"<span style='color:#f77709; padding-left:1em'>query was: </span>"
                +"<span style='color:#333;'>" + query + "</span>"
                );
        $("#navigation").hide();
    }
    ptinput = undefined; //pt_prepareInputs(aggs);
    return ptinput;
};


function displaySAMfile(samfile, r, nSearches) {
    var file = samfile.key;
    var l = "<p class='bresult'>"
        + "<a href='?q=filename:\"" + file + "\"'>" + file + "</a> ";

    l += "(<a href=/esr/retrieve-blast-output?q=" + file + ">json output</a>)"
        + "(TODO:link/full result view)"
        +"</p>";

    l += "<p><b>#reads</b>: " + samfile.doc_count;
    l += "</p>";
    $("#tablescontainer").append(l);
    return l;
}
