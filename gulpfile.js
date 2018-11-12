var gulp = require('gulp'),
    //jshint = require('gulp-jshint'),
    //uglify = require('gulp-uglify'),
    //rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    replace = require('gulp-token-replace'),
    argv = require('yargs').argv;
    //sourcemaps = require('gulp-sourcemaps'),
    //del = require('del'),
    //chmod = require('gulp-chmod'),
    //webpackStream = require('webpack-stream'),
    //jsdoc = require('gulp-jsdoc3');

var sources = [ 'src/*.js' ],
    outputFolder = 'dist/app',
    resultScriptName = 'twain-cloud.js';

gulp.task('build', function build(){
    var apiUrl = argv.apiUrl;

    if (!apiUrl)
      throw Error('Missing API Url parameter.');

    var build = gulp.src(sources)
        //.pipe(jshint())
        //.pipe(jshint.reporter('default'))
        //.pipe(sourcemaps.init())
        //.pipe(webpackStream(require('./webpack.config.js')))
        .pipe(replace({ tokens: { apiUrl } }))
        .pipe(concat(resultScriptName));

    //if (minify)
    //    build = build.pipe(uglify());

    return build
        //.pipe(sourcemaps.write('.', { addComment: false }))
        //.pipe(chmod(666))
        .pipe(gulp.dest(outputFolder));
        //.pipe(gulp.dest(integrationTestsFolder))
        //.pipe(gulp.dest(demoPageFolder));

});
