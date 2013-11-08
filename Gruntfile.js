module.exports = function( grunt ) {
    'use strict';
    //
    // Grunt configuration:
    //
    // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
    //
    grunt.registerTask('coffee', 'insert dependency flags and templates', function () {
    });
    grunt.registerTask('compass', 'insert dependency flags and templates', function () {
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // angular specific stuff
    grunt.registerTask('ngmin', 'insert dependency flags and templates', function () {
        var jsFiles = grunt.config("ngmin").js || [];
        var childProcess = require('child_process');
        var done = this.async();
        jsFiles.forEach(function(file) {
            var cmd = 'ngmin "' + file + '" -o "' + file + '"';
            grunt.log.write("processing: " + cmd +"\n");
            childProcess.exec(cmd, function (err, stdout) {
                grunt.log.write("processed: " + file +"\n");
                if(file == jsFiles[0]) done(err);
            });
        });
    });

    grunt.registerMultiTask('html2js', 'Generate js version of html template.', function() {
        var TPL = '';
        var single = true; // do you want one file per template or all in one?

        if(!single) {;
            TPL += 'angular.module("templates").run(["$templateCache", function($templateCache) {\n';
            TPL += '  $templateCache.put("<%= file %>",\n    "<%= content %>");\n';
            TPL += '}]);\n';
        } else {
            TPL += '  $templateCache.put("<%= file %>",\n    "<%= content %>");\n';
        }

        var escapeContent = function(content) {
            return content.replace(/"/g, '\\"').replace(/\n/g, '" +\n    "');
        };

        var files = grunt._watch_changed_files || grunt.file.expand(this.data);
        var items = [];
        files.forEach(function(file) {
            var content = grunt.template.process(TPL, {
                file: file.replace(/^app\//, ""),
                content: escapeContent(grunt.file.read(file))
            });
            items.push(content);
            if(!single) {
                grunt.file.write(file + '.js', content);
            }

        });
        if(single) {
            console.log(this, items.length)
            var content = 'angular.module("' + this.file.dest + '").run(["$templateCache", function($templateCache) {\n' +
                items.join("\n") +
                '}]);\n';
            grunt.file.write(this.file.dest, content);
        }
    });
	

    grunt.registerMultiTask('concat', 'Generate single files', function() {
        var vars = grunt.file.read(this.target);
		var files = vars.substring(vars.indexOf("["), vars.indexOf("//END")).replace(/.*?\[.*/m,"").replace(/"/g, '').replace(/\s+/g, '').split(',');
		var contents = [];
		files.forEach(function(file) {
			if(file) {
				var content = grunt.file.read(file);
				contents.push(content);
			}
		});
		contents.push();
        grunt.file.write(this.target, contents.join("\n"));
    });
	
    grunt.registerMultiTask('fixup', 'Generate function() files and minify', function() {
        var files = grunt._watch_changed_files || grunt.file.expand(this.data);
		var contents = [];
		contents.push("!function(angular, jQuery) {")
		files.forEach(function(file) {
			if(file) {
				var content = grunt.file.read(file);
				contents.push(content);
			}
		});
		contents.push("}(angular, jQuery);");
        grunt.file.write(this.target, contents.join("\n"));
    });
	

    // Custom build order
    grunt.registerTask('build',   'intro clean mkdirs html html2js concat ngmin fixup usemin-handler css     uglify rev_files copy time'.split(/\s+/));
    grunt.registerTask('dist',    'intro clean mkdirs html html2js concat ngmin fixup                css img uglify rev_files copy test time'.split(/\s+/));
    grunt.registerTask('release', 'intro clean mkdirs html html2js concat ngmin fixup usemin-handler css img usemin rev_files copy test time'.split(/\s+/));

    // Alias the `test` task to run `testacular` instead
    grunt.registerTask('test', 'run the testacular test driver', function () {
        var done = this.async();
        require('child_process').exec('testacular start --single-run', function (err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });

    grunt.registerTask('rev_files', 'run the revisioner', function () {
        var files = grunt.file.expand(["*.html"]);

	    function md5(filepath, algorithm, encoding, fileEncoding) {
		 	var crypto = require('crypto');
	      	var hash = crypto.createHash(algorithm);
	      	hash.update(grunt.file.read(filepath), fileEncoding);
	      	return hash.digest(encoding);
	    }
		
		function rename(f) {
		 	var fs = require('fs'),
  		  		path = require('path');
	        var hash = md5(f, 'md5', 'hex', 'utf8'),
	          prefix = hash.slice(0, 8),
	          renamed = [prefix, path.basename(f)].join('.'),
	          outPath = path.resolve(path.dirname(f), renamed);
	          grunt.verbose.ok().ok(hash);
	          fs.renameSync(f, outPath);
	          grunt.log.write(f + ' ').ok(renamed);
			  return path.dirname(f) + "/" + renamed;
		}
		
        var done = this.async();
        try {
			files.forEach(function(file) {
	            grunt.log.write(file);
				var content = grunt.file.read(file);
				var matches = content.match(/<!--\s*build:js\s+(.*?)\s*-->([\s\S]*?)<!--\s*endbuild\s*-->/);
				if(matches) {
					var dst = matches[1];
					var srcs = matches[2].replace(/.*?src="(.*?)".*/g, "$1").trim().split("\n");
					var code = [];
					srcs.forEach(function(src) {
						code.push(grunt.file.read(src))
					});
		            grunt.file.write(dst, code.join("\n"));
					var renamed = rename(dst);
					content = content.replace(/<!--\s*build:js\s+.*?\s*-->([\s\S]*?)<!--\s*endbuild\s*-->/g, '<script src="'+renamed+'"></script>');
		            grunt.file.write(file, content);
				}
			});
			done(0);
            //var child_process = require('child_process');
			//var outpath = rename(f);
			//child_process.exec('perl -pi -e "s|<!--build:js\s+(.*?)\s*-->(.*?)<!-- endbuild -->|' + outpath + '|sg" *.html', function (err, stdout) {
            //    done(err);
            //});
        } catch(e) {
            grunt.log.write(e);
            done(0);
        }
    });

    grunt.initConfig({

        // Project configuration
        // ---------------------
        // specify an alternate install location for Bower
        bower: {
            dir: 'app/components'
        },

        html2js: {
            "scripts/scripts.templates.js": ['<config:src.scripttpl>'],
            "scripts/sender.templates.js": ['<config:src.sendertpl>'],
            "scripts/chat.templates.js": ['<config:src.chattpl>']
        },

        concat: {
            "scripts/support.js":[],
	        "scripts/scripts.js":[],
            "scripts/sender.js":[],
            "scripts/chat.js":[],
        },
		
        fixup: {
            "scripts/sender.js":["scripts/scripts.js","scripts/sender.js"],
            "scripts/chat.js":["scripts/scripts.js","scripts/chat.js"],
            "scripts/scripts.js":[],
        },

        ngmin:{
            js:["scripts/scripts.js", "scripts/chat.js", "scripts/sender.js"]
        },
        src: {
            js: ['scripts/*.js', 'temp/scripts/*.js'],
            html: ['index.html'],
            scripttpl: ['scripts/**/*.html', "!scripts/chat/**/*.html", "!scripts/sender/**/*.html", "!scripts/views/**/*.html"],
            sendertpl: ['scripts/sender/**/*.html'],
            chattpl: ['scripts/chat/**/*.html', 'scripts/views/**/*.html']
        },

        // default watch configuration
        watch: {
            reload: {
                files: [
                    'app/*.html',
                    'app/styles/main.css',
                    'app/scripts/**/*.js',
                    'app/scripts/views/**/*.html',
                    'app/images/**/*',
                    'test/**/*.js'
                ],
                tasks: 'build'
            }
        },

        // default lint configuration, change this to match your setup:
        // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#lint-built-in-task
        lint: {
            files: [
                'Gruntfile.js',
                'app/scripts/**/*.js',
                'spec/**/*.js'
            ]
        },

        // specifying JSHint options and globals
        // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#specifying-jshint-options-and-globals
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {
                angular: true
            }
        },

        // Build configuration
        // -------------------

        // the staging directory used during the process
        staging: 'temp',
        // final build output
        output: 'dist',

        mkdirs: {
            staging: 'app/'
        },

        // Below, all paths are relative to the staging directory, which is a copy
        // of the app/ directory. Any .gitignore, .ignore and .buildignore file
        // that might appear in the app/ tree are used to ignore these values
        // during the copy process.

        // concat css/**/*.css files, inline @import, output a single minified css
        css: {
            'styles/main.css': ['styles/main.css']
        },

        // renames JS/CSS to prepend a hash of their contents for easier
        // versioning
        rev: {
            js: ['scripts/*.js'],
            css: 'styles/main.css',
            img: 'images/**'
        },

        // usemin handler should point to the file containing
        // the usemin blocks to be parsed
        'usemin-handler': {
            html: ['*.html']
        },

        // update references in HTML/CSS to revved files
        usemin: {
            html: ['*.html'],
            css: ['styles/main.css'],
            js: ['scripts/*.min.js']
        },

        // HTML minification
        html: {
            files: ['**/*.html']
        },
        min: {
            dist: {
                src: ['scripts/scripts.js'],
                dest: 'scripts/scripts.js'
            }
        },
        uglify: {
            options: {
                mangle: true,
				compress: false,
				beautify: false,
				report: true,
            },
            dist: {
                files: {
                     //'scripts/support.js': ['scripts/support.js'],
                    'scripts/scripts.js': ['scripts/scripts.js'],
                    'scripts/chat.js': ['scripts/chat.js'],
                    'scripts/sender.js': ['scripts/sender.js']
                }
            }
        },
        // Optimizes JPGs and PNGs (with jpegtran & optipng)
        img: {
            dist: '<config:rev.img>'
        },

        // rjs configuration. You don't necessarily need to specify the typical
        // `path` configuration, the rjs task will parse these values from your
        // main module, using http://requirejs.org/docs/optimization.html#mainConfigFile
        //
        // name / out / mainConfig file should be used. You can let it blank if
        // you're using usemin-handler to parse rjs config from markup (default
        // setup)
        rjs: {
            // no minification, is done by the min task
            optimize: 'none',
            baseUrl: './scripts',
            wrap: true
        }
    });
};