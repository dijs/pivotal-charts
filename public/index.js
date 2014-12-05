'use strict';

/* global $, console, _, Chartist, moment */

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

var releaseLabelFormat = /\d+\.\d+\.\d+/;

var responsiveOptions = [
	['screen and (max-width: 640px)', {
		seriesBarDistance: 5,
		axisX: {
			labelInterpolationFnc: function(value) {
				return value[0];
			}
		}
	}]
];

// TODO: Make releases it a diamond label

function getReleaseLabelFromIteration(iteration) {
	var releaseStory = _.find(iteration.stories, function(story) {
		return story.type === 'release';
	});
	var label = releaseStory ? _.find(releaseStory.labels, function(label) {
		return label.match(releaseLabelFormat);
	}) : null;
	return label ? label.match(releaseLabelFormat)[0] : moment(iteration.finish).format('MMM DD');
}

function loadIterations(iterations) {

	console.log('Loaded %d iterations', iterations.length);

	iterations = _.last(iterations, 10);

	// Get types of data
	var types = _.unique(_.flatten(iterations.map(function(iteration) {
		return _.pluck(iteration.stories, 'type');
	}))).filter(function(type) {
		return type !== 'release';
	});

	var data = {
		labels: [],
		series: []
	};

	// Initialize Data
	types.forEach(function(type) {
		data.series.push({
			name: 'Number of ' + type.capitalize() + ' Stories',
			data: iterations.map(function() {
				return 0;
			})
		});
	});

	// TODO: Make release label function 

	iterations.forEach(function(iteration, iterationIndex) {
		data.labels.push(getReleaseLabelFromIteration(iteration));
		iteration.stories.filter(function(story) {
			return story.type !== 'release';
		}).forEach(function(story) {
			data.series[types.indexOf(story.type)].data[iterationIndex] += 1;
		});
	});

	new Chartist.Bar('.story-sprint', data, {
		seriesBarDistance: 10,
		axisY: {
			offset: 80,
			labelInterpolationFnc: function(value) {
				return (value | 0) + ' Points';
			},
			scaleMinSpace: 15
		}
	}, responsiveOptions);

}

function wasDoneOn(story, day) {
	return _.any(story.activity, function(e) {
		return e.highlight === 'delivered' && moment(e.at).isBefore(day);
	});
}

function deliveredDoneness(story, day) {
	return wasDoneOn(story, day) ? 0 : story.estimation || 0;
	// last state for the given day
	// if story has ever been done ~ 50%
}

function doneness(stories, day) {
	return stories.reduce(function(sum, story) {
		return sum + deliveredDoneness(story, day);
	}, 0);
}

var allowedStates = ['accepted', 'delivered', 'finished', 'started', 'rejected', 'unstarted'];

function isAllowedEventState(e) {
	return _.contains(allowedStates, e.highlight);
}

function getLastStoryEventForDay(story, day) {
	var lastEvent = _.chain(story.activity).filter(isAllowedEventState).filter(function(e) {
		return moment(e.at).isBefore(day);
	}).sortBy(function(e){
		return e.at;
	}).last().value();

	//var lastEvent = _.last(filterActivity(story.activity).filter());
	return lastEvent ? lastEvent.highlight : 'unstarted';
}

// TODO: Optional Ideal line option
// TODO: Open Doneness function

function loadBurndownChart(iteration) {
	var data = {
		labels: [],
		series: [{
			name: 'Points',
			data: []
		}]
	};

	var lastDay = moment(iteration.finish);
	var day = moment(iteration.start);

	while (day.isBefore(lastDay)) {
		data.labels.push(day.format('MMM DD'));
		data.series[0].data.push(doneness(iteration.stories, day));
		day.add(1, 'days');
	}

	// Ideal Line
	if (false) {
		data.series.push({
			name: 'Goal',
			data: []
		});
		var total = 0;
		iteration.stories.forEach(function(story) {
			total += story.estimation || 0;
		});
		//var goalDelta = total / (lastDay.diff(day, 'days') + 1);
		//var goalCurrent = total;
		//data.series[1].data.push(goalCurrent);
		//goalCurrent -= goalDelta;

	}

	new Chartist.Line('.burndown', data, {
		seriesBarDistance: 10,
		axisY: {
			offset: 80,
			labelInterpolationFnc: function(value) {
				return (value | 0) + ' Points';
			},
			scaleMinSpace: 15
		}
	}, responsiveOptions);
}

