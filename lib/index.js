'use strict';

const ChildProcess = require('child_process');

const Commands = require('./commands.json');
const Aliases = require('./aliases.json');
const Errors = require('./errors.json');

function Nssm(name, options = { nssmExe: 'nssm.exe', promise: global.Promise }) {
  let self = this;
  let PromiseLibrary = options.promise;

  if (!name) {
    throw new Error(Errors.emptyName);
  }

  /*
    var Commands = [
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
       'reset'
     ];

    var Aliases = {
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
  */

  self._exec = (cmd, args) => {
    args.unshift(name);
    args.unshift(cmd);

    let callback;

    if (typeof args[args.length - 1] === 'function') {
      callback = args.pop();
    } else {
      callback = () => {};
    }

    return new PromiseLibrary((resolve, reject) => {
      ChildProcess.execFile(options.nssmExe, args, { encoding: 'utf16le' }, (error, stdout, stderr) => {
        // Convert Buffer to String and remove trailing EOLs
        let cleanedStdout = typeof stdout === 'string' ? stdout.toString('utf8').trim() : '';
        let cleanedStderr = typeof stderr === 'string' ? stderr.toString('utf8').trim() : '';
        let outputError = null;

        if (cleanedStderr && !error) {
          // Treat warnings on stderr as error
          outputError = new Error(cleanedStderr);
        } else if (error && error.code === 'ENOENT') {
          // ENOENT
          outputError = new Error(Errors.notFound + ': \'' + options.nssmExe + '\'');
        }

        // Handle error
        if (outputError) {
          callback(outputError, cleanedStderr);
          reject(outputError, cleanedStderr);
          return;
        }

        callback(null, cleanedStdout);
        resolve(cleanedStdout);
      });
    });
  };


  // for each available command add method to Nssm object
  Commands.forEach((command) => {
    if (command === 'set') {
      // May require alias replacement
      self[command] = () => {
        let args = Array.prototype.slice.call(arguments);

        // Replace parameter values with Aliases
        if ((args.length > 2) || (args[args.length - 1] !== 'function' && args.length === 2)) {
          let parameter = args[0].toLowerCase(); // i.e. 'start'
          let value = args[1].toLowerCase(); // i.e. 'auto'
          let parameterAliases = Aliases[parameter]; // i.e. { auto: 'SERVICE_AUTO_START', ... }
          let replacement = parameterAliases && parameterAliases[value]; // i.e. 'auto' -> 'SERVICE_AUTO_START'

          args[1] = replacement ? replacement : args[1];
        }

        return self._exec(command, args);
      };
    } else {
      self[command] = () => {
        let args = Array.prototype.slice.call(arguments);

        return self._exec(command, args);
      };
    }
  });
}

module.exports = (name, options) => {
  return new Nssm(name, options);
};
