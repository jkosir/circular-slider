var gulp = require('gulp');
var tsc = require('gulp-tsc');
var shell = require('gulp-shell');
var gulpCopy = require('gulp-copy');
var livereload = require('gulp-livereload');
var tslint = require('gulp-tslint');
var inject = require('gulp-inject');
var es = require('event-stream');
var webserver = require('gulp-webserver');

var paths = {
  tscripts: {
    src: ['app/src/**/*.ts'],
    dest: 'app/build'
  },
  all_src: 'app/src/**/*.*'
};

gulp.task('default', ['build', 'copycss', 'webserver', 'watch']);

// ** Running ** //


// ** Watching ** //

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(paths.all_src, ['build']);
});

// ** Compilation ** //

gulp.task('copycss', function () {
  return gulp.src(['./app/src/**/*.css']).pipe(gulpCopy('./app/build/', {prefix: 2}));
});

gulp.task('build', function () {

  var ts = gulp
    .src(paths.tscripts.src)
    .pipe(tsc({
      module: "commonjs",
      emitError: false
    }));

  var css = gulp.src(['./app/src/**/*.css'], {read: false});

  return gulp.src('./app/src/index.html')
    .pipe(inject(es.merge(ts, css), {cwd: __dirname + '/app/src'}))
    .pipe(gulp.dest('./app/build'))
    .pipe(livereload());
});

// ** Linting ** //

gulp.task('lint', ['lint:default']);
gulp.task('lint:default', function () {
  return gulp.src(paths.tscripts.src)
    .pipe(tslint())
    .pipe(tslint.report('prose', {
      emitError: false
    }));
});

/* Server */

gulp.task('webserver', function () {
  gulp.src('./app/build')
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});
