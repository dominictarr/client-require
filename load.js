if(!module.parent){

  process.argv.shift()
  process.argv.shift()

  var relative = process.argv.shift() + '/RELATIVE_FILE.js'
    , request = process.argv
    , depends = require('meta-test/depends')
    , loader = require('./loader')

  depends.remap({
    assert: 'core/assert', 
    util: 'core/util', 
    sys: 'core/util', 
    readline: 'core/readline', 
    child_process: 'core/child_process', 
    util: 'core/util', 
    events: 'core/events'})

  try{
    process.argv.map(function (e){return loader.load(e,relative)})//(request)
  }catch (err){
//    console.log('/*error loading files*/')
    return console.log(JSON.stringify({error: err}))    
  }
  
  var loaded
   loaded = depends.sorted(__dirname + '/loader.js')
  var main = loaded.pop()

  process.on('exit', function (){
  //  console.log('/*last line will be valid json*/')
    console.log(JSON.stringify({
      success: {
        modules: 
        loaded.map(function (e){
          return {
            filename: e.filename
          , resolves: e.resolves
          , source: e.source
          }
        })
    , main: main.resolves[request[0]]
    , resolves: main.resolves
    , request: request
    , paths: require.paths
    }}))
  })
}

