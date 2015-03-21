// Dev dependencies
var gulp = require('gulp'),
	gutil = require('gulp-util'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	minifyCSS = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	concat = require('gulp-concat');

// Paths
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

// Run "gulp --prod" to trigger production/build mode
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
	return gulp.src(path.css.src + 'styles.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({ style: 'expanded' }))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', '> 1%'],
			cascade: false
		}))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? minifyCSS() : gutil.noop() )
		.pipe(gulp.dest(path.css.dest));
});

// JS
gulp.task('js', function() {
	return gulp.src([path.js.src + '**/*.js', '!' + path.js.src + 'scripts.js', '!' + path.js.src + 'libs/*'])
		.pipe(sourcemaps.init())
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest(path.js.dest));
});

// JS Libs
gulp.task('jsLibs', function() {
	return gulp.src([path.jsLibs.src + 'jquery.js', path.jsLibs.src + 'angular.js', path.jsLibs.src + '**/*.js', '!' + path.jsLibs.src + 'modernizr.min.js', '!' + path.jsLibs.src + 'libs.js'])
		.pipe(concat('libs.js'))
		//.pipe(isProduction ? uglify() : gutil.noop() )	// to unminify libs in dev, uncomment this and comment out the next line instead
		.pipe(uglify())
		.pipe(gulp.dest(path.jsLibs.dest));
});

// AngularJS
gulp.task('jsAngular', function() {
	return gulp.src([path.jsAngular.src + 'ngStartup.js', path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + 'ng-app.js'])
		.pipe(sourcemaps.init())
		.pipe(concat('ng-app.js'))
		.pipe(sourcemaps.write())
		.pipe(isProduction ? uglify() : gutil.noop() )
		.pipe(gulp.dest(path.jsAngular.dest));
});

// default build task
// use "gulp --prod" to trigger production/build mode from commandline
gulp.task('default', ['styles', 'jsLibs', 'js', 'jsAngular'], function() {
	if (!isProduction) {
		gulp.watch(path.css.src + '**/*.scss', ['styles']);
		gulp.watch([path.jsLibs.src + '**/*.js', '!' + path.jsLibs.src + 'libs.js'], ['jsLibs']);
		gulp.watch([path.js.src + '**/*.js', '!' + path.js.src + 'scripts.js', '!' + path.js.src + 'libs/*'], ['js']);
		gulp.watch([path.jsAngular.src + '**/*.js', '!' + path.jsAngular.src + 'ng-app.js'], ['jsAngular']);
	}
});