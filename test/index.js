'use strict';

/* globals describe, before, beforeEach, after, afterEach, it */
const Sinon = require('sinon');
const Chai = require('chai');
const Mockery = require('mockery');
const Commands = require('../lib/commands.json');
const Log = console;

const expect = Chai.expect;

const protectedMethods = ['_exec'];


// We have an issue:
// any exception (including expect/etc) inside async functions silently stops the test execution

describe('# nssm', () => {
  describe('# initialization', () => {
    let nssmModuleExports;
    let nssm;

    beforeEach('beforeEach', () => {
      nssmModuleExports = require('../');
    });

    it('# require() returns constructing function', () => {
      expect(nssmModuleExports).to.be.a('function');
    });

    it('# creates an object', () => {
      nssm = nssmModuleExports('name', {});
      expect(nssm).to.be.an('object');
    });

    it('# an object has all the expected methods', () => {
      let allMethods = Commands.concat(protectedMethods);

      expect(nssm).to.have.all.keys(allMethods);
    });

    it('# throws if name not provided', () => {
      expect(() => {
        nssmModuleExports('', {});
      }).to.throw();
    });
  });

  describe('# methods with mock', () => {
    let serviceName = 'serviceName';
    let nssmModuleExports;
    let nssm;
    let childProcess;

    before('before', () => {
      Mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      });

      childProcess = {
        execFile: Sinon.stub() // overrided later
      };

      // replace the module `request` with a stub object
      Mockery.registerMock('childProcess', childProcess);

      nssmModuleExports = require('../');
      nssm = nssmModuleExports(serviceName, {});
    });

    after(() => {
      Mockery.disable();
    });

    it('# creates a mocked object', () => {
      expect(nssm).to.be.an('object');
    });


    describe('# nssm.get()', () => {
      function setMockFn(defaultNssmExe, commandName, commandParams, output) {
        childProcess.execFile = (name, args, options, execFileCb) => {
          expect(name).to.equal(defaultNssmExe);

          let nssmArgs = commandParams.slice();

          nssmArgs.unshift(serviceName);
          nssmArgs.unshift(commandName);

          expect(args).to.eql(nssmArgs);
          execFileCb(output.error, output.stdout, output.stderr);
        };
      }

      it('# callback on success', (done) => {
        let defaultNssmExe = 'nssm.exe';
        let commandName = 'get';
        let commandParams = ['Start'];
        let error = null;
        let stdout = 'test output';
        let stderr = '';

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        let nssmCallback = (err, res) => {
          expect(err).to.eql(error);
          expect(res).to.equal(stdout);
          done();
        };

        let fnParam = commandParams.slice();

        fnParam.push(nssmCallback);
        nssm[commandName].apply(this, fnParam);
      });

      it('# callback on non-empty error', (done) => {
        let defaultNssmExe = 'nssm.exe';
        let commandName = 'get';
        let commandParams = ['Start'];
        let error = { code: 'ERROR_CODE' };
        let stdout = 'test output';
        let stderr = '';

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        let nssmCallback = (err, res) => {
          expect(err).to.eql(error);
          expect(res).to.equal(stderr);
          done();
        };

        let fnParam = commandParams.slice();
        fnParam.push(nssmCallback);

        nssm[commandName].apply(this, fnParam);
      });

      it('# nssm.get() returns resolved Promise (callback not set)', () => {
        let defaultNssmExe = 'nssm.exe';
        let commandName = 'get';
        let commandParams = ['Start'];
        let error = null;
        let stdout = 'test output';
        let stderr = '';

        setMockFn(defaultNssmExe, commandName, commandParams, { error, stdout, stderr });

        let fnParam = commandParams.slice();
        let promise = nssm[commandName].apply(this, fnParam);

        expect(promise).to.be.a('Promise');

        promise.then((output) => {
          expect(output).to.equal(stdout);
        });
      });

      it('# nssm.get() returns resolved Promise and calls callback on success', (done) => {
        let defaultNssmExe = 'nssm.exe';
        let commandName = 'get';
        let commandParams = ['Start'];
        let error = null;
        let stdout = 'test output';
        let stderr = '';

        setMockFn(defaultNssmExe, commandName, commandParams, { error, stdout, stderr });

        let nssmCallback = (err, res) => {
          expect(err).to.eql(error);
          expect(res).to.equal(stdout);
          done();
        };

        let fnParam = commandParams.slice();
        fnParam.push(nssmCallback);

        let promise = nssm[commandName].apply(this, fnParam);

        expect(promise).to.be.a('Promise');
      });
    });

    describe('# nssm.set()', () => {
      function setMockFn(defaultNssmExe, commandName, commandParams, expectedArgs, output) {
        childProcess.execFile = (name, args, options, execFileCb) => {
          expect(name).to.equal(defaultNssmExe);

          let nssmArgs = commandParams.slice();

          nssmArgs.unshift(serviceName);
          nssmArgs.unshift(commandName);

          Log.log('args:', args, ', nssmArgs:', nssmArgs, ', expectedArgs:', expectedArgs);

          expect(args).to.eql(expectedArgs);
          execFileCb(output.error, output.stdout, output.stderr);
        };
      }

      it('# returns resolved Promise and calls callback on success', (done) => {
        let defaultNssmExe = 'nssm.exe';
        let commandName = 'set';
        let commandParams = ['Start', 'Auto'];
        let error = null;
        let stdout = 'test output';
        let stderr = '';
        let expectedArgs = ['set', 'serviceName', 'Start', 'SERVICE_AUTO_START']; // auto -> SERVICE_AUTO_START

        setMockFn(defaultNssmExe, commandName, commandParams, expectedArgs, { error, stdout, stderr });

        let nssmCallback = (err, res) => {
          expect(err).to.eql(error);
          expect(res).to.equal(stdout);
          done();
        };

        let fnParam = commandParams.slice();

        fnParam.push(nssmCallback);

        let promise = nssm[commandName].apply(this, fnParam);

        expect(promise).to.be.a('Promise');
      });
    });
  });
});
