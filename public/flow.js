'use strict';

/* global $, nv, d3, Spinner */

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
		return chart;
	});
}

$(document).ready(function() {

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

	new Spinner(opts).spin($('.processing')[0]);

	$('.processing').show();
	$.getJSON('/projects', function(projects) {
		projects.forEach(function(project) {
			$('#projects').append('<option value="' + project.id + '">' + project.name + '</option>');
		});
		$('.processing').hide();
	});

	$('#load').click(function() {
		$('.processing').show();
		$.getJSON('/activity/' + $('#projects').val() + '/' + $('#from').val() + '/' + $('#to').val(), function(res) {
			loadFlowChart(res.data);
			$('.processing').hide();
		});
	});

});