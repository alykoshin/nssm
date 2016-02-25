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
  return;
}

if (argv.v || argv.version) {
  version();
  return;
}


var onExec = function (err, result) {
  if (err) {
    console.log('*** err:', err, ' stderr:', result);
    return;
  }
  console.log('*** stdout: \'' + result + '\'');
};

var args = process.argv.slice(2);

var name = args[1];
var cmd = args[0];

args = args.slice(2);
args.push(onExec);

var nssm = new Nssm(name);
if (!nssm[cmd]) { throw 'Invalid command'; }
nssm[cmd].apply(nssm, args);
