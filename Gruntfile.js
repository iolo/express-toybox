module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                devel: true,
                node: true,
                '-W030': true,//Expected an assignment or function call and instead saw an expression.
                '-W097': true,//Use the function form of "use strict".
                globals: {}
            },
            all: ['libs/**/*.js']
        },
        mochaTest: {
            all: {
                src:['tests/**/*_test.js'],
                                options:{reporter:'spec'}
                                }

        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('test', ['jshint', 'mochaTest']);
};
