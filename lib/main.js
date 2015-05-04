// jscs:disable
'use strict';

var tabs = require('sdk/tabs');

var { button } = require('./toolbar-button');
var { panel: loggedOutPanel } = require('./panels/signup');
var { panel: confirmPanel } = require('./panels/saved');
var { panel: signedInPanel } = require('./panels/signedin');
var cm = require('./context-menu');
var { CONTEXT_MENU_LINK_SAVE, CONTEXT_MENU_PAGE_SAVE } = require('./events');
var api = require('./api');
var cookies = require('./cookies');

function saveOrSignup() {
  if (api.isUserLoggedIn()) {
    save();
  } else {
    signup();
  }
}

function save() {
  api.addLink(tabs.activeTab.url, {
    title : tabs.activeTab.title,
    success: function(data) {
      confirmPanel.port.emit('saved', data);
    }
  });
  confirmPanel.show({
    position: button
  });
}

function signup() {
  loggedOutPanel.show({
    position: button
  });
}

cookies.on('signedin', function showSignedInPanel() {
  var { setTimeout } = require('sdk/timers');
  signedInPanel.on('hide', function onHide() {
    button.state('window', {checked: false});
  });
  signedInPanel.show({
    position: button
  });
  setTimeout(function() {
    signedInPanel.hide();
  }, 3 * 1000);
});

button.on('change', function onChange(state) {
  if (state.checked) {
    saveOrSignup();
  } else {
    confirmPanel.hide();
    loggedOutPanel.hide();
  }
});

confirmPanel.on('hide', function onHide() {
  button.state('window', {checked: false});
});
loggedOutPanel.on('hide', function onHide() {
  button.state('window', {checked: false});
});

cm.on(CONTEXT_MENU_LINK_SAVE, saveOrSignup);
cm.on(CONTEXT_MENU_PAGE_SAVE, saveOrSignup);
