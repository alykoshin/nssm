'use strict';

var childProcess = require('child_process');

function Nssm(name, options) {
  var self = this;
  if (!name) { throw 'Service name must be provided'; }
  options = options || {};
  options.exe = options.exe || 'nssm.exe';

  var commands = [
    'install',
    'remove',
    'start',
    'stop',
    'restart',
    'status',
    'pause',
    'continue',
    'rotate',
    'get',
    'set',
    'reset',
  ];

  var aliases = {
    start: {
      auto:     'SERVICE_AUTO_START',
      delayed:  'SERVICE_DELAYED_START',
      demand:   'SERVICE_DEMAND_START',
      manual:   'SERVICE_DEMAND_START',
      disabled: 'SERVICE_DISABLED'
    },
    type: {
      standalone: 'SERVICE_WIN32_OWN_PROCESS',
      interactive: 'SERVICE_INTERACTIVE_PROCESS'
    },
    apppriority: {
      realtime: 'REALTIME_PRIORITY_CLASS',
      high: 'HIGH_PRIORITY_CLASS',
      above: 'ABOVE_NORMAL_PRIORITY_CLASS',
      normal: 'NORMAL_PRIORITY_CLASS',
      below: 'BELOW_NORMAL_PRIORITY_CLASS',
      idle: 'IDLE_PRIORITY_CLASS'
    }
  };

  self._exec = function(cmd, args) {
    args.unshift(name);
    args.unshift(cmd);
    var callback = args.pop();

    childProcess.execFile(options.exe, args, { encoding: 'utf16le' }, function(error, stdout, stderr) {
      // Convert Buffer to String and remove trailing EOLs
      stdout = stdout.toString('utf8').trim();
      stderr = stderr.toString('utf8').trim();
      // Treat warnings on stderr as error
      if (stderr && !error) {
        error = new Error(stderr.toString('utf8'));
      }
      // ENOENT
      if (error.code === 'ENOENT') {
        error = new Error('nssm.exe executable not found.');
      }
      // Handle error
      if (error) {
        return callback(error, stderr);
      }

      return callback(null, stdout);

    });
  };

  commands.forEach(function(command) {

    if (command === 'set') { // May require alias replacement

      self[ command ] = function (/*arguments*/) {
        var args = Array.prototype.slice.call(arguments);
        // replace parameter values with aliases
        //
        // args[0] - parameter // i.e. 'start'
        // args[1] - value     // i.e. 'auto'
        // aliases[ args[0] ] - object, holding aliases for the parameter  // i.e. { auto: 'SERVICE_AUTO_START', ... }
        // aliases[ args[0] ][ args[1] ] - replacement for the parameter value // i.e. 'auto' -> 'SERVICE_AUTO_START'
        if (args.length > 2) {
          var alias = aliases[ args[ 0 ] ];    // i.e. { auto: 'SERVICE_AUTO_START', ... }
          var replacement = alias && alias[ args[ 1 ] ]; // i.e. 'auto' -> 'SERVICE_AUTO_START'
          args[ 1 ] = replacement ? replacement : args[ 1 ];
        }
        self._exec(command, args);
      };

    } else {
      self[command] = function(/*arguments*/) {
        var args = Array.prototype.slice.call(arguments);
        self._exec(command, args);
      };
    }

    self[command] = function(/*arguments*/) {
      var args = Array.prototype.slice.call(arguments);
      // replace parameter values with aliases
      //
      // args[0] - parameter
      // args[1] - value
      // aliases[ args[0] ] - object, holding aliases for the parameter
      // aliases[ args[0] ][ args[1] ] - replacement for the parameter value
      if (command === 'set' && args.length > 2) {
        var parameter   = args[0];                 // i.e. 'start'
        var value       = args[1];                 // i.e. 'auto'
        var alias       = aliases[ parameter ];    // i.e. { auto: 'SERVICE_AUTO_START', ... }
        var replacement = alias && alias[ value ]; // i.e. 'auto' -> 'SERVICE_AUTO_START'
        args[1] = replacement ? replacement : args[1];
      }

      self._exec(command, args);
    };

  });

//self.start = function(/*arguments*/) {
//  var args = Array.prototype.slice.call(arguments);
//  self._exec('start', args);
//};
//
//self.stop = function(/*arguments*/) {
//  var args = Array.prototype.slice.call(arguments);
//  self._exec('stop', args);
//};
//
//self.restart = function(/*arguments*/) {
//  var args = Array.prototype.slice.call(arguments);
//  self._exec('restart', args);
//};
//
//self.status = function(/*arguments*/) {
//  var args = Array.prototype.slice.call(arguments);
//  self._exec('status', args);
//};
//
//self.install = function(/*arguments*/) {
///*
// nssm install <servicename>
// nssm install <servicename> <program>
// nssm install <servicename> <program> [<arguments>]
// */
//  var args = Array.prototype.slice.call(arguments);
//  self._exec('install', args);
//};
//
//self.remove = function(/*arguments*/) {
//  var args = Array.prototype.slice.call(arguments);
//  self._exec('remove', args);
//};
//
//self.get = function(/*arguments*/) {
//  var args = Array.prototype.slice.call(arguments);
//  self._exec('get', args);
//};
//
//self.set = function(/*arguments*/) {
//  var args = Array.prototype.slice.call(arguments);
//  self._exec('set', args);
//};
//
//self.reset = function(/*arguments*/) {
//  var args = Array.prototype.slice.call(arguments);
//  self._exec('reset', args);
//};

}


module.exports = function(options) { return new Nssm(options); };

