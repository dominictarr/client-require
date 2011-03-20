
var a = require('./a')
  , b = require('./b')
exports.a = a.a
exports.b = b.b
exports.c = function (){return 'only CC\'s be tasting like these'}
exports.a_module = a
exports.b_module = b

