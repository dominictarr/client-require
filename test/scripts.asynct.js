/*
*/
var depends = require('bnr').depends
  , scripts = require('bnr').scripts
  , it = require('it-is')
  , files = {
      a:__dirname + '/examples/a.js'
    , b:__dirname + '/examples/b.js'
    , c:__dirname + '/examples/c.js' 
    }

exports ['discover dependencies a'] = function (test){
  scripts('./examples/a',__dirname)
  
  scripts('./examples/a',__dirname,function (err,a){
    it(err).equal(null)
    it(a).has([
      { /*resolve: './examples/a'
      , */filename: __dirname + '/examples/a.js' }
    ])

    test.done()
  })
}
/*
exports ['discover dependencies b'] = function (test){

  depends('./examples/b',__dirname,function (err,a){
    it(err).equal(null)
    
    //files will be returned in topological sort order.
    
    it(a).has([
    ])

    test.done()
  })
}

exports ['discover dependencies c'] = function (test){

  depends('./examples/c',__dirname,function (err,a){
    it(err).equal(null)
    
    //files will be returned in topological sort order.
    
    it(a).has([
      { resolves: {}
      , filename: files.a }
    , { resolves: {'./a': files.a}
      , filename: files.b }
    , { resolves: {'./b': files.b}
      , filename: files.c }
    ])

    test.done()
  })
}

//*/
