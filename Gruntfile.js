module.exports = function(grunt) {

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'src/assets/img/',
					src: ['**/*.{png,jpg,gif}'],
					dest: 'dist/'
				}]
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
			},
			dist: {
				files: {
					'dist/ng-<%= pkg.name %>.min.js': ['src/app/**/*.js'],
					'dist/modernizr.min.js': ['src/assets/js/libs/modernizr.js'],
					'dist/libs.min.js': ['src/assets/js/libs/**/*.js', '!src/assets/js/libs/modernizr.js'],
					'dist/<%= pkg.name %>.min.js': ['src/assets/js/**/*.js', '!src/assets/js/libs/*']
				}
			}
		},
		sass: {
			dist: {
				options: {
					style: 'expanded',
					lineNumbers: true
				},
				files: {
					'src/assets/css/<%= pkg.name %>.css': 'src/assets/css/scss/styles.scss'
				}
			}
		},
		watch: {
			css: {
				files:  ['**/*.scss'],
				tasks: ['sass']
			}
		}
	});
	
	// Load the plugins that provide the tasks
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	// Default task(s)
	grunt.registerTask('default', ['sass', 'imagemin', 'watch']);

};