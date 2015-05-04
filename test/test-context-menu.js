'use strict';
var cm = require('../lib/context-menu');

exports['test context menu'] = function(assert) {
  assert.pass('Context Menu Unit test running!');
};

exports['test context menu async'] = function(assert, done) {
  assert.pass('async Unit test running!');
  done();
};

require('sdk/test').run(exports);
