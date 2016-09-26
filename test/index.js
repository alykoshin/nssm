/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var sinon = require('sinon');
var mockery = require('mockery');

var commands = require('../lib/commands.json');

var protectedMethods = [
  '_exec',
];


// We have an issue:
// any exception (including assert/expect/etc) inside async functions silently stops the test execution


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

    it('# throws if name not provided', function () {
      expect(function() {
        nssmModuleExports('', {});
      }).to.throw();
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
        execFile: sinon.stub() // overrided later
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
      // child_process.execFile = sinon.stub();
      expect(nssm).to.be.an('object');
    });


    describe('# nssm.get()', function() {

      function setMockFn(defaultNssmExe, commandName, commandParams, output) {
        child_process.execFile = function(name, args, options, execFileCb) {
          expect(name).to.equal(defaultNssmExe);

          var nssmArgs = commandParams.slice();
          nssmArgs.unshift(serviceName);
          nssmArgs.unshift(commandName);
          expect(args).to.eql(nssmArgs);

          // var error = null;
          // var stdout = null;
          // var stderr = null;

          // var error = null;
          // if (error || output.stderr) {
          //   error = { code: error };
          // }
          execFileCb(output.error, output.stdout, output.stderr);
        };
      }

      // function setMockFnThrow(/* arguments */) {
      //   child_process.execFile = function(/* arguments */) {
      //     throw new Error('throw error inside child_process.execFile()');
      //   };
      // }


      it('# callback on success', function (done) {

        var defaultNssmExe = 'nssm.exe';
        var commandName = 'get';
        var commandParams = ['Start'];
        var error = null;
        var stdout = 'test output';
        var stderr = '';

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });


        var nssmCallback = function(err, res) {
          expect(err).to.eql(error);
          expect(res).to.equal(stdout);
          done();
        };

        var fnParam = commandParams.slice();
        fnParam.push(nssmCallback);

        nssm[commandName].apply(this,fnParam);
      });

      it('# callback on non-empty error', function (done) {

        var defaultNssmExe = 'nssm.exe';
        var commandName = 'get';
        var commandParams = ['Start'];
        var error = { code: 'ERROR_CODE' };
        var stdout = 'test output';
        var stderr = '';

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });


        var nssmCallback = function(err, res) {
          expect(err).to.eql(error);
          expect(res).to.equal(stderr);
          done();
        };

        var fnParam = commandParams.slice();
        fnParam.push(nssmCallback);

        nssm[commandName].apply(this,fnParam);
      });

      it('# nssm.get() returns resolved Promise (callback not set)', function () {

        var defaultNssmExe = 'nssm.exe';
        var commandName = 'get';
        var commandParams = ['Start'];
        var error = null;
        var stdout = 'test output';
        var stderr = '';

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        // var nssmCallback = function(error, result) {
        //   expect(error).to.be.null;
        //   done();
        // };

        var fnParam = commandParams.slice();
        // fnParam.push(nssmCallback);

        var promise = nssm[commandName].apply(this,fnParam);

        expect(promise).to.be.a('Promise');

        promise.then(function(stdout) {
          expect(stdout).to.equal(stdout);
        });

      });

      it('# nssm.get() returns resolved Promise and calls callback on success', function (done) {

        var defaultNssmExe = 'nssm.exe';
        var commandName = 'get';
        var commandParams = ['Start'];
        var error = null;
        var stdout = 'test output';
        var stderr = '';

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        var nssmCallback = function(err, res) {
          expect(err).to.eql(error);
          expect(res).to.equal(stdout);
          done();
        };

        var fnParam = commandParams.slice();
        fnParam.push(nssmCallback);

        var promise = nssm[commandName].apply(this,fnParam);

        expect(promise).to.be.a('Promise');
      });

      // it('# nssm.get() survives throw inside child_process.execFile()', function (done) {
      //
      //   var defaultNssmExe = 'nssm.exe';
      //   var commandName = 'get';
      //   var commandParams = ['Start'];
      //   var error = null;
      //   var stdout = 'test output';
      //   var stderr = '';
      //
      //   setMockFnThrow(/* arguments */);
      //
      //   var nssmCallback = function(err, res) {
      //     expect(err).to.eql(error);
      //     expect(res).to.equal(stdout);
      //     done();
      //   };
      //
      //   var fnParam = commandParams.slice();
      //   fnParam.push(nssmCallback);
      //
      //   var promise = nssm[commandName].apply(this,fnParam);
      //
      //   expect(promise).to.be.a('Promise');
      // });

    });

    describe('# nssm.set()', function() {

      function setMockFn(defaultNssmExe, commandName, commandParams, expectedArgs, output) {
        child_process.execFile = function(name, args, options, execFileCb) {
          expect(name).to.equal(defaultNssmExe);

          var nssmArgs = commandParams.slice();
          nssmArgs.unshift(serviceName);
          nssmArgs.unshift(commandName);
          console.log('args:', args, ', nssmArgs:', nssmArgs, ', expectedArgs:', expectedArgs);

          expect(args).to.eql(expectedArgs);

          execFileCb(output.error, output.stdout, output.stderr);
        };
      }

      it('# returns resolved Promise and calls callback on success', function (done) {

        var defaultNssmExe = 'nssm.exe';
        var commandName = 'set';
        var commandParams = [ 'Start', 'Auto' ];
        var error = null;
        var stdout = 'test output';
        var stderr = '';
        var expectedArgs = [ 'set', 'serviceName', 'Start', 'SERVICE_AUTO_START' ];  // auto -> SERVICE_AUTO_START

        setMockFn(defaultNssmExe, commandName, commandParams, expectedArgs, { error: error, stdout: stdout, stderr: stderr });

        var nssmCallback = function(err, res) {
          expect(err).to.eql(error);
          expect(res).to.equal(stdout);
          done();
        };

        var fnParam = commandParams.slice();
        fnParam.push(nssmCallback);

        var promise = nssm[commandName].apply(this,fnParam);

        expect(promise).to.be.a('Promise');
      });
    });

  });

});
