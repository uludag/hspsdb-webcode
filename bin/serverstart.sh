
export PORT=${1-3000};
export ES_SERVER='http://localhost:9200/';
export ES_SERVER='http://baloo-dev.cbrc.kaust.edu.sa:9200/';

echo "port=${PORT}";

nohup node ./bin/www >& server.log &
