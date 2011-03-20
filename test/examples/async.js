exports.c = require('./c')
//exports.curry = require('./get_curry') //stuff not yet supported
exports.curry = require('curry') //stuff not yet supported

exports.load = function(req){
  return require(req)
}
