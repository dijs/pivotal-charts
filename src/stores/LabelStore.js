'use strict';

/* jshint node:true */

var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var LabelConstants = require('../constants/LabelConstants');
var ProjectConstants = require('../constants/ProjectConstants');
var ProjectStore = require('./ProjectStore');
var API = require('../utils/Api');

var _labels = [];
var _selectedLabel;

function loadLabels(data) {
	_labels = data.labels;
	_selectedLabel = 'any';
}

function selectLabel(data) {
	_selectedLabel = data;
}

var LabelStore = merge(EventEmitter.prototype, {
	getLabels: function() {
		return _labels;
	},
	getSelectedLabel: function() {
		return _selectedLabel;
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

LabelStore.dispatchToken = AppDispatcher.register(function(payload) {
	var action = payload.action;
	switch (action.actionType) {
		case LabelConstants.SELECT_LABEL:
			selectLabel(action.data);
			break;
		case LabelConstants.LOAD_LABELS:
			loadLabels(action.data);
			break;
		case ProjectConstants.LOAD_PROJECTS:
		case ProjectConstants.SELECT_PROJECT:
			AppDispatcher.waitFor([ProjectStore.dispatchToken]);
			API.getLabels(ProjectStore.getSelectedProjectId());
			break;
		default:
			// Does not emit change
			return true;
	}
	LabelStore.emitChange();
	return true;
});

module.exports = LabelStore;