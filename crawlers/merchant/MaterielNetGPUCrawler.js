var MaterielNetCrawler = require('./MaterielNetCrawler')

function MaterielNetGPUCrawler() {
  this.defaults = {
    type: 'gpu',
    url: '/carte-graphique/',
    path: '#SfPH a',
    match: 'carte-graphique',
      score: {
        fetch: true,
        model: 'GPUModel'
      }
  }
  MaterielNetCrawler.apply(this, arguments)
}

MaterielNetGPUCrawler.prototype = new MaterielNetCrawler()
MaterielNetGPUCrawler.prototype.getSpec = function(h2) {
  var gpu = h2.match(/.*?cartes graphiques (.*)/i)
  if (gpu) {
    gpu = gpu[1]
  } else {
    gpu = ''
  }
  return { gpu: gpu }
}

module.exports = MaterielNetGPUCrawler
