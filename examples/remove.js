/**
 * Created by alykoshin on 26.02.16.
 */

'use strict';

const Nssm = require('../');
const Log = console;

const svcName = 'AeLookupSvc';
const nssmService = new Nssm(svcName); // default
let propertyName = 'confirm';

// Add 'confirm' to avoid user prompt
nssmService.remove(propertyName, (error, result) => {
  if (error) {
    Log.log('*** error:', error, ' stderr:', result);
    return;
  }

  Log.log('*** stdout: \'' + result + '\'');
});
