/**
 * Created by alykoshin on 26.09.16.
 */

'use strict';

//var Nssm = require('nssm');
var Nssm = require('../');

var svcName = 'test';
var options = { nssmExe: 'nssm.exe' }; // default
var nssm = Nssm(svcName, options);

var propertyName = 'Start';
var propertyValue = 'manual';

nssm.set('start', 'manual')
  .then(function(stdout) {
    console.log('\n*** Parameter set ok');
    console.log('stdout: \'' + stdout + '\'');
    return nssm.get('start')
  })
  .then(function(stdout) {
    console.log('\n*** Parameter retrieved ok');
    console.log('stdout: \'' + stdout + '\'');
    return nssm.start()
  })
  .then(function(stdout) {
    console.log('\n*** Service started ok');
    console.log('stdout: \'' + stdout + '\'');
    return nssm.stop()
  })
  .then(function(stdout) {
    console.log('\n*** Service stopped ok');
    console.log('stdout: \'' + stdout + '\'');
    console.log('DONE');
  })
  .catch(function(error) {
    console.log('\n*** catch(): error:', error);
    console.log('ERROR:', error);
  })
  ;
