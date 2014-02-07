module.exports = function(grunt) {

    // Load tasks
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-nodemon');

    grunt.initConfig({

        env : {
            options : {
                //Shared Options Hash
            },
            dev : {
                NODE_ENV : 'development'
            }
        },

        nodemon: {
            dev: {
                script: 'server.js'
            }
        }

    });

    grunt.registerTask('dev', ['env:dev', 'nodemon']);

};