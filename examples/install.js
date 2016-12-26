/**
 * Created by alykoshin on 26.02.16.
 */

'use strict';

const Path = require('path');
const Nssm = require('../');
const Log = console;

const svcName = 'AeLookupSvc';
const nssmService = new Nssm(svcName); // default

// The path must be in Windows format
let scriptName = Path.resolve(__dirname, 'testSvc', 'testSvc.js');
let programName = /* __dirname + '\\' + */ 'node.exe';

nssmService.install(programName, scriptName, (error, result) => {
  if (error) {
    Log.log('*** error:', error, ' stderr:', result);
    return;
  }

  Log.log('*** stdout: \'' + result + '\'');
});
