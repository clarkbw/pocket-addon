'use strict';

var self = require('sdk/self');

var settings = require('../settings');

var panel = require('sdk/panel').Panel({
  contentURL: self.data.url('signedin.html'),
  width: 350,
  height: 300
});

panel.on('show', function(width, height) {
  panel.resize(width, height);
  panel.port.emit('options', {
    premiumStatus: settings.get('premium_status'),
    displayName: settings.get('display_name')
  });
});

exports.panel = panel;
