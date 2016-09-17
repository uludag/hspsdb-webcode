

function getQueryRequest_aggs()
{
    var emax = $("#emax").val();
    var bucketsize = 100;

    var aggsq = {
        "search_target" : {
            nested : {
                path : "BlastOutput2.report.search_target"
            },
            "aggs": {
                db:{
                    terms : {
                        field : "BlastOutput2.report.search_target.db.raw"
                    }
                }}
        },
        "report" : {
            nested : {
                path : "BlastOutput2.report"
            },
            "aggs": {
                program:{
                    terms : {
                        field : "BlastOutput2.report.program"
                    }
                }}
        },
        "hsps": {
            "nested": {
                "path": "BlastOutput2.report.results.search.hits.hsps"
            },        
            "aggs": {
                "filteredhsps": {
                    "filter": {
                        "bool": {"must":[]
                        }
                    },
                    "aggs":{"hsps2hits":{
                            reverse_nested : {
                                path : "BlastOutput2.report.results.search.hits"
                            },
                            "aggs": {
                                "description.sciname":{
                                    "terms" : {
                                        "size": bucketsize,
                                        "field" :
                                                "BlastOutput2.report.results.search.hits.description.sciname.raw"
                                    }
                                },
                                "description.accession":{
                                    "terms" : {
                                        "size": bucketsize,
                                        "field" :
                                                "BlastOutput2.report.results.search.hits.description.accession"
                                    }
                                },
                                "taxid_count":{
                                    "terms" : {
                                        "field" :
                                                "BlastOutput2.report.results.search.hits.description.taxid"
                                    }
                                }
                            }},
                        
                        "hseq":{
                            "terms" : {
                                "field" : "BlastOutput2.report.results.search.hits.hsps.hseq"
                            }
                        }
                        
                    }
                }
            }
        },
        "search": aggsForMainResultsView().aggs.search
    };

    var m = aggsq.hsps.aggs.filteredhsps.filter.bool.must;
    addEvalueFilter(m);
    addAlignLenFilter(m);
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
