var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');

gulp.task('compile', function() {
	var bundle = browserify({
			entries: './src/App.jsx',
			debug: true
		})
		.transform('reactify')
		.bundle()
		.pipe(source('deps.min.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('watcher', function() {
	gulp.watch('./src/*.jsx', ['compile']);
});

gulp.task('default', ['compile', 'watcher']);