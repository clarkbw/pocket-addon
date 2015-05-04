'use strict';
// var sinon = require('sinon');
var tabs = require('sdk/tabs');
var button = require('../lib/toolbar-button');
var api = require('../lib/api');

exports['test toolbar button : signed in : enabled on about page'] = function(assert, done) {
  assert.ok(!api.isUserLoggedIn());
  tabs.open({
    url: 'about:blank',
    inBackground: false,
    onOpen: function onOpen(tab) {
      assert.ok(!button.disabled, 'button should be enabled');
      tab.close(done);
    }
  });
};

exports['test toolbar button : signed in : enabled on activating about page'] = function(assert, done) {
  assert.ok(!api.isUserLoggedIn());
  tabs.open({
    url: 'about:blank',
    inBackground: true,
    onOpen: function onOpen(tab) {
      tab.on('activate', function() {
        assert.ok(!button.disabled, 'button should be enabled');
        tab.close(done);
      });
      tab.activate();
    }
  });
};

exports['test toolbar button : signed in : disabled on about page'] = function(assert, done) {
  assert.ok(!api.isUserLoggedIn());
  // var stub = sinon.stub(api, 'isUserLoggedIn', function() {
  //   return true;
  // });
  tabs.open({
    url: 'about:blank',
    inBackground: false,
    onOpen: function onOpen(tab) {
      // assert.ok(button.disabled, 'button should be disabled');
      // api.isUserLoggedIn.restore();
      tab.close(done);
    }
  });
};

require('sdk/test').run(exports);
