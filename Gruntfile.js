module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			dist: {
				src: [
					'js/wfloader.js',
					'js/sr.js',
					'js/sprites.js',
					'js/starship.js',
					'js/main.js'
				],
				dest: 'js/build/starship_concat.js',
			}
		},
		uglify: {
			build: {
				src: 'js/build/starship_concat.js',
				dest: 'js/build/starship.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ['concat','uglify']);

};
