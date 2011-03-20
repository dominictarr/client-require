
/*
  join
  /home/user/dev/project/
  with
   ../../blreg.js
  to get
  /home/user/blerg.js

*/

module.exports = function relativeToFile (to,req){
  to = to.split('/')
  to.pop()//get rid of current file or empty '' (if last thing ends in file)
  req = req.split('/')
  while('.' === req[0][0]){
    if('..' === req[0])
      to.pop(); 
    req.shift()
  }
  return to.join('/') + '/' + req.join('/')
}
