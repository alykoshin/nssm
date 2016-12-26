/**
 * Created by alykoshin on 26.09.16.
 */

'use strict';

const Nssm = require('../');
const Log = console;

const svcName = 'AeLookupSvc';
const nssmService = new Nssm(svcName); // default
let propertyName = 'Start';
let propertyValue = 'manual';

nssmService.set(propertyName, propertyValue)
  .then((stdout) => {
    Log.log('\n*** Parameter set ok');
    Log.log('stdout: \'' + stdout + '\'');

    return nssmService.get('start');
  })
  .then((stdout) => {
    Log.log('\n*** Parameter retrieved ok');
    Log.log('stdout: \'' + stdout + '\'');

    return nssmService.start();
  })
  .then((stdout) => {
    Log.log('\n*** Service started ok');
    Log.log('stdout: \'' + stdout + '\'');

    return nssmService.stop();
  })
  .then((stdout) => {
    Log.log('\n*** Service stopped ok');
    Log.log('stdout: \'' + stdout + '\'');
    Log.log('DONE');
  })
  .catch((error) => {
    Log.log('\n*** catch(): error:', error);
    Log.log('ERROR:', error);
  })
  ;
