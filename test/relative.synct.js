var relative = require('../relative')
  , it = require('it-is')

exports['join absolute paths with relative filenames'] = function (){
  var examples = [
        [ '/home/user/project/lib/main.js'
          ,'./hello.js'
            , '/home/user/project/lib/hello.js'], 
        ['/home/user/project/lib/main.js'
          , '../go.js'
            , '/home/user/project/go.js'], 
        [ '/home/user/project/lib/'
          , '../go.js'
            , '/home/user/project/go.js'], 
        [ '/home/user/project/lib/foo.js'
          ,'../../../sudo.js'
            , '/home/sudo.js'], 
        [ '/home/user/dev/project/'
          , '../../blerg.js'
            , '/home/user/blerg.js' ] ]
    
  it(examples).every(function (e){
    it(relative.call(null,e[0],e[1])).equal(e[2])
  })
}
