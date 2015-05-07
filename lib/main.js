// jscs:disable
'use strict';

var tabs = require('sdk/tabs');

var { button } = require('./toolbar-button');
var { panel: signup } = require('./panels/signup');
var { panel: saved } = require('./panels/saved');
var { panel: signedin } = require('./panels/signedin');
var cm = require('./context-menu');
var { CONTEXT_MENU_LINK_SAVE, CONTEXT_MENU_PAGE_SAVE } = require('./events');
var api = require('./api');
var cookies = require('./cookies');

function showSaveOrSignup() {
  if (api.isUserLoggedIn()) {
    showSave();
  } else {
    showSignup();
  }
}

function showSave() {
  saved.show({
    position: button
  });
  api.addLink(tabs.activeTab.url, {
    title : tabs.activeTab.title,
    success: function(data) {
      saved.port.emit('saved', data);
    }
  });
}

function showSignup() {
  signup.show({
    position: button
  });
}

cookies.on('signedin', function showSignedInPanel() {
  var { setTimeout } = require('sdk/timers');
  signedin.on('hide', function onHide() {
    button.state('window', {checked: false});
  });
  signedin.show({
    position: button
  });
  setTimeout(function() {
    signedin.hide();
  }, 3 * 1000);
});

button.on('change', function onChange(state) {
  if (state.checked) {
    showSaveOrSignup();
  } else {
    saved.hide();
    signup.hide();
  }
});

saved.on('hide', function onHide() {
  button.state('window', {checked: false});
});
signup.on('hide', function onHide() {
  button.state('window', {checked: false});
});

cm.on(CONTEXT_MENU_LINK_SAVE, showSaveOrSignup);
cm.on(CONTEXT_MENU_PAGE_SAVE, showSaveOrSignup);
