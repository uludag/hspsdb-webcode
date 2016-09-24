// query paths for facet fields defined in attribute-filters.js
var qpaths={
    search: "BlastOutput2.report.results.search",
    search_target: "BlastOutput2.report.search_target",
    report: "BlastOutput2.report",
    bhits: "BlastOutput2.report.results.search.hits",
    hsps: "BlastOutput2.report.results.search.hits.hsps"
};


function executeQueryDisplayResults(server, querywof, nextprevq)
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

    var queryrequest = getQueryRequest_QueryPlusAggs(querywof);

    $("#notifications").text("Querying '" + querywof + "'please wait ....");
    var query = $("#q").val();

    $.postJSON(qurl, queryrequest, function(r){
        processQueryResults(r, query, nextprevq);}).fail(queryFailed);
};


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
        $("#pivottabletab").show();
        displayResultsInPivotTable(ptinput);
        ssview(result.hits.hits);
    }
}


var mpq =                    {
    "match_phrase": {
        //"BlastOutput2.report.search_target.db": "swissprot"
    }
};

var qt = {
    "nested": {
        "path": "BlastOutput2.report.search_target",
        "query": {
            "bool": {
                "should": []}}
    }};


function attrSelections()
{
    var categories = {}, category, fval;
//todo: in case of URL specified attributes we do not have existing check boxes yet
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


function addAttrFilter(must){
    var selections = attrSelections();
    var i, qt_, r, p, path_, v, n;
    var l = $("input:checked[name=topic]");
    var attrfilters = new Map();

    for(path_ in selections)
    {
        var val = selections[path_];
        n = val.length;
        for(i = 0; i < n; i++){
            v = val[i];
            var a = path_.split(",");
            var mpq_ = jQuery.extend(true, {}, mpq);
            r = a[0];
            if(r === 'hsps' && a[2] == 'hsps2hits')
                p = qpaths['bhits'];
            else
                p = qpaths[r];
            
            mpq_.match_phrase[p + "." + a[a.length-1]] = v;
            
            if(attrfilters.get(r) === undefined)
                qt_ = jQuery.extend(true, {}, qt);
            else
                qt_ = attrfilters.get(r);
            
            qt_.nested.path = p;
            qt_.nested.query.bool.should.push(mpq_);
            attrfilters.set(a[0], qt_);
        }
    };

    attrfilters.forEach(function(e,i){
        must.push(e);
    });
}


// 'query' section of the query request

function getQueryRequest_query(query)
{
    var q={
        bool:{
            must:[{query_string:{
                        fields: ["_all", "_id"],
                        default_field: "_all",
                        default_operator: "AND",
                        query: query
                    }}],
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
                    }}}}
    };
    var m = q.bool.filter.nested.query.nested.query.bool.must;
    addEvalueFilter(m);
    addAlignLenFilter(m);
    addAttrFilter(q.bool.must);

    return q;
}


function getQueryRequest_QueryPlusAggs(query)
{
    var q = getQueryRequest_query(query);
    var aggsq = getQueryRequest_aggs();
    var source = ["*.program", "*.query_id", "*.query_title", "*.db"];
    var queryrequest =
        "{\n"
        + "\"size\": 10,\n"
        + "\"_source\": " + JSON.stringify(source, null, ' ') + ",\n"
        + "\"query\": " + JSON.stringify(q, null, ' ') + ",\n"
        + "\"aggs\": " + JSON.stringify(aggsq, null, ' ') + "\n"
        + "}";
    return queryrequest;
}
