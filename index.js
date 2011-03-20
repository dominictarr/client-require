
exports = module.exports = bnr
exports.depends = depends
exports.scripts = renderScript

var exec = require('child_process').exec
  , join = require('path').join
  , ctrl = require('ctrlflow')
  , fs = require('fs')
  , render = require('render')

function indent(str){
  return ('' + str).trim().split('\n').map(function (e){return '  ' + e}).join('\n')
}

function depends(request, relative, cb){
  var json = ''
  var cmd = 
        [ 'node'
        , join(__dirname,'./load.js')
        , request[0] == '.'  
          ? join(relative,request) 
          : request
        ].join(' ')

  exec(cmd,function (err,stdout,stderr){
    var obj = {}
    /*console.log('*************************')
    console.log(err)
    console.log('*************************')
    console.log(stdout)
    console.log('*************************')
    console.log(stderr)
    console.log('*************************')
    */
    try {obj = JSON.parse(stdout)} catch(err) {obj.error = err}
    cb(err || obj.error,obj.success)
  })
}

function wrap(code,done){
  return eval('(function (require,module,exports,__filename,__dirname){\n'
     + indent(code)
     + "\n});")
}


function renderScript (request,relative,cb){
  var g = ctrl.group()
  
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

function Header (payload,req,rel){
  /*
  some simple changes to make nodejs code feel more at home in the browser.
  */
  if(!this.process)
    this.process = {
      EventEmitter: function EventEmitter(){}
    , nextTick: function (f){return setTimeout(f,0)}
    , title: 'browser'
    , versions: {}
    }
  if(!this.Buffer){
    this.Buffer = Buffer
    
    function Buffer(){}
     
    Buffer.isBuffer = function (){return false}    
  }
  if(this.navigator){
    this.navigator.userAgent
      .split(/\s+\(.*?\)\s+|\s/)
      .forEach(function (e){ 
        var v =/(\w+)\/([\d|.]+)/(e)
        process.versions[v[1]] = v[2]
      })
  }
  var cache = {}
 
  function b_require (req,parent){

    var fn
    if(!parent) {
      fn = payload.main
    } else
      fn = parent.resolves[req]
  
    if(cache[fn] && cache.hasOwnProperty(fn))
      return cache[fn].exports

    if(!payload.modules[fn]){
      throw new Error('could not load:\'' + req +"' (" + fn + ") expected one of:" 
        + JSON.stringify(Object.keys(payload.modules)) 
        + '\nrequested by: ' 
        + JSON.stringify(parent))
    }
    var func = payload.modules[fn].closure
    var m  = new Module(fn,parent)
    m.resolves = payload.modules[fn].resolves
    var dir = fn.split('/')
    if(dir.length > 1)
      dir.pop()
    func(function (req){
        return b_require(req,m)
      }, m, m.exports, fn, dir.join('/'))
    cache[fn] = m
    return m.exports
  }
  return b_require
}

function bnr (request, relative, cb) {

  renderScript(request, relative,function (err,load){

    var str = 
    render(load,{
        joiner:",\n  "
      , indent: '  '
      , padJoin: ['\n  ','\n']
      , surround: function (value,p,def){

          if('function' !== typeof p.value)
            return def(value,p)
            
          return p.value.toString()
        }  
      })
    
    cb(err, [
        module.constructor.toString()
      , Header.toString()
      , 'b_require = Header(' + str + ');'].join('\n')
    )
  })
}
