# HSPs-db project webcode

Webcode for NCBI-BLAST search results, in json format, indexed with Elasticsearch. Scripts provided by the HSPs-db project should be used for indexing.

## Installation

* Make sure [Node.js](https://nodejs.org/en/) and
  [npm](https://www.npmjs.com/) installed

* Clone this repository

  Run `npm install` from project root folder

* Check configuration parameters in [bin/serverstart.sh](bin/serverstart.sh)
  script and run the script from project root folder.
  HSPs-db web interface should be accessible from the port you selected

* Index your BLAST results using the scripts provided
  by the [HSPs-db indexer](https://github.com/uludag/hspsdb-indexer)
  project

Development version of the web interface is visible on a
[test server](http://hspsdb-test.herokuapp.com/) with a sample
set of BLAST search results

## License

Copyright (c) King Abdullah University of Science and Technology, SA
