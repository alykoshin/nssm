#!/usr/bin/env node
'use strict';

var argv = require('minimist')(process.argv.slice(2));
var pkg = require('./package.json');
var Nssm = require('./');
var Log = console;

function help() {
  Log.log([
    '',
    '  Package name: ' + pkg.name,
    '',
    '  Package description: ' + pkg.description,
    '',
    '  Example:',
    '    node node_modules/' + pkg.name + '/cli.js',
    ''
  ].join('\n'));
}

function version() {
  Log.log([
    '* version info:',
    '* package.json version: ' + pkg.version,
    '* process.version: ' + process.version,
    ''
  ].join('\n'));
}

if (argv.h || argv.help) {
  help();
  throw new Error();
}

if (argv.v || argv.version) {
  version();
  throw new Error();
}


var onExec =  (err, result) => {
  if (err) {
    Log.log('*** err:', err, ' stderr:', result);
    return;
  }

  Log.log('*** stdout: \'' + result + '\'');
};

var args = process.argv.slice(2);

var svcName = args[1];
var command = args[0];

args = args.slice(2);
args.push(onExec);

var nssm = new Nssm(svcName);

if (!nssm[command]) {
  throw new Error('Invalid command');
}

nssm[command].apply(nssm, args);
