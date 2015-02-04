var React = require('react');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			projects: []
		};
	},
	componentDidMount: function() {
		$.get('/projects', function(projects) {
			this.setState({
				projects: projects
			});
			this.props.update({
				project: projects[0].id
			});
			this.props.ready();
		}.bind(this));
	},
	update: function(event) {
		this.props.update({
			project: event.target.value
		});
	},
	render: function() {
		var projects = this.state.projects.map(function(project){
			return	<option value={project.id}>{project.name}</option>;
          	});
		return (
			<div className='form-group'>
				<label htmlFor='projects' className='control-label'>Project</label>
                    		<select className='form-control' onChange={this.update}>
                    			{projects}
                    		</select>
			</div>
		);
	}
});