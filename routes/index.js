var express = require('express');
var router = express.Router();
var restClient = require('node-rest-client').Client;
var rclient = new restClient();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var argv = require('minimist')(process.argv.slice(2));

var es_server = (process.env.ES_SERVER || 'http://localhost:9200/');

if (argv.es_server !== undefined)  es_server = argv.es_server;
console.dir('es_server: ' + es_server);

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: es_server,
  requestTimeout: 14000,
  log: ['error', 'warning']
});

var _index = "hspsdb-test";
var _type = "xml2";


router.get('/search', function (req, res)
{
    console.log("/search");
    var query = req.query.q;

    client.search({
        requestTimeout: 60000,
        index: _index,
        type: _type,
        body: {
            "query": {
                query_string:{
                    default_field: "_all",
                    default_operator: "AND",
                    query: query
                }
            }
        }
    }).then(function (resp) {
        res.json(resp);
    }, function (err) {
        console.trace(err.message);
        res.render('search', {response: err.message});
    });
});


router.post('/esr/'+_index+"/_search", function (req, res)
{
    var esreq = {
        index: _index,
        //type: _type,
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


//MongoDB search request
router.post('/mdbr/'+_index+"/_search", function (req, res)
{
    var qterm = req.body.query.bool.must[0].query_string.query;
    console.log('/esr/'+_index+"/_search:"
        +req.body.query.bool.must[0].query_string.query);


    var esreq = {
        index: _index,
        //type: _type,
        body: req.body,
        size: (req.query.size!==undefined ? req.query.size : 5),
        from: (req.query.from!==undefined ? req.query.from : 0)
    };

    mdb.querymongodb(qterm, res);
});


router.post('/esr/'+_index+"/_suggest", function (req, res)
{

    var esreq = {
        index: _index,
        //type: _type,
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


function getResultRequest(jobid, format) {
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
    var rreq = url + path + getResultRequest(jobid, resulttype);

    var req = rclient.get(rreq, {}, function (res) {
        if(res.BlastOutput2 !== undefined){
            console.log('writing  results for job ' + jobid);
            client.index({
                index: _index,
                type: "xml2",
                id: jobid,
                body: res
            });
            client.indices.refresh({index: _index});
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
