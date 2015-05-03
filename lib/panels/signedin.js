'use strict';

var self = require('sdk/self');

var panel = require('sdk/panel').Panel({
  contentURL: self.data.url('signedin.html'),
  width: 350,
  height: 300
});

exports.panel = panel;
