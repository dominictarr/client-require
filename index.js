
exports = module.exports = bnr
exports.depends = depends
exports.scripts = renderScript

var exec = require('child_process').exec
  , join = require('path').join
  , ctrl = require('ctrlflow')
  , fs = require('fs')
  , render = require('render')

function indent(str){
  return ('' + str).split('\n').map(function (e){return '  ' + e}).join('\n')
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
    console.log(err,stdout)
    cb(err || obj.error,obj.success)
  })
}

function wrap(filename,done){

  fs.readFile(filename,function (err,code){
    done(err,eval('(function (require,module,exports,__filename,__dirname){\n'
       + indent(code)
       + "\n});"))
  })
}


function renderScript (request,relative,cb){
  var g = ctrl.group()
  
  depends(request,relative,function (err,deps){
    
    deps.modules.forEach(function (e){
      wrap(e.filename,g())
    })
    
    g.done(function (err,funx){
      var payload = {}
        , err = null
      deps.modules.forEach(function(e,key){
        e.src = funx[key][1]
        payload[e.filename] = e
      })
      
/*      if (request[0] != '.')
        throw new Error('path requests not supported')
  */    
      deps.modules = payload
      deps.request = request
      deps.pwd = relative
      
      cb(err,deps)/*{
          request: request
        , main: deps.main //join(relative,request + '.js')
        , paths: require.paths
        , pwd: relative
        , modules: payload
      })*/
    })

  })
}
var Module = module.constructor

function Header (payload,req,rel){
  function b_require (req,parent){
    var fn
    
    if(!parent) {
      fn = payload.main
    } else //if(req[0] == '.')
      fn = parent.resolves[req]

    console.log(fn)
    
/*    else {
      var i = 0
      while(!(fn = payload.modules[payload.paths[i] + '/' + req])){
        i ++
      }
    }*/
    var func = payload.modules[fn].src
    var m  = new Module(fn,parent)
    m.resolves = payload.modules[fn].resolves
    var dir = fn.split('/')
    dir.pop()
    func(function (req){
        return b_require(req,m)
      }, m, m.exports, fn, dir.join('/'))
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
