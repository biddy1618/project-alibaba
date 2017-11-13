var restify = require('restify')

var Database = require('../database/Database')
var MaterielNetCrawlers = require('./MaterielNetCrawlers')

var crawlers = new MaterielNetCrawlers()

Database.open()
crawlers.crawl(function (err) {
  if (err) console.log(err)
  else console.log('All Crawlers ended!')
  exit()
})

process.on('SIGINT', function () {
  console.log('\nSIGINT (Ctrl+C), exiting...')
  exit()
})

function exit() {
  console.log('\nClosing database...')
  Database.close()
  process.exit(0)
}