

//require('bnr')('./test/examples/c',__dirname,function (err,data){console.log(data)})
console.log('/*' + process.argv + '*/')
require('bnr')(process.argv[2],process.env.PWD,function (err,data){
  if(err) throw err
    console.log(data)
})
