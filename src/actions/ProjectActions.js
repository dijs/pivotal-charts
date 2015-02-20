'use strict';

/* jshint node:true */

var AppDispatcher = require('../dispatcher/AppDispatcher');
var ProjectConstants = require('../constants/ProjectConstants');

var ProjectActions = {
	loadProjects: function(data) {
		AppDispatcher.handleServerAction({
			actionType: ProjectConstants.LOAD_PROJECTS,
			data: data
		});
	},
	selectProject: function(data) {
		AppDispatcher.handleViewAction({
			actionType: ProjectConstants.SELECT_PROJECT,
			data: data
		});
	}
};

module.exports = ProjectActions;