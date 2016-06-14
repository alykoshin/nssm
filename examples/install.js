/**
 * Created by alykoshin on 26.02.16.
 */

'use strict';

//var Nssm = require('nssm');
var Nssm = require('../');

var svcName = 'test';
var options = { nssmExe: 'nssm.exe' }; // default
var nssm = Nssm(svcName, options);

// var programName = '.\\node\\64\\node.exe';
var programName = /*__dirname + '\\' +*/ 'node.exe';
var scriptName = __dirname +  '\\' + 'testSvc\\testSvc.js'; // The path must be in Windows format

nssm.install(programName, scriptName, function(error, result) {
  if (error) {
    console.log('*** error:', error, ' stderr:', result);
    return;
  }
  console.log('*** stdout: \'' + result + '\'');
});
