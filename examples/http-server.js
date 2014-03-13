var fdbo = require('../index.js');
var fs = require('fs');
var expressIO = require('express.io');

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

fdboServer.eioApp.use(expressIO.static(__dirname + '/public'));

fdboServer.listen();