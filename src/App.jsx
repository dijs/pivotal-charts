// Figure out how to not filter types upon click...
 
var React = require('react');

var ProjectFilter = require('./ProjectFilter.jsx');
var Chart = require('./Chart.jsx');
var StoryTypeFilter = require('./StoryTypeFilter.jsx');
var LabelFilter = require('./LabelFilter.jsx');
var DateSelector = require('./DateSelector.jsx');
var StoriesModal = require('./StoriesModal.jsx');

var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');
var Button = require('react-bootstrap/Button');

var App = React.createClass({
	getInitialState: function() {
		return {
			project: null,
			type: 'all',
			to: null,
			from: null,
			following: false,
			followInterval: null,
			loading: false,
			label: 'any'
		};
	},
	updateChart: function() {
		this.refs.chart.update(this.state);
	},
	updateState: function(data) {
		this.setState(data);
	},
	toggleFollow: function() {
		if (this.state.following) {
			clearInterval(this.state.followInterval);
			this.setState({
				following: false
			});
		} else {
			this.updateDataRangeForCurrentSprint(function() {
				this.updateChart();
				this.setState({
					followInterval: setInterval(this.updateChart, 1000 * 60 * 60)
				});
			}.bind(this));
			this.setState({
				following: true
			});
		}
	},
	projectFilterReady: function() {
		this.refs.labels.load(this.state.project);
		this.updateDataRangeForCurrentSprint(function() {
			this.updateChart(); 
		}.bind(this));
	},
	updateDataRangeForCurrentSprint: function(callback) {
		this.setState({
			loading: true
		});
		$.get('/current-sprint/' + this.state.project, function(res) {
			this.setState({
				from: res.range.from,
				to: res.range.to,
				loading: false
			});
			this.refs.from.setState({
				value: this.state.from
			});
			this.refs.to.setState({
				value: this.state.to
			});
			callback();
		}.bind(this));
	},
	chartAreaClickHandler: function(stories) {
		this.refs.storiesModal.load(this.state.project, stories);
	},
	render: function() {
		return (
			<div>
				<div className='container'>
					<Row>
			            		<Col md={4}>
			            			<ProjectFilter update={this.updateState} ready={this.projectFilterReady} />
			            		</Col>
			            		<Col md={4}>
			            			<DateSelector label='From' name='from' ref='from' update={this.updateState} />
			            		</Col>
			            		<Col md={4}>
			            			<DateSelector label='To' name='to' ref='to' update={this.updateState} />
			            		</Col>		            		
			        	</Row>
		            		<Row>
			            		<Col md={4}>
			            			<StoryTypeFilter update={this.updateState} />
			            		</Col>
			            		<Col md={4}>
			            			<LabelFilter ref='labels' update={this.updateState} />
				              </Col>
			            		<Col md={4}>
				              	<div className='form-group'>
				                    		<Button bsStyle='primary' className='form-control' onClick={this.updateChart}>Load</Button>
				                	</div>
				            	</Col>
			        	</Row>
			        	<Row>
			            		<Col md={4}>
			            			<div className='checkbox'>
					                    <label>
					                        <input type='checkbox' onChange={this.toggleFollow} /> Follow current sprint
					                    </label>
					     		</div>
			            		</Col>
			        	</Row>
			        	{ this.state.loading ? <h6>Loading current sprint...</h6> : <span /> }
			        	<Chart ref='chart' handleAreaClick={this.chartAreaClickHandler} />
			 	</div>	
		        	<StoriesModal ref='storiesModal' />
	        	</div>        	
	        );
	}
});

React.render(<App />, document.body);