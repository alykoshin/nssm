/**
 * Created by alykoshin on 26.02.16.
 */

'use strict';

const Nssm = require('../');
const Log = console;

const svcName = 'AeLookupSvc';
const nssmService = new Nssm(svcName); // default
let propertyName = 'Start';
let propertyValue = 'manual';

nssmService.set(propertyName, propertyValue, (error, result) => {
  if (error) {
    Log.log('*** error:', error, ' stderr:', result);
    return;
  }

  Log.log('*** stdout: \'' + result + '\'');
});
