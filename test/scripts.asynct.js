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

var depends = require('bnr').depends
  , scripts = require('bnr').scripts
  , it = require('it-is')
  , files = {
      a:__dirname + '/examples/a.js'
    , b:__dirname + '/examples/b.js'
    , c:__dirname + '/examples/c.js' 
    }

function isModule(name){
  return function (actual){
    it(actual).has({
      resolves: {}
    , closure: it.function()
    })
  }
}

exports ['load dependencies a'] = function (test){
  
  scripts('./examples/a',__dirname,function (err,a){
    it(err).equal(null)
    var modules = {}
    modules[files.a] = isModule('a')

    it(a).has({
      main: files.a
    , request: './examples/a'
    , pwd: __dirname  
    , modules: modules
    })
    

    test.done()
  })
}
exports ['load dependencies b'] = function (test){
  
  scripts('./examples/b',__dirname,function (err,all){
    it(err).equal(null)
    var modules = {}
    modules[files.a] = isModule('a')
    modules[files.b] = isModule('b')

    it(all).has({
      main: files.b
    , request: './examples/b'
    , pwd: __dirname  
    , modules: modules
    })
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

    it(all).has({
      main: files.c
    , request: './examples/c'
    , pwd: __dirname  
    , modules: modules
    })
    test.done()
  })
}

