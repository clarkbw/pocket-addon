'use strict';

var self = require('sdk/self');
var tabs = require('sdk/tabs');

var settings = require('../settings');
var api = require('../api');

var panel = require('sdk/panel').Panel({
  contentURL: self.data.url('saved.html'),
  width: 350,
  height: 300
});

panel.on('show', function(width, height) {
  panel.resize(width, height);
  panel.port.emit('options', {
    premiumStatus: settings.get('premium_status')
  });
});

// when the panel asks to close, we close
panel.port.on('close', function() {
  panel.hide();
});

panel.port.on('openTabWithUrl', function(url) {
  console.log('URL', url);
  panel.hide();
  tabs.open(url);
});

panel.port.on('deleteItem', function(itemId) {
  api.deleteItem(itemId, {}, function(resp) {
    panel.port.emit('deleteItem', resp);
  });
});

panel.port.on('getTags', function() {
  panel.port.emit('getTags', settings.get('tags'));
});

panel.port.on('getSuggestedTags', function(data) {
  api.getSuggestedTags(data || {}, {
    success: function(data) {
      panel.port.emit('getSuggestedTags', data);
    }
  });
});

exports.panel = panel;
