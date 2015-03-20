// Requires & plugins
var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');

/*
 // if you want to replace the requires for gulp plugins,
 // you can use this plugin to load all of the dev-dependencies
 // npm install gulp-load-plugins --save-dev

 var plugins = require("gulp-load-plugins")({
 pattern: ['gulp-*', 'gulp.*'],
 replaceString: /\bgulp[\-.]/
 });

 */

var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var map = require('map-stream');

var imagemin = require('gulp-imagemin');
// imagemin plugins
var optipng = require('imagemin-optipng');
var pngquant = require('imagemin-pngquant');
var mozjpeg = require('imagemin-mozjpeg');
var svgo = require('imagemin-svgo');

var webserver = require('gulp-webserver');
var livereload = require('gulp-livereload');

/*
 Install required Gulp Plugins:

 The "--save-dev" flag will automatically add it to your package.json.  If the files
 already exist there, you don't need that flag, and can just run "npm install"

 To install the above plugins at the command prompt:

 npm install gulp --save-dev
 npm install gulp-util --save-dev
 npm install del --save-dev

 npm install gulp-sass --save-dev   // LibSass = faster than Ruby Sass, not quite 100% Sass compliant.  "npm install gulp-ruby-sass" for Ruby Sass
 npm install gulp-sourcemaps --save-dev
 npm install gulp-autoprefixer --save-dev

 npm install gulp-concat --save-dev
 npm install gulp-uglify --save-dev
 npm install gulp-jshint --save-dev
 npm install map-stream --save-dev

 npm install gulp-imagemin --save-dev
 npm install imagemin-optipng --save-dev
 npm install imagemin-pngquant --save-dev
 npm install imagemin-mozjpeg --save-dev
 npm install imagemin-svgo --save-dev

 npm install gulp-webserver --save-dev
 npm install gulp-livereload --save-dev

 To install all of the above at one time, run the following line at the command prompt:
 npm install gulp gulp-util del gulp-sass gulp-sourcemaps gulp-autoprefixer gulp-concat gulp-uglify gulp-jshint map-stream gulp-imagemin imagemin-optipng imagemin-pngquant imagemin-mozjpeg imagemin-svgo gulp-webserver gulp-livereload --save-dev
 */

// Configuration and environment variables

// use "gulp --prod" to trigger production/build mode from commandline
var isProduction = false;
var sassStyle = 'expanded';
var sourceMap = true;
var doClean = gutil.env.clean;

// use "gulp --prod" to trigger production/build mode from commandline
if (gutil.env.prod) {
	isProduction = true;
	sassStyle = 'compressed';
	sourceMap = false;
}

// File reference variables
var basePaths = {
	src: 'src/',
	dest: 'src/'  // current recommendation is to compile files to the same folder
};

var paths = {
	html: {
		src: basePaths.src,
		dest: basePaths.dest
	},
	images: {
		src: basePaths.src + 'assets/images/',
		dest: basePaths.dest + 'assets/images/'
	},
	scripts: {
		src: basePaths.src + 'assets/js/',
		dest: basePaths.dest + 'js/'
	},
	angular: {
		src: basePaths.src + 'ng-app/',
		dest: basePaths.dest + 'ng-app/'
	},
	styles: {
		src: basePaths.src + 'assets/css/' + 'scss/',
		dest: basePaths.dest + 'assets/css/'
	}
};

var appFiles = {
	html: paths.html.src +  '**/*.html',
	images: paths.html.src +  '**/*.{png,jpg,jpeg,gif,svg}',
	styles: paths.styles.src + '**/*.scss',
	scripts: paths.scripts.src + '**/*.js',
	angular: [paths.angular.src + 'ngStartup.js', paths.angular.src + '**/*.js']
};

// To specify order for files, pass an array to the appFiles value, i.e.:
// scripts: [
//	 	paths.scripts.src + 'vendor/jquery.min.js',
//	 	paths.scripts.src + 'plugins.js',
//	 	paths.scripts.src + 'main.js'
//	]

// Want to create per page scripts that can all use a single task?
// Iterate over the following object
// var pageScripts = {
// 	 	'section1': [
// 			paths.scripts.src + 'vendor/pluginFile.js',
// 	 		paths.scripts.src + 'vendor/aFramework.js',
// 	 		paths.scripts.src + 'section/section1SpecificCode.js'
// 		],
// 	 	'section2': [
// 			paths.scripts.src + 'vendor/diffPluginFile.js',
// 	 		paths.scripts.src + 'vendor/secondPluginFile.js',
// 	 		paths.scripts.src + 'section/section2SpecificCode.js'
// 		],
// 	};

// END Configuration

// Standard error handler
function standardHandler(err){
	gutil.beep();
	// Log to console
	gutil.log(gutil.colors.red('Error: '), err.message);
}

// Clean
function cleancss(cb) {
	if (doClean) { del('dist/css', cb); }
}

