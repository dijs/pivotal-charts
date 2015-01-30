var React = require('react');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			value: null
		};
	},
	update: function(event) {
		var data = {};
		data[this.props.name] = event.target.value;
		this.props.update(data);
	},
	render: function() {
		return (
			<div className='form-group'>
                    		<label className='control-label'>{this.props.label}</label>
                	 	<input type='date' className='form-control' onChange={this.update} value={this.state.value} />
                    	</div>
	        );
	}
});
