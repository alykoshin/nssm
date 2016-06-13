/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var sinon = require('sinon');
var mockery = require('mockery');
// chai.should();
// chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things


var commands = [
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
  'reset'
];

var protectedMethods = [
  '_exec',
];

describe('# nssm', function () {

  describe('# initialization', function () {
    var nssmModuleExports, nssm;

    beforeEach('beforeEach', function () {
      nssmModuleExports = require('../');
    });

    it('# require() returns constructing function', function () {
      expect(nssmModuleExports).to.be.a('function');
    });

    it('# creates an object', function () {
      nssm = nssmModuleExports('name', {});
      expect(nssm).to.be.an('object');
    });

    it('# an object has all the expected methods', function () {
      var allMethods = commands.concat(protectedMethods);
      expect(nssm).to.have.all.keys( allMethods );
    });
  });

  describe('# methods with mock', function () {
    var serviceName = 'serviceName';
    var nssmModuleExports, nssm, child_process;

    before('before', function () {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      });

      child_process = {
        execFile: sinon.stub()
      };

      // replace the module `request` with a stub object
      mockery.registerMock('child_process', child_process);

      nssmModuleExports = require('../');
      nssm = nssmModuleExports(serviceName, {});
    });

    after(function(){
      mockery.disable();
    });

    it('# creates a mocked object', function () {
      expect(nssm).to.be.an('object');
    });

    it('# able to call nssm.get() passing all parameters', function (done) {

      var defaultNssmExe = 'nssm.exe';
      var commandName = 'get';
      var commandParams = ['Start'];

      child_process.execFile = function(name, args, options, fn) {
        expect(name).to.equal(defaultNssmExe);

        var nssmArgs = commandParams.slice();
        nssmArgs.unshift(serviceName);
        nssmArgs.unshift(commandName);
        expect(args).to.eql(nssmArgs);

        var error = null;
        var stdout = null;
        var stderr = null;
        fn(error, stdout, stderr);
      };

      var nssmCallback = function(error, result) {
        expect(error).to.be.null;
        done();
      };

      var fnParam = commandParams.slice();
      fnParam.push(nssmCallback);

      nssm[commandName].apply(this,fnParam);
    });

  });

});
