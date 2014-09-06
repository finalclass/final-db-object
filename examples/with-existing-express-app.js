var express = require('express');
var http = require('http');
var fdbo = require('../index.js');

var fdboServer = new fdbo.Server({
  development: {
    port: 8181,
    protocol: 'http',
    host: 'localhost',
    routesPrefix: 'fdbo',
    dataStoreAdapter: 'sqlite',
    dataStore: {
      sqlite: {
        path: __dirname + '/db.fdbo'
      }
    }
  },
  staging: {},
  production: {}
}, 'development');


var app = express();
var server = http.createServer(app);
fdboServer.connectToHttpServer(server);

fdboServer.on('listen', function () {
  console.log('Final DB Object server is listening on port', fdboServer.config.port);
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.send('hello world');
});

server.listen(8181);
