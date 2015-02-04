var React = require('react');

var chart;
var history;

module.exports = React.createClass({
	getInitialState: function() {
		return {
			loading: false
		};
	},
	update: function(options) {
		if (chart) {
			this.updateChartData(options);
		} else {
			nv.addGraph(function() {
				this.createChart();
				this.updateChartData(options);
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
	updateChartData: function(options) {
		this.setState({
			loading: true
		});
		$.get('/activity/' + options.project + '/' + options.from + '/' + options.to + '/' + options.type + '/' + options.label, function(res) {
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