'use strict';

/* jshint node:true */

var React = require('react');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			active: false,
			seconds: 60,
			intervalId: null
		};
	},
	_toggleActive: function() {
		if (this.state.active) {
			clearInterval(this.state.intervalId);
			this.setState({
				active: false
			});
		} else {
			this.setState({
				intervalId: setInterval(this.props.action, 1000 * this.state.seconds),
				active: true
			});
			this.props.action();
		}
	},
	_onUpdateTime: function(event) {
		var seconds = parseInt(event.target.value, 10);
		if (!isNaN(seconds)) {
			this.setState({
				seconds: seconds
			});
		}
	},
	render: function() {
		return (
			<form className='form-inline'>
				<div className='checkbox'>
		                    <label>
		                        <input type='checkbox' onChange={this._toggleActive} /> Refresh chart every 
		                    </label>
		              </div>
		              <div className='form-group'>
      					&nbsp; <input type='text' defaultValue='60' onChange={this._onUpdateTime} className='refresh-time' /> seconds.
		     		</div>
	     		</form>
	     	);
	}
});