'use strict';

/* jshint node:true */

var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var AppDispatcher = require('../dispatcher/AppDispatcher');
var StoryTypeConstants = require('../constants/StoryTypeConstants');

var _types = ['all', 'bug', 'chore', 'feature', 'release'];
var _selectedType = 'all';

function selectType(data) {
	_selectedType = data;
}

var StoreTypeStore = merge(EventEmitter.prototype, {
	getTypes: function() {
		return _types;
	},
	getSelectedType: function() {
		return _selectedType;
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

StoreTypeStore.dispatchToken = AppDispatcher.register(function(payload) {
	var action = payload.action;
	switch (action.actionType) {
		case StoryTypeConstants.SELECT_TYPE:
			selectType(action.data);
			break;
		default:
			// Does not emit change
			return true;
	}
	StoreTypeStore.emitChange();
	return true;
});

module.exports = StoreTypeStore;