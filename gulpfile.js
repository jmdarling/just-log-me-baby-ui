const babelify = require('babelify')
const browserify = require('browserify')
const gulp = require('gulp')
const connect = require('gulp-connect')
const sourcemaps = require('gulp-sourcemaps')
const buffer = require('vinyl-buffer')
const source = require('vinyl-source-stream')

gulp.task('copy-html', () => {
  gulp
    .src('./src/**/*.html')
    .pipe(gulp.dest('./bin'))
})

gulp.task('watch-html', ['copy-html'], () => {
  gulp.watch('./src/**/*.html', ['copy-html'])
})

gulp.task('build-scripts', () => {
  browserify('./src/app.js')
    .transform(babelify.configure({ presets: 'es2015' }))
    .bundle()
    .on('error', error => {
      console.error(error)
    })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./bin'))
})

gulp.task('watch-scripts', ['build-scripts'], () => {
  gulp.watch('./src/**/*.js', ['build-scripts'])
})

gulp.task('serve', () => {
  connect.server({
    devBaseUrl: 'http://localhost',
    port: 8182,
    root: './bin'
  })
})

gulp.task('build', ['copy-html', 'build-scripts'])

gulp.task('default', ['watch-html', 'watch-scripts', 'serve'])
