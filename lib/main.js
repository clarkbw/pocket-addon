// jscs:disable
'use strict';

var tabs = require('sdk/tabs');

var { button } = require('./toolbar-button');
var { loggedOutPanel, confirmPanel } = require('./panel');
var cm = require('./context-menu');
var { CONTEXT_MENU_LINK_SAVE, CONTEXT_MENU_PAGE_SAVE } = require('./events');
var api = require('./api');

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
