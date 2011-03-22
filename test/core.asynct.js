var bnr = require('client-require')
  , it = require('it-is')
  , assert = require('assert')
  
exports ['load node core libs'] = function (test){

  bnr('assert',__dirname,function (err,src){
  
    it(err).equal(null)
    
    eval(src)
    
    var __assert = b_require('assert')
      , check = {}
    
    for(var key in assert){
      check[key] = it.function()    
    }
  
    //console.log(__assert)
    it(__assert).has(check)
    test.done()
  })

}
