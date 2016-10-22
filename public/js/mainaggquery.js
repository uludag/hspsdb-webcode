

function getQueryRequest_aggs()
{
    //var bucketsize = 100;

    var aggsq = {
        "file":{
            "terms" : {
                "field" : "filename"
            }},
        "cigar":{
            "terms" : {
                "field" : "cigarString"
            }},
        "read":{
            "terms" : {
                "field" : "readString"
            }}
    };

    //var m = aggsq.hsps.aggs.filteredhsps.filter.bool.must;
    //addEvalueFilter(m);
    //addAlignLenFilter(m);
    return aggsq;
}


function aggsForMainResultsView()
{
    var q= {
        "size": 0,
        "aggs": {
            "search": {
                "nested": {
                    "path": "BlastOutput2.report.results.search"
                },
                "aggs": {
                    "query_id": {
                        "terms": {
                            "field": "BlastOutput2.report.results.search.query_id.raw",
                            "size": 10
                        },
                        "aggs": {
                            "hits": {
                                "nested": {
                                    "path": "BlastOutput2.report.results.search.hits"
                                },
                                "aggs": {
                                    "taxid_count": {
                                        "terms": {
                                            "field": "BlastOutput2.report.results.search.hits.description.sciname.raw"
                                        },
                                        "aggs": {
                                            "description.accession": {
                                                "terms": {
                                                    "size": 6,
                                                    "field": "BlastOutput2.report.results.search.hits.description.accession"
                                                },
                                                "aggs": {
                                                    "hsps": {
                                                        "nested": {
                                                            "path": "BlastOutput2.report.results.search.hits.hsps"
                                                        },
                                                        "aggs": {
                                                            "hseq": {
                                                                "terms": {
                                                                    "field": "BlastOutput2.report.results.search.hits.hsps.hseq"
                                                                }
                                                            },
                                                            "totalscore": {
                                                                "sum": {
                                                                    "field": "BlastOutput2.report.results.search.hits.hsps.bit_score"
                                                                }
                                                            },
                                                            "nhsps": {
                                                                "max": {
                                                                    "field": "BlastOutput2.report.results.search.hits.hsps.num"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }


    };
    return q;
}
