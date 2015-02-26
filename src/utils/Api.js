'use strict';

/* jshint node:true */

var $ = require('jquery');

var ProjectActions = require('../actions/ProjectActions');
var DateRangeActions = require('../actions/DateRangeActions');
var LabelActions = require('../actions/LabelActions');

module.exports = {
	getProjectData: function() {
		$.get('/projects', ProjectActions.loadProjects);
	},
	getCurrentSprint: function(projectId) {
		$.get('/current-sprint/' + projectId, DateRangeActions.loadCurrentSprint);
	},
	getLabels: function(projectId) {
		$.get('/labels/' + projectId, LabelActions.loadLabels);
	}
};