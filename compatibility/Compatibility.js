function Compatibility() {

}

Compatibility.prototype.compatible = function(components, c2) {
  var self = this
  var compatible = true
  components.every(function (c1) {
    var type1 = c1.type
    var type2 = c2.type
    if (type1 == type2)
      return true
    var method = type1 + type2.ucfirst()
    if (self[method] && self[method](c1, c2)) {
      compatible = true
      return true
    } else {
      compatible = false
      return false
    }
    method = type2 + type1.ucfirst()
    if (self[method] && self[method](c1, c2)) {
      compatible = true
      return true
    } else {
      compatible = false
      return false
    }
    throw new Error("Cannot check for compatibility between " + type1 + " and " + type2)
  })
  return compatible
}

/**
 * Compatibility between cpu and motherboard
 * @param  {Object} c1 component 1
 * @param  {Object} c2 Component 2
 * @return {Boolean}    true if compatible
 */
Compatibility.prototype.cpuMotherboard = function(c1, c2) {
  return c1.spec && c2.spec && c1.spec.socket == c2.spec.socket
}

/**
 * Compatibility between cpu and gpu, cpu and ram, gpu and ram
 * @param  {Object} c1 component 1
 * @param  {Object} c2 Component 2
 * @return {Boolean}    true if compatible
 */
Compatibility.prototype.cpuGpu = Compatibility.prototype.cpuRam = Compatibility.prototype.gpuRam = function() {
  return true
}

/**
 * Compatibility between motherboard and ram
 * @param  {Object} c1 component 1
 * @param  {Object} c2 Component 2
 * @return {Boolean}    true if compatible
 */
Compatibility.prototype.motherboardRam = function(c1, c2) {
  var motherboard = c1.type == 'motherboard' ? c1 : c2
  var ram = c1.type == 'ram' ? c1 : c2
  return motherboard.spec && ram.spec && motherboard.spec.frequences.indexOf(this.pc(ram.spec.frequence)) != -1 && ram.spec.type == motherboard.spec.ram && ram.spec.ramNumber <= motherboard.spec.ramNumber
}

Compatibility.prototype.pc = function(frequence) {
  return frequence.replace(/^(PC.*?) .*$/, '$1')
}

/**
 * Compatibility between motherboard and gpu
 * @param  {Object} c1 component 1
 * @param  {Object} c2 Component 2
 * @return {Boolean}    true if compatible
 */
Compatibility.prototype.motherboardGpu = function(c1, c2) {
  // TODO
  return true
}


/**
 * Ucfirst like php
 * @return {String}
 * // TODO: move this method
 */
String.prototype.ucfirst = function() {
  return this.charAt(0).toUpperCase() + this.substr(1)
}

module.exports = new Compatibility