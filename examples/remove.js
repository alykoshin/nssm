/**
 * Created by alykoshin on 26.02.16.
 */

'use strict';

//var Nssm = require('nssm');
var Nssm = require('../');

var svcName = 'test';
var options = { nssmExe: 'nssm.exe' }; // default
var nssm = Nssm(svcName, options);


// Add 'confirm' to avoid user prompt
nssm.remove('confirm', function(error, result) {
  if (error) {
    console.log('*** error:', error, ' stderr:', result);
    return;
  }
  console.log('*** stdout: \'' + result + '\'');
});
