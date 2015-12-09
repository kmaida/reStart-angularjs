/**
 * Dev dependencies
 */

var gulp = require('gulp'),
	connect = require('gulp-connect'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	minifyCSS = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat'),
	deleteLines = require('gulp-delete-lines'),
	Server = require('karma').Server,
    fpath = require('path'),
    child_process = require('child_process');

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
	jsVendor: {
		src: basePath.src + '/assets/js/vendor/',
		dest: basePath.dest + '/assets/js/vendor/'
	},
	jsAngular: {
		src: basePath.src + '/reStart-app/',
		dest: basePath.dest + '/reStart-app/'
	},
	e2e:{
		src:'./tests/integration/',
		dest:'./tests'
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
	return gulp.src([path.jsAngular.src + 'core/app-setup/app.module.js', path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + 'reStart-app.js','!' + path.jsAngular.src + '**/*.spec.js'])	
		//remove lines marked with //test code if production
		.pipe(isProduction ?deleteLines({
			'filters': [
				/test code/
			]
		}): gutil.noop())	
		.pipe(sourcemaps.init())	
		.pipe(concat('reStart-app.js'))				
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest(path.jsAngular.dest));
}

/**
 * function tests()
 *
 * Init sourcemaps
 * Concatenate .spec files
 * Write sourcemaps
 * Save
 */
function tests() {
	return gulp.src([path.jsAngular.src + '**/*.spec.js','!'+path.jsAngular.src+'reStart-app.spec.js'])
		.pipe(sourcemaps.init())
		.pipe(concat('reStart-app.spec.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.jsAngular.dest));
}

/**
 * function e2e()
 *
 * Init sourcemaps
 * Concatenate .spec files
 * Write sourcemaps
 * Save
 */
function e2e() {
	return gulp.src([path.e2e.src + '**/*.spec.js'])
		.pipe(sourcemaps.init())
		.pipe(concat('e2e.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.e2e.dest));
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
 * function karma()
 *
 * Start karma test runner
 * Use singleRun false for CI testing 
 */
 function karma(){
	return gulp.task('karma', function (done) {
		new Server({
			configFile: __dirname + '/karma.conf.js',
			singleRun: true
		}, done).start();
	});
 }
 
/**
 * function e2eTests
 * 
 * Start protractor and runs e2e tests
 */
  function e2eTests(){
	var argv = process.argv.slice(3); // forward args to protractor
    return child_process.spawn(getProtractorBinary('protractor'), argv, {
        stdio: 'inherit'
    })//.once('close', done);
  }
 function getProtractorBinary(binaryName){
    var winExt = /^win/.test(process.platform)? '.cmd' : '';
    var pkgPath = require.resolve('protractor');
    var protractorDir = fpath.resolve(fpath.join(fpath.dirname(pkgPath), '..', 'bin'));
    return fpath.join(protractorDir, '/'+binaryName+winExt);
}

 
/**
 * Gulp tasks
 */

gulp.task('styles', styles);
gulp.task('js', js);
gulp.task('jsVendor', jsVendor);
gulp.task('jsAngular', jsAngular);
gulp.task('tests', tests);
gulp.task('e2e', e2e);
gulp.task('serve', serve);
//Start karma after files have been rebuilt and test compiled
gulp.task('karma',['js','jsVendor','jsAngular','tests'],karma);
//Start protractor after karma runs
gulp.task('protractor',['e2e','serve'],e2eTests);

/**
 * Default build task
 *
 * If not production, watch for file changes and execute the appropriate task
 *
 * Use "gulp --prod" to trigger production/build mode from commandline
 */

gulp.task('default', ['serve', 'styles', 'jsVendor', 'js', 'jsAngular','karma','protractor'], function() {
	if (!isProduction) {
		gulp.watch(path.css.src + '**/*.scss', ['styles']);
		gulp.watch([path.jsVendor.src + '**/*.js', '!' + path.jsVendor.src + 'vendor.js'], ['jsVendor']);
		gulp.watch([path.js.src + '**/*.js', '!' + path.js.src + 'scripts.js', '!' + path.js.src + 'vendor/*'], ['js']);
		gulp.watch([path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + 'reStart-app.js', '!' + path.jsAngular.src + '**/*.spec.js'], ['jsAngular']);
		gulp.watch([path.jsAngular.src + '**/*.spec.js','!'+ path.jsAngular.src+ 'reStart-app.spec.js'], ['tests','karma']);
		gulp.watch([path.e2e.src + '**/*.spec.js'], ['e2e','protractor']);
	}
});