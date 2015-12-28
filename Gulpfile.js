/**
 * Dev dependencies
 */

var gulp = require('gulp');
var connect = require('gulp-connect');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');

// Images
var imagemin = require('gulp-imagemin');
// imagemin plugins
var gifsicle = require('imagemin-gifsicle');
var optipng  = require('imagemin-optipng');
var pngquant = require('imagemin-pngquant');
//var mozjpeg  = require('imagemin-mozjpeg');   // currently has a bug and returns 0kb images

// SVGs
var svgo = require('imagemin-svgo');
var svgSprite = require('gulp-svg-sprite');

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
	images: {
		src: basePath.src + '/assets/images/',
		dest: basePath.src + '/assets/images/'
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
var jsModuleFile = path.jsAngular.src + 'core/app-setup/app.module.js';

/**
 * Files object
 * Sets up file source arrays for tasks
 * (No modification should be necessary)
 */

var files = {};

files.scssSrc = [path.css.src + '**/*.scss'];
files.jsUserSrcAngular = [path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + jsAngularScript];
files.jsUserSrcAssets = [path.js.src + '**/*.js', '!' + path.js.src + jsUserScript, '!' + path.js.src + 'vendor/*'];
files.jsUserSrcAll = files.jsUserSrcAngular.concat(files.jsUserSrcAssets);
files.jsVendorSrc = [path.jsVendor.src + 'jquery.js', path.jsVendor.src + 'angular.js', path.jsVendor.src + '**/*.js', '!' + path.jsVendor.src + 'modernizr.min.js', '!' + path.jsVendor.src + 'vendor.js'];
files.imagesSrc = [path.images.src + '**/*.{jpg,jpeg,gif,png,svg}', '!' + path.images.src + 'svg/*.svg'];
files.svgSrc = [path.images.src + 'svgSrc/**/*.svg'];

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
		.pipe(sourcemaps.init())
		.pipe(concat(jsAngularScript))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest(path.jsAngular.dest));
}

/**
 * function compressImages()
 *
 * Image minification and compression
 */
function compressImages() {
	var svgoOpts = [
		{removeViewBox: false}
	];

	return gulp.src(files.imagesSrc)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: svgoOpts,
			use: [
				gifsicle({interlaced: true}),
				optipng({optimizationLevel: 3}),
				pngquant({quality: '65-80', speed: 4}),
				//mozjpeg({quality: '70'}),
				svgo()
			]
		})).on('error', errorHandler)
		.pipe(gulp.dest(path.images.dest))
}

/**
 * function spriteSVGs()
 *
 * Turn SVG files into SVG sprite
 */
function spriteSVGs() {
	var svgSpriteConfig = {
		mode: {
			css: false,
			symbol: {
				dest: path.images.dest
			}
		},
		shape: {
			dimension: {
				precision: -1
			},
			transform: [
				{
					svgo: {removeViewBox: false}
				}
			]
		}
	};

	return gulp.src(files.svgSrc)
		.pipe(svgSprite(svgSpriteConfig)).on('error', errorHandler)
		.pipe(gulp.dest('.'));
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

	// compile SVG sprites
	gulp.watch(files.svgSrc, ['spriteSVGs']);

	// compress images
	gulp.watch(files.imagesSrc, ['compressImages']);
}

/**
 * Gulp tasks
 */

gulp.task('styles', styles);
gulp.task('jsValidate', jsValidate);
gulp.task('jsUser', jsUser);
gulp.task('jsVendor', jsVendor);
gulp.task('jsAngular', jsAngular);
gulp.task('compressImages', compressImages);
gulp.task('spriteSVGs', spriteSVGs);
gulp.task('processImages', ['compressImages', 'spriteSVGs']);
gulp.task('serve', serve);
gulp.task('js', ['jsVendor', 'jsValidate', 'jsUser', 'jsAngular']);
gulp.task('default', ['serve', 'styles', 'js', 'compressImages', 'spriteSVGs'], defaultTask);