var React = require('react');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			labels: []
		};
	},
	load: function(project) {
		$.get('/labels/' + project, function(res) {
			this.setState({
				labels: res.labels
			});
		}.bind(this));
	},
	update: function(event) {
		this.props.update({
			label: event.target.value
		});
	},
	render: function() {
		var labels = this.state.labels.map(function(label){
			return	<option value={label.name}>{_.capitalize(label.name)}</option>;
          	});
		return (
			<div className='form-group'>
				<label className='control-label'>Label</label>
                    		<select className='form-control' onChange={this.update}>
                    			<option value='any'>Any</option>
                    			{labels}
                    		</select>
			</div>
		);
	}
});