'use strict';

var Panel = require('sdk/panel').Panel;
var self = require('sdk/self');
var tabs = require('sdk/tabs');

var settings = require('./settings');
var api = require('./api');

var confirmPanel = require('sdk/panel').Panel({
  contentURL: self.data.url('saved.html'),
  width: 350,
  height: 300
});

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

loggedOutPanel.port.on('openTabWithUrl', function(url) {
  console.log('URL', url);
  loggedOutPanel.hide();
  tabs.open(url);
});

exports.loggedOutPanel = loggedOutPanel;
