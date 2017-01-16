'use strict';

/* globals describe, before, beforeEach, after, afterEach, it */
const Sinon = require('sinon');
const Chai = require('chai');
const Mockery = require('mockery');
const Commands = require('../lib/commands.js');
const expect = Chai.expect;
const Log = console;

describe('# service', () => {
  describe('# initialization', () => {
    let Nssm;
    let service;

    beforeEach('beforeEach', () => {
      Nssm = require('../');
    });

    it('# require() returns constructing function', () => {
      expect(Nssm).to.be.a('function');
    });

    it('# creates an object', () => {
      service = new Nssm('name');
      expect(service).to.be.an('object');

      service = Nssm('name');
      expect(service).to.be.an('object');
    });

    it('# an object has all the expected methods', () => {
      let allMethods = Commands.list;
      
      service = new Nssm('name');

      expect(service).to.have.all.keys(allMethods);
    });

    it('# throws if name not provided', () => {
      expect(()=>new Nssm('')).to.throw();
      expect(()=>new Nssm()).to.throw();
    });
  });

  describe('# methods with mock', () => {
    let serviceName = 'serviceName';
    let Nssm;
    let service;
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

      Mockery.registerMock('child_process', childProcess);

      Nssm = require('../');
      service = new Nssm(serviceName);
    });

    after(() => {
      Mockery.disable();
    });

    it('# creates a mocked object', () => {
      expect(service).to.be.an('object');
    });

    describe('# service.get()', () => {
      function setMockFn(defaultNssmExe, commandName, commandParams, output) {
        childProcess.execFile = (name, args, options, execFileCb) => {
          expect(name).to.equal(defaultNssmExe);

          let serviceArgs = commandParams.slice();

          serviceArgs.unshift(serviceName);
          serviceArgs.unshift(commandName);

          expect(args).to.eql(serviceArgs);

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
        let commandParamsClone = commandParams.slice();
        let serviceCallback = (err, stout) => {
          expect(err).to.eql(error);
          expect(stout).to.equal(stout);
          done();
        };

        commandParamsClone.push(serviceCallback);

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        return service.get.apply(this, commandParamsClone);
      });

      it('# callback on non-empty error', (done) => {
        let defaultNssmExe = 'nssm.exe';
        let commandName = 'get';
        let commandParams = ['Start'];
        let error = { code: 'ERROR_CODE' };
        let stdout = 'test output';
        let stderr = '';
        let commandParamsClone = commandParams.slice();
        let serviceCallback = (err, sterr) => {
          expect(err).to.eql(error);
          expect(sterr).to.equal(stderr);
          done();
        };

        commandParamsClone.push(serviceCallback);

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        return service.get.apply(this, commandParamsClone);
      });

      it('# service.get() returns resolved Promise (callback not set)', () => {
        let defaultNssmExe = 'nssm.exe';
        let commandName = 'get';
        let commandParams = ['Start'];
        let error = null;
        let stdout = 'test output';
        let stderr = '';
        let commandParamsClone = commandParams.slice();

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        let promise = service.get.apply(this, commandParamsClone);

        expect(promise).to.be.a('Promise');

        promise.then((output) => {
          expect(output).to.equal(stdout);
        });
      });

      it('# service.get() returns resolved Promise and calls callback on success', (done) => {
        let defaultNssmExe = 'nssm.exe';
        let commandName = 'get';
        let commandParams = ['Start'];
        let error = null;
        let stdout = 'test output';
        let stderr = '';
        let commandParamsClone = commandParams.slice();
        let serviceCallback = (err, stout) => {
          expect(err).to.eql(error);
          expect(stout).to.equal(stdout);
          done();
        };

        commandParamsClone.push(serviceCallback);

        setMockFn(defaultNssmExe, commandName, commandParams, { error: error, stdout: stdout, stderr: stderr });

        let promise = service.get.apply(this, commandParamsClone);

        expect(promise).to.be.a('Promise');
      });
    });

    describe('# service.set()', () => {
      function setMockFn(defaultNssmExe, commandName, commandParams, expectedArgs, output) {
        childProcess.execFile = (name, args, options, execFileCb) => {
          expect(name).to.equal(defaultNssmExe);

          let serviceArgs = commandParams.slice();

          serviceArgs.unshift(serviceName);
          serviceArgs.unshift(commandName);

          Log.log('args:', args, ', serviceArgs:', serviceArgs, ', expectedArgs:', expectedArgs);

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
        let commandParamsClone = commandParams.slice();
        let serviceCallback = (err, stout) => {
          expect(err).to.eql(error);
          expect(stout).to.equal(stdout);
          done();
        };

        commandParamsClone.push(serviceCallback);

        setMockFn(defaultNssmExe, commandName, commandParams, expectedArgs, { error: error, stdout: stdout, stderr: stderr });

        let promise = service.set.apply(this, commandParamsClone);

        expect(promise).to.be.a('Promise');
      });
    });
  });
});
