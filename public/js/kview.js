

/**
 * Returns jQuery wrapped element that should hold kablammo view's svg
 */
function new_SVG_container_() {
    $("#svgContainer").append("<div></div>");
    return $("#svgContainer div:last");
}


/**
 * Invokes Graph method defined in graph.js to render kablammo visualization.
 */
function kview(khit, svgContainer)
{
    Graph.prototype._canvas_width = svgContainer.width();
    
    this._graph = new Graph(
        new Grapher(null, null,false),
    get_seq_type(khit.program),
    khit.query.id + ' ' + khit.query.title,
    khit.query.id,
    khit.hit.id + ' ' + khit.hit.title,
    khit.hit.id, khit.query.length, khit.hit.length, khit.hit.hsps,
    svgContainer);
}


function read(report, success) {
    if (success==="success") {
        ssreport(report);
    }
    else
        console.log(success);
};


function ssview(reports) {
    var i;
    for (i = 0; i < reports.length; i++) {
        ssreport_BLAST_json(reports[i]);
        break;// display the first result only
    }
}


function ssreport_BLAST_json(qhit)
{
    var id = qhit._id;    
    executeEntryQueryUpdateKablammoView(id);
}


function report_individual_query_results(blastoutput)
{
    var khit = {};
    var report_ = blastoutput.report;
    var report = json2_to_kablammojson(report_);

    $.each(report.queries, function reportquery(i, query)
    {
        query.length = report_.results.search.query_len;
        query.id = report_.results.search.query_id;
        query.title = report_.results.search.query_title;
        khit.query = query;
        khit.program = report_.program;
        var svgContainer = new_SVG_container_();
        $(svgContainer).append("<h3>"
            + shortQueryTitle(query.id, query.title) + "<h3>");
        
        $.each(query.hits, function reporthit(j, hit)
        {
            svgContainer = new_SVG_container_();
            khit.hit = hit;
            $(svgContainer).append("<br>"
                + shortQueryTitle(hit.id, hit.title)
                + "<br>");
            var results={
                "query_seq_type": "nucleic_acid",
                "subject_seq_type": "nucleic_acid"};
            khit.results = results;//TODO: set this correctly
            $(svgContainer).addClass("subject");
            $(svgContainer).append("<div></div>");
            var c = $(svgContainer).find("div");
            normalizeHspsBitScores(khit.hit.hsps, khit.query);
            kview(khit, c);
        });
    });
}


function normalizeHspsBitScores(hsps, query) {
    var maxBitScore = query.hits[0].hsps[0].bit_score;
    $.each(hsps, function (i, hsp) {
            hsp.normalized_bit_score = hsp.bit_score / maxBitScore;
    });
    return hsps;
}


// json2 to Kablammo json
function json2_to_kablammojson(json2)
{
    var i, j;
    var kson = {};
    var r = json2.results;
    kson.queries = [];
    var q = {};
    q.hits = [];
    for(i = 0 ; i < r.search.hits.length; i++)
    {
        var h = r.search.hits[i];
        h.number = h.num;
        h.length = h.len;
        var d = h.description[0];
        h.id = d.id;
        h.accession = d.accession;
        h.title = d.title;
        h.sciname = d.scinanme;
        for(j = 0 ; j < h.hsps.length; j++)
        {
            var hsp = h.hsps[j]; 
            h.hsps[j].number = h.hsps[j].num;
            h.hsps[j].query_start = h.hsps[j].query_from;
            h.hsps[j].query_end = h.hsps[j].query_to;
            h.hsps[j].subject_start = h.hsps[j].hit_from;
            h.hsps[j].subject_end = h.hsps[j].hit_to;
            h.hsps[j].query_frame =
                hsp.query_strand === undefined || hsp.query_strand === "Plus" ? 1 : -1;
            h.hsps[j].subject_frame =
                hsp.query_strand === undefined || hsp.hit_strand === "Plus" ? 1 : -1;
            h.hsps[j].alignment_length = h.hsps[j].align_len;
            h.hsps[j].qcovhsp = 80;//todo????
            h.hsps[j].sseq = h.hsps[j].hseq;
            h.hsps[j].normalized_bit_score =0.1;//todo
        }
        q.hits.push(h);
    }
    kson.queries.push(q);
    return kson;
}


function get_seq_type(algorithm) {
  var SEQ_TYPES = {
      blastn: {
          query_seq_type:   'nucleic_acid',
          subject_seq_type: 'nucleic_acid'
      },
      blastp: {
          query_seq_type:   'amino_acid',
          subject_seq_type: 'amino_acid'
      },
      blastx: {
          query_seq_type:   'nucleic_acid',
          subject_seq_type: 'amino_acid'
      },
      tblastx: {
          query_seq_type:   'nucleic_acid',
          subject_seq_type: 'nucleic_acid'
      },
      tblastn: {
          query_seq_type:   'amino_acid',
          subject_seq_type: 'nucleic_acid'
      }
  };
  return SEQ_TYPES[algorithm];
}
