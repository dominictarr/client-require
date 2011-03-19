

if(!module.parent){

var load = process.argv[2]
var depends = require('meta-test/depends')
  require(load)

  console.log(JSON.stringify(depends.sorted(load + '.js')
    .map(function (e){
      return {
        filename: e.filename
      , resolves: e.resolves
      }
    })))
}
