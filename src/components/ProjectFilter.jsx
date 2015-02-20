'use strict';

/* jshint node:true */

var React = require('react');

var ProjectStore = require('../stores/ProjectStore');
var ProjectActions = require('../actions/ProjectActions');

function getState() {
	return {
		projects: ProjectStore.getProjects()
	};
}

module.exports = React.createClass({
	getInitialState: function() {
		return getState();
	},
	componentDidMount: function() {
		ProjectStore.addChangeListener(this._onChange);
	},
	componentWillUnmount: function() {
		ProjectStore.removeChangeListener(this._onChange);
	},
	_onChange: function() {
		this.setState(getState());
	},
	_onSelectProject: function(event) {
		ProjectActions.selectProject(event.target.value);
	},
	render: function() {
		var projects = this.state.projects.map(function(project){
			return	<option value={project.id}>{project.name}</option>;
          	});
		return (
			<div className='form-group'>
				<label htmlFor='projects' className='control-label'>Project</label>
                    		<select className='form-control' onChange={this._onSelectProject}>
                    			{projects}
                    		</select>
			</div>
		);
	}
});