'use strict';

/* jshint node:true */

var React = require('react');

var StoryTypeStore = require('../stores/StoryTypeStore');
var StoryTypeActions = require('../actions/StoryTypeActions');

function getState() {
	return {
		types: StoryTypeStore.getTypes()
	};
}

module.exports = React.createClass({
	getInitialState: function() {
		return getState();
	},
	componentDidMount: function() {
		StoryTypeStore.addChangeListener(this._onChange);
	},
	componentWillUnmount: function() {
		StoryTypeStore.removeChangeListener(this._onChange);
	},
	_onChange: function() {
		this.setState(getState());
	},
	_onSelectType: function(event) {
		StoryTypeActions.selectType(event.target.value);
	},
	render: function() {
		var types = this.state.types.map(function(type){
			return	<option value={type}>{_.capitalize(type)}</option>;
          	});
		return (
			<div className='form-group'>
				<label htmlFor='projects' className='control-label'>Story Type</label>
                    		<select className='form-control' onChange={this._onSelectType}>
                    			{types}
                    		</select>
			</div>
		);
	}
});