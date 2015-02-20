'use strict';

/* jshint node:true */

var React = require('react');
var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');
var DateSelector = require('./DateSelector.jsx');
var DateRangeStore = require('../stores/DateRangeStore');
var DateRangeActions = require('../actions/DateRangeActions');

function getState() {
	return {
		from: DateRangeStore.getFrom(),
		to: DateRangeStore.getTo()
	};
}

module.exports = React.createClass({
	getInitialState: function() {
		return getState();
	},
	componentDidMount: function() {
		DateRangeStore.addChangeListener(this._onChange);
	},
	componentWillUnmount: function() {
		DateRangeStore.removeChangeListener(this._onChange);
	},
	_onChange: function() {
		this.setState(getState());
	},
	_updateFrom: function(event) {
		DateRangeActions.updateFrom(event.target.value);
	},
	_updateTo: function(event) {
		DateRangeActions.updateTo(event.target.value);
	},
	render: function() {
		return (
			<Row>
	     			<Col md={6}>
					<DateSelector label='From' value={this.state.from} onChange={this._updateFrom} />
	     			</Col>
	     			<Col md={6}>
					<DateSelector label='To' value={this.state.to} onChange={this._updateTo} />
	     			</Col>
	     		</Row>
		);
	}
});