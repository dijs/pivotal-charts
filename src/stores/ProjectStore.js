'use strict';

/* jshint node:true */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var ProjectConstants = require('../constants/ProjectConstants');
var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var _projects = [];
var _selectedProjectId;

function loadProjects(data) {
	_projects = data;
	_selectedProjectId = data[0].id;
}

function selectProject(data) {
	_selectedProjectId = data;
}

var ProjectStore = merge(EventEmitter.prototype, {
	getProjects: function() {
		return _projects;
	},
	getSelectedProjectId: function() {
		return _selectedProjectId;
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

ProjectStore.dispatchToken = AppDispatcher.register(function(payload) {
	var action = payload.action;
	switch (action.actionType) {
		case ProjectConstants.LOAD_PROJECTS:
			loadProjects(action.data);
			break;
		case ProjectConstants.SELECT_PROJECT:
			selectProject(action.data);
			break;
		default:
			// Does not emit change
			return true;
	}
	ProjectStore.emitChange();
	return true;
});

module.exports = ProjectStore;