var cheerio = require('cheerio')
var MaterielNetCrawler = require('./MaterielNetCrawler')

function MaterielNetRAMCrawler() {
  this.defaults = {
    type: 'ram',
    url: '/barrettes-memoire-pc-ordinateurs-et-serveurs/',
    path: 'table.CatSubTable td > a',
    match: 'barrette-memoire',
    score: {
      fetch: true,
      model: 'RAMModel'
    }
  }
  MaterielNetCrawler.apply(this, arguments)
}

MaterielNetRAMCrawler.prototype = new MaterielNetCrawler()

MaterielNetRAMCrawler.prototype.getProductSpec = function(client, url, spec, cb) {
  client.get(url, function (err, req, res, data) {
    if (err) {
      cb(err)
      return
    }

    var $ = cheerio.load(data)
    var $table = $("#ProdSectionDesc")

    var type = $table.find('tr td').filter(function() {
      return $(this).text().trim().match(/type/i)
    }).next().text().trim()

    var frequence = $table.find('tr td').filter(function() {
      return $(this).text().trim().match(/fr.quence/i)
    }).next().text().trim()

    var ramNumber = $table.find('tr td').filter(function() {
      return $(this).text().trim().match(/nombre de barrettes/i)
    }).next().text().trim()

    cb({
      type: type,
      frequence: frequence,
      ramNumber: ramNumber
    })
  })
}

module.exports = MaterielNetRAMCrawler
