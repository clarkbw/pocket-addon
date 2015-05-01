'use strict';

var { Request } = require('sdk/request');

var settings = require('./settings');
var cookies = require('./cookies');

// Base url for all api calls
var baseAPIUrl = 'https://' + settings.get(settings.API_HOST) + '/v3';


/**
* Auth keys for the API requests
*/
var oAuthConsumerKey = '40249-e88c401e1b1f2242d9e441c4';

/**
* Returns users logged in status
* @return {Boolean} Users logged in status
*/
exports.isUserLoggedIn = function isUserLoggedIn() {
  // TODO: this needs to be fast and it isn't
  return (typeof cookies.getAccessToken() !== 'undefined');
}

/**
* Add a new link to Pocket
* @param {string} url     URL of the link
* @param {Object | undefined} options Can provide an title and have a
*                                     success and error callbacks
* @return {Boolean} Returns Boolean whether the api call started sucessfully
*/
exports.addLink = function addLink(url, options) {
  options = options || {};

  var sendData = {
    url: url
  };

  if (typeof options.title !== 'undefined') {
    sendData.title = options.title;
  }

  return apiRequest({
    path: '/firefox/save',
    data: sendData,
    success: function(data) {
      if (options.success) {
        options.success(data);
      }
    },
    error: options.error
  });
};

/**
 * Helper function to get suggested tags
 * @return {Boolean} Returns Boolean whether the api call started sucessfully
 */
exports.getSuggestedTags = function getSuggestedTags(data, options) {

  data = data || {};
  options = options || {};

  return apiRequest({
    path: '/getSuggestedTags',
    data: data,
    success: options.success,
    error: options.error
  });
};

function apiRequest(options) {
  if ((typeof options === 'undefined') || (typeof options.path === 'undefined')) {
    return false;
  }

  var url = baseAPIUrl + options.path;
  var data = options.data || {};
  data.access_token = cookies.getAccessToken();

  var since = settings.get('latestSince');
  data.since = since ? since : 0;

  data.locale_lang = settings.locale();
  data.consumer_key = oAuthConsumerKey;

  return Request({
    url: url,
    content: data,
    onComplete: (response) => {
      if (response.status === 200) {

        // Update premium status, tags and since
        var tags = response.json.tags;
        if ((typeof tags !== 'undefined') && Array.isArray(tags)) {
          // If a tagslist is in the response replace the tags
          settings.set('tags', JSON.stringify(tags));
        }

        // Update premium status
        var premiumStatus = response.json.premium_status;
        if (typeof premiumStatus !== 'undefined') {
          // If a premium_status is in the response replace the premium_status
          settings.set('premium_status', premiumStatus);
        }

        // Save since value for further requests
        settings.set('latestSince', response.json.since);

        options.success(response.json);
      } else {
        if (options.error) {
          options.error(response);
        }
      }
    }
  }).post();
}
