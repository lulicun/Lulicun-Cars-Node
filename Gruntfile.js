var config = require('./config/configs.json');
var exec = require('child_process').exec;

module.exports = function(grunt) {
	grunt.initConfig({
		watch: {
			options: {
				atBegin: true,
				livereload: true,
				spawn: false,
				interrupt: true,
				cwd: './src/',
			},	
			scripts: {
				files: [
					'../package.json',
					'./package.json',
					'./bower.json',
					'./**/*.html',
					'./**/*.js',
					'./**/*.css',
					'!./node_modules/**/*.js',
				],
				tasks: ['restart']							
			}
		},
		shell: {
			killall: {
				options: {
		        	failOnError: false
		        },
		        command: 'killall node'
			}
		},
		ngconstant: {
			options: {
				name: 'Lulicun',
				deps: false,
				dest: './src/app/js/services/constants.js',
				constants: config.defaults
			},
			local: { constants: config.local },
			prod: { constants: config.prod }
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-ng-constant');

	grunt.event.on('watch', function(action, filepath, target) {
	    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
	});

	grunt.registerTask('killall', function() {
		grunt.task.run('shell:killall');
	});

	grunt.registerTask('start', 'start server', function(){
	    exec('node ./src/server.js');
  	});

	grunt.registerTask('restart', function() {
	    grunt.task.run('killall');
	    grunt.task.run('start');
	});

	grunt.registerTask('config', 'Config application settings.', function() {
		var prod = grunt.option('prod');
		if (prod) {
			grunt.task.run('ngconstant:prod');
		} else {
			grunt.task.run('ngconstant:local');
		}
	});

	grunt.registerTask('default', 'Start server and run watch.',['killall', 'start', 'watch']);
}