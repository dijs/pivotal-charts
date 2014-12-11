'use strict';
/* global require, console, module, process */

var natural = require('natural');
var Pivotal = require('pivotaljs');
var moment = require('moment');
var async = require('async');
var _ = require('underscore');

var pivotal = new Pivotal(process.env.PIVOTAL_API_KEY);

function getStoryText(story) {
	return [story.story_type, story.name, story.description].join(' ');
}

function filterStoryData(story) {
	return {
		id: story.id,
		keywords: natural.PorterStemmer.tokenizeAndStem(getStoryText(story)),
		estimation: story.estimate,
		type: story.story_type,
		duration: moment(story.accepted_at).diff(story.created_at, 'days'),
		labels: story.labels.map(function(label) {
			return label.name;
		})
	};
}

function filterIterationData(iteration) {
	return {
		id: iteration.number,
		teamStrength: iteration.team_strength,
		start: +moment(iteration.start),
		finish: +moment(iteration.finish),
		stories: iteration.stories.map(filterStoryData)
	};
}

function filterEventData(event) {
	return {
		kind: event.kind,
		highlight: event.highlight,
		at: +moment(event.occurred_at)
	};
}

module.exports.getIterationData = function(project, callback) {
	var data = [];
	// Get Past
	console.log('Getting past iteration data for project %d', project);
	pivotal.getIterations(project, {
		scope: 'done'
	}, function(err, iterations, page, done) {
		iterations.forEach(function(iteration) {
			data.push(filterIterationData(iteration));
		});
		done(true);
	}, function(err) {
		if (err) {
			callback(err);
		} else {
			// Get Current
			console.log('Getting current iteration data for project %d', project);
			pivotal.getCurrentIterations(project, function(err, iterations) {
				if (err) {
					callback(err);
				} else {
					iterations.forEach(function(iteration) {
						data.push(filterIterationData(iteration));
					});
					callback(null, data);
				}
			});
		}
	});
};

module.exports.getProjects = function(callback) {
	pivotal.getProjects(function(err, projects) {
		callback(err, projects.map(function(project) {
			return {
				id: project.id,
				name: project.name
			};
		}));
	});
};

module.exports.getActivity = function(project, iterationId, callback) {
	var iterations = require('./data/' + project + '/iterations.json');
	var iteration = _.findWhere(iterations, {
		id: iterationId
	});
	async.map(iteration.stories, function(story, next) {
		pivotal.getStoryActivity(project, story.id, function(err, activity) {
			try {
				story.activity = activity.map(filterEventData);
			} catch (e) {
				console.log(activity);
			}
			next(err, story);
		});
	}, function(err, stories) {
		callback(err, {
			start: +moment(iteration.start),
			finish: +moment(iteration.finish),
			stories: stories
		});
	});
};