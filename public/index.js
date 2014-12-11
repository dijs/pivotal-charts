'use strict';

/* global $, console, _, moment, nv, d3 */

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

var releaseLabelFormat = /(\d+)\.(\d+)\.(\d+)/;

// TODO: Make releases it a diamond label

function getReleaseLabelFromIteration(iteration) {
	var releaseLabels = _.chain(iteration.stories).pluck('labels').flatten().filter(function(label) {
		return label.match(releaseLabelFormat);
	}).value();
	if (releaseLabels.length) {
		var mostCommonLabel = _.chain(releaseLabels).countBy().invert().max(function(label, count) {
			return count;
		}).value();
		return mostCommonLabel.match(releaseLabelFormat)[0];
	} else {
		return moment(iteration.finish).format('MMM DD');
	}
}

function loadIterations(iterations) {

	console.log('Loaded %d iterations', iterations.length);

	iterations = _.last(iterations, 10);

	// Get types of data
	var types = _.unique(_.flatten(iterations.map(function(iteration) {
		return _.pluck(iteration.stories, 'type');
	}))).filter(function(type) {
		return type !== 'release';
	}).sort();

	// Initialize Data
	var data = types.map(function(type) {
		return {
			key: type.capitalize() + ' Stories',
			values: iterations.map(function(iteration) {
				return {
					x: getReleaseLabelFromIteration(iteration),
					y: 0
				};
			})
		};
	});

	// Fill Data
	iterations.forEach(function(iteration, iterationIndex) {
		iteration.stories.filter(function(story) {
			return story.type !== 'release';
		}).forEach(function(story) {
			data[types.indexOf(story.type)].values[iterationIndex].y += 1;
		});
	});

	// Create Chart
	nv.addGraph(function() {
		var chart = nv.models.multiBarChart()
			.transitionDuration(350)
			.reduceXTicks(false)
			.rotateLabels(0)
			.showControls(true)
			.groupSpacing(0.1);
		chart.yAxis.tickFormat(d3.format(',f'));
		d3.select('.story-sprint svg')
			.datum(data)
			.call(chart);
		nv.utils.windowResize(chart.update);
		return chart;
	});

}

function wasStateBefore(story, state, day) {
	return _.any(story.activity, function(e) {
		return e.highlight === state && moment(e.at).isBefore(day);
	});
}

function deliveredDoneness(story, day) {
	var est = story.estimation || 0;
	if (wasStateBefore(story, 'accepted', day)) {
		return 0;
	} else {
		if (wasStateBefore(story, 'delivered', day)) {
			return est * 0.1;
		} else {
			if (wasStateBefore(story, 'finished', day)) {
				return est * 0.5;
			} else {
				return est;
			}
		}
	}
}

function doneness(stories, day) {
	return stories.reduce(function(sum, story) {
		return sum + deliveredDoneness(story, day);
	}, 0);
}

var allowedStates = ['unstarted', 'started', 'finished', 'rejected', 'delivered', 'accepted'].reverse();

function isAllowedEventState(e) {
	return _.contains(allowedStates, e.highlight);
}

function getLastStoryEventForDay(story, day) {
	var lastEvent = _.chain(story.activity).filter(isAllowedEventState).filter(function(e) {
		return moment(e.at).isBefore(day);
	}).sortBy(function(e) {
		return e.at;
	}).last().value();

	//var lastEvent = _.last(filterActivity(story.activity).filter());
	return lastEvent ? lastEvent.highlight : 'unstarted';
}

// TODO: Optional Ideal line option
// TODO: Open Doneness function

function loadBurndownChart(iteration) {
	var data = [{
		key: 'Points',
		values: []
	}];

	var lastDay = moment(iteration.finish);
	var day = moment(iteration.start);

	while (day.isBefore(lastDay)) {
		data[0].values.push({
			x: +day,
			y: doneness(iteration.stories, day)
		});
		day.add(1, 'days');
	}

	// Ideal Line
	if (false) {
		/*data.series.push({
			name: 'Goal',
			data: []
		});
		var total = 0;
		iteration.stories.forEach(function(story) {
			total += story.estimation || 0;
		});*/
		//var goalDelta = total / (lastDay.diff(day, 'days') + 1);
		//var goalCurrent = total;
		//data.series[1].data.push(goalCurrent);
		//goalCurrent -= goalDelta;

	}

	nv.addGraph(function() {
		var chart = nv.models.lineChart()
			.useInteractiveGuideline(true)
			.transitionDuration(350)
			.showLegend(true)
			.showYAxis(true)
			.showXAxis(true);

		chart.xAxis.axisLabel('Day').tickFormat(function(d) {
			return d3.time.format('%b %d')(new Date(d));
		});

		d3.select('.burndown svg')
			.datum(data)
			.call(chart);

		//Update the chart when window resizes.
		nv.utils.windowResize(function() {
			chart.update();
		});

		return chart;
	});

}

function dateRangeIteration(start, end, callback) {
	var day = moment(start);
	var dayIndex = 0;
	while (day.isBefore(end)) {
		callback(day, dayIndex);
		dayIndex++;
		day.add(1, 'days');
	}
}

function loadFlowChart(iteration) {

	var data = [];

	var stories = iteration.stories.filter(function(story) {
		return story.type !== 'release';
	});

	var lastDay = moment(iteration.finish);
	var day = moment(iteration.start);

	// Initialize Data
	allowedStates.forEach(function(state) {
		var d = {
			key: state.capitalize(),
			values: []
		};
		dateRangeIteration(day, lastDay, function(day) {
			d.values.push({
				x: +day,
				y: 0
			});
		});
		data.push(d);
	});

	dateRangeIteration(day, lastDay, function(day, index) {
		stories.forEach(function(story) {
			var lastStateIndex = allowedStates.indexOf(getLastStoryEventForDay(story, day));
			data[lastStateIndex].values[index].y += story.estimation;
		});
	});

	nv.addGraph(function() {
		var chart = nv.models.stackedAreaChart()
			.useInteractiveGuideline(true)
			.rightAlignYAxis(false)
			.transitionDuration(500)
			.showControls(true)
			.clipEdge(true);

		//Format x-axis labels with custom function.
		chart.xAxis.tickFormat(function(d) {
			return d3.time.format('%b %d')(new Date(d));
		});

		chart.yAxis.tickFormat(d3.format(',f'));

		d3.select('.flow svg')
			.datum(data)
			.call(chart);

		nv.utils.windowResize(chart.update);

		return chart;
	});
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

	$('#resetIterations').click(function() {
		$.post('/iterations/reset/' + $('#projects').val());
	});

	$('#resetStories').click(function() {
		$.post('/iteration/reset/' + $('#projects').val() + '/' + $('#iterations').val());
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