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
    child_process = require('child_process'),
	eslint = require('gulp-eslint');
/**
 * File paths
 *
 ********************** IMPORTANT:
 ********************** Make sure to update these paths for your project!
 ********************** Modification to other sections should not be necessary if using default setup
 */

var jsAngularDir = 'reStart-app';
var jsAngularScript = jsAngularDir + '.js';
var jsUserScript = 'scripts.js';
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
	},
	e2e:{
		src:'./tests/integration/',
		dest:'./tests'
	}
};
var jsModuleFile = path.jsAngular.src + 'core/app-setup/app.module.js';

/**
 * Files object
 * Sets up file source arrays for tasks
 * (No modification should be necessary)
 */

var files = {};

files.e2e = [path.e2e.src];
files.specs= [path.jsAngular.src + '**/*.spec.js','!'+path.jsAngular.src+'reStart-app.spec.js'];
files.scssSrc = [path.css.src + '**/*.scss'];
files.jsUserSrcAngular = [path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + jsAngularScript , '!'+path.jsAngular.src + '**/*.spec.js'];
files.jsUserSrcAssets = [path.js.src + '**/*.js', '!' + path.js.src + jsUserScript, '!' + path.js.src + 'vendor/*'];
files.jsUserSrcAll = files.jsUserSrcAngular.concat(files.jsUserSrcAssets);
files.jsVendorSrc = [path.jsVendor.src + 'jquery.js', path.jsVendor.src + 'angular.js', path.jsVendor.src + '**/*.js', '!' + path.jsVendor.src + 'modernizr.min.js', '!' + path.jsVendor.src + 'vendor.js'];

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
	return gulp.src(files.scssSrc)
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
 * Lint and stylecheck JavaScript with ESLint
 * Exclude vendor files
 * Print results
 */
function jsValidate() {
	if (isProduction) {
		return;
	}

	return gulp.src(files.jsUserSrcAll)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.results(function(results) {
			if (results.warningCount == 0 && results.errorCount == 0) {
				gutil.log(gutil.colors.green('Congratulations! No ESLint warnings or errors.'));
			} else {
				gutil.beep();
			}
		}));
}

/**
 * function jsUser()
 *
 * Init sourcemaps
 * Concatenate JS files
 * Write sourcemaps
 * Uglify / minify (if production)
 * Save
 */
function jsUser() {
	return gulp.src(files.jsUserSrcAssets)
		.pipe(sourcemaps.init())
		.pipe(concat(jsUserScript))
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
	return gulp.src(files.jsVendorSrc)
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
	return gulp.src([jsModuleFile].concat(files.jsUserSrcAngular))
		//remove lines marked with //test code if production
		.pipe(isProduction ?deleteLines({
			'filters': [
				/test code/
			]
		}): gutil.noop())	
		.pipe(sourcemaps.init())
		.pipe(concat(jsAngularScript))
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
	return gulp.src(files.specs)
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
	return gulp.src(files.e2e)
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
	if (isProduction) {
		return;
	}

	connect.server({
		root: 'src',
		port: 8000,
		fallback: 'src/index.html'
	});
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

 * Default build task
 *
 * If not production, watch for file changes and execute the appropriate task
 *
 * Use "gulp --prod" to trigger production/build mode from commandline
 */
function defaultTask() {
	// if no production flag, start watching
	if (isProduction) {
		return;
	}

	// compile SCSS
	gulp.watch(files.scssSrc, ['styles']);

	// compile JS vendor files
	gulp.watch(files.jsVendorSrc, ['jsVendor']);

	// validate user JS: linting / style-checking
	gulp.watch(files.jsUserSrcAll, ['jsValidate']);

	// compile JS asset files
	gulp.watch(files.jsUserSrcAssets, ['jsUser']);

	// compile JS Angular files
	gulp.watch(files.jsUserSrcAngular, ['jsAngular']);
	
	//compile jasmine unit tests
	gulp.watch(files.specs, ['tests']);
	
	//compile protractor tests
	gulp.watch(files.e2e, ['e2e']);
}
/**
 * Gulp tasks
 */

gulp.task('styles', styles);
gulp.task('jsValidate', jsValidate);
gulp.task('jsUser', jsUser);
gulp.task('jsVendor', jsVendor);
gulp.task('jsAngular', jsAngular);
gulp.task('tests', tests);
gulp.task('e2e', e2e);
gulp.task('serve', serve);
//Start karma after files have been rebuilt and test compiled
gulp.task('karma',['jsUser','jsVendor','jsAngular','tests'],karma);
//Start protractor after karma runs
gulp.task('protractor',['e2e','serve'],e2eTests);

/**
 * Default build task
 *
 * If not production, watch for file changes and execute the appropriate task
 *
 * Use "gulp --prod" to trigger production/build mode from commandline
 */

gulp.task('js',['jsVendor', 'jsValidate', 'jsUser', 'jsAngular']);
gulp.task('default',['serve', 'styles', 'js'], defaultTask);