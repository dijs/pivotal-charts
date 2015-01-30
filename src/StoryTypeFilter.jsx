var React = require('react');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			types: ['all', 'bug', 'chore', 'feature', 'release']
		};
	},
	update: function(event) {
		this.props.update({
			type: event.target.value
		});
	},
	render: function() {
		var types = this.state.types.map(function(type){
			return	<option value={type}>{_.capitalize(type)}</option>;
          	});
		return (
			<div className='form-group'>
				<label htmlFor='projects' className='control-label'>Story Type</label>
                    		<select className='form-control' onChange={this.update}>
                    			{types}
                    		</select>
			</div>
		);
	}
});