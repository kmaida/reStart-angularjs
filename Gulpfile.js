// Dev dependencies
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	minifyCSS = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat');

/*
	Install required Gulp Plugins:

	The "--save-dev" flag will automatically add it to your package.json.  If the files
	already exist there, you don't need that flag, and can just run "npm install"

	To install the above plugins at the command prompt:

	npm install gulp --save-dev
	npm install gulp-util --save-dev
	npm install gulp-uglify --save-dev
	npm install gulp-sass --save-dev
	npm install gulp-sourcemaps --save-dev
	npm install gulp-minify-css --save-dev
	npm install gulp-autoprefixer --save-dev
	npm install gulp-concat --save-dev
	npm install gulp-watch --save-dev

	To install all of the above at one time, run the following line at the command prompt:
	npm install gulp gulp-util gulp-uglify gulp-sass gulp-sourcemaps gulp-minify-css gulp-autoprefixer gulp-concat --save-dev
 */

// Use "gulp --prod" to trigger production/build mode from commandline
var isProduction = false;

if (gutil.env.prod) {
	isProduction = true;
}

// Standard error handler
function errorHandler(err){
	gutil.beep();
	gutil.log(gutil.colors.red('Error: '), err.message);
}

// Compile SCSS
gulp.task('styles', function() {
	return gulp.src('./src/assets/css/scss/styles.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({ style: 'expanded' }))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', '> 1%'],
			cascade: false
		}))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? minifyCSS() : gutil.noop() )
		.pipe(gulp.dest('./src/assets/css/'));
});

// JS Libs
gulp.task('jsLibs', function() {
	return gulp.src(['./src/assets/js/libs/jquery.js', './src/assets/js/libs/angular.js', './src/assets/js/libs/**/*.js', '!./src/assets/js/libs/modernizr.min.js', '!./src/assets/js/libs/libs.js'])
		.pipe(concat('libs.js'))
		//.pipe(isProduction ? uglify() : gutil.noop() )	// to unminify libs in dev, uncomment this and comment out the next line instead
		.pipe(uglify())
		.pipe(gulp.dest('./src/assets/js/libs/'));
});

// JS
gulp.task('js', function() {
	return gulp.src(['./src/assets/js/**/*.js', '!./src/assets/js/scripts.js', '!./src/assets/js/libs/*'])
		.pipe(sourcemaps.init())
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest('./src/assets/js/'));
});

// AngularJS
gulp.task('jsAngular', function() {
	return gulp.src(['./src/ng-app/ngStartup.js', './src/ng-app/**/*.js', '!./src/ng-app/ng-app.js'])
		.pipe(sourcemaps.init())
		.pipe(concat('ng-app.js'))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest('./src/ng-app/'));
});

// default build task
// use "gulp --prod" to trigger production/build mode from commandline
gulp.task('default', ['styles', 'jsLibs', 'js', 'jsAngular'], function() {
	if (!isProduction) {
		gulp.watch('./src/assets/css/scss/**/*.scss', ['styles']);
		gulp.watch('./src/assets/js/libs/**/*.js', ['jsLibs']);
		gulp.watch(['./src/assets/js/**/*.js', '!./src/assets/js/scripts.js', '!./src/assets/js/libs/*'], ['js']);
		gulp.watch(['./src/ng-app/**/*.js', '!./src/ng-app/ng-app.js'], ['jsAngular']);
	}
});