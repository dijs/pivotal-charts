'use strict';

/* jshint node:true */

var React = require('react');

var ProjectFilter = require('./components/ProjectFilter.jsx');
var StoryTypeFilter = require('./components/StoryTypeFilter.jsx');
var LabelFilter = require('./components/LabelFilter.jsx');
var DateRangeFilter = require('./components/DateRangeFilter.jsx');
var Chart = require('./components/Chart.jsx');
var StoriesModal = require('./components/StoriesModal.jsx');
var Refresher = require('./components/Refresher.jsx');

var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');
var Button = require('react-bootstrap/Button');

var API = require('./utils/Api');

API.getProjectData();

var App = React.createClass({
	_updateChart: function() {
		this.refs.chart.update();
	},
	_chartAreaClickHandler: function(stories) {
		this.refs.storiesModal.load(stories);
	},
	render: function() {
		return (
			<div>
				<div className='container'>
					<Row>
						<Col md={4}>
			            			<ProjectFilter />
						</Col>
						<Col md={8}>
			            			<DateRangeFilter />
			            		</Col>	            		
			        	</Row>
		            		<Row>
			            		<Col md={4}>
			            			<StoryTypeFilter />
			            		</Col>
			            		<Col md={4}>
			            			<LabelFilter />
				              </Col>
			            		<Col md={4}>
				              	<div className='form-group'>
				                    		<Button bsStyle='primary' className='form-control' onClick={this._updateChart}>Load</Button>
				                	</div>
				            	</Col>
			        	</Row>
			        	<Row>
			            		<Col md={12}>
			            			<Refresher action={this._updateChart} />
			            		</Col>
			        	</Row>
			        	<Chart ref='chart' handleAreaClick={this._chartAreaClickHandler} />
			 	</div>	
		        	<StoriesModal ref='storiesModal' />
	        	</div>        	
	        );
	}
});

React.render(<App />, document.body);