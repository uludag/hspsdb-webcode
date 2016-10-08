

function executeEntryQueryUpdateKablammoView(id)
{
    var qurl = server + "_search?";
    var q = getEntryQueryRequest(id);
    $.postJSON(qurl, JSON.stringify(q, null, ' '), function (r)
    {
        if(r.hits.hits.length > 0){
            var qhit = r.hits.hits[0];
            // outputs does not always have array of reports
            if(qhit._source.BlastOutput2[0] === undefined )
            {
                report_individual_query_results(qhit._source.BlastOutput2);
            }
            else
            {
                qhit._source.BlastOutput2.forEach(report_individual_query_results);
            }
        }
        //else
        //    console.log(JSON.stringify(q, null, ' '));
    }).fail(queryFailed);
};


function getEntryQueryRequest(id)
{
    var q = {
        "query": {"term": { "_id":  encodeURIComponent(id)}},
        "_source": {
            "exclude": [ "*.qseq", "*.hseq", "*.midline" ]
        }
    };

    // TODO: use filters & inner_hits as in getQueryRequest_query

    return q;
}
