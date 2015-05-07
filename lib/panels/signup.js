'use strict';

var self = require('sdk/self');
var tabs = require('sdk/tabs');

var fxAccounts = require('../fx/accounts');

var panel = require('sdk/panel').Panel({
  contentURL: self.data.url('signup.html'),
  width: 300,
  height: 550
});

panel.on('show', function(width, height) {
  panel.resize(width, height);
  fxAccounts.isUserSignedIn().then(function(isUserSignedIn) {
    // console.log('fxAccounts.isUserSignedIn()', isUserSignedIn);
    panel.port.emit('options', {
      signedIn: isUserSignedIn
    });
  });
});

panel.port.on('openTabWithUrl', function(url) {
  console.log('URL', url);
  panel.hide();
  tabs.open(url);
});

exports.panel = panel;
