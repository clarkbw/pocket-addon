'use strict';
var main = require('./panel');

exports['test panel'] = function(assert) {
  assert.pass('Unit test running!');
};

exports['test panel async'] = function(assert, done) {
  assert.pass('async Unit test running!');
  done();
};

require('sdk/test').run(exports);
