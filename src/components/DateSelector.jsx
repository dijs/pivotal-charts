'use strict';

/* jshint node:true */

var React = require('react');

module.exports = React.createClass({
	render: function() {
		return (
			<div className='form-group'>
                    		<label className='control-label'>{this.props.label}</label>
                	 	<input type='date' className='form-control' onChange={this.props.onChange} value={this.props.value} />
                    	</div>
	        );
	}
});
