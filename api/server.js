var restify = require('restify')
var Database = require('../crawlers/database/Database')
var MinMaxVariant = require('../algos/MinMaxVariant')

function respond(req, res, next) {
  res.send('hello ' + req.params.name)
  next()
}

var server = restify.createServer()
server.use(restify.queryParser())

/**
 * /search?type= (gaming|graphic|standard) &budget= int &tolerance= int &merchants=[]
 */
server.get('/search', function (req, res, next) {
  var start = new Date().getTime()
  if (!req.query) {
    return next(new Error('No query found.'));
  }
  Database.open()

  var options = {
    budget: req.query.budget || 700,// TODO: replace by average budget
    merchants: req.query.merchants || [], // TODO: replace by all merchants
    number: 3,
    tolerance: req.query.tolerance || 10,
    type: req.query.type || 'standard'
  }

  findBestMatches(options, function (err, results) {
    if (err) {
      console.log(err)
      res.status(500)
      res.send(err)
      Database.close()
      return
    }

    console.log("Finished: %s ms", (new Date().getTime() - start))

    res.json(results);

    Database.close()

    next();
  })
});

function findBestMatches (options, cb) {
  var err = null;
  var results = [];

  // compute
  // fetch data from the database
  Database.select(options, function(err, products) {
    if (err) {
      // Fail
      cb(err)
      return
    }
    // classify the products in each category
    // console.log("productsServ", products)
    products = Database.classify(products)
    if (products == null) {
      cb(new Error('Classification error'))
      return
    }
    var minMaxAlgo = new MinMaxVariant(products)
    minMaxAlgo.getBestMatches(options, function(err, bestProducts) {
      if (err) {
        // Fail
        cb(err)
        return
      }
      // console.log(bestProducts)
      // Success
      cb(null, bestProducts)
    })
  })
}

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
})

// for errors
server.on('uncaughtException', function (req, res, route, err) {
    console.error(err.stack)
})
