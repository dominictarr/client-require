//loader.js

exports.load = function (request,relative){
  var __filename = module.filename
    , loaded;

  //hack to get load a module relative to a specific place.
    module.filename = relative

    try{
      loaded = require(request)
      module.filename = __filename
      return loaded
    } catch(err){
      module.filename = __filename
      throw err
    }

}