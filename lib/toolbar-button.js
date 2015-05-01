// jscs:disable
'use strict';
var tabs = require('sdk/tabs');
var api = require('./api');

var button = require('sdk/ui/button/toggle').ToggleButton({
  id: 'pocket-toolbar-button',
  label: 'Pocket',
  icon: {
    '16': './icons/pocket-16.png',
    '18': './icons/pocket-18.png',
    '32': './icons/pocket-32.png',
    '36': './icons/pocket-36.png',
    '64': './icons/pocket-64.png'
  }
});

function activeTab() {
  // if our users is not logged in we can show the sign up panel on any page
  if (!api.isUserLoggedIn()) {
    button.disabled = false;
    return;
  }
  button.disabled = (!/^https?:\/\//.test(tabs.activeTab.url));
}

// initialize this on first run
activeTab();

tabs.on('pageshow', activeTab);
tabs.on('activate', activeTab);
tabs.on('deactivate', activeTab);
tabs.on('close', activeTab);

exports.button = button;
