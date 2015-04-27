// jscs:disable
'use strict';

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

exports.button = button;
