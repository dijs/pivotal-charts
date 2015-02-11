'use strict';

/* jshint node:true */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var StoryTypeConstants = require('../constants/StoryTypeConstants');

var StoreTypeActions = {
	selectType: function(data) {
		AppDispatcher.handleViewAction({
			actionType: StoryTypeConstants.SELECT_TYPE,
			data: data
		});
	}
};

module.exports = StoreTypeActions;