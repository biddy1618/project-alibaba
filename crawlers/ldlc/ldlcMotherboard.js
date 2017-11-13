// import modules
var Database = require('../database/Database')
var restify = require('restify')
var cheerio = require('cheerio')
var async = require('async')

// declaring constants
var PAGEENDING = 'e48t7o0a1.html' // ending of every page is same
var URL = 'http://www.ldlc.com'
var TYPE = 'motherboard'

// main function
// crawl(name: String, page: Int) -> no return
// crawl every single page recursively
var crawlMotherboard = function(name, page) {
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
				var SOCKET, RAM, MAXRAM, DESCRIPTION = dataIns.name
				var FREQUENCES = []
				$('#productParametersList').children().each(function(i, element) {
					if ($(this).children().eq(0).text().trim() === 'Support du processeur') {
						SOCKET = $(this).children().eq(1).text().trim()
					}else if ($(this).children().eq(0).text().trim() === 'Fréquence(s) Mémoire') {
						$(this).children().eq(1).text().trim().split(',').forEach(
							function(e, i, f) {
								FREQUENCES.push(e.trim())
							})
					}else if ($(this).children().eq(0).text().trim() === 'Type de mémoire') {
						RAM = $(this).children().eq(1).text().trim()
					}else if ($(this).children().eq(0).text().trim() === 'Capacité maximale de RAM') {
						MAXRAM = $(this).children().eq(1).text().trim()
					}else if ($(this).children().eq(0).text().trim() === 'Connecteurs Disques') {
						DESCRIPTION += ' ' + $(this).children().eq(1).text().trim()
					}
				})
				var PICTUREURL = $('#ctl00_cphMainContent_ImgProduct').attr('src')
				dataIns.spec.socket = SOCKET
				dataIns.spec.ram = RAM
				dataIns.spec.maxRam = MAXRAM
				dataIns.spec.frequences = FREQUENCES
				dataIns.pictureUrl = PICTUREURL
				dataIns.description = DESCRIPTION
				// find benchmarkId
				async.series([function(cb) {
					Database.findBenchmarkId('GPUModel', dataIns.name, function(err, id) {
						if (err) { cb(err, null)
						}else { cb(null, id)} })
				}], function(err, benchmarkId) {
					if (err) {
						console.log(error)
					}else {
						if (benchmarkId[0] === null) {
							console.log('No corresponding product found')
						}else{
							dataIns.benchmarkId = benchmarkId[0]
							// console.log(dataIns) - will look like
							/*
							{
								name: 'SuperMicro MBD-X9SCM-F-O (Intel C204)',
  								price: '229€95',
  								productUrl: 'http://www.ldlc.com/fiche/PB00124759.html',
  								merchant: 'http://www.ldlc.com',
  								spec:
   								{
   									socket: 'Intel 1155',
     								ram: 'DDR3 ECC',
     								maxRam: '32 Go',
     								frequences: [
     									'PC3-8500 - DDR3 1066 MHz',
        								'PC3-10600 - DDR3 1333 MHz',
        								'PC3-6400 - DDR3 800 MHz'
        							]
        						},
  								type: 'motherboard',
  								pictureUrl: 'http://media.ldlc.com/ld/products/00/00/99/95/LD0000999530_1.jpg',
  								description: 'SuperMicro MBD-X9SCM-F-O (Intel C204) 4 x Serial ATA 3Gb/s (SATA II), 2 x Serial ATA 6Gb/s (SATA Revision 3.0)',
								benchmarkId: 554e2d81fccd64456a4447d9
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
		crawlMotherboard(name, ++page)
	})
}

module.exports = crawlMotherboard
