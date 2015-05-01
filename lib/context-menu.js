// jscs:disable
'use strict';

var { on, off, emit } = require('sdk/event/core');
var { Item, PageContext, SelectorContext } = require('sdk/context-menu');
var { CONTEXT_MENU_LINK_SAVE, CONTEXT_MENU_PAGE_SAVE } = require('./events');

var target = Object.create(null);

var pageContextMenuItemScript = '' +
'self.on(\'click\', function (node, data) {' +
'  self.postMessage(document.URL);' +
'});';

var linkContextMenuItemScript = '' +
'self.on(\'click\', function (node, data) {' +
'  self.postMessage(node.getAttribute(\'href\'));' +
'});';

var pageContextMenuItem = Item({
  label: 'Save Page to Pocket',
  context: PageContext(),
  contentScript: pageContextMenuItemScript,
  onMessage: function (pageURL) {
    emit(target, CONTEXT_MENU_PAGE_SAVE, pageURL);
  }
});

exports.pageContextMenuItem = pageContextMenuItem;

var linkContextMenuItem = Item({
  label: 'Save Link to Pocket',
  context: SelectorContext('a[href]'),
  contentScript: linkContextMenuItemScript,
  onMessage: function (pageURL) {
    emit(target, CONTEXT_MENU_LINK_SAVE, pageURL);
  }
});

exports.linkContextMenuItem = linkContextMenuItem;

exports.on = (type, listener) => on(target, type, listener);
exports.off = (type, listener) => off(target, type, listener);
