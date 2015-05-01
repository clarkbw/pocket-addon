
'use strict';

var { fxAccounts } = require('resource://gre/modules/FxAccounts.jsm');

exports.getSignedInUser = fxAccounts.getSignedInUser;

var fxAccountEmail = null;

exports.isUserSignedIn = function isUserSignedIn() {
  return fxAccounts.getSignedInUser().then((data) => {
    if (data !== null && data.email) {
      fxAccountEmail = data.email;
      console.log('email', data.email);
    }
    return (data !== null && data.email);
  });
};

exports.getFxAccountEmail = function getFxAccountEmail() {
  return fxAccountEmail;
};
