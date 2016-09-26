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

nssm.get(propertyName)
  .then(function(stdout) {
    console.log('then(): stdout: \'' + stdout + '\'');
  })
  .catch(function(error) {
    console.log('catch(): error:', error);
  })
  ;


