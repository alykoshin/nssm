/**
 * Created by alykoshin on 26.02.16.
 */

'use strict';

const Nssm = require('../');
const Log = console;

const svcName = 'AeLookupSvc';
const nssmService = new Nssm(svcName); // default
let propertyName = 'Start';

nssmService.get(propertyName)
  .then((stdout) => {
    Log.log('then(): stdout: \'' + stdout + '\'');
  })
  .catch((error) => {
    Log.log('catch(): error:', error);
  });


