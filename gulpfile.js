const gulp = require('gulp')
const babel = require('gulp-babel')
const clean = require('gulp-clean')

const paths = {
  src: 'src/**',
  dist: 'app/js/'
}

gulp.task('babel', [], () => {
  return gulp.src(paths.src)
    .pipe(babel())
    .pipe(gulp.dest(paths.dist))
})

// No console output, no comments
gulp.task('babel:prod', ['clean-scripts'], () => {
  return gulp.src(paths.src)
    .pipe(babel({ comments: false, plugins: ['transform-es2015-modules-commonjs', 'transform-remove-console']}))
    .pipe(gulp.dest(paths.dist))
})

gulp.task('clean-scripts', () => {
  return gulp.src(paths.dist, {read: false})
    .pipe(clean())
})

gulp.task('build:win', () => {

})