'use strict';

var Panel = require('sdk/panel').Panel;
var self = require('sdk/self');

var confirmPanel = require('sdk/panel').Panel({
  contentURL: self.data.url('confirm.html'),
  width: 300,
  height: 140
});

exports.confirmPanel = confirmPanel;

var loggedOutPanel = require('sdk/panel').Panel({
  contentURL: self.data.url('logged-out.html'),
  width: 300,
  height: 400
});

exports.loggedOutPanel = loggedOutPanel;
