 var bnr = require('client-require')
  , it = require('it-is')
  , files = {
      a:__dirname + '/examples/a.js'
    , b:__dirname + '/examples/b.js'
    , c:__dirname + '/examples/c.js' 
    }

exports ['require a'] = function (test){
  bnr('./a',__dirname + '/examples',function(err,src){
    it(err).equal(null)

    eval(src)

    it(b_require).function()
    
    var a = b_require('./a')
    
    it(a).property('a',it.function())
    it(a.a()).equal('HELLO1')
    test.done()
  })
}

exports ['require b'] = function (test){
  bnr('./b',__dirname + '/examples',function(err,src){
    it(err).equal(null)

    eval(src)

    it(b_require).function()
    
    var b = b_require('./b')
    
    it(b).has({
      a: it.function()
    , b: it.function()
    })
    it(b.a()).equal('HELLO1')
    it(b.b()).equal('BBBB')
    test.done()
  })
}

exports ['require c'] = function (test){
  bnr('./c',__dirname + '/examples',function(err,src){
    it(err).equal(null)

    eval(src)

    it(b_require).function()
    
    var c = b_require('./c')
    
    it(c).has({
      a: it.function()
    , b: it.function()
    , c: it.function()
    })

    it(c.a()).equal('HELLO1')
    it(c.b()).equal('BBBB')
    it(c.c()).like("only CC's be tasting like these")

    test.done()
  })
}

exports ['require from path'] = function (test){
  bnr('client-require/test/examples/c',__dirname,function(err,src){
    it(err).equal(null)
    
    eval(src)

    it(b_require).function()
    
    var c = b_require('client-require/test/examples/c')
    
    it(c).has({
      a: it.function().equal(c.a_module.a).equal(c.b_module.a)
    , b: it.function().equal(c.b_module.b)
    , c: it.function()
    })
    
    it(c.a()).equal('HELLO1')
    it(c.b()).equal('BBBB')
    it(c.c()).like("only CC's be tasting like these")
    
    test.done()
  })
}
