'use strict';

/* global require, console, __dirname */

var express = require('express');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var fetch = require('./fetch');

var app = express();

app.set('port', 30473);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/projects', function(req, res) {
	fetch.getProjects(function(err, projects) {
		res.json(projects);
	});
});

app.get('/iterations/:project', function(req, res) {
	var file = path.join(__dirname, 'data', req.params.project, 'iterations.json');
	fs.exists(file, function(exists) {
		res.setHeader('Content-Type', 'application/json');
		if (exists) {
			fs.createReadStream(file).pipe(res);
		} else {
			fetch.getIterationData(req.params.project, function(err, iterations) {
				mkdirp(path.dirname(file), function() {
					fs.writeFile(file, JSON.stringify(iterations), function() {
						fs.createReadStream(file).pipe(res);
					});
				});
			});
		}
	});
});

app.post('/iterations/reset/:project', function(req, res) {
	var file = path.join(__dirname, 'data', req.params.project, 'iterations.json');
	fs.unlink(file, function(err) {
		res.json({
			error: err
		});
	});
});

app.post('/iteration/reset/:project/:id', function(req, res) {
	var file = path.join(__dirname, 'data', req.params.project, req.params.id + '.json');
	fs.unlink(file, function(err) {
		res.json({
			error: err
		});
	});
});

app.get('/activity/:project/:iteration', function(req, res) {
	var file = path.join(__dirname, 'data', req.params.project, req.params.iteration + '.json');
	fs.exists(file, function(exists) {
		res.setHeader('Content-Type', 'application/json');
		if (exists) {
			fs.createReadStream(file).pipe(res);
		} else {
			fetch.getActivity(req.params.project, parseInt(req.params.iteration), function(err, iteration) {
				mkdirp(path.dirname(file), function() {
					fs.writeFile(file, JSON.stringify(iteration), function() {
						fs.createReadStream(file).pipe(res);
					});
				});
			});
		}
	});
});

app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});