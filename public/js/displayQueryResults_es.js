

function displayQueryResults(result, nextprevq, query)
{
    var esqhits = result.hits.hits;
    var nhits = result.hits.total;
    var aggs = result.aggregations;

    //Hide graph tabs until the data ready
    $("#pivottabletab").hide();

    //remove previous results if any
    $("#tablescontainer").empty();
    //$("#searchresults").show();

    if(nhits > 0) {
        var ptinput = new Array();
        ptinput.push(ptGetHeaders());
        var tables = document.getElementById('tablescontainer');
        $(tables).show();
        if(nhits>1)$("#navigation").show();
        else $("#navigation").hide();
        $("#nresults").html(
            "Number of ncbi-blast-search results found: "
            + "<span style='color:#333;'>"+nhits
            + "</span>"

            +"&nbsp;&nbsp;&nbsp;&nbsp;Number of database entries matched in these results: "
            + "<span style='color:#333;'>"+aggs.bhits.doc_count
            + "</span>"
            +(        aggs.hsps===undefined ? "" :
            ("&nbsp;&nbsp;&nbsp;&nbsp;Number of HSPs: "
            + "<span style='color:#333;'>"+aggs.hsps.hsps.doc_count
            + "</span>")
            )
            +"<span style='padding-left:1em'>Query was: </span>"
            +"<span style='color:#333;'>"+query+"</span>"
            );
        $("#notifications").text("");
        $("#rows").val(esqhits.length);

        result.hits.hits.forEach(reportOutputs);

        if(nextprevq===undefined || nextprevq===false)
            update_facetcounts(query, aggs);
    }
    else
    {
        $("#nresults").text("");
        $("#notifications").html("No results found."
                +"<span style='color:#f77709; padding-left:1em'>query was: </span>"
                +"<span style='color:#333;'>"+query+"</span>"
                );
        $("#navigation").hide();
    }
    ptinput = pt_prepareInputs(aggs);
    return ptinput;
};

function outputsLine(id, r){
    return "<p class='bresult'>"
        + "<a href='?q=_id:" + id + "'>" + id + "</a></p>"
        + "<p><b>Program</b>: " + r.program
        + ",  <b>Database</b>: " + r.search_target.db + "</p>";
}

function reportOutputs(h) // each hit is one or more BlastOutput
{
    var r;
    if(h._source.BlastOutput2[0] === undefined ){
        r = h._source.BlastOutput2.report;
        $("#tablescontainer").append(outputsLine(h._id, r));
        reportOutput(h._source.BlastOutput2);
    }
    else {
        r = h._source.BlastOutput2[0].report;
        $("#tablescontainer").append(outputsLine(h._id, r));
        h._source.BlastOutput2.forEach(reportOutput);
    }
}

function describeSearchResult(r){
    var b= "<p><b>Query</b>: " + r.results.search.query_title + "</p>"
        + "<p><b>#matched sequences/entries</b>: "
        + r.results.search.hits.length + "</p>"
        + "Entry matched, Max score, Total score, Query cover, E value, Ident, "
        + "Accession";
    return b;
}

function reportOutput(output)
{
    var r = output.report;
    $("#tablescontainer").append(describeSearchResult(r));
//    if(searchqueryid.hits.taxid_count.buckets.length === 0)
//        $("#tablescontainer div:last").append(
//        "<p>no species info provided for the matched database entries</p>");
//    else
//        $.each(searchqueryid.hits.taxid_count.buckets, reportSpeciesMatch);
}


function reportSpeciesMatch(i, speciesmatch)
{
    $("#tablescontainer div:last").append("<p>"+speciesmatch.key+":</p>");
    speciesmatch['description.accession'].buckets.forEach(reportEntriesMatch);
}


function reportEntriesMatch(em)
{
    var nhsps = em.hsps.nhsps.value;
    $("#tablescontainer p:last").append(
        ""
        +em.key
        +" #hsps="+nhsps
        +" score="+em.hsps.totalscore.value
        +", ");
}


function displayReport(report, ihits, ptinput)
{
    var bhits, hit_;

    if(report!==undefined)
    {
        if(ihits!==undefined
            && ihits["BlastOutput2.report.results.search.hits"]!==undefined)
        {
            bhits = ihits["BlastOutput2.report.results.search.hits"]
                .hits.hits;
        }
        else
            bhits = report.results.search.hits;


        var qid = report.results.search.query_id;
        var qtitle = report.results.search.query_title;

        var qseqrow = "<tr class='qseqrow' id='"+qid+"'>"
            + "<td class=\"textcol rnaid\" colspan=5>"
            + qid + " " + qtitle;
        + "</td></tr>";
        $("#tablerows").append(qseqrow);

        var qlen = report.results.search.query_len;
        for (var j=0; j< bhits.length;j++)
        {
            if(bhits[j]._source===undefined)
                hit_ = bhits[j];
            else
                hit_ = bhits[j]._source;

            var ptrow = getPivotTablerow(hit_, qid, qlen);
            insertHitrow(hit_, qid, qtitle, qlen);
            ptinput.push(ptrow);
            insertHspsRows(hit_.hsps, qid+'.'+j);
        }
    }
}


