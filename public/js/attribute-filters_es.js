
var ffl =[
    ["search", "query_id"],
    ["search_target","db"],
    ["report", "program"],
    ["hsps", "filteredhsps", "hsps2hits", "description.sciname"],
    ["hsps", "filteredhsps", "hsps2hits", "description.accession"],
    ["hsps", "filteredhsps", "hseq"]
];
var fflnames =[
    "Query sequences",
    "Sequence databases",
    "Search type/program",
    "Species/sequence-source",
    "Matched sequences/entries",
    "Sequence segments matched"
];
var units =[
    "#searches",
    "#matches",
    "#matches",
    "#matches",
    "#matches",
    "#HSP matches"
];


function getbuckets(fc, path)
{
    var i, ret;
    var buckets = fc;

    for(i = 0; (i < path.length && buckets !== undefined); i++)
    {
        buckets = buckets[path[i]];
    }
    if(buckets !== undefined )
        ret = {
            buckets: buckets.buckets,
            other_doc_count: buckets.sum_other_doc_count
        };
    return ret;
}


function aggregationGroupHeader(r, i){
    var h;
    h = "<li class='attrfilterheader'>";
    h += (r.other_doc_count + r.buckets.length);
    h += " <span style='font-weight:bold'>" + fflnames[i]
        + "</span> (" + units[i] + ")";
    h += "</li>";
    if(r.other_doc_count > 0)
        h += "<span style='font-size:-3;'>(only " + r.buckets.length
        + " listed)</span>";
    return h;
}


function attributefilters(query, fc)
{
    var i, j, l, v, r;
    var newli, headerli, buckets;

    //get selected filters if any
    l = $("input:checked[name=topic]");
    v = new Array();
    for(i=0; i < l.length; i++)  v.push($(l[i]).val());

    var ul = $("#attrfilters");
    ul.empty();

    for(i=0;i<ffl.length;i++)
    {
        var facets="";
        r = getbuckets(fc, ffl[i]);
        if(r === undefined)  continue;
        buckets = r.buckets;
        headerli = aggregationGroupHeader(r, i);

        for(j=0;j<buckets.length;j++)
        {
            var title = buckets[j].key;

            newli = "<li><input name='topic' "
                + " value='" + buckets[j].key + "'"
                + " path='" + ffl[i] + "'";

            if(v.indexOf(buckets[j].key)!== -1)  newli += " checked='checked'";

            newli += " type='checkbox'> <a href='"
                + attrFilterQuery(query, ffl[i], buckets[j].key)+"'"
                + "ffl='" + ffl[i] + "'"
                + "fval='" + buckets[j].key + "'"
                + "title='click me to filter results with "
                + buckets[j].key + "'"
                +">"
                +title
                +"</a> ("+buckets[j].doc_count;

            newli +=")</li>";

            facets += newli;
        }
        if(facets !== "")  $(ul).append(headerli+"<div>"+facets+"</div>");
    }

    $("#attrfilters a").click(function(event)
    {
        event.preventDefault();
        $(this).siblings("input").prop("checked", "checked");
        attrFilterQuerySubmit(query, this);
    });

    $("input[name=topic]").click(function cbclick(e)
    {
        var a = $(this).siblings().first();
        var attrfilter = $(a).attr("ffl");
        var attrfilterval = $(a).attr("fval");

        if($(this).prop("checked") === true)
            addSelectedFilterEntry(attrfilter, attrfilterval);
        else
        {
            $("#"+attrfilterval.replace(attvalsafe, "")).remove();
        }
    });
}


function attrFilterQuery(q, ff, a) {
    var fq;
    fq = "?q=" + (q.length === 0 ? "*" :
        encodeURIComponent(q).replace("'","%27"));
    fq += "&attrfilter=" + ff + "&attrfilterval=" + a;
    return fq;
}


var attvalsafe = /[\(\):34 \.\/\"]/g;

// Adds an entry, close to the search box
// that allows deleting the selected attribute filter
function addSelectedFilterEntry(attrfilter, attrfilterval)
{
    var id = attrfilterval.replace(attvalsafe, "");
    if($("#" + id).size() === 0)
    {
        var qp = attrfilter+":\""+attrfilterval+"\"";
        $("#atfl").append(
            "<li id='" + id + "'>"
            + qp
            + " [<a href='#' "
            + "title='click me to repeat the current query without this filter'"
            + ">X</a>]</li>"
            );

        var li = $("#atfl li").last();
        var a = $(li).children('a');

        $(a).click(function (e){
            e.preventDefault();
            $("li a[ffl=\""+attrfilter+"\"][fval=\""+attrfilterval+"\"]")
                .prev().prop("checked", false);
            // update results
            executeFormQuery(false);
            $(li).remove();
        });
    }
}


function attrFilterQuerySubmit(q, a)
{
    var ffl = $(a).attr("ffl");
    var fval = $(a).attr("fval");
    var cb = $(a).siblings().first();
    
    if( !$(cb).is(":checked") )
        $(cb).prop("checked", "checked");

    addSelectedFilterEntry(ffl, fval);
    executeQueryDisplayResults(server, q, false);
}


// Update aggregation results on the right panel
function update_facetcounts(query, fc)
{
    if(fc === undefined)  return;

    attributefilters(query, fc);
    $("#leftcontent").show();
}
