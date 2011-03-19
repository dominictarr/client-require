function Module(id, parent) {
  this.id = id;
  this.exports = {};
  this.parent = parent;

  this.filename = null;
  this.loaded = false;
  this.exited = false;
  this.children = [];
}
function Header(payload,req,rel){
  function b_require (req,parent){
    var fn
    if(!parent) {
      fn = payload.main
//      console.log(payload)
    } else if(req[0] == '.')
      fn = parent.resolves[req]
    else {
      var i = 0
      while(!(fn = payload.modules[payload.paths[i] + '/' + req])){
        i ++
      }
    }
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
b_require = Header({
  request: "./test/examples/c",
  main: "/home/dominic/dev/bnr/test/examples/c.js",
  paths: [
    "/home/dominic/npm",
    "/home/dominic/dev",
    "/home/dominic/.node_modules",
    "/home/dominic/.node_libraries",
    "/home/dominic/source/nvm/v0.4.2/lib/node"
  ],
  pwd: "/home/dominic/dev/bnr",
  modules: {
    '/home/dominic/dev/bnr/test/examples/a.js': {
      filename: "/home/dominic/dev/bnr/test/examples/a.js",
      resolves: {},
      src: function (require,module,exports,__filename,__dirname){
        
        
        //this is a.js
        
        exports.a = function (){
          return "HELLO1"
        }
        
      }
    },
    '/home/dominic/dev/bnr/test/examples/b.js': {
      filename: "/home/dominic/dev/bnr/test/examples/b.js",
      resolves: {
        './a': "/home/dominic/dev/bnr/test/examples/a.js"
      },
      src: function (require,module,exports,__filename,__dirname){
        
        exports.b = function (){
        return "BBBB"
        }
        
        exports.a = require('./a').a
        
      }
    },
    '/home/dominic/dev/bnr/test/examples/c.js': {
      filename: "/home/dominic/dev/bnr/test/examples/c.js",
      resolves: {
        './a': "/home/dominic/dev/bnr/test/examples/a.js",
        './b': "/home/dominic/dev/bnr/test/examples/b.js"
      },
      src: function (require,module,exports,__filename,__dirname){
        
        
        exports.a = require('./a').a
        exports.b = require('./b').b
        exports.c = function (){return 'only CC\'s be tasting like these'}
        
        
      }
    }
  }
});
