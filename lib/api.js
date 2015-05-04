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
};

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

/**
 * Delete an item identified by item id from the users list
 * @param  {string} itemId  The id from the item we want to remove
 * @param  {Object | undefined} options Can provide an actionInfo object with
 *                                      further data to send to the API. Can
 *                                      have success and error callbacks
 * @return {Boolean} Returns Boolean whether the api call started sucessfully
 */
exports.deleteItem = function deleteItem(itemId, options) {
  var action = {
    action: 'delete',
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    item_id: itemId
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
  };
  return sendAction(action, options);
};

/**
 * API call to the add tags to an item or url
 * and addTagsToItem but not exposed outside
 * @param {Object} actionPart Specific action part to add to action {url: url} or {item_id: itemId}
 * @param {Array}  tags       Tags adding to the item
 * @param {Object | undefined} options Can provide an actionInfo object with
 *                                     further data to send to the API. Can
 *                                     have success and error callbacks
 * @return {Promise}
 */
exports.addTags = function addTags(actionPart, tags, options) {
  // Tags add action
  var action = {
    action: 'tags_add',
    tags: tags
  };
  action = Object.assign(action, actionPart);

  // Backup the success callback as we need it later
  var finalSuccessCallback = options.success;

  // Switch the success callback
  options.success = function(data) {

    // Update used tags
    var usedTagsJSON = settings.get('usedTags');
    var usedTags = usedTagsJSON ? JSON.parse(usedTagsJSON) : {};

    // Check for each tag if it's already in the used tags
    for (var i = 0; i < tags.length; i++) {
      var tagToSave = tags[i].trim();
      var newUsedTagObject = {
        'tag': tagToSave,
        'timestamp': new Date().getTime()
      };
      usedTags[tagToSave] = newUsedTagObject;
    }
    settings.set('usedTags', JSON.stringify(usedTags));

    // Let the callback know that we are finished
    if (finalSuccessCallback) {
      finalSuccessCallback(data);
    }
  };

  // Execute the action
  return sendAction(action, options);
};

/**
 * General function to send all kinds of actions like adding of links or
 * removing of items via the API
 * @param  {Object}  action  Action object
 * @param  {Object | undefined}  options Can provide an actionInfo object
 *                                       with further data to send to the
 *                                       API. Can have success and error
 *                                       callbacks
 * @return {Boolean} Returns Boolean whether the api call started sucessfully
 */
function sendAction(action, options) {
  // Options can have an 'actionInfo' object. This actionInfo object gets
  // passed through to the action object that will be send to the API endpoint
  if (typeof options.actionInfo !== 'undefined') {
    action = Object.assign(action, options.actionInfo);
  }
  return sendActions([action], options);
}

/**
 * General function to send all kinds of actions like adding of links or
 * removing of items via the API
 * @param  {Array} actions Array of action objects
 * @param  {Object | undefined} options Can have success and error callbacks
 * @return {Boolean} Returns Boolean whether the api call started sucessfully
 */
function sendActions(actions, options) {
  return apiRequest({
    path: '/send',
    data: {
      actions: JSON.stringify(actions)
    },
    success: options.success,
    error: options.error
  });
}

function apiRequest(options) {
  if ((typeof options === 'undefined') || (typeof options.path === 'undefined')) {
    return false;
  }

  var url = baseAPIUrl + options.path;
  var data = options.data || {};
  var since = settings.get('latestSince');
  data.since = since ? since : 0;

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  data.access_token = cookies.getAccessToken();
  data.locale_lang = settings.locale();
  data.consumer_key = oAuthConsumerKey;
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

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
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        var premiumStatus = response.json.premium_status;
        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
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
