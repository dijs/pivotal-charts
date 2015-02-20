'use strict';

/* jshint node:true */

var React = require('react');

var LabelStore = require('../stores/LabelStore');
var LabelActions = require('../actions/LabelActions');

function getState() {
	return {
		labels: LabelStore.getLabels()
	};
}

module.exports = React.createClass({
	getInitialState: function() {
		return getState();
	},
	componentDidMount: function() {
		LabelStore.addChangeListener(this._onChange);
	},
	componentWillUnmount: function() {
		LabelStore.removeChangeListener(this._onChange);
	},
	_onChange: function() {
		this.setState(getState());
	},
	_onSelectLabel: function(event) {
		LabelActions.selectLabel(event.target.value);
	},
	render: function() {
		var labels = this.state.labels.map(function(label){
			return	<option value={label.name}>{label.name}</option>;
          	});
		return (
			<div className='form-group'>
				<label className='control-label'>Label</label>
                    		<select className='form-control' onChange={this._onSelectLabel}>
                    			<option value='any'>Any</option>
                    			{labels}
                    		</select>
			</div>
		);
	}
});