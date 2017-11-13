var async = require('async')
var MaterielNetBuilder = require('./MaterielNetBuilder')

function MaterielNetCrawlers () {

	this.crawl = function(crawlers, cb) {
    if (typeof crawlers == 'function') {
      cb = crawlers
      crawlers = undefined
    }
    crawlers = crawlers || Object.keys(MaterielNetBuilder.crawlers)
		async.each(crawlers, function(type, cb) {
      var crawler = MaterielNetBuilder.create(type)
      if (crawler != null) {
        crawler.crawl(cb)
      } else {
        console.error('There\'s no crawler \'' + type + '\'')
      }
		}, function(err) {
      if (err) {
        cb(err)
        return
      }
      cb()
    })
	}
}

module.exports = MaterielNetCrawlers