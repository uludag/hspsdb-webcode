

function executeEntryQueryUpdateKablammoView(id)
{
    var qurl = server + index + "/_search?";
    var q = {
        "query": {"term": { "_id":  encodeURIComponent(id)}}};
    
    $.postJSON(qurl, JSON.stringify(q, null, ' '), function (r)
    {
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
    }).fail(queryFailed);
};
