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
var depends = require('client-require').depends
  , scripts = require('client-require').scripts
  , it = require('it-is')


exports ['discover dependencies a'] = function (test){
 
  depends('./examples/a',__dirname,function (err,a){
    it(err).equal(null)
    it(a.modules).has([
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
    
    it(a.modules).has([
      { filename: __dirname + '/examples/a.js' }
    , { filename: __dirname + '/examples/b.js' }
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
    
    it(a.modules).has([
      { resolves: {}
      , filename: files.a }
    , { resolves: {'./a': files.a}
      , filename: files.b }
    , { resolves: {'./a': files.a, './b': files.b}
      , filename: files.c }
    ])

    test.done()
  })
}

exports ['discover dependencies from path'] = function (test){

  depends('client-require/test/examples/c',__dirname,function (err,c_path){
    it(err).equal(null)
    
    //files will be returned in topological sort order.
    
    var files = {
      a:__dirname + '/examples/a.js'
    , b:__dirname + '/examples/b.js'
    , c:__dirname + '/examples/c.js' 
    }
    
    it(c_path.modules).has([
      { resolves: {}
      , filename: files.a }
    , { resolves: {'./a': files.a}
      , filename: files.b }
    , { resolves: {'./a': files.a, './b': files.b}
      , filename: files.c }
    ])

//    console.log(c_path)

    test.done()
  })
}


exports ['error on module not found'] = function (test){

  depends('client-require/test/dslfvnsdlkfds',__dirname,function (err,data){
    it(data).equal(null)
    it(err).property('message',it.matches(/Cannot find module/))
       
    test.done()
  })
}


/*
okay, so I want to generate a javascript with all the dependencies
loaded appended & wrapped.

*/
