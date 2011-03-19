/*
okay,

so this is gonna load modules onto client side

discover dependencies,

wrap them all in a transport

stick them all in an object

module: function (require,module,exports,__filename,__dirname){
  //code...
}
*/
var depends = require('bnr').depends
  , scripts = require('bnr').scripts
  , it = require('it-is')


exports ['discover dependencies a'] = function (test){
  scripts('./examples/a',__dirname)
  
  depends('./examples/a',__dirname,function (err,a){
    it(err).equal(null)
    it(a).has([
      { /*resolve: './examples/a'
      , */filename: __dirname + '/examples/a.js' }
    ])

    test.done()
  })
}

exports ['discover dependencies b'] = function (test){

  depends('./examples/b',__dirname,function (err,a){
    it(err).equal(null)
    
    //files will be returned in topological sort order.
    
    it(a).has([
      { /*resolve: './examples/a'
      , */filename: __dirname + '/examples/a.js' }
    , { /*resolve: './examples/a'
      , */filename: __dirname + '/examples/b.js' }
    ])

    test.done()
  })
}

exports ['discover dependencies c'] = function (test){

  depends('./examples/c',__dirname,function (err,a){
    it(err).equal(null)
    
    //files will be returned in topological sort order.
    
    var files = {
      a:__dirname + '/examples/a.js'
    , b:__dirname + '/examples/b.js'
    , c:__dirname + '/examples/c.js' 
    }
    
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

/*
okay, so I want to generate a javascript with all the dependencies
loaded appended & wrapped.

*/
