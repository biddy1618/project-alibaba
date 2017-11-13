var MaterielNetCPUCrawler = require('./MaterielNetCPUCrawler')
var MaterielNetGPUCrawler = require('./MaterielNetGPUCrawler')
var MaterielNetRAMCrawler = require('./MaterielNetRAMCrawler')
var MaterielNetMotherboardCrawler = require('./MaterielNetMotherboardCrawler')

function MaterielNetBuilder () {

	this.crawlers = {
		cpu: MaterielNetCPUCrawler,
    gpu: MaterielNetGPUCrawler,
    ram: MaterielNetRAMCrawler,
		motherboard: MaterielNetMotherboardCrawler
	}

	this.create = function(type) {
		if (this.crawlers.hasOwnProperty(type)) {
			var constructor = this.crawlers[type]
			arguments = Array.prototype.slice.call(arguments)
			var args = [this].concat(arguments)
			function Crawler() {
				return constructor.apply(this, args)
			}
			Crawler.prototype = constructor.prototype
			return new Crawler()
		}
		return null
	}
}

module.exports = new MaterielNetBuilder()