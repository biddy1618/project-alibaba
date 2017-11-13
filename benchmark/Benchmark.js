function Benchmark() {

}

Benchmark.prototype.scoreComponent = function(component) {
  var type = component.type
  var method = type + "Score"
  if (this[method]) {
    return this[method](component)
  } else {
    throw new Error("Cannot get the score of " + component.type)
  }
}

Benchmark.prototype.cpuScore = function(cpu) {
  return cpu.benchmark ? cpu.benchmark.score : 0
}

Benchmark.prototype.gpuScore = function(gpu) {
  return gpu.benchmark ? gpu.benchmark.score : 0
}

Benchmark.prototype.ramScore = function(ram) {
  return ram.benchmark ? ram.benchmark.writeSpeed : 0
}

Benchmark.prototype.motherboardScore = function(motherboad) {
  // TODO
  return 0
}

Benchmark.prototype.scoreComputer = function(score, price, budget) {
  var x = price / budget
  x = x == 1 ? 0.99 : x
  return score * Math.log(1 / Math.abs(1 - x))
}

module.exports = new Benchmark