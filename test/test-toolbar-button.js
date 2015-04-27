'use strict';
var main = require('./toolbar-button');

exports['test context menu'] = function(assert) {
  assert.pass('Toolbar Button Unit test running!');
};

exports['test toolbar button async'] = function(assert, done) {
  assert.pass('async Unit test running!');
  done();
};

require('sdk/test').run(exports);