function getHspsToggleLink(n, rna_id)
{
    var link;

    link = "<a href='#' "+
        "title='click me to show/hide annotations for the category'"+
        "onclick='toggleAnnotations_most_specific(this); return false;'>"
        +n+"</a>";

    return link;
}


function getPivotTablerow(hit, qid, querylength)
{
    var desc = hit.description[0];
    var ptrow = new Array(6);
    ptrow[0] = qid;
    ptrow[1] = desc.accession;
    ptrow[2] = querylength;
    ptrow[3] = hit.len;
    ptrow[4] = hit.hsps.length;
    var maxscore = Number(getHitMaxScore(hit)).toFixed(0);
    ptrow[5] = maxscore;
    return ptrow;
}


function insertHitrow(hit, qid, qtitle, querylength)
{
    var row;
    var desc = hit.description[0];
    var row_id = bhitId(hit);
    var title = desc.title;

    row = "<tr class='firstrow' id='"+row_id+"'>";

    /** 1st column, query id **/
    row += "<td class=\"textcol rnaid\" colspan=1>";
    row += desc.accession;
    row += "</td>";

    row += "<td class=\"textcol rnaid\" colspan=1>";
    row += "<p style='font-weight: 300; font-size:small;'>" + title;
    row += "</p>";
    row += "</td>";


    /** 3rd column, query/hit length **/
    row += "<td class=\"numcol\" colspan=1>";
    row += " <p>"
        + querylength + "/"+hit.len;
    row += "</p>";
    row += "</td>";


    /** 4th column, #HSPs **/
    row += "<td class=\"numcol\" colspan=1>";
    row += getHspsToggleLink(hit.hsps.length, row_id);
    row += "</td>";

    /** 5th column, max score **/
    row += "<td class=\"numcol\" colspan=1>";
    var maxscore = Number(getHitMaxScore(hit)).toFixed(0);
    row += maxscore;
    row += "</td>";

    row += "</tr>";

    $("#tablerows").append(row);
}


function getHitMaxScore(hit)
{
    var i;
    var maxscore = 0;
    for(i=0; i<hit.hsps.length;i++)
    {
        if(hit.hsps[i].bit_score>maxscore)
            maxscore = hit.hsps[i].bit_score;
    }
    return maxscore;
}


function insertHspsRows(hsps, hitid)
{
    var rows = getHspsRows(hsps, hitid);

    if(rows!=="")
    {
        $("#tablerows").append(rows);
        var table = $("table[rna_id='"+hitid+"']");

        if($("tr",table).size()>2)
            table.tablesorter({ sortList: [[0,0]] });
    }

}


function getHspsRows(hsps, hitid)
{
    var rows;

    rows = "<tr rna_id='"+hitid
        +"' class='annottablerow'><td colspan=5>";

    rows += getHspsTable(hitid, hsps);

    rows += "</td></tr>\n";

    return rows;
}


function getHspsTable(hitid, hsps)
{
    var table =
            "<table rna_id='"+hitid
            +"' class='table tablesorter' style='width:100%;'>";

    var h = "<thead><tr rna_id='"+hitid+"' class='annotrow'>";
    h += "<th class='numcol'>HSP</th>";
    h += "<th class='numcol'>bit score</th>";
    h += "<th style='max-width:6em;' class='numcol'>score</th>";
    h += "<th style='max-width:8em;' class='numcol'>e-value</th>";
    h += "<th style='max-width:8em;' class='numcol'>identity</th>";
    h += "<th style='max-width:8em;' class='numcol'>positive</th>";
    h += "</tr></thead>";
    table += h;

    for (var j = 0; j < hsps.length; j++)
    {
        var hsp = hsps[j];
        table += getHspRow(hsp, hitid);
    }
    table += "</table>";

    return table;
}


function getHspRow(hsp, hitid)
{
    var row;

    row = "<tr rna_id='"+hitid+"' class='annotrow'>";

    row += "<td class='numcol' colspan=1>"
        +hsp.num
        +"</td>";

    row += "<td class=\"numcol\" colspan=1>" + hsp.bit_score.toExponential(2)
            +"</td>";
    row += "<td class=\"numcol\" colspan=1>" + hsp.score.toExponential(2)
            +"</td>";
    row += "<td class=\"numcol\" colspan=1>" + hsp.evalue.toExponential(2)
            +"</td>";
    row += "<td class=\"numcol\" colspan=1>" + hsp.identity
            +"</td>";
    row += "<td class=\"numcol\" colspan=1>" + hsp.positive
            +"</td>";

    row += "</tr>\n";
    return row;
}


function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}


function getUniprotLinks(tfsa)
{
    var l;
    var tf;
    var ret="";
    for(i=0; i<tfsa.length;i++)
    {
        tf = tfsa[i];
        l = "<a href='http://www.uniprot.org/uniprot/";
        l += tf+"' target='_blank'>"+tf+"</a> ";
        ret += l;
    }
    return ret;
}
