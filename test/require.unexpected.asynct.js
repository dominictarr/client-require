var bnr = require('bnr')
  , it = require('it-is')
  , files = {
      a:__dirname + '/examples/a.js'
    , b:__dirname + '/examples/b.js'
    , c:__dirname + '/examples/c.js' 
    , async:__dirname + '/examples/async.js'
    }

exports ['load relative file not in resolves list'] = function (test){
//i'll probably ditch the resolves list soon anyway!
  bnr('./examples/async',__dirname,function(err,src){
    it(err).equal(null)
    eval(src)
    
    var main = b_require()
    
    it(main.c.c()).like("only cc's be tasting like these")
    var a = main.load('./a')
    it(a).ok()
    
    test.done()
  })
}

exports ['load path file not in resolves list'] = function (test){
//i'll probably ditch the resolves list soon anyway!
  bnr('./examples/async',__dirname,function(err,src){
    it(err).equal(null)
    eval(src)
    
    var main = b_require()
    
    it(main.c.c()).like("only cc's be tasting like these")
    var a = main.load('bnr/test/examples/a')
    it(a).ok()
    
    test.done()
  })
}
/*

//this behavious is not yet supported.
exports ['load npm package not in resolves list'] = function (test){
//i'll probably ditch the resolves list soon anyway!
  bnr('./examples/async',__dirname,function(err,src){
    it(err).equal(null)
    eval(src)
    
    var main = b_require()
    
    it(main.c.c()).like("only cc's be tasting like these")
    var a = main.load('curry')
    it(a).ok()
    
    test.done()
  })
}*/
