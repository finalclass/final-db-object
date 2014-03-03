require('require-ts')({
  sourcePath: __dirname + '/src',
  buildPath: __dirname + '/build'
});

module.exports = require('./src/server');