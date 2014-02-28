var fireworm = require('fireworm')
var exec = require('child_process').exec;

// make a new file watcher
var fw = fireworm(__dirname)

// Add the files you want to watch for changes on (can be glob)
fw.add(__dirname + '/src/**')

// ignore some patterns
// fw.ignore('tests/dontcare/*.js')

// register for the `change` event
fw.on('change', function(filename) {
  exec('sh build.sh', function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
});