/*
how does this load into the browser?

wrapped inside a function ()?

bnr('/pathto/main/module')

... which returns exports... will be nice to test...

so i'll need a header... which creates module and the require function.

bnr(rel,path,function(err,src){
  eval(src)
  a = b_require('./a')

})

*/

var bnr = require('bnr')
  , it = require('it-is')
  , files = {
      a:__dirname + '/examples/a.js'
    , b:__dirname + '/examples/b.js'
    , c:__dirname + '/examples/c.js' 
    }
/*
function evalsToFunction (src){
  it(src).matches(/function\s*\(.*?\)\s*\{/gm)
  var func
  try{
    func = eval(src)
  } catch(err){
    var m = err.message
    err.message = 'attempting to eval:"' + actual.src + '", but got:"' + m + '"'
    throw err 
  }
  it(func).function()
}

function isModule(name){
  return function (actual){
    it(actual).has({
      filename: files[name]
    , resolves: {}
    , src: evalsToFunction
    })
  }
}
*/
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

    console.log('****************')
    console.log(src)
    console.log('****************')
    
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
  bnr('bnr/test/examples/c',__dirname,function(err,src){
    it(err).equal(null)

    console.log('****************')
    console.log(src)
    console.log('****************')
    
    eval(src)

    it(b_require).function()
    
    var c = b_require('bnr/test/examples/c')
    
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



/*
exports ['load dependencies a'] = function (test){
  
  scripts('./examples/a',__dirname,function (err,a){
    it(err).equal(null)
    var modules = {}
    modules[files.a] = isModule('a')

    it(a).has(modules)

    test.done()
  })
}
exports ['load dependencies b'] = function (test){
  
  scripts('./examples/b',__dirname,function (err,all){
    it(err).equal(null)
    var modules = {}
    modules[files.a] = isModule('a')
    modules[files.b] = isModule('b')

    it(all).has(modules)

    test.done()
  })

}

exports ['load dependencies c'] = function (test){
  
  scripts('./examples/c',__dirname,function (err,all){
    it(err).equal(null)
    var modules = {}
    modules[files.a] = isModule('a')
    modules[files.b] = isModule('b')
    modules[files.c] = isModule('c')

    it(all).has(modules)

    test.done()
  })
}
//*/

