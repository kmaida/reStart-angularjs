/**
 * Dev dependencies
 */

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	minifyCSS = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat');

/**
 * File paths
 */

var basePath = {
	src: './src',
	dest: './src'
};

var path = {
	css: {
		src: basePath.src + '/assets/css/scss/',
		dest: basePath.dest + '/assets/css/'
	},
	js: {
		src: basePath.src + '/assets/js/',
		dest: basePath.dest + '/assets/js/'
	},
	jsLibs: {
		src: basePath.src + '/assets/js/libs/',
		dest: basePath.dest + '/assets/js/libs/'
	},
	jsAngular: {
		src: basePath.src + '/ng-app/',
		dest: basePath.dest + '/ng-app/'
	}
};

/**
 * Run "gulp --prod" to trigger production/build mode
 */

var isProduction = false;

if (gutil.env.prod) {
	isProduction = true;
}

/**
 * function errorHandler(err)
 *
 * @param err
 */

function errorHandler(err){
	gutil.beep();
	gutil.log(gutil.colors.red('Error: '), err.message);
}

/**
 * function styles()
 *
 * Init sourcemaps
 * Compile Sass
 * Run autoprefixer
 * Write sourcemaps
 * Minify (if production)
 * Save
 */

function styles() {
	return gulp.src(path.css.src + 'styles.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({ style: 'expanded' })).on('error', errorHandler)
		.pipe(autoprefixer({
			browsers: ['last 2 versions', '> 1%'],
			cascade: false
		})).on('error', errorHandler)
		.pipe(sourcemaps.write())
		.pipe(isProduction ? minifyCSS() : gutil.noop() )
		.pipe(gulp.dest(path.css.dest));
}

/**
 * function js()
 *
 * Init sourcemaps
 * Concatenate JS files
 * Write sourcemaps
 * Uglify / minify (if production)
 * Save
 */

function js() {
	return gulp.src([path.js.src + '**/*.js', '!' + path.js.src + 'scripts.js', '!' + path.js.src + 'libs/*'])
		.pipe(sourcemaps.init())
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest(path.js.dest));
}

/**
 * function jsLibs()
 *
 * Concatenate JS vendor files / libraries
 * Uglify / minify
 * Save
 */

function jsLibs() {
	return gulp.src([path.jsLibs.src + 'jquery.js', path.jsLibs.src + 'angular.js', path.jsLibs.src + '**/*.js', '!' + path.jsLibs.src + 'modernizr.min.js', '!' + path.jsLibs.src + 'libs.js'])
		.pipe(concat('libs.js'))
		//.pipe(isProduction ? uglify() : gutil.noop() )	// to unminify libs in dev, uncomment this and comment out the next line instead
		.pipe(uglify())
		.pipe(gulp.dest(path.jsLibs.dest));
}

/**
 * function jsAngular()
 *
 * Init sourcemaps
 * Concatenate Angular JS files
 * Write sourcemaps
 * Uglify / minify (if production)
 * Save
 */

function jsAngular() {
	return gulp.src([path.jsAngular.src + 'ngStartup.js', path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + 'ng-app.js'])
		.pipe(sourcemaps.init())
		.pipe(concat('ng-app.js'))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest(path.jsAngular.dest));
}

/**
 * Gulp tasks
 */

gulp.task('styles', styles);
gulp.task('js', js);
gulp.task('jsLibs', jsLibs);
gulp.task('jsAngular', jsAngular);

/**
 * Default build task
 *
 * If not production, watch for file changes and execute the appropriate task
 *
 * Use "gulp --prod" to trigger production/build mode from commandline
 */

gulp.task('default', ['styles', 'jsLibs', 'js', 'jsAngular'], function() {
	if (!isProduction) {
		gulp.watch(path.css.src + '**/*.scss', ['styles']);
		gulp.watch([path.jsLibs.src + '**/*.js', '!' + path.jsLibs.src + 'libs.js'], ['jsLibs']);
		gulp.watch([path.js.src + '**/*.js', '!' + path.js.src + 'scripts.js', '!' + path.js.src + 'libs/*'], ['js']);
		gulp.watch([path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + 'ng-app.js'], ['jsAngular']);
	}
});