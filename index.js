exports.depends = depends

//var _depends = requrie('meta-test/depends')

var spawn = require('child_process').spawn
  , exec = require('child_process').exec
  , join = require('path').join
  , ctrl = require('ctrlflow')
  , fs = require('fs')
  
function depends(request, relative, cb){
  var json = ''
  var cmd = 
        [ 'node'
        , join(__dirname,'./load.js')
        , join(relative,request)
        ].join(' ')

  exec(cmd,function (err,stdout,stderr){
    var obj 
    try {obj = JSON.parse(stdout)} catch(err) {}
    cb(err,obj)
  })
}

function wrap(filename,done){
  console.log('read:',filename)
  fs.readFile(filename,function (err,code){
    done(err,'function (require,module,exports,__filename,__dirname){\n'
       + code
       + "\n};")
  })
}

exports.scripts = renderScript

function renderScript (request,relative,cb){
  var g = ctrl.group()

  depends(request,relative,function (err,deps){
    
    deps.forEach(function (e){
      console.log(e)
      wrap(e.filename,g())
    })
    
    g.done(function (err,funx){
      console.log(funx)
      var payload = {}
        , err = null
      deps.forEach(function(e,key){
        e.src = funx[key][1]
        payload[e.filename] = e
      })
      
      cb(err,payload)
    })

  })
}

