
exports.registerModule = function registerModule(fn,closure,resolves){
  __payload__[fn] = {
    resolves: resolves
  , closure: closure
  }
}
exports.Header = function Header (req,rel){
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
    to.pop()
    //get rid of current file or empty '' (if last thing ends in file)
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
      return __payload__[parent.filename].resolves[req] || (function (){
        if ('.' === req[0]) 
          return relativeToFile(parent.filename,req + '.js')

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
        + '\nrequested by:' 
        + JSON.stringify(__payload__[parent.filename].resolves))
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

exports.getHeaderScript = function (){

 return [
    'var __payload__ = {}, __manifest__;'
  , module.constructor.toString()
  , exports.registerModule.toString()
  , exports.Header.toString()
  ].join('\n')
}
