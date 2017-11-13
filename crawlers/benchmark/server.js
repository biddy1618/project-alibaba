var restify = require('restify')

var Database = require('../database/Database')
var Crawler = require('./Crawler')


var crawler = new Crawler()

Database.open()
crawler.start()

process.on('SIGINT', function () {
  console.log('\nSIGINT (Ctrl+C), exiting...')

  console.log('\nClosing database...')
  Database.close()

  process.exit(0)
})
