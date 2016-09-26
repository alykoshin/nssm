/**
 * Created by alykoshin on 26.02.16.
 */

'use strict';

//var Nssm = require('nssm');
var Nssm = require('../');

var svcName = 'AeLookupSvc';
var options = { nssmExe: 'nssm.exe' }; // default
var nssm = Nssm(svcName, options);

var propertyName = 'Start';

nssm.get(propertyName, function(error, result) {
  if (error) {
    console.log('error:', error, ' stderr:', result);
    return;
  }
  console.log('stdout: \'' + result + '\'');
});
