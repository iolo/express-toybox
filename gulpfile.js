var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var doxx = require('gulp-doxx');
var mocha = require('gulp-mocha');

gulp.task('jshint', function () {
    gulp.src('*.js')
        .pipe(jshint({
            node: true,
            devel: true,
            '-W030': true,//Expected an assignment or function call and instead saw an expression.
            '-W097': true,//Use the function form of "use strict".
            'newcap': false//Missing 'new' prefix when invoking a constructor.
        }))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('docs', function () {
    gulp.src(['*.js', 'README.md'])
        .pipe(doxx({
            title: 'node-toybox',
            ignore: ['node_modules', 'build']
        }))
        .pipe(gulp.dest('build/doxx'));
});

gulp.task('test', function () {
    gulp.src('tests/**/*_test.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

gulp.task('default', ['jshint']);

