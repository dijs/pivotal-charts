'use strict';
/* global require, console, module, process */

var natural = require('natural');
var Pivotal = require('pivotaljs');
var moment = require('moment');
var async = require('async');
var _ = require('underscore');

var pivotal = new Pivotal(process.env.PIVOTAL_API_KEY);

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
		before: change.original_values.current_state || event.highlight,
		after: change.new_values.current_state || event.highlight,
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

module.exports.getActivity = function(projectId, dateRangeFrom, dateRangeTo, type, callback) {
	var allEvents = [];
	var range = _.range(dateRangeFrom, dateRangeTo, millisInDay);
	var data = [];
	var sortedStates = ['accepted', 'delivered', 'finished', 'rejected', 'started',
		'unstarted', 'planned', 'unscheduled', 'unestimated'
	];

	var byType = (function() {
		return function(event) {
			return type === 'all' ? true : event.type === type;
		};
	})();

	function getStoryStates(events) {
		return range.map(function(day) {
			return getStateForDay(events, day);
		});
	}

	function addStoryData(states) {
		states.forEach(function(state, index) {
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
				results.push(result);
			}
		});
		return results;
	}

	pivotal.getActivity(projectId, {
		occurred_before: dateRangeTo,
		occurred_after: dateRangeFrom
	}, function(err, events, page, done) {
		allEvents = allEvents.concat(events);
		done(true);
	}, function(err) {
		_.chain(allEvents)
			.filter(isStoryStateUpdateEvent)
			.map(normalizeEvent)
			.filter(byType)
			.groupBy('id')
			.map(getStoryStates)
			.each(addStoryData);
		callback(err, buildSortedData(data));
	});
};