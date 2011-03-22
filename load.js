if(!module.parent){

console.log(process.argv[2])

//  process.argv.shift()
  //process.argv.shift()

  var opts = JSON.parse(process.argv[2])
    , relative = opts.relative + '/RELATIVE_FILE.js'
  //  , request = process.argv
    , depends = require('meta-test/depends')
    , fs = require('fs')
    , loader = require('./loader')

  console.log(opts)

  if(!/^\/tmp\/.*/(opts.file))
    throw new Error("expects a tmp file as last argument, not:" + opts.file)

  depends.remap({
    assert: 'core/assert', 
    util: 'core/util', 
    sys: 'core/util', 
    readline: 'core/readline', 
    child_process: 'core/child_process', 
    util: 'core/util', 
    events: 'core/events'})

  try{
    opts.requests.forEach(function (e){return loader.load(e,relative)})//(request)
  }catch (err){

  fs.writeFileSync(opts.file,JSON.stringify({error: err}))
  return
  }
  
  var loaded
   loaded = depends.sorted(__dirname + '/loader.js')
  var main = loaded.pop()

  //logging to console is bad. noisy channel. 
  
  //write to a file.

  //don't do it at on process exit, it will get cut off.
  
  fs.writeFile(opts.file,JSON.stringify({
      success: {
        modules: 
        loaded.map(function (e){
          return {
            filename: e.filename
          , resolves: e.resolves
          , source: e.source
          }
        })
    , main: main.resolves[opts.requests[0]]
    , resolves: main.resolves
    , request: opts.requests
    , paths: require.paths
    }}),'utf-8', function(){
    
    })

//  })

}

