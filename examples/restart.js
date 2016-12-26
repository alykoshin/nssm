/**
 * Created by alykoshin on 26.02.16.
 */

'use strict';

const Nssm = require('../');
const Log = console;

const svcName = 'AeLookupSvc';
const nssmService = new Nssm(svcName); // default

nssmService.restart((error, result) => {
  if (error) {
    Log.log('*** error:', error, ' stderr:', result);
    return;
  }

  Log.log('*** stdout: \'' + result + '\'');
});
