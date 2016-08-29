

function ptGetHeaders()
{
    return [
        "Query sequence", //"Search database",
        "Sequence/entry matched", "Query length", "Match length",
        "#HSPs", "Max score"];
}


// Prepares data as arrays of arrays.
// One sub-array per record, the first sub-array contains the attribute names.
function pt_prepareInputs(aggs)
{
    var row;
    var ptinput = new Array();
    var attnames = [
        "Query sequence", "taxon",
        "Sequence/entry matched",
        "#HSPs", "score"];
    ptinput.push(attnames);

    $.each(aggs.search.query_title.buckets, function(i, searchqueryid)
    {
        $.each(searchqueryid.hits.taxid_count.buckets, function(j, speciesmatch)
        {
            $.each(speciesmatch['description.accession'].buckets, function(k, em)
            {
                row = new Array(5);
                row[0]= searchqueryid.key;
                row[1]= speciesmatch.key;
                row[2]= em.key;
                row[3]= em.hsps.nhsps.value;;
                row[4]= em.hsps.totalscore.value;
                ptinput.push(row);
            });
        });
    });

    return ptinput;
};




function geneviewAnnotsAggsQuery(bucketsize, sampletype)
{
    var trx_bucketsize = 10;

    var query = $("#q").val();

    var q = getQueryRequest_query(query);

    var annotsquery = {
        "size": 0,
        "query": q,
        "aggs": {
            "transcripts_": {
                "terms": {
                    "size":trx_bucketsize,
                    "include": ".{3,}",
                    "script" :
                        "doc['rna_id'].value+(doc['promoter_region'].value==0 ? '' : '#'+doc['promoter_region'].value)",
                    collect_mode : "breadth_first"
                }
            },
            "samples": {
                "terms": {
                    "field": (sampletype==="primarycell"?"primary_cell":"tissue"),
                    "size":1,
                    collect_mode : "breadth_first"
                },
                "aggs": {
                    "transcripts": {
                        "terms": {
                            "size":trx_bucketsize,
                            "include": ".{3,}",
                            "script" :
                                "doc['rna_id'].value+(doc['promoter_region'].value==0 ? '' : ' trx '+doc['promoter_region'].value)",
                            collect_mode : "breadth_first"
                        },
                        "aggs": {
                            "annots": {
                                "nested": {
                                    "path": "annotations"
                                },
                                "aggs": {
                                    "annots_": {
                                        filter:{
                                            bool:{
                                                must:[
                                                ]}},
                                        aggs:{
                                            "annots__": {
                                                "terms": {
                                                    script : "doc['annotations.annotation_id']",
                                                    size:bucketsize,
                                                    collect_mode : "breadth_first"
                                                },
                                                "aggs": {                                                    
                                                    "category": {
                                                        "terms": {
                                                            "field": "annotations.category",
                                                            "size":5,
                                                            collect_mode : "breadth_first"
                                                        }
                                                    },
                                                    "fdr": {
                                                        "avg": {
                                                            "field": "annotations.fdr"
                                                        }
                                                    },
                                                    "pvalue": {
                                                        "avg": {
                                                            "field": "annotations.pvalue"
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

    addAnnotTermFilter(annotsquery.aggs.samples.aggs.transcripts.aggs.annots.aggs.annots_.filter.bool.must);
    addAttrFilter(annotsquery.aggs.samples.aggs.transcripts.aggs.annots.aggs.annots_.filter.bool.must);
    return annotsquery;
}




function displayResultsInPivotTable(pivotinp)
{
    var cont = "pivottablecont";
    
    if(pivotinp===undefined || pivotinp.length===0)
    {
        $("#"+cont).html("<br>No values found.");
    }
    else
    {
        $("#ptheader").text("Query results displayed using PivotTavle.js library:");
        
        $("#pttable").pivotUI(pivotinp,
        {
            rows: ["taxon", "Query sequence", "Sequence/entry matched"],//Search database"],
            cols: [],
            rendererName: "Heatmap",
            aggregatorName: "Average",
            vals: ["score"],
            menuLimit: 1000
        }, true
            );
        
        scatterChart(pivotinp);
    }
    
}


function scatterChart(input)
{
    $("#output").pivot(input, {
        cols: ["#HSPs", "taxon"], rows: ["score"],
        renderer: $.pivotUtilities.c3_renderers["Scatter Chart"]
    });
};

