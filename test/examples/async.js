exports.c = require('./c')
exports.c = require('./get_curry')

exports.load = function(req){
  return require(req)
}
