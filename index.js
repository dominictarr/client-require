
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

function registerModule(fn,closure,resolves){
  __payload__[fn] = {
    resolves: resolves
  , closure: closure
  }
}
function Header (req,rel){
  var modules = __payload__

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
 
  function relativeToFile (to,req){
    to = to.split('/')
    to.pop()//get rid of current file or empty '' (if last thing ends in file)
    req = req.split('/')
    while('.' === req[0][0]){
      if('..' === req[0])
        to.pop(); 
      req.shift()
    }
    return to.join('/') + '/' + req.join('/')
  }
  function resolve (req,parent) {
    if(!parent) {
      return __manifest__.main
    } else {
      return __payload__[parent.filename].resolves[req] 
        || '.' === req[0] 
          ? relativeToFile(parent.filename,req + '.js')
          : (function (){
              var paths = __manifest__.paths
              for( var m in paths){
                var abs = paths[m] + '/' + req + '.js'
                if(__payload__[abs])
                  return abs
              }
          })()
    }
  }

  function b_require (req,parent){
    var fn = resolve(req,parent)
    if(cache[fn] && cache.hasOwnProperty(fn))
      return cache[fn].exports

    if(!modules[fn]){
    //this is where i should fall back to a blocking XHR.
      throw new Error('could not load:\'' + req +"' (" + fn + ") expected one of:" 
        + JSON.stringify(Object.keys(modules)) 
        + '\nrequested by: ' 
        + JSON.stringify(parent))
    }
    var func = modules[fn].closure
    var m  = new Module(fn,parent)
    m.filename = fn
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
function nice_property (obj,payload,property,add1, add2){
  return Object.keys(obj).map(function (filename){
    return payload
      + '[' 
      + JSON.stringify(filename)
      + ']' +  add1 +
    nice(obj[filename][property])
      + add2
  }).join('\n')
}*/
/*
hmm. generating javascript is a bit ugly.

other possible ways:

__registerModule(filename,code,resolves)

ways to load the javascript...

generate each module  into a seperate .js file
and add script tags (be handy for dev)
then stick that list in the template.

or...
set script to a request... this is proably next:

create service which loads request....

oh yeah! support loading any main module.
how am I gonna do that?

if a module loads something async, it may already exit.

*/
function bnr (request, relative, cb) {
  renderScript(request, relative,function (err,load){
    var payloader = '__payload__'
    var payload = 
    Object.keys(load.modules).map(function (key){
      return 'registerModule(' + [
        key,load.modules[key].closure,load.modules[key].resolves
      ].map(nice).join(',\n') + ')\n'
    }).join('\n')

/*    var payload_closures = 
          nice_property(
              load.modules
            , payloader
            , 'closure'
            , '.closure = '
            , '')
    var payload_resolves = 
          nice_property(
              load.modules
            , payloader
            , 'resolves'
            , ' = {resolves:'
            , '}')*/
    delete load.modules
    var manifest = nice(load)
    cb(err, [
        'var __payload__ = {}, __manifest__;'
      , module.constructor.toString()
      , registerModule.toString()
      , Header.toString()
      , '__manifest__ = ' + manifest 
      , payload
      , 'b_require = Header();'].join('\n')
    )
  })
}

