#!/bin/bash
# Start Node.js server for HSPs-db web interface
#
# Make sure you have checked configuration parameters:
export HSPSDB_SERVER='http://baloo-dev:9200/';
export HSPSDB_INDEX='hspsdb-test';
# Uses default port 3000 if user did not specify any in the command line
export PORT=${1-3000};

echo "Server started at http://localhost:${PORT}";

nohup node ./bin/www >& server.log &
