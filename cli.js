#!/usr/bin/env node
'use strict';

var argv = require('minimist')(process.argv.slice(2));
var pkg = require('./package.json');
var Nssm = require('./');


function help() {
  console.log([
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
  console.log([
    '* version info:',
    '* package.json version: ' + pkg.version,
    '* process.version: ' + process.version,
    ''
  ].join('\n'));
}

if (argv.h || argv.help) {
  help();
  process.exit(0);
}

if (argv.v || argv.version) {
  version();
  process.exit(0);
}


var onExec = function (err, result) {
  if (err) {
    console.log('*** err:', err, ' stderr:', result);
    return;
  }
  console.log('*** stdout: \'' + result + '\'');
};

var args = process.argv.slice(2);

var svcName = args[1];
var command = args[0];

args = args.slice(2);
args.push(onExec);

var nssm = new Nssm(svcName);
if (!nssm[command]) { throw 'Invalid command'; }
nssm[command].apply(nssm, args);
