
exports = module.exports = bnr
exports.depends = depends
exports.scripts = renderScript
exports.host = host

var spawn = require('child_process').spawn
  , exec = require('child_process').exec
  , join = require('path').join
  , fs = require('fs')
  , render = require('render')
  , header = require('./header')
  , qs = require('qs')

function indent(str){
  return ('' + str).trim().split('\n').map(function (e){return '  ' + e}).join('\n')
}

function depends(requests, relative, cb){
  if(!Array.isArray(requests))
    requests = [requests]
    
/*  requests = requests.map(function (request){
    return request[0] == '.'  
      ? request
      : request
  }).join(' ')*/

//  var json = ''
  var cmd = 
        [ //run child node with same version as this process.
          join(__dirname,'./load.js')
        , relative].concat(requests)

  console.log
  exec(process.execPath+ ' ' + cmd.join(' '), function (err,stdout,stderr){
    var obj = {}
//      , json = stdout.split('\n')

  //    json.pop() // blank 
    //  json = json.pop()
    json = stdout
    console.log(stdout)
    console.log(err)

    try {obj = JSON.parse(json)} catch(err) {obj.error = err}

    cb(err || obj.error,obj.success)
  })
}

function wrap(code,done){
  return eval('(function (require,module,exports,__filename,__dirname){\n'
     + indent(code.replace(/^#/,'//#'))
     + "\n});")
}


function renderScript (request,relative,cb){
  //var g = ctrl.group()
  
  depends(request,relative,function (err,deps){

    if(err)
      return cb(err)    
    var payload = {}
    deps.modules.forEach(function (e){

      payload[e.filename] = {
        closure: wrap(e.source)
      , resolves: e.resolves
      } 
    })
      deps.modules = payload
      deps.request = request
      deps.pwd = relative
      
      cb(err,deps)
  })
}
var Module = module.constructor


function nice (obj){

  return render(obj,{
      joiner:",\n  "
    , indent: '  '
    , padJoin: ['\n  ','\n']
    , surround: function (value,p,def){
        if('function' !== typeof p.value)
          return def(value,p)
        return p.value.toString()
      }  
    })

}
/*

function to load just code but not the header

*/

function prepare(load){
    var payloader = '__payload__'
    var payload = 
    Object.keys(load.modules).map(function (key){
      return 'registerModule(' + [
        key,load.modules[key].closure,load.modules[key].resolves
      ].map(nice).join(',\n') + ')\n'
    }).join('\n')

    delete load.modules
    var manifest = nice(load)

     return [
        '__manifest__ = ' + manifest 
      , payload
      , 'b_require = Header();'].join('\n')
}

function bnr (request, relative, cb) {
  renderScript(request, relative,function (err,load){
        cb(err
          , header.getHeaderScript()
          + '\n'
          + (load ? prepare(load) : null))
  })
}

function host (options){
  return function (req, res, next) {
    var query = qs.parse(req.url.split('?')[1]) || {}
      , require = query.require 
      ? query.require.split(',') 
      : options["default"]
      
    bnr(require, options.relative
        , function (err,src){

      if(err) throw err
      console.log(src)
      res.writeHead(200, {
//        'Last-Modified' : modified.toString(),
        'Content-Type' : 'text/javascript'
      })
      res.end(src);
   })
  }
}
