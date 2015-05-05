/*! This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

'use strict';

var gulp = require('gulp');
var del = require('del');
var autoprefixer = require('autoprefixer-core');
var dirname = require('path').dirname;
var config = require('./package.json');
// Load plugins
var $ = require('gulp-load-plugins')();

gulp.task('clean', function(next) {
  del([config.paths.vendorjs + '/**', config.paths.vendorcss + '/**'], next);
});

var downloads = {
  'node_modules/jquery-tokeninput/jquery.tokeninput.js' : 'https://raw.githubusercontent.com/loopj/jquery-tokeninput/master/src/jquery.tokeninput.js'
};
var vendorjs = [
  'node_modules/handlebars/dist/handlebars.runtime.js',
  'node_modules/jquery/dist/jquery.js'
];
vendorjs = vendorjs.concat(Object.keys(downloads));

var vendorcss = [
  'node_modules/normalize.css/normalize.css'
];

// CSS
gulp.task('vendorcss', function() {
  return gulp.src(vendorcss)
    .pipe($.postcss([autoprefixer({browsers: ['last 2 Firefox versions']}), $.minifycss]))
    .pipe(gulp.dest(config.paths.vendorcss));
});

// download packages not available in npm
gulp.task('download', function() {
  return Object.keys(downloads).forEach(function(key) {
    var url = downloads[key];
    $.download(url)
     .pipe(gulp.dest(dirname(key)));
  });
});

// Scripts
gulp.task('vendorjs', ['download'], function() {
  return gulp.src(vendorjs)
    .pipe(gulp.dest(config.paths.vendorjs));
});

gulp.task('lint', function() {
  return gulp.src(config.paths.js)
             .pipe($.jshint())
             .pipe($.jshint.reporter('default'));
});

gulp.task('default', ['vendorjs', 'vendorcss']);
