// Dev dependencies
var pkg = require('./package.json'),
	gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	watch = require('gulp-watch');

var isProduction = false;
var sourceMap = true;

// use "gulp --prod" to trigger production/build mode from commandline
if (gutil.env.prod) {
	isProduction = true;
	sourceMap = false;
}

// Compile SASS
gulp.task('styles', function() {
	gulp
		.src('./src/css/scss/style.scss')
		.pipe(isProduction ? sass({
			style: 'compressed'
		}) : sass({
			style: 'expanded',
			lineNumbers: true
		}))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', '> 1%'],
			cascade: false
		}))
		.on('error', function(err) { console.log(err.message); })
		.pipe(gulp.dest('./src/css/'))
});

// JS
gulp.task('js', function() {
	gulp
		.src(['./src/assets/js/*.js', '!./src/assets/js/pkg.name.js'])
			.pipe(isProduction ? gutil.noop : uglify() )
			.pipe(concat('scripts.js')) // http://stackoverflow.com/questions/21961142/gulp-concat-scripts-in-order
			.pipe(gulp.dest('./src/js/'))

		.src(['./src/assets/js/libs/modernizr.js'])
			.pipe(isProduction ? gutil.noop : uglify() )
			.pipe(gulp.dest('./src/js/libs/'))

		.src(['./src/ng-app/ngStartup.js', './src/ng-app/**/*.js', '!./src/ng-app/ng-app.js'])
			.pipe(isProduction ? gutil.noop : uglify() )
			.pipe(concat('ng-app.js'))
});

// Watch
gulp.task('watch', function() {
	watch('./src/css/scss/**/*.scss', function(files, cb) {
		gulp
			.start('styles', cb);
	});
});

// Build task
// use "gulp --prod" to trigger production/build mode from commandline
gulp.task('default', ['styles', 'js', 'watch']);