var creq = require('client-require')
  , it = require('it-is')
  , files = {
      a:__dirname + '/examples/a.js'
    , b:__dirname + '/examples/b.js'
    , c:__dirname + '/examples/c.js' 
    , async:__dirname + '/examples/async.js'
    }


exports ['can require more than one file'] = function (test){

  creq(['curry','./examples/c'],__dirname,function (err,src){
  
    it(err).equal(null)
    
    var req = eval(src)
  
    var curry = req('curry')
    
    it(curry).function()
    it(curry(curry)).function()
    
    var c = req('./examples/c')

    it(c).has({
      a: it.function()
    , b: it.function()
    , c: it.function()
    })

    test.done()
  
  })
}