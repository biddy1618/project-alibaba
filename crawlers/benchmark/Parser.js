var fs = require('fs')

var cheerio = require('cheerio')

module.exports = function Parser () {
	this.parseRAM = function (filePath, cb) {
		fs.readFile(filePath, function (err, data) {
			if (err) {
				return cb(err)
			}

			var $ = cheerio.load(data)

			var results = $('#multicpu tbody tr:not(.repeated-header)').map(function (index, el) {
				var tds = $(this).children('td')

				var data = {
					name: tds.eq(0).text(),
					latency: tds.eq(1).text(),
					readSpeed: tds.eq(2).text(),
					writeSpeed: tds.eq(3).text()
				}

				// debug
				// console.log(data)
				// console.log('===========================')

				return data
			}).get()

			// debug
			// console.log('lenght: ' + results.length)
			cb(null, results)
		})
	}

	this.parseCPU = function (filePath, cb) {
		fs.readFile(filePath, function (err, data) {
			if (err) {
				return cb(err)
			}

			var $ = cheerio.load(data)

			var results = $('#cputable tbody tr:not(.tablesorter-childRow)').map(function (index, el) {
				var tds = $(this).children('td')

				var data = {
					name: tds.eq(0).text(),
					score: tds.eq(2).text(),
					category: tds.last().text()
				}

				// debug
				// console.log(data)
				// console.log('===========================')

				return data
			}).get()

			// debug
			// console.log('lenght: ' + results.length)
			cb(null, results)
		})
	}

	this.parseGPU = function (filePath, cb) {
		fs.readFile(filePath, function (err, data) {
			if (err) {
				return cb(err)
			}

			var $ = cheerio.load(data)

			var results = $('#cputable tbody tr:not(.repeated-header)').map(function (index, el) {
				var tds = $(this).children('td')

				var data = {
					name: tds.eq(0).text(),
					score: tds.eq(1).text(),
					rank: tds.eq(2).text()
				}

				// debug
				// console.log(data)
				// console.log('===========================')

				return data
			}).get()

			// debug
			// console.log('lenght: ' + results.length)
			cb(null, results)
		})
	}
}
