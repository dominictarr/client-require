if(!module.parent){

  var request = process.argv[2]
    , depends = require('meta-test/depends')

  depends.remap({
    assert: 'core/assert', 
    util: 'core/util', 
    sys: 'core/util', 
    readline: 'core/readline', 
    child_process: 'core/child_process', 
    util: 'core/util', 
    events: 'core/events'})
    
  try{
    require('./loader').load(request)
  }catch (err){
    return console.log(JSON.stringify({error: err}))    
  }
  
  var loaded
   loaded = depends.sorted(__dirname + '/loader.js')
  var main = loaded.pop()

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
    , main: main.resolves[request]
    , request: request
    , paths: require.paths
    }
  }))
}
