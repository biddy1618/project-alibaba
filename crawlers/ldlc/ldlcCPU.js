// import modules
var Database = require('../database/Database')
var restify = require('restify')
var cheerio = require('cheerio')
var async = require('async')

// declaring constants
var PAGEENDING = 'e48t7o0a1.html' // ending of every page is same
var URL = 'http://www.ldlc.com'
var TYPE = 'cpu'

// main function
// crawl(name: String, page: Int) -> no return
// crawl every single page recursively
var crawlCPU = function(name, page) {
	var client = restify.createStringClient({
		url: URL
	})
	// check if page argument is given
	// if not given than it means it is the first page
	// otherwise set the page url accordingly with page
	if (page !== undefined) {
		var pageUrl = name + 'p' + page.toString() + PAGEENDING
	}else {
		var pageUrl = name
		page = 1
	}
	// get the page
	client.get(pageUrl, function(err, req, res, data) {
		// if error then show
		if (err) {
			console.log(err)
		}
		// this is one is used to check whether the previous page was last
		// if the previous page was last one, then current one shoul return
		// status code different than 200, thus return
		if (res.statusCode !== 200) {
			return
		}
		var $ = cheerio.load(data)
		// collect objects here for insertion
		var insertObjects = []
		// for every single CPU in the page
		$('.cmp').not('.groupWrapper').map(function(ind, el) {
			// url of single CPU in page
			var url = $(this).find('.designation .nom').attr('href')
			// insert object
			var dataIns = {
				name: $(this).find('.designation .nom').text(),
				price: $(this).find('.prix .price').text(),
				productUrl: url,
				merchant: URL,
				spec: {},
				type: TYPE,
				description: $(this).find('.designation .nom').text()
			}
			// for every CPU url in page, create client, so that
			// we can get picture and socket type
			client.get(url.slice(19), function(err, req, res, data) {
				// if error then show
				if (err) {
					console.log(err)
				}
				var $ = cheerio.load(data)
				var SOCKET, DESCRIPTION = dataIns.name
				$('#productParametersList').children().each(function(i, element) {
					if ($(this).children().eq(0).text().trim() === 'Support du processeur') {
						SOCKET = $(this).children().eq(1).text().trim()
					}else if ($(this).children().eq(0).text().trim() === 'Nom du core') {
						DESCRIPTION += ', ' + $(this).children().eq(1).text().trim()
					}else if ($(this).children().eq(0).text().trim() === 'Chipset graphique') {
						DESCRIPTION += ', ' + $(this).children().eq(1).text().trim()
					}else if ($(this).children().eq(0).text().trim() === 'Fréquence du chipset') {
						DESCRIPTION += ', ' + $(this).children().eq(1).text().trim()
					}
				})
				var PICTUREURL = $('#ctl00_cphMainContent_ImgProduct').attr('src')
				dataIns.spec.socket = SOCKET
				dataIns.pictureUrl = PICTUREURL
				dataIns.description = DESCRIPTION
				// find benchmarkId
				async.series([function(cb) {
					Database.findBenchmarkId('CPUModel', dataIns.name, function(err, id) {
						if (err) { cb(err, null)
						}else { cb(null, id)} })
				}], function(err, benchmarkId) {
					if (err) {
						console.log(error)
					}else {
						if (benchmarkId[0] === null){
							console.log('No corresponding product found')
						}else{
							dataIns.benchmarkId = benchmarkId[0]
							// console.log(dataIns) - will look like
							/*
							{
								name: 'Intel Xeon E5-2643 v2 (3.5 GHz)',
  								price: '1 714€95',
  								productUrl: 'http://www.ldlc.com/fiche/PB00181714.html',
  								merchant: 'http://www.ldlc.com',
  								spec: {
	  								socket: 'Intel 2011'
  								},
  								type: 'cpu',
  								pictureUrl: 'http://media.ldlc.com/ld/products/00/01/37/06/LD0001370681_1_0002829114.jpg',
  								description: 'Intel Xeon E5-2640 v3 (2.6 GHz), Haswell-E',
  								benchmarkId: 554e2d86fccd64456a4451dd
  							}
  							*/
  							insertObjects.push(dataIns)
  							// insert one object as an array
  							Database.insertProducts(insertObjects, function(err) {
  								if (err) {
  									console.log(err)
  								}
  							})
						}
					}
				})

			})
		})
		// recursively call with next page as parameter
		crawlCPU(name, ++page)
	})
}

module.exports = crawlCPU
