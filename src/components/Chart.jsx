'use strict';

/* jshint node:true */

var React = require('react');

var ProjectStore = require('../stores/ProjectStore');
var DateRangeStore = require('../stores/DateRangeStore');
var LabelStore = require('../stores/LabelStore');
var StoryTypeStore = require('../stores/StoryTypeStore');

var chart;
var history;

module.exports = React.createClass({
	getInitialState: function() {
		return {
			loading: false
		};
	},
	update: function() {
		if (chart) {
			this.updateChartData();
		} else {
			nv.addGraph(function() {
				this.createChart();
				this.updateChartData();
			}.bind(this));
		}
	},
	getStoriesFromClickEvent: function(event) {
		var box = $('.nv-areaWrap').get(0).getBoundingClientRect();
		var index = Math.floor((event.pos[0] - box.left) / box.width * history[0].states.length);
		return history.filter(function(story) {
			return story.states[index] === event.series;
		}).map(function(story) {
			return story.id;
		}).join(',');
	},
	addChartEvents: function() {
		chart.legend.dispatch.on('legendClick', null);
		chart.legend.dispatch.on('legendDblclick', null);
		chart.legend.dispatch.on('stateChange', null);
		chart.stacked.dispatch.on('areaClick.toggle', null);
		chart.stacked.dispatch.on('areaClick', function(event) {
			this.props.handleAreaClick(this.getStoriesFromClickEvent(event));
		}.bind(this));
		if (chart.update) {
			var originalUpdate = chart.update;
			chart.update = function() {
				originalUpdate();
				this.addChartEvents();
			}.bind(this);
		}
	},
	createChart: function(callback) {
		chart = nv.models.stackedAreaChart()
			.useInteractiveGuideline(true)
			.transitionDuration(500)
			.showControls(true)
			.clipEdge(true);
		chart.xAxis.tickFormat(function(d) {
			return d3.time.format('%b %d')(new Date(d));
		});
		chart.yAxis.axisLabel('Stories').tickFormat(d3.format(',f'));
		chart.margin({
			left: 100
		});
		nv.utils.windowResize(chart.update);
	},
	updateChartData: function() {
		this.setState({
			loading: true
		});
		$.get('/activity/' + ProjectStore.getSelectedProjectId() + '/' + DateRangeStore.getFrom() + '/' +
			DateRangeStore.getTo() + '/' + StoryTypeStore.getSelectedType() + '/' + LabelStore.getSelectedLabel(),
			function(res) {
				history = res.history;
				d3.select('.flow svg').datum(res.data).call(chart);
				this.addChartEvents();
				this.setState({
					loading: false
				});
			}.bind(this));
	},
	render: function() {
		return (
			<div className = 'flow with-transition'>
				{ this.state.loading ? <h6>Loading Chart...</h6> : <span/> }
				<svg></svg>
			</div>
		);
	}
});