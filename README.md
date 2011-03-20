
#browser node require#

require node modules into the browser... 

bnr wraps detects the dependencies and wraps modules into a single file.

next: fallback onto a sync XHR if another require occures after the modules are loaded...

++increases sanity from developing in modules etc...

++use npm to manage browser packages...

++better browser side testing...

:( think of a better name.

PLAN: pull ajax stuff out of jquery into a module.

gee. it's really complicated. 
so pull the whole thing,
use just the AJAX part, and then bootstap something simpler.

next: serve node modules from server.

on request: 
  pass back files you already have loaded...
  send in a format that will be appendable.

what if a file asyncronously requests a module you have but havn't 
references yet?

and what about npm modules
  ... if i remap npm files to 
  from 
    .npm/[project]/[version]/package/path/file.js
  to
    [project]/path/file.js
    
  dropping version may break conflicting versions.
    but will be easy.

  could put version back in later... 
    and pass the package.json.dependencies
    
    sounds heavy. 
    
damn. nodejs now reads the package.json file, and for example, skips
index.js to main: whatever.js 

i'll need to send the packages to the client... which means, i'll need depends to pick them up.

no, i could collect them after... because I know the file name.

then, only add the necessary packages...
it may help to translate the versions into something simpler?

aha! what if I resolved the packages refured to in the package.json
  ... so i know what they will be refuring to
  , when the server loads them!

add the following to resolves:
   package : /path/to/npm/.npm/[package]/[version]/package/main.js
   
then check the resolve will work.
  ...unless they don't declare thier dependencies.

or, would i get more love by writing the fallback?

would it be any easier for the server to resolve?
( hmmm, if it's just what it says in the package.json, 
  it should still work from fresh)

would it push node towards the simplest package system?

current guidelines to make sure that your all your modules will load:

all modules should load syncroniously.
  i.e. put all requires at top of file.
  ( since requires are cached, there is no reason not to,
    unless you do not actually know what you are loading yet)

hmm. what about a simple test runner where i load the test runner,
then load the test, then write one extra line to tell the runner to load the test & execute it?

some compromises that make me think i'm only covering the 90% case.

how big is the 90% case? what if I ran all the tests on npm and found out?
