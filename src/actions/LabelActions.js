'use strict';

/* jshint node:true */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var LabelConstants = require('../constants/LabelConstants');

var LabelActions = {
	loadLabels: function(data) {
		AppDispatcher.handleServerAction({
			actionType: LabelConstants.LOAD_LABELS,
			data: data
		});
	},
	selectLabel: function(data) {
		AppDispatcher.handleViewAction({
			actionType: LabelConstants.SELECT_LABEL,
			data: data
		});
	}
};

module.exports = LabelActions;