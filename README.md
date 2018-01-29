# HSPs-db

HSPs-db project develops indexing tools and data-mining interfaces for
NCBI-BLAST sequence similarity search results.
Everyday researchers in many parts of the world run countless number of
BLAST sequence similarity searches;
aim here is to prepare tools to make more sense of these search results.
Latest version of BLAST software have improved outputs (xml2 project)
which makes our task easier.

We use Elasticsearch for indexing and storing BLAST results.
We have open eye for Solr and Mongodb.

## Installation

* Make sure you have [Node.js](https://nodejs.org/en/) and
  [npm](https://www.npmjs.com/) installed

* You should have indexed your BLAST results using the mappings we have
  as part of the [HSPs-db indexer](https://github.com/uludag/hspsdb-indexer)
  project

* Clone this repository

  Run `npm install` from project root folder

* Check configuration parameters in [bin/serverstart.sh](bin/serverstart.sh)
  script and run the script from project root folder.
  HSPs-db web interface should now be accessible from the port you selected

You can see development version of HSPS-db web interface on a sample
set of BLAST results by visiting the
[test server](http://hspsdb-test.herokuapp.com/) we maintain

## License

Copyright (c) King Abdullah University of Science and Technology, SA
