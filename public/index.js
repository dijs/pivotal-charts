'use strict';

/* global $, nv, d3, Spinner, Handlebars */

$(document).ready(function() {
	var history;

	var source = $('#story-template').html();
	var storyTemplate = Handlebars.compile(source);

	var opts = {
		lines: 11, // The number of lines to draw
		length: 13, // The length of each line
		width: 10, // The line thickness
		radius: 44, // The radius of the inner circle
		corners: 0.6, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#000', // #rgb or #rrggbb or array of colors
		speed: 0.8, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: true, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: '50%', // Top position relative to parent
		left: '50%' // Left position relative to parent
	};

	function getStoriesFromClickEvent(e) {
		var box = $('.nv-areaWrap').get(0).getBoundingClientRect();
		var index = Math.floor((e.pos[0] - box.left) / box.width * history[0].states.length);
		return history.filter(function(story) {
			return story.states[index] === e.series;
		}).map(function(story) {
			return story.id;
		});
	}

	function addChartEvents(chart) {
		chart.stacked.dispatch.on('areaClick.toggle', null);
		chart.stacked.dispatch.on('areaClick', function(e) {
			$('.processing').show();
			$.getJSON('/stories/' + $('#projects').val() + '/' + getStoriesFromClickEvent(e).join(','), function(res) {
				$('#storiesModal .list-group').empty().append(res.stories.map(storyTemplate).join(''));
				$('.processing').hide();
				$('#storiesModal').modal('show');
			});
		});
		if (chart.update) {
			var originalUpdate = chart.update;
			chart.update = function() {
				originalUpdate();
				addChartEvents(chart);
			};
		}
	}

	function loadFlowChart(data) {
		nv.addGraph(function() {
			var chart = nv.models.stackedAreaChart()
				.useInteractiveGuideline(true)
				.rightAlignYAxis(false)
				.transitionDuration(500)
				.showControls(true)
				.clipEdge(true);
			chart.xAxis.tickFormat(function(d) {
				return d3.time.format('%b %d')(new Date(d));
			});
			chart.yAxis.tickFormat(d3.format(',f'));
			d3.select('.flow svg')
				.datum(data)
				.call(chart);
			nv.utils.windowResize(chart.update);
			addChartEvents(chart);
			return chart;
		});
	}

	new Spinner(opts).spin($('.processing')[0]);

	$('.processing').show();
	$.getJSON('/projects', function(projects) {
		projects.forEach(function(project) {
			$('#projects').append('<option value="' + project.id + '">' + project.name + '</option>');
		});

		updateCurrentSprint();
	});

	function updateChart() {
		$('.processing').show();
		$.getJSON('/activity/' + $('#projects').val() + '/' + $('#from').val() + '/' + $('#to').val() + '/' + $('#type').val(), function(res) {
			loadFlowChart(res.data);
			history = res.history;
			$('.processing').hide();
		});
	}

	$('#load').click(updateChart);

	function updateCurrentSprint() {
		$.getJSON('/current-sprint/' + $('#projects').val(), function(res) {
			$('#from').val(res.range.from);
			$('#to').val(res.range.to);
			updateChart();
		});
	}

	var followInterval;

	$('#follow').change(function() {
		if ($(this).is(':checked')) {
			updateCurrentSprint();
			followInterval = setInterval(updateCurrentSprint, 1000 * 60 * 60);
		} else {
			clearInterval(followInterval);
		}
	});

});