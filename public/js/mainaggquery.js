

function getQueryRequest_aggs()
{
    var emax = $("#emax").val();
    var bucketsize = 100;

    var aggs = {
        "bhits" : {
            nested : {
                path : "BlastOutput2.report.results.search.hits"
            },
            "aggs": {
                //                "efilter": {
                //                    filter:{
                //                        "bool": {
                //                            "must":[],
                //                            "should": [
                //                            ]}},
                //                    aggs : {
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
            }//}}
        },
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
                "hsps": {
                    "filter": {
                        "query": {
                            "range": {
                                "BlastOutput2.report.results.search.hits.hsps.evalue": {
                                    "lte": emax
                                }
                            }
                        }
                    },
                    "aggs": {
                        
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

    if(emax===undefined || emax==="")
    {
        delete aggs.hsps.filter.nested.query.range;
        aggs.hsps.filter.nested.query["match_all"]={};
    }

    //addAnnotTermFilter(anc["annotations_count"].aggs.fdrfilter.filter.bool.must);
    //addAttrFilter(anc["annotations_count"].aggs.fdrfilter.filter.bool.must);

    return aggs;
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