function cleanjs(cb) {
	if (doClean) { del('dist/js', cb); }
}

function cleanimg(cb) {
	if (doClean) { del('dist/images', cb); }
}

function cleanhtml(cb) {
	if (doClean) { del(paths.html.dest + '**/*.html', cb); }
}

// CSS / Sass compilation
function styles(cb) {
	gulp
		.src(appFiles.styles)
		.pipe(isProduction ? gutil.noop : sourcemaps.init())
		.pipe(isProduction ? sass({outputStyle: 'compressed'}) : sass()).on('error', standardHandler)
		.pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false })).on('error', standardHandler)
		.pipe(isProduction ? gutil.noop : sourcemaps.write())
		.pipe(gulp.dest(paths.styles.dest));
}

// JavaScript tasks and compilation
function lintjs(cb) {
	var myReporter = map(function(file, cb) {
		if (!file.jshint.success) {
			notifier.notify({title: 'JSHint Error', message: 'Error in ' + file.path});
		}
		cb(null, file);
	});

	gulp
		.src(appFiles.scripts)
		.pipe(jshint())
		.once('end', cb || gutil.noop)
		.pipe(myReporter)
		.pipe(jshint.reporter('default'));
}

function scripts() {
	gulp
		.src(appFiles.scripts)
		//.pipe(lintjs())
		.pipe(isProduction ? gutil.noop : sourcemaps.init())
		.pipe(concat(appFiles.scripts, {newLine: ';\r\n'})).on('error', standardHandler)
		.pipe(isProduction ? gutil.noop : uglify()).on('error', standardHandler)
		.pipe(isProduction ? gutil.noop : sourcemaps.write())
		.pipe(gulp.dest(paths.scripts.dest));
}

function angular() {
	gulp
		.src(appFiles.angular)
		//.pipe(lintjs())
		.pipe(isProduction ? gutil.noop : sourcemaps.init())
		.pipe(concat(appFiles.angular, {newLine: ';\r\n'})).on('error', standardHandler)
		.pipe(isProduction ? gutil.noop : uglify()).on('error', standardHandler)
		.pipe(isProduction ? gutil.noop : sourcemaps.write())
		.pipe(gulp.dest(paths.scripts.dest));
}

// Image Minification and compression
// More info: http://www.devworkflows.com/posts/adding-image-optimization-to-your-gulp-workflow/
function compressImages(cb) {
	gulp
		.src(appFiles.images)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [
				pngquant({quality: '65-80', speed: 4}),
				optipng({optimizationLevel: 3}),
				mozjpeg({quality: '70'}),
				svgo()
			]
		}))
		.pipe(gulp.dest(paths.images.dest));
}

// TODO: we don't need to copy anything anywhere if using the same folder for dist and src?

// Copy files to Dist
function copyhtml(cb) {
	gulp
		.src(appFiles.html)
		.pipe(gulp.dest(paths.html.dest));
}

function copyimg(cb) {
	gulp
		.src(appFiles.images)
		.pipe(compressImages())
		.pipe(gulp.dest(paths.images.dest));
}

// Webserver and watch
function webserver(cb) {
	if (isProduction) { return; }
	gulp
		.src(basePaths.dest)
		.pipe(webserver({
			livereload: true,
			directoryListing: true,
			open: true
		}));
}

function watchAndReload(cb) {
	if (isProduction) { return; }

	// Create LiveReload server
	livereload.listen();

	gulp.watch(appFiles.html, ['copy:html']).on('change', livereload.changed);
	gulp.watch(appFiles.images, ['copy:img']).on('change', livereload.changed);
	gulp.watch(appFiles.styles, ['styles']).on('change', livereload.changed);
	gulp.watch(appFiles.scripts, ['scripts']).on('change', livereload.changed);
}

/*********************
 Task(s)
 *********************/

// Clean Task(s)
gulp.task('clean:css', cleancss);
gulp.task('clean:js', cleanjs);
gulp.task('clean:img', cleanimg);
gulp.task('clean:html', cleanhtml);
gulp.task('clean', ['clean:css', 'clean:js', 'clean:img', 'clean:html']);

// Style Task(s)
gulp.task('styles', ['clean:css'], styles);

// Script Task(s)
gulp.task('scripts', ['clean:js'], scripts);
gulp.task('angular', ['clean:js'], angular);

// Image Compression Task(s)
gulp.task('imagemin', ['clean:img'], compressImages);

// Copy Task(s)
gulp.task('copy:img', ['clean:img'], imagemin);
gulp.task('copy:html', ['clean:html'], copyhtml);
gulp.task('copy', ['copy:html', 'imagemin']);

// Webserver/Watch Task(s)
gulp.task('webserver', webserver);
gulp.task('watch', ['clean', 'webserver'], watchAndReload);

// Default task
// by default it will run the dev process.
// Use "gulp --prod" to build for production
gulp.task('default', ['styles', 'scripts', 'angular', 'copy', 'watch']);
