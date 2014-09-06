var express = require('express');
var http = require('http');
var fdbo = require('../build/server/index.js');

var app = express();
var server = http.createServer(app);

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
}, 'development', app, server);

fdboServer.on('listen', function () {
  console.log('Final DB Object server is listening on port', fdboServer.config.port);
});

app.use(express.static(__dirname + '/public'));

app.get('/hello', function(req, res){
  res.send('hello world');
});

server.listen(8181);
