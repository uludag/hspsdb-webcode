

function addEvalueFilterToQuery(must)
{
    var emax = $("#emax").val();
    if(emax!==undefined && emax!=="")
    {
        var evalue;
        evalue = Number(emax);

        if(isNaN(evalue))
        {
            alert("e-value entered is not number: " + emax);
        }
        else if(evalue>100)
        {
            alert("e-value should be smaller than 100: " + evalue);
        }
        else
        {
            var r = {
                range: {
                    "BlastOutput2.report.results.search.hits.hsps.evalue": {
                        lte: emax
                    }
                }
            };
        must.push(r);
    }
}
}
