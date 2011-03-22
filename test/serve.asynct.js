
var http = require('http')
  , creq = require('client-require')
  , request = require('request')
  , it = require('it-is')
  , port = 43759
  , server = http.createServer(creq.host({"default": './examples/c',relative: __dirname}))

exports.__setup = function (test){
  server.listen(port,test.done)
}

exports ['serve a default .js'] = function (test){

  request({uri: 'http://localhost:' + port}, function (err,res,body){
    it(err).equal(null)
  
    var req = eval(body)
    
    var c = req('./examples/c')
    it(c.c()).like("only cc's be tasting like these")

    test.done()
  })
}

exports.__teardown = function (test){
  server.close()  
}

exports ['serve .js dynamicially'] = function (test){

  //this is a new file, so will have to load it especially...

  request({uri: 'http://localhost:' + port + '?require=curry'}, function (err,res,body){
    it(err).equal(null)
  
    var req = eval(body)
      , curry = req('curry')
    it(curry).function()
    it(curry(curry)).function()

    test.done()
  })
}


exports ['serve .js dynamicially'] = function (test){

  //this is a new file, so will have to load it especially...

  request({uri: 'http://localhost:' + port + '?require=curry,qs'}, function (err,res,body){
    it(err).equal(null)
    var req = eval(body)
      , curry = req('curry')
    it(curry).function()
    it(curry(curry)).function()

    test.done()
  })
}
