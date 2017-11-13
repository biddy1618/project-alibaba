// import modules
var Database = require('../database/Database')
var restify = require('restify')
var cheerio = require('cheerio')
var async = require('async')

// declaring constants
var PAGEENDING = 'e48t7o0a1.html' // ending of every page is same
var URL = 'http://www.ldlc.com'
var TYPE = 'ram'

// main function
// crawl(name: String, page: Int) -> no return
// crawl every single page recursively
var crawlRAM = function(name, page) {
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
				type: TYPE
			}
			// for every CPU url in page, create client, so that
			// we can get picture and socket type
			client.get(url.slice(19), function(err, req, res, data) {
				// if error then show
				if (err) {
					console.log(err)
				}
				var $ = cheerio.load(data)
				var TYPE, FREQUENCY, DESCRIPTION = dataIns.name
				$('#productParametersList').children().each(function(i, element) {
				 	if ($(this).children().eq(0).text().trim() === 'Type de mémoire') {
						TYPE = $(this).children().eq(1).text().trim()
					}else if ($(this).children().eq(0).text().trim() === 'Fréquence(s) Mémoire') {
						FREQUENCY = $(this).children().eq(1).text().trim()
					}else if ($(this).children().eq(0).text().trim() === 'Spécification mémoire') {
						DESCRIPTION += ', ' + $(this).children().eq(1).text().trim()
					}
				})
				var PICTUREURL = $('#ctl00_cphMainContent_ImgProduct').attr('src')
				dataIns.spec.frequence = FREQUENCY
				dataIns.spec.type = TYPE
				dataIns.pictureUrl = PICTUREURL
				dataIns.description = DESCRIPTION
				// find benchmarkId
				async.series([function(cb) {
					Database.findBenchmarkId('RAMModel', dataIns.name, function(err, id) {
						if (err) { cb(err, null)
						}else { cb(null, id)} })
				}], function(err, benchmarkId) {
					if (err) {
						console.log(error)
					}else {
						if (benchmarkId[0] === null) {
							console.log('No corresponding products found')
						}else {
							dataIns.benchmarkId = benchmarkId[0]
							// console.log(dataIns) - will look like
							/*
							{
								name: 'Kingston ValueRAM SO-DIMM 8 Go DDR3L 1600 MHz ECC CL11',
						  		price: '121€15',
						  		productUrl: 'http://www.ldlc.com/fiche/PB00152885.html',
						  		merchant: 'http://www.ldlc.com',
						  		spec: {
							  		frequence: 'PC3-12800 - DDR3 1600 MHz',
							  		type: 'DDR3 ECC'
						  		},
						  		type: 'ram',
						  		pictureUrl: 'http://media.ldlc.com/ld/products/00/01/34/69/LD0001346946_1_0001346956_0001347041_0001356034.jpg',
						  		benchmarkId: 554e2d87fccd64456a44555a
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
		crawlRAM(name, ++page)
	})
}

module.exports = crawlRAM
