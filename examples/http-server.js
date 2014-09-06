var fdbo = require('../build/server/index.js');
var fs = require('fs');
var express = require('express');

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

fdboServer.on('listen', function () {
  console.log('Final DB Object server is listening on port', fdboServer.config.port);
});

fdboServer.expressApp.use(express.static(__dirname + '/public'));

fdboServer.listen();