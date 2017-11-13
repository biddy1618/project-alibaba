var fs = require('fs')
var util = require('util')

var restify = require('restify')

var Database = require('../database/Database')
var Parser = require('./Parser')

function Crawler () {

  this.interval = 1 * 24 * 60 * 60 * 1000 // one day
  this.timer // interal timer object

  var parser = new Parser()

  function crawlCPU () {
    var timestamp = new Date().getTime()
    var dirPath = 'download'
    var filePath = util.format('%s/%sCPU.html', dirPath, timestamp)

    var client = restify.createClient({
      url: 'http://www.cpubenchmark.net/CPU_mega_page.html'
    })

    fs.exists(dirPath, function (exists) {
      if (!exists) {
        fs.mkdirSync(dirPath)
      }

      var fileStream = fs.createWriteStream(filePath)

      var options = {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36'
      }

      console.log('crawlingCPU: ', filePath)

      client.get(options, function(err, req) {
        req.on('result', function(err, res) {
          res.setEncoding('utf8')
          res.pipe(fileStream)

          res.on('end', function () {
            console.log('THE END')
            fileStream.close()

            parser.parseCPU(filePath, function (err, results) {
              // delete file after use
              fs.unlink(filePath)

              Database.insertCPU(results, function (err, results) {
                if (err) {
                  return console.log('ERROR INSERTING CPU: ', err)
                }

                console.log('INSERT CPU SUCCESS')
              })
            })
          })
        })

      })
    })
  }

  function crawlGPU () {
    var timestamp = new Date().getTime()
    var dirPath = 'download'
    var filePath = util.format('%s/%sGPU.html', dirPath, timestamp)

    var client = restify.createClient({
      url: 'http://www.videocardbenchmark.net/gpu_list.php'
    })

    fs.exists(dirPath, function (exists) {
      if (!exists) {
        fs.mkdirSync(dirPath)
      }

      var fileStream = fs.createWriteStream(filePath)

      var options = {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36'
      }

      console.log('crawlingGPU: ', filePath)

      client.get(options, function(err, req) {
        req.on('result', function(err, res) {
          res.setEncoding('utf8')
          res.pipe(fileStream)

          res.on('end', function () {
            console.log('THE END')
            fileStream.close()

            parser.parseGPU(filePath, function (err, results) {
              // delete file after use
              fs.unlink(filePath)

              Database.insertGPU(results, function (err, results) {
                if (err) {
                  return console.log('ERROR INSERTING GPU: ', err)
                }

                console.log('INSERT GPU SUCCESS')
              })
            })
          })
        })

      })
    })
  }

  function crawlRAM () {
    var timestamp = new Date().getTime()
    var dirPath = 'download'
    var filePath = util.format('%s/%sRAM.html', dirPath, timestamp)

    var client = restify.createClient({
      url: 'http://www.memorybenchmark.net/ram_list.php'
    })

    fs.exists(dirPath, function (exists) {
      if (!exists) {
        fs.mkdirSync(dirPath)
      }

      var fileStream = fs.createWriteStream(filePath)

      var options = {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36'
      }

      console.log('crawlingRAM: ', filePath)

      client.get(options, function(err, req) {
        req.on('result', function(err, res) {
          res.setEncoding('utf8')
          res.pipe(fileStream)

          res.on('end', function () {
            console.log('THE END')
            fileStream.close()

            parser.parseRAM(filePath, function (err, results) {
              // delete file after use
              fs.unlink(filePath)

              Database.insertRAM(results, function (err, results) {
                if (err) {
                  return console.log('ERROR INSERTING RAM: ', err)
                }

                console.log('INSERT RAM SUCCESS')
              })
            })
          })
        })

      })
    })
  }

  this.start = function() {
    if (this.timer != null) {
      clearInterval(this.timer)
    } else {
      crawlCPU()
      crawlGPU()
      crawlRAM()
    }

    var self = this
    this.timer = setInterval(function () {
      crawlCPU()
      crawlGPU()
      crawlRAM()
    }, this.interval)
  }

}


Crawler.prototype.setInterval = function(interval) {
  this.interval = interval

  // timer started so we restart it
  if (this.timer != null) {
    this.start()
  }
}

module.exports = Crawler
