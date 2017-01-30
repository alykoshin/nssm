'use strict';

const Errors = require('./errors.json');
const ChildProcess = require('child_process');

const list = [
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

function exec(PromiseLibrary, nssmExe, serviceName, cmd, args) {
  let callback;
  let commandArgs = args

  commandArgs.unshift(serviceName);
  commandArgs.unshift(cmd);

  if (typeof commandArgs[commandArgs.length - 1] === 'function') {
    callback = commandArgs.pop();
  } else {
    callback = () => {};
  }

  if(commandArgs.length === 1 && typeof commandArgs[0] == Object){
    let key = Object.keys(commandArgs[0])[0];
    commandArgs = [key, commandArgs[key]];
  }

  return new PromiseLibrary((resolve, reject) => {
    ChildProcess.execFile(nssmExe, commandArgs, { encoding: 'utf16le' }, (error, stdout, stderr) => {
      // Convert Buffer to String and remove trailing EOLs
      let cleanedStdout = typeof stdout === 'string' ? stdout.toString('utf8').trim() : '';
      let cleanedStderr = typeof stderr === 'string' ? stderr.toString('utf8').trim() : '';
      let outputError = null;

      if (cleanedStderr && !error) {
        // Treat warnings on stderr as error
        outputError = new Error(cleanedStderr);
      } else if (error && error.code === 'ENOENT') {
        // ENOENT
        outputError = new Error(Errors.notFound + ': \'' + nssmExe + '\'');
      } else {
        outputError = error;
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
}

module.exports = {
  exec: exec,
  list: list
};
