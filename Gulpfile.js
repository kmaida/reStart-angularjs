/**
 * Dev dependencies
 */

var gulp = require('gulp');
var connect = require('gulp-connect');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var jscs = require('gulp-jscs');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');

/**
 * File paths
 * Make sure to update these paths for your project!
 */

var jsAngularDir = 'reStart-app';
var jsAngularScript = jsAngularDir + '.js';
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
	jsVendor: {
		src: basePath.src + '/assets/js/vendor/',
		dest: basePath.dest + '/assets/js/vendor/'
	},
	jsAngular: {
		src: basePath.src + '/' + jsAngularDir + '/',
		dest: basePath.dest + '/' + jsAngularDir + '/'
	}
};
var jsUserSrc = [path.js.src + '**/*.js', '!' + path.js.src + 'scripts.js', path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + jsAngularScript, '!' + path.js.src + 'vendor/*'];

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
	this.emit('end');
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
 * function jsValidate()
 *
 * Lint JavaScript with ESLint
 * Style-check JavaScript with JSCS
 * Exclude vendor files
 * Print results
 */
function jsValidate() {
	if (!isProduction) {
		return gulp.src(jsUserSrc)
			.pipe(eslint({
				extends: ['eslint:recommended']
			}))
			.pipe(eslint.format())
			.pipe(eslint.results(function(results) {
				console.log('ESLint Warnings: ' + results.warningCount);
				console.log('ESLint Errors: ' + results.errorCount);
			}))
			.pipe(jscs())
			.pipe(jscs.reporter());
	}
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
	return gulp.src([path.js.src + '**/*.js', '!' + path.js.src + 'scripts.js', '!' + path.js.src + 'vendor/*'])
		.pipe(sourcemaps.init())
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest(path.js.dest));
}

/**
 * function jsVendor()
 *
 * Concatenate JS vendor files / libraries
 * Uglify / minify
 * Save
 */
function jsVendor() {
	return gulp.src([path.jsVendor.src + 'jquery.js', path.jsVendor.src + 'angular.js', path.jsVendor.src + '**/*.js', '!' + path.jsVendor.src + 'modernizr.min.js', '!' + path.jsVendor.src + 'vendor.js'])
		.pipe(concat('vendor.js'))
		.pipe(isProduction ? uglify() : gutil.noop() )	// to unminify vendor in dev, remove "isProduction" ternary
		.pipe(gulp.dest(path.jsVendor.dest));
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
	return gulp.src([path.jsAngular.src + 'core/app-setup/app.module.js', path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + jsAngularScript])
		.pipe(sourcemaps.init())
		.pipe(concat(jsAngularScript))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest(path.jsAngular.dest));
}

/**
 * function serve()
 *
 * Start webserver
 * localhost:8000
 */
function serve() {
	if (!isProduction) {
		connect.server({
			root: 'src',
			port: 8000,
			fallback: 'src/index.html'
		});
	}
}

/**
 * Gulp tasks
 */

gulp.task('styles', styles);
gulp.task('jsValidate', jsValidate);
gulp.task('js', js);
gulp.task('jsVendor', jsVendor);
gulp.task('jsAngular', jsAngular);
gulp.task('serve', serve);

/**
 * Default build task
 *
 * If not production, watch for file changes and execute the appropriate task
 *
 * Use "gulp --prod" to trigger production/build mode from commandline
 */

gulp.task('default', ['serve', 'styles', 'jsVendor', 'jsValidate', 'js', 'jsAngular'], function() {
	// if no production flag, start watching
	if (!isProduction) {
		// compile SCSS
		gulp.watch(path.css.src + '**/*.scss', ['styles']);

		// compile JS vendor files
		gulp.watch([path.jsVendor.src + '**/*.js', '!' + path.jsVendor.src + 'vendor.js'], ['jsVendor']);

		// validate user JS: linting / style-checking
		gulp.watch(jsUserSrc, ['jsValidate']);

		// compile JS asset files
		gulp.watch([path.js.src + '**/*.js', '!' + path.js.src + 'scripts.js', '!' + path.js.src + 'vendor/*'], ['js']);

		// compile JS Angular files
		gulp.watch([path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + jsAngularScript], ['jsAngular']);
	}
});