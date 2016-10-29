// query paths for facet fields defined in attribute-filters.js
var qpaths={
    cigar: "cigarString",
    read: "readString"
};


function executeQueryDisplayResults(server, querywof, nextprevq, facets)
{
    var startfrom = $("#startfrom").val();
    //var rows = $("#rows").val();

    $("#q").val(decodeURIComponent(querywof));

    var qurl = server + "_search?";

    if(nextprevq===true)
        qurl += "from="+(startfrom-1);
    else
        qurl += "from=0";

    qurl += "&size=" + 5;
    $("#nresults").text("");
    $("tbody tr").remove();

    var queryrequest = getQueryRequest_QueryPlusAggs(querywof,
            facets || attrSelections());

    $("#notifications").text("Querying '" + querywof + "'please wait ....");
    var query = $("#q").val();

    $.postJSON(qurl, queryrequest, function(r){
        processQueryResults(r, query, nextprevq);
        if(facets !== undefined) attrFilterQueryTab(facets);
    }).fail(queryFailed);

};

// If the attribute filter query was called by URL
// here make sure that facet checkbox is checked after the query made
function attrFilterQueryTab(facets)
{
    var fval;
    var ffl = getURLParam("attrfilter");
    if(facets[ffl] !== undefined)
        fval = facets[ffl][0];
    var cb = $("input[value=" + fval + "]");
    if( !$(cb).is(":checked") )
        $(cb).prop("checked", "checked");
}

function queryFailed(errmsg)
{
    console.log("Query failed: "+errmsg.responseText);
    $("#notifications").text("Query failed: "+errmsg.responseText);
};


function processQueryResults(result, query, nextprevq)
{
    var ptinput =  displayQueryResults(result, nextprevq, query);

    //if(nextprevq === false) $("#startfrom").val("1");

    if(result.hits.hits.length > 0)
    {
        //$("#pivottabletab").show();
        //displayResultsInPivotTable(ptinput);
        //ssview(result.hits.hits);
    }
}


function attrSelections()
{
    var categories = {}, category, fval;

    $('input:checked[name=topic]').next().each(function(i, a)
    {
        category = $(a).attr('ffl');
        fval = $(a).attr('fval');
        if (!categories.hasOwnProperty(category)) {
            categories[category] = [];
        }
        categories[category].push(fval);
    });

    return categories;
}

var mpq = {"match_phrase": {}};
var qt = {"bool": {"should": []}};

function addAttrFilter(must, selections) {
    var i, qt_, r, p, path_, v, n;
    var attrfilters = new Map();

    for(path_ in selections) {
        var val = selections[path_];
        n = val.length;
        for(i = 0; i < n; i++){
            v = val[i];
            var a = path_.split(",");
            var mpq_ = jQuery.extend(true, {}, mpq);
            r = a[0];
            p = qpaths[r];
            
            mpq_.match_phrase[p] = v;
            
            if(attrfilters.get(r) === undefined)
                qt_ = jQuery.extend(true, {}, qt);
            else
                qt_ = attrfilters.get(r);
            
            qt_.bool.should.push(mpq_);
            attrfilters.set(a[0], qt_);
        }
    };

    attrfilters.forEach(function(e,i){
        must.push(e);
    });
}


// 'query' section of the query request

function getQueryRequest_query(query, facets)
{
    var q={
        bool:{
            must:[{query_string:{
                        fields: ["_all", "_id"],
                        default_field: "_all",
                        default_operator: "AND",
                        query: query
                    }}]/*,
            filter: {
                nested:{
                    path:"BlastOutput2.report.results.search.hits",
                    query:{
                        nested:{
                            path:"BlastOutput2.report.results.search.hits.hsps",
                            query:{
                                "bool": {
                                    "must":[]}}}
                    },
                    "inner_hits": {
                        "size": 100,
                        "_source": [
                            "*.accession"
                        ]
                    }}} */}
    };
    //var m = q.bool.filter.nested.query.nested.query.bool.must;
    //addEvalueFilter(m);
    //addAlignLenFilter(m);
    addAttrFilter(q.bool.must, facets);
    return q;
}


function getQueryRequest_QueryPlusAggs(query, facets)
{
    var q = getQueryRequest_query(query, facets);
    var aggsq = getQueryRequest_aggs(facets);
    var source = ["*"];
    var queryrequest =
        "{\n"
        + "\"size\": 0,\n"
        + "\"_source\": " + JSON.stringify(source, null, ' ') + ",\n"
        + "\"query\": " + JSON.stringify(q, null, ' ')
        + ",\n"
        + "\"aggs\": " + JSON.stringify(aggsq, null, ' ') + "\n"
        + "}";
    return queryrequest;
}
