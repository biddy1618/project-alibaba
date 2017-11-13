var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var request = require('request')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(require('stylus').middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/search', function(req, res, next) {
  search(req.query, function (results) {
    res.json({
      query: req.query,
      results: results
    })
  })
})

app.get('*', function(req, res, next) {
  res.render('index', { title: 'Alibaba' })
})

// app.get('*', function(req, res, next) {
//   res.redirect('/')
// })

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

// TODO: move this to another file or merge api with client
function search (query, cb) {
  request.get({
    url: 'http://localhost:8080/search',
    qs: query
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log(body) // debug
      cb(JSON.parse(body))
    }
  })
}


module.exports = app
