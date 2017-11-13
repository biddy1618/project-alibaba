var MaterielNetCrawler = require('./MaterielNetCrawler')

function MaterielNetCPUCrawler() {
  this.defaults = {
    type: 'cpu',
    url: '/processeurs-pc/',
    path: 'table.CatSubTable td > a',
    match: 'processeur',
      score: {
        fetch: true,
        model: 'CPUModel'
      }
  }
  MaterielNetCrawler.apply(this, arguments)
}

MaterielNetCPUCrawler.prototype = new MaterielNetCrawler()
MaterielNetCPUCrawler.prototype.getSpec = function(h2) {
  var socket = h2.match(/.*?socket (.*)/i)
  if (socket) {
    socket = socket[1]
  } else {
    socket = ''
  }
  return { socket: socket }
}

module.exports = MaterielNetCPUCrawler
