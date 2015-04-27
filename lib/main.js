// jscs:disable
'use strict';

var { button } = require('./toolbar-button');
var { loggedOutPanel, confirmPanel } = require('./panel');
var cm = require('./context-menu');
var { CONTEXT_MENU_LINK_SAVE, CONTEXT_MENU_PAGE_SAVE } = require('./events');

function save() {
  confirmPanel.show({
    position: button
  });
}

button.on('change', function onChange(state) {
  if (state.checked) {
    save();
  }
});

confirmPanel.on('hide', function onHide() {
  button.state('window', {checked: false});
});
loggedOutPanel.on('hide', function onHide() {
  button.state('window', {checked: false});
});

cm.on(CONTEXT_MENU_LINK_SAVE, save);
cm.on(CONTEXT_MENU_PAGE_SAVE, save);
