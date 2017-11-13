var Compatibility = require('../compatibility/Compatibility')
var Benchmark = require('../benchmark/Benchmark')

function MinMaxVariant(products) {
  // this.products = this.getTree(products)
  this.products = products
    // TODO: for debug
    /*this.products = {
      cpu: [{
        price: 250
      }, {
        price: 300
      }],
      motherboard: [{
        price: 120
      }, {
        price: 180
      }],
      gpu: [{
        price: 220
      }, {
        price: 190
      }, {
        price: 180
      }],
      ram: [{
        price: 80
      }, {
        price: 90
      }, {
        price: 60
      }, {
        price: 70
      }]
    }*/
}

MinMaxVariant.prototype.getBestMatches = function(options, cb) {
  // TODO: handle options, benchmark and compatibility
  var self = this
  var bestProducts = []
  var number = options.number
  var budget = parseInt(options.budget)
  var products = this.products
  var globalEvaluation
  var stable = false // true means that the prices stagnate
  function rec(arrayProducts, depth, product, bestProducts, previousComponents) {
    depth = (depth == undefined) ? arrayProducts.length - 1 : depth
    previousComponents = previousComponents ||  []
    var products = arrayProducts[arrayProducts.length - depth - 1]
    bestProducts = bestProducts || []
    product = product ||  {
      price: 0,
      score: 0
    }
    var key = products[0]
    products = products[1]
    products.every(function(component) {
      // check compatibility
      if (!Compatibility.compatible(previousComponents, component))
        return false
      var price = parseInt(component.price) // TODO: use a module to get the price and the currency
      var score = Benchmark.scoreComponent(component)
      product.price += price
      product.score += score
      product[key] = component
      previousComponents.push(component)
      if (depth > 0) {
        var ret = rec(arrayProducts, depth - 1, product, bestProducts, previousComponents)
        product = ret.product
        product.price -= price
        product.score -= score
        previousComponents.pop()
        globalEvaluation = ret.globalEvaluation
        bestProducts = ret.bestProducts
        stable = ret.stable
        if (stable) {
          return false
        }
      } else {
        var p = {
          cpu: product.cpu,
          motherboard: product.motherboard,
          gpu: product.gpu,
          ram: product.ram,
          price: product.price,
          score: product.score,
          normalizedScore: 0
        }
        p.score = Benchmark.scoreComputer(p.score, p.price, budget)
        product.price -= price
        product.score -= score
        previousComponents.pop()
        if (bestProducts.length < number) {
          bestProducts.push(p)
          bestProducts = self.sortByScore(bestProducts)
          self.display(bestProducts) // debug
        } else {
          if (globalScore < p.score) {
            bestProducts.splice(number - 1, 1)
            bestProducts.push(p)
            bestProducts = self.sortByScore(bestProducts)
            self.display(bestProducts) // debug
            if (self.checkStable(bestProducts, budget)) {
              console.log("STAGNATE")
              stable = true
              return false
            }
          }
        }
        self.incrementScore(bestProducts)
        globalScore = bestProducts[bestProducts.length - 1].score
        return true
      }
      return true
    })
    return {
      product: product,
      stable: stable,
      bestProducts: bestProducts
    }
    return true
  }
  try {
    var ret = rec([
      ['cpu', products.cpu],
      ['motherboard', products.motherboard],
      ['gpu', products.gpu],
      ['ram', products.ram]
    ])
    cb(null, ret.bestProducts)
  } catch (err) {
    cb(err)
  }
}

MinMaxVariant.prototype.incrementScore = function(products) {
  return products.map(function (product) {
    return product.normalizedScore + 0.1 // TODO
  })
}

MinMaxVariant.prototype.normalize = function(products) {
  var max = 0
  products.forEach(function (p) {
    max = max < p.score ? p.score : max
  })
  return products.map(function (p) {
    p.normalizedScore = p.score / max
    return p
  })
}

MinMaxVariant.prototype.sortByScore = function(products) {
  var normalized = this.normalize(products)
  // console.log(normalized)
  return normalized.sort(function(p1, p2) {
    if (Math.abs(p1.normalizedScore) < Math.abs(p2.normalizedScore)) return 1
    if (Math.abs(p1.normalizedScore) > Math.abs(p2.normalizedScore)) return -1
    return 0
  })
}

MinMaxVariant.prototype.sortByEstimation = function(products) {
  return products.sort(function(p1, p2) {
    if (Math.abs(p1.optimisticEvaluation) < Math.abs(p2.optimisticEvaluation)) return -1
    if (Math.abs(p1.optimisticEvaluation) > Math.abs(p2.optimisticEvaluation)) return 1
    return 0
  })
}

MinMaxVariant.prototype.checkStable = function(products) {
  return products.filter(function(product) {
    return product.normalizedScore <= 1
  }).length == 0
}

MinMaxVariant.prototype.display = function(products) {
  var filterPrice = []
  products.forEach(function(p) {
    filterPrice.push({
      price: p.price,
      normalizedScore: p.normalizedScore,
      score: p.score
    })
  })
  console.log(filterPrice)
}

module.exports = MinMaxVariant