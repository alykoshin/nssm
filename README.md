[![npm version](https://badge.fury.io/js/nssm.svg)](http://badge.fury.io/js/nssm)
[![Build Status](https://travis-ci.org/alykoshin/nssm.svg)](https://travis-ci.org/alykoshin/nssm)
[![Coverage Status](https://coveralls.io/repos/alykoshin/nssm/badge.svg?branch=master&service=github)](https://coveralls.io/github/alykoshin/nssm?branch=master)
[![Code Climate](https://codeclimate.com/github/alykoshin/nssm/badges/gpa.svg)](https://codeclimate.com/github/alykoshin/nssm)
[![Inch CI](https://inch-ci.org/github/alykoshin/nssm.svg?branch=master)](https://inch-ci.org/github/alykoshin/nssm)

[![Dependency Status](https://david-dm.org/alykoshin/nssm/status.svg)](https://david-dm.org/alykoshin/nssm#info=dependencies)
[![devDependency Status](https://david-dm.org/alykoshin/nssm/dev-status.svg)](https://david-dm.org/alykoshin/nssm#info=devDependencies)


# nssm

Wrapper for `nssm.exe` to manage Windows services with `Promises` support


If you have different needs regarding the functionality, please add a [feature request](https://github.com/alykoshin/nssm/issues).


## Installation

```sh
npm install --save nssm
```

## Usage

Require the module:

```js
var Nssm = require('nssm');
```

Instantiate the object providing service name and options object (so far `options` object may contains only one parameter `nssmExe` - path to `nssm.exe`):

```js
var nssm = Nssm('AeLookupSvc', { nssmExe: 'nssm.exe' });
```

Execute command by calling appropriate method, passing arguments and callback function, for example, to set startup type: 

```js
nssm.set('Start', 'manual', function(error, result) {
  if (error) {
    console.log('*** error:', error, ' stderr:', result);
    return;
  }
  console.log('*** stdout: \'' + result + '\'');
});
```

Promises version: 

```js
nssm.set('Start', 'manual')
  .then(function(stdout) { 
    console.log('*** stdout: \'' + stdout + '\''); 
  })
  .catch(function(error, stderr) {
     console.log('*** error:', error, ' stderr:', stderr); 
   })
  ;
```

You may use callback and Promises simultaneously if needed.


## Examples

### restart

Please, set the proper name of the service.

```js
//var Nssm = require('nssm');
var Nssm = require('../');

var svcName = 'AeLookupSvc';
var options = { nssmExe: 'nssm.exe' }; // default
var nssm = Nssm(svcName, options);

nssm.restart(function(error, result) {
  if (error) {
    console.log('*** error:', error, ' stderr:', result);
    return;
  }
  console.log('*** stdout: \'' + result + '\'');
});
```

### get 

Please, set the proper name of the service.

```js
//var Nssm = require('nssm');
var Nssm = require('../');

var svcName = 'AeLookupSvc';
var options = { nssmExe: 'nssm.exe' }; // default
var nssm = Nssm(svcName, options);

nssm.get('Start', function(error, result) {
  if (error) {
    console.log('*** error:', error, ' stderr:', result);
    return;
  }
  console.log('*** stdout: \'' + result + '\'');
});
```

### set 

Please, set the proper name of the service.

```js
//var Nssm = require('nssm');
var Nssm = require('../');

var svcName = 'test';
var options = { nssmExe: 'nssm.exe' }; // default
var nssm = Nssm(svcName, options);

nssm.set('Start', 'manual', function(error, result) {
  if (error) {
    console.log('*** error:', error, ' stderr:', result);
    return;
  }
  console.log('*** stdout: \'' + result + '\'');
});
```

## Options object

`options.nssmExe` - String - pathname of `nssm.exe`, default: `nssm.exe`


## Available commands: 
    'install',
    'remove',
    'start',
    'stop',
    'restart',
    'status',
    'pause',
    'continue',
    'rotate',
    'get',
    'set',
    'reset',

Please, refer to `nssm` manual for the info on usage: https://nssm.cc/commands. 

## Aliases

You may also use following aliases when setting parameters values with `set` method.


parameter: `Start`

| alias       | value                       |
|-------------|-----------------------------|
| auto        | SERVICE_AUTO_START          |
| delayed     | SERVICE_DELAYED_START       |
| demand      | SERVICE_DEMAND_START        |
| manual      | SERVICE_DEMAND_START        |
| disabled    | SERVICE_DISABLED            |

parameter: `Type`

| alias       | value                       |
|-------------|-----------------------------|
| standalone  | SERVICE_WIN32_OWN_PROCESS   |
| interactive | SERVICE_INTERACTIVE_PROCESS | 

parameter: `AppPriority`: 

| alias       | value                       |
|-------------|-----------------------------|
| realtime    | REALTIME_PRIORITY_CLASS     |
| high        | HIGH_PRIORITY_CLASS         |
| above       | ABOVE_NORMAL_PRIORITY_CLASS |
| normal      | NORMAL_PRIORITY_CLASS       |
| below       | BELOW_NORMAL_PRIORITY_CLASS |
| idle        | IDLE_PRIORITY_CLASS         |




## Credits
[Alexander](https://github.com/alykoshin/)


# Links to package pages:

[github.com](https://github.com/alykoshin/nssm) &nbsp; [npmjs.com](https://www.npmjs.com/package/nssm) &nbsp; [travis-ci.org](https://travis-ci.org/alykoshin/nssm) &nbsp; [coveralls.io](https://coveralls.io/github/alykoshin/nssm) &nbsp; [inch-ci.org](https://inch-ci.org/github/alykoshin/nssm)


## License

MIT
