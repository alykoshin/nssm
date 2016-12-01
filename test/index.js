/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

const Sinon = require('sinon');
const Chai = require('chai');
const Mockery = require('Mockery');
const Assert = Chai.assert;
const Expect = Chai.expect;

const Commands = require('../lib/commands.json');

const protectedMethods = [
  '_exec',
];


// We have an issue:
// any exception (including Assert/Expect/etc) inside async functions silently stops the test execution


describe('# nssm', () => {

  describe('# initialization', () => {
    let nssmModuleExports, nssm;

    beforeEach('beforeEach', () => {
      nssmModuleExports = require('../');
    });

    it('# require() returns constructing function', () => {
      Expect(nssmModuleExports).to.be.a('function');
    });

    it('# creates an object', () => {
      nssm = nssmModuleExports('name', {});
      Expect(nssm).to.be.an('object');
    });

    it('# an object has all the Expected methods', () => {
      let allMethods = Commands.concat(protectedMethods);

      Expect(nssm).to.have.all.keys(allMethods);
    });

    it('# throws if name not provided', () => {
      Expect(() => {
        nssmModuleExports('', {});
      }).to.throw();
    });
  });

  describe('# methods with mock', () => {
    let serviceName = 'serviceName';
    let nssmModuleExports, nssm, child_process;

    before('before', () => {
      Mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      });

      child_process = {
        execFile: Sinon.stub() // overrided later
      };

      // replace the module `request` with a stub object
      Mockery.registerMock('child_process', child_process);

      nssmModuleExports = require('../');
      nssm = nssmModuleExports(serviceName, {});
    });

    after(() => {
      Mockery.disable();
    });

    it('# creates a mocked object', () => {
      Expect(nssm).to.be.an('object');
    });


    describe('# nssm.get()', () => {
      function setMockFn(defaultNssmExe, commandName, commandParams, output) {
        child_process.execFile = (name, args, options, execFileCb) => {
          Expect(name).to.equal(defaultNssmExe);

          let nssmArgs = commandParams.slice();

          nssmArgs.unshift(serviceName);
          nssmArgs.unshift(commandName);

          Expect(args).to.eql(nssmArgs);
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
          Expect(err).to.eql(error);
          Expect(res).to.equal(stdout);
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
          Expect(err).to.eql(error);
          Expect(res).to.equal(stderr);
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

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        let fnParam = commandParams.slice();
        let promise = nssm[commandName].apply(this, fnParam);

        Expect(promise).to.be.a('Promise');

        promise.then((stdout) => {
          Expect(stdout).to.equal(stdout);
        });
      });

      it('# nssm.get() returns resolved Promise and calls callback on success', (done) => {
        let defaultNssmExe = 'nssm.exe';
        let commandName = 'get';
        let commandParams = ['Start'];
        let error = null;
        let stdout = 'test output';
        let stderr = '';

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        let nssmCallback = (err, res) => {
          Expect(err).to.eql(error);
          Expect(res).to.equal(stdout);
          done();
        };

        let fnParam = commandParams.slice();
        fnParam.push(nssmCallback);

        let promise = nssm[commandName].apply(this, fnParam);

        Expect(promise).to.be.a('Promise');
      });
    });

    describe('# nssm.set()', () => {
      function setMockFn(defaultNssmExe, commandName, commandParams, ExpectedArgs, output) {
        child_process.execFile = (name, args, options, execFileCb) => {
          Expect(name).to.equal(defaultNssmExe);

          let nssmArgs = commandParams.slice();

          nssmArgs.unshift(serviceName);
          nssmArgs.unshift(commandName);

          console.log('args:', args, ', nssmArgs:', nssmArgs, ', ExpectedArgs:', ExpectedArgs);

          Expect(args).to.eql(ExpectedArgs);
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
        let ExpectedArgs = ['set', 'serviceName', 'Start', 'SERVICE_AUTO_START']; // auto -> SERVICE_AUTO_START

        setMockFn(defaultNssmExe, commandName, commandParams, ExpectedArgs, { error: error, stdout: stdout, stderr: stderr });

        let nssmCallback = (err, res) => {
          Expect(err).to.eql(error);
          Expect(res).to.equal(stdout);
          done();
        };

        let fnParam = commandParams.slice();

        fnParam.push(nssmCallback);

        let promise = nssm[commandName].apply(this, fnParam);

        Expect(promise).to.be.a('Promise');
      });
    });
  });
});
