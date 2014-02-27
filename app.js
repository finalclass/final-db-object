var fdbo = require('./index.js');

var fdboServer = new fdbo.Server({
  development: {
    dbPath: __dirname + '/var/db.fdbo',
    port: 8181,
    routesPrefix: 'fdbo'
  },
  staging: {},
  production: {}
}, 'development');

fdboServer.listen();

fdboServer.on('listen', function () {
  console.log('Final DB Object server is listening on port', fdboServer.config.port);
});