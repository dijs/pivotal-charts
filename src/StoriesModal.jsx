var React = require('react');

var Modal = require('react-bootstrap/Modal');
var Button = require('react-bootstrap/Button');
var OverlayMixin = require('react-bootstrap/OverlayMixin');

module.exports = React.createClass({
	mixins: [OverlayMixin],

	getInitialState: function() {
		return {
			isModalOpen: false,
			loading: false,
			stories: []
		};
	},

	handleToggle: function() {
		this.setState({
			isModalOpen: !this.state.isModalOpen
		});
	},

	load: function(project, stories) {
		this.setState({
			loading: true
		});
		this.handleToggle();
		$.get('/stories/' + project + '/' + stories, function(res) {
			this.setState({
				loading: false,
				stories: res.stories
			});
		}.bind(this));
	},

	render: function() {
		return (
			<span />
		);
	},

	renderOverlay: function() {
		if (!this.state.isModalOpen) {
			return <span />;
		}

		var stories = this.state.stories.map(function(story){
			return (
				<a href={story.url} className='list-group-item story'>
			           <h6 className='list-group-item-heading'>{story.name}</h6>
			            <p className='list-group-item-text'>
			                {
		                		story.labels.map(function(label){
		                			return  <span className='label label-default'>{label.name}</span>
		                		})
	                		  }
			            </p>
			        </a>
			);
		});

		var body = this.state.loading ? <h6>Loading stories...</h6> : <div className='list-group'>{stories}</div>;

		return (
			<Modal title='Stories' onRequestHide={this.handleToggle}>
				<div className='modal-body'>{body}</div>
			</Modal>
  		);
  	}
});
