'use strict';
/*jshint browser:true */
/*globals $,addon */
$(document).ready(function() {
  $('body').on('click', '.btn, a[href]', function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log('addon.port.emit(openTabWithUrl)', $(this).attr('href'));
    addon.port.emit('openTabWithUrl', $(this).attr('href'));
    return false;
  });
  addon.port.emit('show');
});
