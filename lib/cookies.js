// jscs:disable
'use strict';

const { Cr, Cu, Ci, Cc, Cm } = require('chrome');
var events = require('sdk/system/events');

var settings = require('./settings');

// save and cache the cookie host
var cookieHost = settings.get(settings.COOKIE_HOST);
settings.on(settings.COOKIE_HOST, function(name, value) {
  cookieHost = value;
});

// cache the access token in memory
var accessToken = null;

function handleCookieChange(event) {
  var cookie = event.subject.QueryInterface(Ci.nsICookie);
  // get out of this function quickly if it is not about pocket
  // cookie.host looks like .fx.dev.getpocket
  if (cookie.host !== '.' + cookieHost) {
    return;
  }
  // console.log(event.subject);

  if ((event.data == 'added') || (event.data == 'changed')) {
    if (cookie.name === 'ftv1') {
      accessToken = cookie.value;
    } else if (cookie.name === 'fsv1') {
      settings.set('fsv1', cookie.value);
    }
  } else if (event.data == 'deleted') {
    // logged out
    if (cookie.name === 'ftv1') {
      accessToken = null;
    } else if (cookie.name === 'fsv1') {
      settings.clearUserData();
    }
  }
}

// watch for the pocket cookie changing so we can handle login / logout
events.on('cookie-changed', handleCookieChange);

/*
*  All cookies from the Pocket domain
*  The return format: { cookieName:cookieValue, cookieName:cookieValue, ... }
*/
function getCookiesFromPocket() {
  var cookieManager = Cc['@mozilla.org/cookiemanager;1'].getService(Ci.nsICookieManager2);
  var pocketCookies = cookieManager.getCookiesFromHost(cookieHost);
  var cookies = {};
  while (pocketCookies.hasMoreElements()) {
    var cookie = pocketCookies.getNext().QueryInterface(Ci.nsICookie2);
    cookies[cookie.name] = cookie.value;
  }
  return cookies;
}

/**
* Returns access token or undefined if no logged in user was found
* @return {string | undefined} Access token for logged in user user
*/
exports.getAccessToken = function getAccessToken() {
  // try using our cache first, otherwise this function will set
  if (accessToken) {
    return accessToken;
  }
  var pocketCookies = getCookiesFromPocket();

  // If no cookie was found just return undefined
  if (typeof pocketCookies.ftv1 === 'undefined') {
    return undefined;
  }
  accessToken = pocketCookies.ftv1;

  // Check if a new user logged in in the meantime and clearUserData if so
  var sessionId = pocketCookies.fsv1;
  var lastSessionId = settings.get('fsv1');
  if (sessionId !== lastSessionId) {
    settings.clearUserData();
    settings.set('fsv1', sessionId);
  }

  // Return access token
  return accessToken;
};
