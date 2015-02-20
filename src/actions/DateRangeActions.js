'use strict';

/* jshint node:true */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var DateRangeConstants = require('../constants/DateRangeConstants');

var DateRangeActions = {
	loadCurrentSprint: function(data) {
		AppDispatcher.handleServerAction({
			actionType: DateRangeConstants.LOAD_CURRENT_SPRINT,
			data: data
		});
	},
	updateFrom: function(data) {
		AppDispatcher.handleViewAction({
			actionType: DateRangeConstants.UPDATE_FROM,
			data: data
		});
	},
	updateTo: function(data) {
		AppDispatcher.handleViewAction({
			actionType: DateRangeConstants.UPDATE_TO,
			data: data
		});
	}
};

module.exports = DateRangeActions;