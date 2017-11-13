var url = require('url')
var restify = require('restify')
var cheerio = require('cheerio')
var async = require('async')
var _ = require('underscore')
var Database = require('../database/Database')

function MaterielNetCrawler (builder, type, url, path, match) {
  this.defaults = this.defaults || {} // first call
  this.builder = builder
  this.type = type || this.defaults.type
  this.url = url || this.defaults.url
  this.path = path || this.defaults.path
  this.match = match || this.defaults.match
  this.score = this.defaults.score
}

MaterielNetCrawler.prototype.crawl = function (cb) {
  var self = this

  var client = restify.createStringClient({
    url: 'http://www.materiel.net'
  })

  async.waterfall([function (cb) {
    self.getUrls(client, cb)
  },
  function (urls, cb) {
    self.getHTMLs(client, urls, cb)
  },
  function (htmls, cb) {
    self.getProducts(client, htmls, cb)
  }], function (err, result) {
    if (err) {
      console.err(err)
    }

    var products = _.flatten(result)

    // Find corresponding benchmark entry before insert
    async.each(products, function (product, cb) {

      // Fetch benchmarkId for certain product type only
      if (self.score.fetch) {
        Database.findBenchmarkId(self.score.model, product.name, function (err, benchmarkId) {
          if (err) {
            cb(err)
            return
          }

          product.benchmarkId = benchmarkId
          cb(null, product)
        })
      } else {
        // Do not fetch benchmarkId
        cb(null, product)
      }
    }, function (err) {
      if (err) {
        cb(err)
        return
      }

      Database.insertProducts(products, function (err) {
        if (err) {
          cb(err)
          return
        }

        // debug
        // console.log('RESULT: ' + JSON.stringify(products))
        console.log(self.type, 'INSERT SUCCESS')
        cb()
      })
    })
  })
}

MaterielNetCrawler.prototype.getUrls = function(client, cb) {
  var self = this
  client.get(self.url, function (err, req, res, data) {
    if (err) {
      cb(err)
      return
    }
    var $ = cheerio.load(data)
    var urls = $(self.path).map(function (i, el) {
      var href = $(this).attr('href')

      // Note: href is a relative url
      return href.indexOf(self.match) != -1 ? href : null
    }).get()

    cb(null, urls)
  })
}

MaterielNetCrawler.prototype.getHTMLs = function(client, urls, cb) {
  // Get product listings
  async.map(urls, function (url, cb) {
    var ref = url.replace(/\//g, '')
    client.get('/request/ProdList.php?ref=' + ref + '&n=0', function (err, req, res, data) {
      console.log('FINISHED: ' + url)

      // TODO: convert charset, currently not utf8
      cb(null, data)
    })
  }, cb)
}

MaterielNetCrawler.prototype.getProducts = function(client, htmls, cb) {
  var self = this
  // Get product from product listing
  async.map(htmls, function (html, cb) {
    var $ = cheerio.load(html)

    // Find specs
    var spec = self.getSpec($('#Plc h2').text().trim())

    var $products = $('table.ProdList thead~tr').map(function() {
      return $(this)
    }).get()
    async.map($products, function ($product, cb) {
      // console.log("product", $product)
      var desc = $product.find('td.Desc td')
      var brand = desc.find('span.brand').text().trim()
      var title = desc.find('span.nomProduit').text().trim()
      var partialUrl = desc.children('a').attr('href').trim()

      var name = brand + ' ' + title
      var productUrl = url.resolve('http://www.materiel.net', partialUrl) // TODO: move base url to const (maybe?) or find other way
      var pictureUrl = $product.find('td.Photo img').attr('src').trim()
      var description = name + ' ' + desc.find('.Carac span:first-child').text().trim()
      var price = $product.find('td.Price span:first-child').text().trim()

      self.getProductSpec(client, productUrl, spec, function(spec) {
        var product = {
          description: description,
          merchant: 'materiel.net',
          name: name,
          pictureUrl: pictureUrl,
          price: price,
          productUrl: productUrl,
          spec: spec,
          type: self.type
        }

        // debug
        // console.log(product)
        cb(null, product)
      })
    }, cb)

  }, cb)
}

MaterielNetCrawler.prototype.getSpec = function(h2) {
  return null
}

MaterielNetCrawler.prototype.getProductSpec = function(client, productUrl, spec, cb) {
  cb(spec)
}

module.exports = MaterielNetCrawler

