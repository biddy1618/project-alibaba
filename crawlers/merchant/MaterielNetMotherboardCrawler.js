var cheerio = require('cheerio')
var MaterielNetCrawler = require('./MaterielNetCrawler')

function MaterielNetMotherboardCrawler() {
	this.defaults = {
		type: 'motherboard',
		url: '/cartes-meres/',
		path: 'table.CatSubTable td > a',
		match: 'carte-mere',
    score: {
      fetch: false,
      model: ''
    }
	}
	MaterielNetCrawler.apply(this, arguments)
}

MaterielNetMotherboardCrawler.prototype = new MaterielNetCrawler()

MaterielNetMotherboardCrawler.prototype.getProductSpec = function(client, url, spec, cb) {
  client.get(url, function (err, req, res, data) {
    var $ = cheerio.load(data)
    var $table = $("#ProdSectionDesc")

    // socket
    var socket = $table.find('tr td').filter(function() {
      return $(this).text().trim().match(/socket/i)
    }).next().text().trim()
    if (socket == '') {
      socket = $table.find('tr td').filter(function() {
        return $(this).text().trim().match(/processeurs support.s/i)
      }).next().text().trim().split(' ')[0]
    }
    var matches = socket.match(/socket (.*)/i)
    if (matches) {
      socket = matches[1]
    }

    // ram
    var ram = $table.find('tr td').filter(function() {
      return $(this).text().trim().match(/type de m.moire support.e/i)
    }).next().text().trim()

    // max ram
    var maxRam = $table.find('tr td').map(function() {
      var matches = $(this).text().trim().match(/capacit. (ram|ddr.) maximum/i)
      if (matches) {
        return [$(this), matches[1]]
      }
      return null
    })
    if (ram == '') {
      ram = maxRam[1]
    }
    maxRam = maxRam[0].next().text().trim()

    // frequence
    var frequences = $table.find('tr td').filter(function() {
      return $(this).text().trim().match(/fr.quences (.*|ddr. )support.es/i)
    }).next().text().trim()
    var pc
    frequences = frequences.replace(/^(\w{2})(.*)$/, function (match, p, freq) {
      pc = p
      return freq
    }).split('/').map(function (freq) {
      return pc + freq
    })

    // ram number
    var ramNumber = $table.find('tr td').filter(function() {
      return $(this).text().trim().match(/nombre de connecteurs/i)
    }).next().text().trim()

    var spec = {
      socket: socket,
      ram: ram,
      maxRam: maxRam,
      ramNumber: ramNumber,
      frequences: frequences
    }

    // debug
    // console.log(spec, url)

    cb(spec)
  })
}



module.exports = MaterielNetMotherboardCrawler
