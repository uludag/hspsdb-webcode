

function hspsClause(attr, cond, val){
    var r = {range: {}};
    r.range = {};
    var a = "BlastOutput2.report.results.search.hits.hsps." + attr;
    r.range[a] = {};
    r.range[a][cond] = val;
    return r;
}


function addEvalueFilterToQuery(must){
    var e = $("#emax").val();
    if(validate("e-value", e, 0, 1000)){
        var r = hspsClause("evalue", "lte", e);
        must.push(r);
    }
}


function addAlignLenFilterToQuery(must){
    var a = $("#minalignlen").val();
    if(validate("min-alignment-length", a, 0, null)){
        var r = hspsClause("align_len", "gte", a);
        must.push(r);
    }
}

function validate(name, val, min, max){
    var ret = false;
    if(val !== undefined && val !== "")
    {
        nvalue = Number(val);
        if(isNaN(nvalue))
        {
            alert(name + " entered is not number: " + val);
        }
        else if(min !== null && nvalue < min)
        {
            alert(name + " should be larger than " + min);
        }
        else if(max !== null && nvalue > max)
        {
            alert(name + " should be smaller than " + max);
        }
        else ret = true;
    }
    return ret;
}
