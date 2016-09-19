#!/bin/bash
# Start Node.js server for HSPs-db web interface

usage() {
  cat << EOF
Usage: $0 [-p <web server port number>][-s <Elasticsearch server URL>][-i <index name>]

Example Usage:
  ./serverstart.sh -s http://localhost:9200/ -i hspsdb-test -p 3000

Requires 3 parameters defined:
- Elasticsearch server URL; (default value = http://localhost:9200/)
  Use ES_SERVER environment setting,
  or argument '-s' when calling this script

- Elasticsearch index name; (default value = hspsdb-test)
  Use HSPSDB_INDEX environment setting,
  or argument '-i' when calling this script

- Port number for the HSPs-db web interface; (default value = 3000)
  Use PORT environment setting,
  or argument '-p' when calling this script
EOF
  exit 1
}

while getopts "p:s:i:h" OPTION; do
  case $OPTION in
    p) export PORT=$OPTARG;;
    s) es_server=$OPTARG;;
    i) index=$OPTARG;;
    h) usage; exit 0;;
    [?]) usage; exit 1;;
  esac
done

if [ "x$es_server" = "x" ]; then
    es_server='http://localhost:9200/';
fi
if [ "x$index" = "x" ]; then
    index='hspsdb-test';
fi
echo "Elasticsearch server URL: ${es_server}"
echo "HSPs-db Elasticsearch index name: ${index}"
nohup node ./bin/www --es_server=$es_server --index=$index >& server.log &
echo "HSPs-db web server started at http://localhost:${PORT}";
