// Dev dependencies
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-ruby-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	watch = require('gulp-watch');

/*
 Install required Gulp Plugins:

 The "--save-dev" flag will automatically add it to your package.json.  If the files
 already exist there, you don't need that flag, and can just run "npm install"

 To install the above plugins at the command prompt:

 npm install gulp --save-dev
 npm install gulp-util --save-dev
 npm install gulp-uglify --save-dev
 npm install gulp-ruby-sass --save-dev
 npm install gulp-autoprefixer --save-dev
 npm install gulp-concat --save-dev
 npm install gulp-watch --save-dev

 To install all of the above at one time, run the following line at the command prompt:
 npm install gulp gulp-util gulp-ruby-sass gulp-autoprefixer gulp-concat gulp-uglify gulp-watch --save-dev
 */

// Use "gulp --prod" to trigger production/build mode from commandline
var isProduction = false;

if (gutil.env.prod) {
	isProduction = true;
}

// standard error handler
function errorHandler(err){
	gutil.beep();
	gutil.log(gutil.colors.red('Error: '), err.message);
}

// Compile SASS
gulp.task('styles', function() {
	var sassSrc = './src/assets/css/scss/styles.scss';

	return gulp.src(sassSrc)
		.pipe(isProduction ? gutil.noop : watch('./src/assets/css/scss/**/*.scss'))
		.pipe(isProduction ? sass(sassSrc, { style: 'compressed' }) : sass(sassSrc, { style: 'expanded' })).on('error', errorHandler)
		.pipe(autoprefixer({
			browsers: ['last 2 versions', '> 1%'],
			cascade: false
		})).on('error', errorHandler)
		.pipe(gulp.dest('./src/css/'));
});

// JS Libs
gulp.task('jsLibs', function() {
	return gulp.src(['./src/assets/js/libs/modernizr.js', './src/assets/js/libs/**/*.js', '!./src/assets/js/libs/libs.js'])
		.pipe(isProduction ? gutil.noop : watch('./src/assets/js/libs/**/*.js'))
		.pipe(concat('libs.js')).on('error', errorHandler)
		.pipe(isProduction ? gutil.noop : uglify() ).on('error', errorHandler)
		.pipe(gulp.dest('./src/js/libs/'));
});

// JS
gulp.task('js', function() {
	return gulp.src(['./src/assets/js/**/*.js', '!./src/assets/js/scripts.js', '!./src/assets/libs'])
		.pipe(isProduction ? gutil.noop : watch(['./src/assets/js/**/*.js', '!./src/assets/js/scripts.js', '!./src/assets/libs']))
		.pipe(concat('scripts.js')).on('error', errorHandler) // http://stackoverflow.com/questions/21961142/gulp-concat-scripts-in-order
		.pipe(isProduction ? gutil.noop : uglify() ).on('error', errorHandler)
		.pipe(gulp.dest('./src/js/'));
});

// AngularJS
gulp.task('jsAngular', function() {
	return gulp.src(['./src/ng-app/ngStartup.js', './src/ng-app/**/*.js', '!./src/ng-app/ng-app.js'])
		.pipe(isProduction ? gutil.noop : watch(['./src/assets/js/**/*.js', '!./src/assets/js/scripts.js', '!./src/assets/libs']))
		.pipe(concat('ng-app.js')).on('error', errorHandler)
		.pipe(isProduction ? gutil.noop : uglify() ).on('error', errorHandler)
		.pipe(gulp.dest('./src/ng-app/'));
});

// Build task
// use "gulp --prod" to trigger production/build mode from commandline
gulp.task('default', ['styles', 'jsLibs', 'js', 'jsAngular']);