module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'), //use variables from pgk throughout the rest of the file
        copy: {
          dist: {
            src: [
                '**/*',  '!**/node_modules/**'
             ],
            dest: 'dist',
            expand: true
          },
        },
        clean: {
          dist: {
            src: [ 'dist' ]
          },
          stylesheets: {
            src: [
                'dist/client/**/*.css',
                '!dist/client/lib/**/*.css',
                '!dist/client/application.min.css'
            ]
          }
        },
        cssmin: {
          dist: {
            files: {
              'dist/client/application.min.css': [ 'dist/client/css/*.css', 'dist/client/js/**/*.css' ]
            }
          }
        },
        ngAnnotate: {
          dist: {
            files: [{
                          expand: true,
                          cwd: 'client/js',
                          src: '**/*.js',
                          dest: 'dist/client/js'
            }]
          }
        },
        uglify: {
          dist: {
            options: {
              mangle: true
            },
            files: [{
                          expand: true,
                          cwd: 'dist/client/js',
                          src: '**/*.js',
                          dest: 'dist/client/js'
            }]
          }
        },
        jshint: {
            // define the files to lint
            files: ['gruntfile.js', 'client/js/**/*.js'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    angular: true,
                    "_": true
                }
            }
        },
        gitadd: {
            release: {
                options: {
                    all: true
                },
                files: {
                    src: ['dist/**']
                }
            }
        },
        gitcommit: {
            release: {
                options: {
                    message: "Release",
                    allowEmpty: true
                }
            }
        },
        gitpush: {
            release: {
                options: {
                    remote: "origin",
                    branch: "master"
                }
            }
        },
        concurrent: {
            dev: {
                tasks: ['watch', 'nodemon'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        env: {
            dev: {
                NODE_ENV: 'development'
            }
        },
        watch: {
            css: {
                files: 'client/**/*.css',
                options: {
                    livereload: true,
                },
            },
            jade: { //client jades
                files: 'client/**/*.jade',
                options: {
                    livereload: true,
                },
            },
            scripts: {
                files: 'client/**/*.js',
                tasks: ['jshint'],
                options: {
                    livereload: true,
                },
            },
            server: {
                files: ['.rebooted'],
                options: {
                    livereload: true
                }
            }
        },
        nodemon: {
            dev: {
                nodeArgs: ['--debug'],
                script: 'server.js',
                options: {
                    env: {
                        PORT: '5000'
                    },
                    ignore: ['node_modules/**'],
                    ext: 'js,jade',
                    watch: ['.', 'server'],
                    callback: function(nodemon) {
                        //There is a "open" browser event available. check github page

                        nodemon.on('log', function(event) {
                            console.log(event.colour);
                        });

                        // refreshes browser when server reboots
                        nodemon.on('restart', function() {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1000);
                        });
                    }
                }
            }
        }
    });

    //Load plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-git');

    //Tasks
    grunt.registerTask(
        'default',
        [
            'env:dev',
            'concurrent:dev'
        ]
    );

    grunt.registerTask(
        'dist',
        'Compiles all of the assets and copies the files to the dist directory.',
        [
            'clean:dist',
            'copy:dist',
            'cssmin',
            'ngAnnotate',
            'uglify',
            'clean:stylesheets'
        ]
    );

    grunt.registerTask(
        'release',
        'Releases dist to git.',
        [
            'dist',
            'gitadd',
            'gitcommit',
            'gitpush'
        ]
    );
};
