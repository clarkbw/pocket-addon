'use strict';

var Panel = require('sdk/panel').Panel;
var self = require('sdk/self');
var tabs = require('sdk/tabs');

var fxAccounts = require('./fx/accounts');
var settings = require('./settings');
var api = require('./api');

var confirmPanel = require('sdk/panel').Panel({
  contentURL: self.data.url('saved.html'),
  width: 350,
  height: 300
});

confirmPanel.on('show', function() {
  confirmPanel.port.emit('options', {
    premiumStatus: settings.get('premium_status')
  });
});

// when the panel asks to close, we close
confirmPanel.port.on('close', function() {
  confirmPanel.hide();
});

confirmPanel.port.on('openTabWithUrl', function(url) {
  console.log('URL', url);
  confirmPanel.hide();
  tabs.open(url);
});

confirmPanel.port.on('getTags', function() {
  confirmPanel.port.emit('getTags', settings.get('tags'));
});

confirmPanel.port.on('getSuggestedTags', function(data) {
  api.getSuggestedTags(data || {}, {
    success: function(data) {
      confirmPanel.port.emit('getSuggestedTags', data);
    }
  });
});

exports.confirmPanel = confirmPanel;

var loggedOutPanel = require('sdk/panel').Panel({
  contentURL: self.data.url('signup.html'),
  width: 300,
  height: 550
});

loggedOutPanel.on('show', function() {
  fxAccounts.isUserSignedIn().then(function(isUserSignedIn) {
    // console.log('fxAccounts.isUserSignedIn()', isUserSignedIn);
    loggedOutPanel.port.emit('options', {
      signedIn: isUserSignedIn
    });
  });
});

loggedOutPanel.port.on('openTabWithUrl', function(url) {
  console.log('URL', url);
  loggedOutPanel.hide();
  tabs.open(url);
});

exports.loggedOutPanel = loggedOutPanel;

var signedInPanel = require('sdk/panel').Panel({
  contentURL: self.data.url('signedin.html'),
  width: 350,
  height: 300
});

exports.signedInPanel = signedInPanel;
