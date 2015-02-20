'use strict';
/* global require, module, process */

var Pivotal = require('pivotaljs');
var moment = require('moment');
var _ = require('underscore');
var async = require('async');
 
var pivotal = new Pivotal(process.env.PIVOTAL_API_KEY);

var numberOfNoiseReductionDays = 7;

var isStoryStateUpdateEvent = function(event) {
	return event.kind === 'story_update_activity' &&
		event.highlight !== 'edited' &&
		event.highlight !== 'planned' &&
		event.highlight !== 'estimated' &&
		event.highlight !== 'added label' &&
		event.highlight !== 'added and removed labels:';
};

var millisInDay = 1000 * 60 * 60 * 24;

var normalizeEvent = function(event) {
	var change = event.changes[0];
	return {
		id: change.id,
		before: change.original_values ? change.original_values.current_state : event.highlight,
		after: change.new_values ? change.new_values.current_state : event.highlight,
		at: +moment(event.occurred_at),
		type: change.story_type
	};
};

function getStateForDay(events, day) {
	var closest = _.min(events, function(event) {
		return Math.abs(event.at - day);
	});
	if (moment(day).isAfter(closest.at)) {
		return closest.after;
	} else {
		return closest.before;
	}
}

_.mixin({
	findWhereOrCreate: function(list, properties, data) {
		var temp = _.findWhere(list, properties);
		if (temp === undefined) {
			temp = data;
			list.push(temp);
		}
		return temp;
	}
});

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

module.exports.getLabels = function(projectId, callback) {
	pivotal.getLabels(projectId, function(err, labels) {
		if (err) {
			callback(err);
		} else {
			callback(null, labels.map(function(label) {
				return {
					name: label.name,
					id: label.id
				};
			}));
		}
	});
};

var fetchStories = function(projectId, storyIds, label, callback) {
	var results = [];
	pivotal.getStories(projectId, {
		filter: 'id:' + storyIds + (label === 'any' ? '' : ' label:"' + label + '"')
	}, function(err, stories, page, next) {
		results = results.concat(stories.map(function(story) {
			return _.pick(story, 'id', 'name', 'url', 'labels');
		}));
		next(true);
	}, function(err) {
		callback(err, results);
	});
};

module.exports.getStories = fetchStories;

module.exports.getCurrentSprintRange = function(project, callback) {
	pivotal.getCurrentIterations(project, function(err, iterations) {
		if (iterations && iterations.length > 0) {
			callback(null, {
				from: moment(iterations[0].start).format('YYYY-MM-DD'),
				to: moment(iterations[0].finish).format('YYYY-MM-DD')
			});
		} else {
			callback(err || new Error('Current sprint doesnt exist'));
		}
	});
};

module.exports.getActivity = function(projectId, dateRangeFrom, dateRangeTo, type, label, callback) {

	var beforeDateRangeFrom = dateRangeFrom - millisInDay * numberOfNoiseReductionDays;
	var range = _.range(beforeDateRangeFrom, dateRangeTo, millisInDay);
	var data = [];
	var sortedStates = ['accepted', 'delivered', 'finished', 'rejected', 'started',
		'unstarted', 'planned', 'unscheduled', 'unestimated'
	];

	var byType = (function() {
		return function(event) {
			return type === 'all' ? true : event.type === type;
		};
	})();

	function getStoryStates(events, id) {
		return {
			id: id,
			states: range.map(function(day) {
				return getStateForDay(events, day);
			})
		};
	}

	function addStoryData(story) {
		story.states.forEach(function(state, index) {
			_.findWhereOrCreate(data, {
				key: state
			}, {
				key: state,
				values: range.map(function(day) {
					return {
						x: day,
						y: 0
					};
				})
			}).values[index].y++;
		});
	}

	function buildSortedData(data) {
		var results = [];
		sortedStates.forEach(function(state) {
			var result = _.findWhere(data, {
				key: state
			});
			if (result) {
				result.values = result.values.slice(numberOfNoiseReductionDays);
				results.push(result);
			}
		});
		return results;
	}

	function getActivity(cb) {
		var results = [];
		pivotal.getActivity(projectId, {
			occurred_before: dateRangeTo,
			occurred_after: beforeDateRangeFrom
		}, function(err, events, page, done) {
			results = results.concat(events);
			done(true);
		}, function(err) {
			cb(err, results);
		});
	}

	function processActivity(events, cb) {
		var eventsByStory = _.chain(events)
			.filter(isStoryStateUpdateEvent)
			.map(normalizeEvent)
			.filter(byType)
			.groupBy('id')
			.value();
		cb(null, eventsByStory);
	}

	function getStories(eventsByStory, cb) {
		if (label === 'any') {
			cb(null, eventsByStory, []);
		} else {
			fetchStories(projectId, _.keys(eventsByStory).join(','), label, function(err, stories) {
				cb(err, eventsByStory, stories);
			});
		}
	}

	function filterByLabel(eventsByStory, stories, cb) {
		var filtered = label === 'any' ? eventsByStory : _.pick(eventsByStory, function(events, storyId) {
			return _.any(stories, function(story) {
				return (story.id + '') === storyId;
			});
		});
		cb(null, filtered);
	}

	function processEvents(eventsByStory, callback) {
		var history = _
			.chain(eventsByStory)
			.map(getStoryStates)
			.value();
		history.forEach(addStoryData);
		callback(null, buildSortedData(data), history);
	}

	async.waterfall([
		getActivity,
		processActivity,
		getStories,
		filterByLabel,
		processEvents
	], callback);

};