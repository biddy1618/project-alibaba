var gulp = require('gulp')
var esformatter = require('gulp-esformatter')
var nodemon = require('gulp-nodemon')

gulp.task('default', ['watch'], function() {
  nodemon({
    script: 'server.js'
  })
})

gulp.task('jsformat', function() {
  gulp.src('**/*.js')
    .pipe(esformatter())
    .pipe(gulp.dest('./'))
})

gulp.task('watch', function() {
  gulp.watch('**/*.js', function(event) {
    // debug
    // console.log('File ' + event.path + ' was ' + event.type + ', running tasks...')

    gulp.src(event.path)
      .pipe(esformatter())
      .pipe(gulp.dest('./'))

  })
})
