'use strict';

/* jshint node:true */

var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var DateRangeConstants = require('../constants/DateRangeConstants');

var ProjectConstants = require('../constants/ProjectConstants');
var ProjectStore = require('./ProjectStore');
var API = require('../utils/Api');

var _from;
var _to;

function updateFrom(data) {
	_from = data;
}

function updateTo(data) {
	_to = data;
}

function loadCurrentSprint(data) {
	updateFrom(data.range.from);
	updateTo(data.range.to);
}

var DateRangeStore = merge(EventEmitter.prototype, {
	getFrom: function() {
		return _from;
	},
	getTo: function() {
		return _to;
	},
	emitChange: function() {
		this.emit('change');
	},
	addChangeListener: function(callback) {
		this.on('change', callback);
	},
	removeChangeListener: function(callback) {
		this.removeListener('change', callback);
	}
});

AppDispatcher.register(function(payload) {
	var action = payload.action;
	switch (action.actionType) {
		case DateRangeConstants.UPDATE_FROM:
			updateFrom(action.data);
			break;
		case DateRangeConstants.UPDATE_TO:
			updateTo(action.data);
			break;
		case DateRangeConstants.LOAD_CURRENT_SPRINT:
			loadCurrentSprint(action.data);
			break;
		// Loading or selecting projects will trigger loading their current sprint date range
		case ProjectConstants.SELECT_PROJECT:
		case ProjectConstants.LOAD_PROJECTS:
			AppDispatcher.waitFor([ProjectStore.dispatchToken]);
			API.getCurrentSprint(ProjectStore.getSelectedProjectId());
			break;
		default:
			// Does not emit change
			return true;
	}
	DateRangeStore.emitChange();
	return true;
});

module.exports = DateRangeStore;