var gulp = require('gulp');
var babel = require("gulp-babel");
var clean = require('gulp-clean');


const src = ["app/src/*js", "app/src/**/*js"];
const dist = "app/dist";

gulp.task("babel", function() {
  return gulp.src(src)
    .pipe(babel())
    .pipe(gulp.dest(dist));
})


gulp.task("clean-dist", function() {
  return gulp.src(dist, {read: false})
    .pipe(clean())
})
