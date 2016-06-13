/* globals describe, before, beforeEach, after, afterEach, it */

'use strict';

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
// chai.should();
// chai.use(require('chai-things')); //http://chaijs.com/plugins/chai-things


describe('nssm', function () {

  before('before', function () {

  });

  beforeEach('beforeEach', function () {

  });

  afterEach('afterEach', function () {

  });

  after('after', function () {

  });

  describe('initialization', function () {
    var nssmModuleExports, nssm;

    beforeEach('beforeEach', function () {
      nssmModuleExports = require('../');
    });

    it('require() returns constructing function', function () {
      expect(nssmModuleExports).to.be.a('function');
    });

    it('creates an object', function () {
      nssm = nssmModuleExports('name', {});
      expect(nssm).to.be.an('object');
    });

    it('an object has all the expected methods', function () {
      expect(nssm).to.have.all.keys([
        // protected methods
        '_exec',
        // commands
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
      ]);
    });
  });

});