function loadFlowChart(iteration) {

	var data = {
		labels: [],
		series: []
	};

	var stories = iteration.stories.filter(function(story) {
		return story.type !== 'release';
	});

	var data = {
		labels: [],
		series: []
	};

	var lastDay = moment(iteration.finish);
	var day = moment(iteration.start);

	// Initialize Data
	allowedStates.forEach(function(state) {
		data.series.push({
			name: 'Number of ' + state.capitalize() + ' Points',
			data: _(lastDay.diff(day, 'day')).times(function() {
				return 0;
			})
		});
	});

	var dayIndex = 0;
	while (day.isBefore(lastDay)) {
		data.labels.push(day.format('MMM DD'));
		stories.forEach(function(story) {
			var lastState = getLastStoryEventForDay(story, day);
			data.series[allowedStates.indexOf(lastState)].data[dayIndex] += story.estimation;
		});
		dayIndex++;
		day.add(1, 'days');
	}

	new Chartist.Line('.flow', data, {
		seriesBarDistance: 10,
		axisY: {
			offset: 80,
			labelInterpolationFnc: function(value) {
				return (value | 0) + ' Points';
			},
			scaleMinSpace: 15
		}
	}, responsiveOptions);
}

var easeOutQuad = function(x, t, b, c, d) {
	return -c * (t /= d) * (t - 2) + b;
};

$(document).ready(function() {

	// Load projects

	$.getJSON('/projects', function(projects) {
		projects.forEach(function(project) {
			$('#projects').append('<option value="' + project.id + '">' + project.name + '</option>');
		});
	});

	$('#load').click(function() {
		$.getJSON('/iterations/' + $('#projects').val(), function(iterations) {
			loadIterations(iterations);
			$('#iterations').empty();
			iterations.forEach(function(iteration) {
				$('#iterations').prepend('<option value="' + iteration.id + '">' + getReleaseLabelFromIteration(iteration) + '</option>');
			});
		});
	});

	$('#loadBurndown').click(function() {
		$.getJSON('/activity/' + $('#projects').val() + '/' + $('#iterations').val(), function(iteration) {
			loadBurndownChart(iteration);
			loadFlowChart(iteration);
		});
	});

	// Animations

	var $chart = $('.ct-chart');

	$chart.each(function() {
		$(this).append('<div class="tooltip"></div>')
			.find('.tooltip')
			.hide();
	});

	$chart.on('mouseenter', '.ct-bar, .ct-point', function() {
		var $point = $(this),
			value = $point.attr('ct:value'),
			seriesName = $point.parent().attr('ct:series-name');
		$point.animate({
			'stroke-width': '50px'
		}, 300, easeOutQuad);
		$point.parent().parent().prev().html(seriesName + '<br>' + value).show();
	});

	$chart.on('mouseleave', '.ct-bar, .ct-point', function() {
		var $point = $(this);
		$point.animate({
			'stroke-width': '20px'
		}, 300, easeOutQuad);
		$point.parent().parent().prev().hide();
	});

	$chart.on('mousemove', function(event) {
		var $toolTip = $(this).find('.tooltip');
		$toolTip.css({
			left: (event.offsetX || event.originalEvent.layerX) - $toolTip.width() / 2 - 10,
			top: (event.offsetY || event.originalEvent.layerY) - $toolTip.height() - 40
		});
	});

});