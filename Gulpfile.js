// Dev dependencies
var gulp = require('gulp'),
	debug = require('gulp-debug'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	minifyCSS = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	webserver = require('gulp-webserver'),
	livereload = require('gulp-livereload');

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
	npm install gulp-webserver --save-dev
	npm install gulp-livereload --save-dev

	To install all of the above at one time, run the following line at the command prompt:
	npm install gulp gulp-debug gulp-util gulp-uglify gulp-sass gulp-sourcemaps gulp-minify-css gulp-autoprefixer gulp-concat gulp-webserver gulp-livereload --save-dev
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
		.pipe(debug({title: 'styles'}))
		.pipe(sourcemaps.init())
		.pipe(sass({ style: 'expanded' }))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', '> 1%'],
			cascade: false
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./src/assets/css/'))
		.pipe(isProduction ? minifyCSS() : gutil.noop() )
		.pipe(isProduction ? gulp.dest('./src/assets/css/') : gutil.noop() );
});

// JS Libs
gulp.task('jsLibs', function() {
	return gulp.src(['./src/assets/js/libs/jquery.js', './src/assets/js/libs/angular.js', './src/assets/js/libs/**/*.js', '!./src/assets/js/libs/libs.js'])
		.pipe(debug({title: 'jsLibs'}))
		.pipe(sourcemaps.init())
		.pipe(concat('libs.js'))

		//.pipe(isProduction ? uglify() : gutil.noop() )	// to unminify libs in dev, uncomment this and comment out the next line instead
		.pipe(uglify())

		.pipe(gulp.dest('./src/assets/js/libs/'));
});

// JS
gulp.task('js', function() {
	return gulp.src(['./src/assets/js/**/*.js', '!./src/assets/js/scripts.js', '!./src/assets/libs'])
		.pipe(debug({title: 'js'}))
		.pipe(sourcemaps.init())
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest('./src/assets/js/'));
});

// AngularJS
gulp.task('jsAngular', function() {
	return gulp.src(['./src/ng-app/ngStartup.js', './src/ng-app/**/*.js', '!./src/ng-app/ng-app.js'])
		.pipe(debug({title: 'jsAngular'}))
		.pipe(sourcemaps.init())
		.pipe(concat('ng-app.js'))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest('./src/ng-app/'));
});

// Build task
// use "gulp --prod" to trigger production/build mode from commandline
gulp.task('default', ['jsLibs', 'js', 'jsAngular']);