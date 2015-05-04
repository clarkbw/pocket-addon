/*global addon */
'use strict';
var Messaging = (function() {

	function addMessageListener(messageId, callback) {
		addon.port.on(messageId, callback);
	}

	function removeMessageListener(messageId, callback) {
		addon.port.off(messageId, callback);
	}

	function sendMessage(messageId, payload, callback) {
		if (callback) {
			addon.port.once(messageId, callback);
		}
		addon.port.emit(messageId, payload);
	}

	/**
	* Public functions
	*/
	return {
		addMessageListener : addMessageListener,
		removeMessageListener : removeMessageListener,
		sendMessage: sendMessage
	};
}());
