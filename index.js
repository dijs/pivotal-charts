'use strict';

/* global require, console, __dirname */

var express = require('express');
var path = require('path');
var fetch = require('./fetch');
var moment = require('moment');

var app = express();

app.set('port', 30473);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.get('/projects', function(req, res) {
	fetch.getProjects(function(err, projects) {
		res.json(projects);
	});
});

app.get('/labels/:project', function(req, res) {
	fetch.getLabels(req.params.project, function(err, labels) {
		res.json({
			labels: labels
		});
	});
});

app.get('/activity/:project/:from/:to/:type/:label', function(req, res) {
	fetch.getActivity(
		req.params.project, 
		+moment(req.params.from), 
		+moment(req.params.to), 
		req.params.type, 
		req.params.label,
		function(err, data, history) {
			res.json({
				err: err,
				data: data,
				history: history
			});
		}
	);
});

app.get('/stories/:project/:ids', function(req, res){
	fetch.getStories(req.params.project, req.params.ids, 'any', function(err, stories){
		res.json({
			err: err,
			stories: stories
		});
	});
});

app.get('/current-sprint/:project', function(req, res) {
	fetch.getCurrentSprintRange(req.params.project, function(err, range) {
		res.json({
			err: err,
			range: range
		});
	});
});

app.listen(app.get('port'), function() {
	console.log('Server is running on http://localhost:' + app.get('port'));
});