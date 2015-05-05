'use strict';

var settings = require('../lib/settings');

var config = require('../config/local.json');
console.log('config', config);

var { Services } = require('resource://gre/modules/Services.jsm');
var cookieManager = Services.cookies;

// Fake the Pocket access token cookie so we can use the service
var { Cc, Ci } = require('chrome');
var cookieService = Cc['@mozilla.org/cookieService;1'].getService(Ci.nsICookieService);
const { newURI } = require('sdk/url/utils');

var spec = 'http://' + settings.get(settings.COOKIE_HOST);
var uri = newURI(spec, null, null);

exports.setAccessTokenCookie = function() {
  console.log('setAccessTokenCookie', uri.spec);
  cookieService.setCookieString(uri, null, 'ftv1=' + config.accessToken, null);
};

exports.clearAccessTokenCookie = function() {
  cookieManager.removeAll();
  // cookieService.setCookieString(uri, null, '', null);
};
