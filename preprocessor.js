'use strict';

/* jshint node:true */

var ReactTools = require('react-tools');
module.exports = {
	process: function(src) {
		return ReactTools.transform(src);
	}
};