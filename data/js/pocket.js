'use strict';
/*jshint browser:true */
/*globals $,addon */

function Pocket() {
  // save options locally here
  addon.port.on('options', function(options) {
    console.log('options', options);
    this.options = options;
    this.premiumStatus = options.premiumStatus || false;
  }.bind(this));
  addon.port.on('getTags', this.handleGetTags);

}

window.Pocket = new Pocket();

$(document).ready(function() {
  window.Pocket.init();
  addon.port.emit('show', $('body').width(), $('body').height());
});
