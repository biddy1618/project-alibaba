var mongoose = require('mongoose')
var async = require('async')

var CPUSchema = mongoose.Schema({
	name: {type: String, unique : true},
	score: Number,
	category: String
})
CPUSchema.index({name: 'text'})

var GPUSchema = mongoose.Schema({
	name: {type: String, unique : true},
	score: Number,
	rank: Number
})
GPUSchema.index({name: 'text'})

var RAMSchema = mongoose.Schema({
	name: {type: String, unique : true},
	latency: Number,
	readSpeed: Number,
	writeSpeed: Number
})
RAMSchema.index({name: 'text'})

var ProductSchema = mongoose.Schema({
	benchmarkId: {type: mongoose.Schema.ObjectId, required: true},
	description: String,
	merchant: {type: String, required: true},
	name: {type: String, required: true},
	pictureUrl: String,
	price: {type: String, required: true},
	productUrl: {type: String, required: true, unique: true},
	spec: {type: mongoose.Schema.Types.Mixed},
	type: {type: String, required: true}
})

function Database () {
	var self = this

	this.models = {
		CPUModel: mongoose.model('CPUModel', CPUSchema),
		GPUModel: mongoose.model('GPUModel', GPUSchema),
		RAMModel: mongoose.model('RAMModel', RAMSchema),
		ProductModel: mongoose.model('ProductModel', ProductSchema)
	}

	this.typeModel = {
		cpu: 'CPUModel',
		gpu: 'GPUModel',
		ram: 'RAMModel',
		motherboard: 'MotherboardModel'
	}

	this.open = function () {
		mongoose.connect('mongodb://localhost/alibaba');
	}

	this.close = function () {
		mongoose.disconnect()
	}

	this.insertCPU = function (cpus, cb) {
		async.each(cpus, function (el, cb) {
			var promise = self.models.CPUModel.update({name: el.name}, el, {upsert: true})
			promise.then(function () {
				cb(null)
			}, function (err) {
				cb(err)
			})
		}, cb)
	}

	this.insertGPU = function (gpus, cb) {
		async.each(gpus, function (el, cb) {
			var promise = self.models.GPUModel.update({name: el.name}, el, {upsert: true})
			promise.then(function () {
				cb(null)
			}, function (err) {
				cb(err)
			})
		}, cb)
	}

	this.insertRAM = function (rams, cb) {
		async.each(rams, function (el, cb) {
			var promise = self.models.RAMModel.update({name: el.name}, el, {upsert: true})
			promise.then(function () {
				cb(null)
			}, function (err) {
				cb(err)
			})
		}, cb)
	}


	this.insertProducts = function (products, cb) {
		async.each(products, function (el, cb) {
			var promise = self.models.ProductModel.update({productUrl: el.productUrl}, el, {upsert: true})
			promise.then(function () {
				cb(null)
			}, function (err) {
				cb(err)
			})

		}, cb)
	}

	this.findBenchmarkId = function (modelName, name, cb) {
		if (!this.models.hasOwnProperty(modelName)) {
			cb(new Error('Model doesn\'t exist'))
			return
		}

		this.models[modelName].findOne({$text:{$search: name}},{textScore:{$meta:'textScore'}})
		.sort({textScore:{$meta:'textScore'}})
		// .limit(3)
		.exec(function (err, benchmark) {
      if (err) {
        cb(err)
        return
      }

      if (!benchmark) {
        cb(null, null)
        return
      }

      // debug
      console.log('----------')
      console.log(benchmark)
      console.log('$seaarch:', name, 'benchmark._id:', benchmark._id)
      cb(null, benchmark._id)
    })
  }

	// TODO: Test this function
	this.select = function(options, cb) {
		var self = this
		// select from ProductModel
		async.waterfall([function (cb) {
			self.models.ProductModel.find({/* merchant: { $in: options.merchants } */}, function(err, products) {
				if (err) {
					cb(err)
					return
				}
        cb(null, products)
      })
    },
    function (products, cb) {
      // select from CPUModel and the other benchmark models
      // joining benchmarkId
      async.each(products, function(product, cb) {
        self.findBenchmark({id: product.benchmarkId, type: product.type}, function(err, benchmark) {
          if (err) {
            cb()
            return
          }
          // TODO: insertion of benchmark not working
          product.benchmark = benchmark
          // console.log(benchmark)
          cb()
        })
      }, function (err) {
        // console.log("products", products)
        cb(err, products)
      })
    }], function (err, products) {
      // console.log("products2", products)
      cb(err, products)
    })
  }

  // TODO: Test this function
  this.findBenchmark = function(options, cb) {
    var id = options.id
    var type = options.type
    if (this.typeModel.hasOwnProperty(type)) {
      var keyModel = this.typeModel[type]
      if (this.models.hasOwnProperty(keyModel)) {
        this.models[keyModel].findById(id, function (err, benchmark) {
          if (err) {
            cb(err)
            return
          }
          // console.log(benchmark)
					cb(null, benchmark)
				})
			} else {
				cb(new Error('Key not found!'))
			}
		} else {
			cb(new Error('Model not found!'))
		}
	}

  // TODO: Test this function
  this.classify = function(products) {
    var array = []
    if (!Object.prototype.toString.call(products).match(/array/i))
      return null
    async.each(products, function(product, cb) {
      if (!array.hasOwnProperty(product.type)) {
        array[product.type] = []
      }
      array[product.type].push(product)
      cb()
    },
    function(err) {
      if (err) {
        array = null
      }
    })
    return array
  }
}

module.exports = new Database()
