'use strict';
// jscs:disable requireCamelCaseOrUpperCaseIdentifiers
var api = require('../lib/api');
var utils = require('./utils');

exports['test isUserLoggedIn'] = function(assert, done) {
  assert.ok(!api.isUserLoggedIn());
  utils.setAccessTokenCookie();
  assert.pass('isUserLoggedIn!');
  assert.ok(api.isUserLoggedIn());
  utils.clearAccessTokenCookie();
  done();
};

// this test actually hits the Pocket API
exports['test addLink'] = function(assert, done) {
  var url = 'http://www.example.com/';
  function finish() {
    utils.clearAccessTokenCookie();
    done();
  }
  utils.setAccessTokenCookie();
  var options = {
    success: function(data) {
      console.log('d', data);
      assert.equal(data.given_url, url);
      finish();
    },
    error: function(resp) {
      console.error(resp);
      assert.fail(resp);
      finish();
    }
  };
  api.addLink(url, options);
};

require('sdk/test').run(exports);
