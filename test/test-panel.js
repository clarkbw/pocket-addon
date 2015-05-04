'use strict';
var saved = require('../lib/panels/saved');
var signedin = require('../lib/panels/signedin');
var signup = require('../lib/panels/signup');

exports['test panel'] = function(assert) {
  assert.pass('Unit test running!');
};

exports['test panel async'] = function(assert, done) {
  assert.pass('async Unit test running!');
  done();
};

require('sdk/test').run(exports);
