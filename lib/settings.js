// jscs:disable
'use strict';

// var ss = require('sdk/simple-storage');
// var extPrefsSvc = require('sdk/simple-prefs');

var API_HOST = exports.API_HOST = 'API_HOST';
var COOKIE_HOST = exports.COOKIE_HOST = 'COOKIE_HOST';

var PREFIX = 'browser.pocket.settings.';

var l10n = require('sdk/l10n/json/core');
var prefsSvc = require('sdk/preferences/service');
var { PrefsTarget } = require('sdk/preferences/event-target');

// listen to the same branch which reqire('sdk/simple-prefs') does
var target = PrefsTarget({ branchName: PREFIX });

exports.get = function get(name, defaultValue) {
  return prefsSvc.get(PREFIX + name, defaultValue);
};

exports.set = function set(name, value) {
  prefsSvc.set(PREFIX + name, value);
};

exports.del = function del(name) {
  prefsSvc.reset(PREFIX + name);
};

exports.has = function has(name) {
  return prefsSvc.has(PREFIX + name);
};

exports.on = function on(name, next) {
  return target.on(name, function(name) {
    next(name, target.prefs[name]);
  });
};

// Returns whether or not the application preference name both exists
// and has been set to a non-default value by the user
exports.isSet = function isSet(name) {
  return prefsSvc.isSet(PREFIX + name);
};

exports.locale = function locale() {
  // similar to window.navigator.language
  return l10n.locale();
};

/**
 * Helper method to check if a user is premium or not
 */
exports.isPremiumUser = function isPremiumUser() {
    return (exports.get('premium_status') == 1);
};

/**
 * Cleans all settings for the previously logged in user
 */
exports.clearUserData = function clearUserData() {
  // Clear stored information
  exports.del('premium_status');
  exports.del('latestSince');
  exports.del('tags');
  exports.del('usedTags');
  exports.del('fsv1');
};

// set some defaults for now
if (!exports.isSet(API_HOST)) {
  exports.set(API_HOST, 'firefox.dev.readitlater.com');
}

if (!exports.isSet(COOKIE_HOST)) {
  exports.set(COOKIE_HOST, 'firefox.dev.readitlater.com');
}
