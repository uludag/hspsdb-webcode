

function getbuckets(fc, path)
{
    var buckets=fc;
    var i;
    
    for(i=0; (i<path.length && buckets!==undefined); i++)
    {
        buckets = buckets[path[i]];
    }

    return (buckets===undefined ? undefined : buckets.buckets);
}


function getAnnotEntryInAttrFilters(annotid)
{
    return $("li a[fval=\""+annotid+"\"],span[fval=\""+annotid+"\"]");
}


function attributefilters(query, fc)
{
    var i, j, k, l, v;
    var ffl =[
        ["search", "query_title"],
        ["search_target","db"],
        ["report", "program"],
        ["bhits", "description.sciname"],
        ["bhits", "description.accession"],
        ["hsps", "hsps", "hseq"]
    ];    
    var fflnames =[
        "Query sequences",
        "Sequence databases",
        "Search type/program",
        "Species/sequence-source",
        "Matched sequences/entries",
        "DB sequences matched (experimental)"
    ];
    var units =[
        "#searches",
        "#matches",
        "#matches",
        "#matches",
        "#matches",
        "#HSP matches"
    ];
    
    var newli, headerli;

    //get selected filters if any
    l = $("input:checked[name=topic]");
    v = new Array();
    for(i=0; i<l.length; i++)
    {
        v.push($(l[i]).val());
    }
    
    ul = $("#attrfilters");
    $("#attrfilters div").remove();
    $("#attrfilters li").remove();
    for(i=0;i<ffl.length;i++)
    {
        var facets="";
        var buckets = getbuckets(fc, ffl[i]);

        if(buckets===undefined)
            continue;

        headerli = "<li class='attrfilterheader'>";
        headerli += buckets.length;
        headerli +=" <span style='font-weight:bold'>"+fflnames[i]+"</span> (";
        headerli += units[i];
        headerli += ")</li>";


        for(j=0;j<buckets.length;j++)
        {
            k=j;

            if (ffl[i]==="annotations.annotation_id")
            {
                k = buckets.length-j-1;
            }

            var title = buckets[k].key;
            if(ffl[i]==="tissue" || ffl[i]==="primary_cell")
            {
                title = normalised_sample_name(title);
            }
            else if(ffl[i]==="annotations.category"
                    && annotcategories[title]!==undefined)
                title=annotcategories[title];

            
            newli = "<li><input name='topic' "
                + " value='" + buckets[k].key + "'"
                + " path='" + ffl[i] + "'";
            
            if(v.indexOf(buckets[k].key)!== -1)
            {
                newli += " checked='checked'";
            }
            
            newli += " type='checkbox'> <a href='"
                +attrFilterQuery(query, ffl[i],buckets[k].key)+"'"
                +"ffl='"+ffl[i]+"'"
                +"fval='"+buckets[k].key+"'"
                +"title='click me to filter results with "
                +buckets[k].key+"'"
                +">"
                +title
                +"</a> ("+buckets[k].doc_count;
            
            if(ffl[i]==="rna_type" && buckets[j].transcripts!==undefined)
                newli += ", " + buckets[j].transcripts.value;
            
            newli +=")</li>";

            facets += newli;
        }

        if(facets!=="")
        {
            $(ul).append(headerli+"<div>"+facets+"</div>");
        }
    }

    $("#attrfilters a").click(function(event)
    {
        event.preventDefault();
        $(this).siblings("input").prop("checked", "checked");
        attrFilterQuerySubmit(query, this);
    });
}


/**
 * TODO: use filter queries instead. example:  fq=rna_type:miRNA
 * @param {type} q
 * @param {type} ff
 * @param {type} a
 * @returns {String}
 */
function attrFilterQuery(q, ff, a)
{
    var fq;

    fq = "?q="+(q.length===0?"*":encodeURIComponent(q).replace("'","%27"));

//    if(ff.indexOf("annotations.")!==-1)
//    {
//        fq += "&attrfilter="+ff+"&attrfilterval="+a;
//    }
//    else
    {
        fq += " AND "+ff+":\""+a+"\"";
    }

    return fq;
}


function addAttrFilterCheckbox(attrfilter, attrfilterval)
{
    var qp = attrfilter+":\""+attrfilterval+"\"";
    $("#atf").html(
        "<input id='atfcb' name='topic' "
        + " value='" + buckets[k].key + "'"
        + " path='" + ffl[i] + "'"
        +" type='checkbox' "
        +"title='click me to repeat the last query without this filter'"
        +"checked='checked'></input><span>"
        +qp+"</span>");

    $("#atfcb").click(function (e)
    {
        if(attrfilter.indexOf("annotations.")=== -1)
        {
        }
    });

}


function attrFilterQuerySubmit(q, a)
{
    //var ffl = $(a).attr("ffl");

    //var fval = $(a).attr("fval");

    //addAttrFilterCheckbox(ffl, fval);
// later addAttrFilter function add attribute filter clauses
    executeQueryDisplayResults(server, index, q, false);
}


// Update aggregation results on the right panel
function update_facetcounts(query, fc)
{
    if(fc===undefined)
        return;

    attributefilters(query, fc);

    $("#leftcontent").show();
    return;
}
