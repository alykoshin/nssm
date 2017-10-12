'use strict';

var childProcess = require('child_process');

var commands = require('./commands.json');
var aliases = require('./aliases.json');
var errors = require('./errors.json');


function Nssm(name, options) {
  var self = this;
  if (!name) { throw new Error(errors.emptyName); }
  options = options || {};
  options.nssmExe = options.nssmExe || 'nssm.exe';

  // var commands = [
  //   'install',
  //   'remove',
  //   'start',
  //   'stop',
  //   'restart',
  //   'status',
  //   'pause',
  //   'continue',
  //   'rotate',
  //   'get',
  //   'set',
  //   'reset'
  // ];

  // var aliases = {
  //   start: {
  //     auto:     'SERVICE_AUTO_START',
  //     delayed:  'SERVICE_DELAYED_START',
  //     demand:   'SERVICE_DEMAND_START',
  //     manual:   'SERVICE_DEMAND_START',
  //     disabled: 'SERVICE_DISABLED'
  //   },
  //   type: {
  //     standalone: 'SERVICE_WIN32_OWN_PROCESS',
  //     interactive: 'SERVICE_INTERACTIVE_PROCESS'
  //   },
  //   apppriority: {
  //     realtime: 'REALTIME_PRIORITY_CLASS',
  //     high: 'HIGH_PRIORITY_CLASS',
  //     above: 'ABOVE_NORMAL_PRIORITY_CLASS',
  //     normal: 'NORMAL_PRIORITY_CLASS',
  //     below: 'BELOW_NORMAL_PRIORITY_CLASS',
  //     idle: 'IDLE_PRIORITY_CLASS'
  //   }
  // };


  self._exec = function(cmd, args) {
    args.unshift(name);
    args.unshift(cmd);
    var callback;
    if (typeof args[args.length-1] === 'function') {
      callback = args.pop();
    } else {
      callback = null;
    }

    return new Promise(function(resolve, reject) {

      childProcess.execFile(options.nssmExe, args, { encoding: 'utf16le' }, function(error, stdout, stderr) {
        // Convert Buffer to String and remove trailing EOLs
        stdout = typeof stdout === 'string' ? stdout.toString('utf8').trim() : '';
        stderr = typeof stderr === 'string' ? stderr.toString('utf8').trim() : '';
        // Treat warnings on stderr as error
        if (stderr && !error) {
          error = new Error(stderr.toString('utf8'));
        }
        // ENOENT
        if (error && error.code === 'ENOENT') {
          error = new Error(errors.notFound + ': \''+options.nssmExe +'\'');
        }
        // Handle error
        if (error) {
          // return callback(error, stderr);
          if (callback) callback(error, stderr);
          else reject(error, stderr);
          return;
        }

        if (callback) callback(null, stdout);
        else resolve(stdout);
      });
    });

  };


  // for each available command add method to Nssm object
  commands.forEach(function(command) {

    if (command === 'set') { // May require alias replacement

      self[ command ] = function (/*arguments*/) {
        var args = Array.prototype.slice.call(arguments);
        // replace parameter values with aliases
        // console.log(args, args.length);
        if (
          (args.length > 2) ||
          (args[args.length-1] !== 'function' && args.length === 2)
        ) {
          var parameter = args[ 0 ].toLowerCase();        // i.e. 'start'
          var value = args[ 1 ].toLowerCase();            // i.e. 'auto'
          var parameterAliases = aliases[ parameter ];    // i.e. { auto: 'SERVICE_AUTO_START', ... }
          var replacement = parameterAliases && parameterAliases[ value ]; // i.e. 'auto' -> 'SERVICE_AUTO_START'
          // console.log(parameter, value, replacement);
          args[ 1 ] = replacement ? replacement : args[ 1 ];
        }
        return self._exec(command, args);
      };

    } else {
      self[command] = function(/*arguments*/) {
        var args = Array.prototype.slice.call(arguments);
        return self._exec(command, args);
      };
    }

  });

}


module.exports = function(name, options) { return new Nssm(name, options); };

