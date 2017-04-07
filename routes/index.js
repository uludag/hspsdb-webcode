var express = require('express');
var router = express.Router();
var restClient = require('node-rest-client').Client;
var rclient = new restClient();
var argv = require('minimist')(process.argv.slice(2));

var es_server;
if (argv.es_server !== undefined)  es_server = argv.es_server;
else
    es_server = (process.env.ES_SERVER || 'http://localhost:9200/');
console.dir('es_server: ' + es_server);

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: es_server,
    requestTimeout: 14000,
    log: ['error', 'warning']
});

var index;
if (argv.index !== undefined)  index = argv.index;
else
    index = (process.env.HSPSDB_INDEX || 'hspsdb-test');
console.dir('index: ' + index);

client.cat.indices({ index:index }, function (err, r) {
    if (err === undefined)
    {
        if (r.length>5 && r.startsWith("green") && r.includes("open"))
            console.log("Index " + index + " is open and available");
        else {
            console.log("Check index status: " + r);
        }
    }
    else{
        console.log(err.message);
        process.exit(1);
    }
});

var type = "xml2";  // Elasticsearch document type name for BLAST results

router.get('/esr/retrieve-blast-output', function (req, res)
{
    var query = req.query.q;

    client.search({
        requestTimeout: 14000,
        index: index,
        type: type,
        body: {
            "query": {
                query_string:{
                    default_field: "_id",
                    query: query
                }}}
    }).then(function (resp) {
        res.type('json');
        res.status(200).send(JSON.stringify(resp, null, ' '));
    }, function (err) {
        console.trace(err.message);
        res.render('retrieve-blast-output failed:', {response: err.message});
    });
});


router.post('/esr/_search', function (req, res)
{
    var esreq = {
        index: index,
        type: type,
        body: req.body,
        size: (req.query.size!==undefined ? req.query.size : 5),
        from: (req.query.from!==undefined ? req.query.from : 0)
    };

    client.search(esreq
        ).then(function (qresult) {
            res.json(qresult);
    }, function (err) {
        console.trace(err.message);
        res.send(err.message);
    });
});


router.post('/esr/_suggest', function (req, res)
{

    var esreq = {
        index: index,
        type: type,
        body: JSON.parse(JSON.stringify(req.body))
    };


    client.suggest(esreq
        ).then(function (resp) {
            res.json(resp);
    }, function (err) {
        console.trace(err.message);
        res.send(err.message);
    });
});


router.get('/esr/ncbiimport', function (req, res)
{
    var jobid = req.query.jobid;
    ncbiimport(jobid, "JSON2_S", res);
});


function retrieveNCBIResultRequest(jobid, format) {
    var req = "?"
        + 'RESULTS_FILE=on'
        + '&RID=' + jobid
        + '&FORMAT_TYPE=' + format
        + '&CMD=Get&FORMAT_OBJECT=Alignment&RID=' + jobid;
    return req;
}


function ncbiimport(jobid, resulttype, httpResponse) {
    var url = 'https://blast.ncbi.nlm.nih.gov';
    var path = '/blast/Blast.cgi';
    var rreq = url + path + retrieveNCBIResultRequest(jobid, resulttype);

    var req = rclient.get(rreq, {}, function (res) {
        if(res.BlastOutput2 !== undefined){
            console.log('indexing BLAST results for NCBI job ' + jobid);
            client.index({
                index: index,
                type: type,
                id: jobid,
                body: res
            });
            client.indices.refresh({index: index});
            httpResponse.send('NCBI import request was successful: ');
        }
        else
            httpResponse.send('NCBI import request failed');
    });
    req.on('error', function (err) {
        httpResponse.send('NCBI import request failed: ' + err);
    });
}


module.exports = router;
