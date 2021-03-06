/*node,/home/dominic/dev/bnr/hello.js,it-is/test/assert.expresso*/
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
  /*
  some simple changes to make nodejs code feel more at home in the browser.
  */
  if(!global.process)
    global.process = {
      EventEmitter: function EventEmitter(){}
    , nextTick: function (f){return setTimeout(f,0)}
    , title: 'browser'
    , versions: {}
    }
  if(!global.Buffer){
    global.Buffer = Buffer
    
    function Buffer(){}
     
    Buffer.isBuffer = function (){return false}    
  }
  if(global.navigator){
    navigator.userAgent
      .split(/\s+\(.*?\)\s+|\s/)
      .forEach(function (e){ 
        var v =/(\w+)\/([\d|.]+)/(e)
        process.versions[v[1]] = v[2]
      })
  }
  var cache = {}
 
  function b_require (req,parent){

    var fn
    if(!parent) {
      fn = payload.main
    } else
      fn = parent.resolves[req]
  
    if(cache[fn] && cache.hasOwnProperty(fn))
      return cache[fn].exports

    if(!payload.modules[fn]){
      throw new Error('could not load:\'' + req +"' (" + fn + ") expected one of:" 
        + JSON.stringify(Object.keys(payload.modules)) 
        + '\nrequested by: ' 
        + JSON.stringify(parent))
    }
    var func = payload.modules[fn].closure
    var m  = new Module(fn,parent)
    m.resolves = payload.modules[fn].resolves
    var dir = fn.split('/')
    if(dir.length > 1)
      dir.pop()
    func(function (req){
        return b_require(req,m)
      }, m, m.exports, fn, dir.join('/'))
    cache[fn] = m
    return m.exports
  }
  return b_require
}
b_require = Header({
  modules: {
    '/home/dominic/dev/core/events.js': {
      closure: function (require,module,exports,__filename,__dirname){
        var EventEmitter = exports.EventEmitter = process.EventEmitter;
        var isArray = Array.isArray;
        
        // By default EventEmitters will print a warning if more than
        // 10 listeners are added to it. This is a useful default which
        // helps finding memory leaks.
        //
        // Obviously not all Emitters should be limited to 10. This function allows
        // that to be increased. Set to zero for unlimited.
        var defaultMaxListeners = 10;
        EventEmitter.prototype.setMaxListeners = function(n) {
          this._events.maxListeners = n;
        };
        
        EventEmitter.prototype.emit = function(type) {
          // If there is no 'error' event listener then throw.
          if (type === 'error') {
            if (!this._events || !this._events.error ||
                (isArray(this._events.error) && !this._events.error.length))
            {
              if (arguments[1] instanceof Error) {
                throw arguments[1]; // Unhandled 'error' event
              } else {
                throw new Error("Uncaught, unspecified 'error' event.");
              }
              return false;
            }
          }
        
          if (!this._events) return false;
          var handler = this._events[type];
          if (!handler) return false;
        
          if (typeof handler == 'function') {
            switch (arguments.length) {
              // fast cases
              case 1:
                handler.call(this);
                break;
              case 2:
                handler.call(this, arguments[1]);
                break;
              case 3:
                handler.call(this, arguments[1], arguments[2]);
                break;
              // slower
              default:
                var args = Array.prototype.slice.call(arguments, 1);
                handler.apply(this, args);
            }
            return true;
        
          } else if (isArray(handler)) {
            var args = Array.prototype.slice.call(arguments, 1);
        
            var listeners = handler.slice();
            for (var i = 0, l = listeners.length; i < l; i++) {
              listeners[i].apply(this, args);
            }
            return true;
        
          } else {
            return false;
          }
        };
        
        // EventEmitter is defined in src/node_events.cc
        // EventEmitter.prototype.emit() is also defined there.
        EventEmitter.prototype.addListener = function(type, listener) {
          if ('function' !== typeof listener) {
            throw new Error('addListener only takes instances of Function');
          }
        
          if (!this._events) this._events = {};
        
          // To avoid recursion in the case that type == "newListeners"! Before
          // adding it to the listeners, first emit "newListeners".
          this.emit('newListener', type, listener);
        
          if (!this._events[type]) {
            // Optimize the case of one listener. Don't need the extra array object.
            this._events[type] = listener;
          } else if (isArray(this._events[type])) {
        
            // Check for listener leak
            if (!this._events[type].warned) {
              var m;
              if (this._events.maxListeners !== undefined) {
                m = this._events.maxListeners;
              } else {
                m = defaultMaxListeners;
              }
        
              if (m && m > 0 && this._events[type].length > m) {
                this._events[type].warned = true;
                console.error('(node) warning: possible EventEmitter memory ' +
                              'leak detected. NaN listeners added. ' +
                              'Use emitter.setMaxListeners() to increase limit.',
                              this._events[type].length);
                console.trace();
              }
            }
        
            // If we've already got an array, just append.
            this._events[type].push(listener);
          } else {
            // Adding the second element, need to change to array.
            this._events[type] = [this._events[type], listener];
          }
        
          return this;
        };
        
        EventEmitter.prototype.on = EventEmitter.prototype.addListener;
        
        EventEmitter.prototype.once = function(type, listener) {
          var self = this;
          self.on(type, function g() {
            self.removeListener(type, g);
            listener.apply(this, arguments);
          });
        
          return this;
        };
        
        EventEmitter.prototype.removeListener = function(type, listener) {
          if ('function' !== typeof listener) {
            throw new Error('removeListener only takes instances of Function');
          }
        
          // does not use listeners(), so no side effect of creating _events[type]
          if (!this._events || !this._events[type]) return this;
        
          var list = this._events[type];
        
          if (isArray(list)) {
            var i = list.indexOf(listener);
            if (i < 0) return this;
            list.splice(i, 1);
            if (list.length == 0)
              delete this._events[type];
          } else if (this._events[type] === listener) {
            delete this._events[type];
          }
        
          return this;
        };
        
        EventEmitter.prototype.removeAllListeners = function(type) {
          // does not use listeners(), so no side effect of creating _events[type]
          if (type && this._events && this._events[type]) this._events[type] = null;
          return this;
        };
        
        EventEmitter.prototype.listeners = function(type) {
          if (!this._events) this._events = {};
          if (!this._events[type]) this._events[type] = [];
          if (!isArray(this._events[type])) {
            this._events[type] = [this._events[type]];
          }
          return this._events[type];
        };
      },
      resolves: {}
    },
    '/home/dominic/dev/core/util.js': {
      closure: function (require,module,exports,__filename,__dirname){
        var events = require('events');
        
        
        exports.print = function() {
          for (var i = 0, len = arguments.length; i < len; ++i) {
            process.stdout.write(String(arguments[i]));
          }
        };
        
        
        exports.puts = function() {
          for (var i = 0, len = arguments.length; i < len; ++i) {
            process.stdout.write(arguments[i] + '\n');
          }
        };
        
        
        exports.debug = function(x) {
          process.binding('stdio').writeError('DEBUG: ' + x + '\n');
        };
        
        
        var error = exports.error = function(x) {
          for (var i = 0, len = arguments.length; i < len; ++i) {
            process.binding('stdio').writeError(arguments[i] + '\n');
          }
        };
        
        
        /**
         * Echos the value of a value. Trys to print the value out
         * in the best way possible given the different types.
         *
         * @param {Object} obj The object to print out.
         * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
         *    properties of objects.
         * @param {Number} depth Depth in which to descend in object. Default is 2.
         * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
         *    output. Default is false (no coloring).
         */
        exports.inspect = function(obj, showHidden, depth, colors) {
          var seen = [];
        
          var stylize = function(str, styleType) {
            // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
            var styles =
                { 'bold' : [1, 22],
                  'italic' : [3, 23],
                  'underline' : [4, 24],
                  'inverse' : [7, 27],
                  'white' : [37, 39],
                  'grey' : [90, 39],
                  'black' : [30, 39],
                  'blue' : [34, 39],
                  'cyan' : [36, 39],
                  'green' : [32, 39],
                  'magenta' : [35, 39],
                  'red' : [31, 39],
                  'yellow' : [33, 39] };
        
            var style =
                { 'special': 'cyan',
                  'number': 'blue',
                  'boolean': 'yellow',
                  'undefined': 'grey',
                  'null': 'bold',
                  'string': 'green',
                  'date': 'magenta',
                  // "name": intentionally not styling
                  'regexp': 'red' }[styleType];
        
            if (style) {
              return '\033[' + styles[style][0] + 'm' + str +
                     '\033[' + styles[style][1] + 'm';
            } else {
              return str;
            }
          };
          if (! colors) {
            stylize = function(str, styleType) { return str; };
          }
        
          function format(value, recurseTimes) {
            // Provide a hook for user-specified inspect functions.
            // Check that value is an object with an inspect function on it
            if (value && typeof value.inspect === 'function' &&
                // Filter out the util module, it's inspect function is special
                value !== exports &&
                // Also filter out any prototype objects using the circular check.
                !(value.constructor && value.constructor.prototype === value)) {
              return value.inspect(recurseTimes);
            }
        
            // Primitive types cannot have properties
            switch (typeof value) {
              case 'undefined':
                return stylize('undefined', 'undefined');
        
              case 'string':
                var simple = JSON.stringify(value).replace(/'/g, "\\'")
                                                  .replace(/\\"/g, '"')
                                                  .replace(/(^"|"$)/g, "'");
                return stylize(simple, 'string');
        
              case 'number':
                return stylize('' + value, 'number');
        
              case 'boolean':
                return stylize('' + value, 'boolean');
            }
            // For some reason typeof null is "object", so special case here.
            if (value === null) {
              return stylize('null', 'null');
            }
        
            // Look up the keys of the object.
            var visible_keys = Object.keys(value);
            var keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;
        
            // Functions without properties can be shortcutted.
            if (typeof value === 'function' && keys.length === 0) {
              if (isRegExp(value)) {
                return stylize('' + value, 'regexp');
              } else {
                var name = value.name ? ': ' + value.name : '';
                return stylize('[Function' + name + ']', 'special');
              }
            }
        
            // Dates without properties can be shortcutted
            if (isDate(value) && keys.length === 0) {
              return stylize(value.toUTCString(), 'date');
            }
        
            var base, type, braces;
            // Determine the object type
            if (isArray(value)) {
              type = 'Array';
              braces = ['[', ']'];
            } else {
              type = 'Object';
              braces = ['{', '}'];
            }
        
            // Make functions say that they are functions
            if (typeof value === 'function') {
              var n = value.name ? ': ' + value.name : '';
              base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
            } else {
              base = '';
            }
        
            // Make dates with properties first say the date
            if (isDate(value)) {
              base = ' ' + value.toUTCString();
            }
        
            if (keys.length === 0) {
              return braces[0] + base + braces[1];
            }
        
            if (recurseTimes < 0) {
              if (isRegExp(value)) {
                return stylize('' + value, 'regexp');
              } else {
                return stylize('[Object]', 'special');
              }
            }
        
            seen.push(value);
        
            var output = keys.map(function(key) {
              var name, str;
              if (value.__lookupGetter__) {
                if (value.__lookupGetter__(key)) {
                  if (value.__lookupSetter__(key)) {
                    str = stylize('[Getter/Setter]', 'special');
                  } else {
                    str = stylize('[Getter]', 'special');
                  }
                } else {
                  if (value.__lookupSetter__(key)) {
                    str = stylize('[Setter]', 'special');
                  }
                }
              }
              if (visible_keys.indexOf(key) < 0) {
                name = '[' + key + ']';
              }
              if (!str) {
                if (seen.indexOf(value[key]) < 0) {
                  if (recurseTimes === null) {
                    str = format(value[key]);
                  } else {
                    str = format(value[key], recurseTimes - 1);
                  }
                  if (str.indexOf('\n') > -1) {
                    if (isArray(value)) {
                      str = str.split('\n').map(function(line) {
                        return '  ' + line;
                      }).join('\n').substr(2);
                    } else {
                      str = '\n' + str.split('\n').map(function(line) {
                        return '   ' + line;
                      }).join('\n');
                    }
                  }
                } else {
                  str = stylize('[Circular]', 'special');
                }
              }
              if (typeof name === 'undefined') {
                if (type === 'Array' && key.match(/^\d+$/)) {
                  return str;
                }
                name = JSON.stringify('' + key);
                if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                  name = name.substr(1, name.length - 2);
                  name = stylize(name, 'name');
                } else {
                  name = name.replace(/'/g, "\\'")
                             .replace(/\\"/g, '"')
                             .replace(/(^"|"$)/g, "'");
                  name = stylize(name, 'string');
                }
              }
        
              return name + ': ' + str;
            });
        
            seen.pop();
        
            var numLinesEst = 0;
            var length = output.reduce(function(prev, cur) {
              numLinesEst++;
              if (cur.indexOf('\n') >= 0) numLinesEst++;
              return prev + cur.length + 1;
            }, 0);
        
            if (length > (require('readline').columns || 50)) {
              output = braces[0] +
                       (base === '' ? '' : base + '\n ') +
                       ' ' +
                       output.join(',\n  ') +
                       ' ' +
                       braces[1];
        
            } else {
              output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
            }
        
            return output;
          }
          return format(obj, (typeof depth === 'undefined' ? 2 : depth));
        };
        
        
        function isArray(ar) {
          return ar instanceof Array ||
                 Array.isArray(ar) ||
                 (ar && ar !== Object.prototype && isArray(ar.__proto__));
        }
        
        
        function isRegExp(re) {
          var s = '' + re;
          return re instanceof RegExp || // easy case
                 // duck-type for context-switching evalcx case
                 typeof(re) === 'function' &&
                 re.constructor.name === 'RegExp' &&
                 re.compile &&
                 re.test &&
                 re.exec &&
                 s.match(/^\/.*\/[gim]{0,3}$/);
        }
        
        
        function isDate(d) {
          if (d instanceof Date) return true;
          if (typeof d !== 'object') return false;
          var properties = Date.prototype && Object.getOwnPropertyNames(Date.prototype);
          var proto = d.__proto__ && Object.getOwnPropertyNames(d.__proto__);
          return JSON.stringify(proto) === JSON.stringify(properties);
        }
        
        
        var pWarning;
        
        exports.p = function() {
          if (!pWarning) {
            pWarning = 'util.p will be removed in future versions of Node. ' +
                       'Use util.puts(util.inspect()) instead.\n';
            exports.error(pWarning);
          }
          for (var i = 0, len = arguments.length; i < len; ++i) {
            error(exports.inspect(arguments[i]));
          }
        };
        
        
        function pad(n) {
          return n < 10 ? '0' + n.toString(10) : n.toString(10);
        }
        
        
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                      'Oct', 'Nov', 'Dec'];
        
        // 26 Feb 16:19:34
        function timestamp() {
          var d = new Date();
          var time = [pad(d.getHours()),
                      pad(d.getMinutes()),
                      pad(d.getSeconds())].join(':');
          return [d.getDate(), months[d.getMonth()], time].join(' ');
        }
        
        
        exports.log = function(msg) {
          exports.puts(timestamp() + ' - ' + msg.toString());
        };
        
        
        var execWarning;
        exports.exec = function() {
          if (!execWarning) {
            execWarning = 'util.exec has moved to the "child_process" module.' +
                          ' Please update your source code.';
            error(execWarning);
          }
          return require('child_process').exec.apply(this, arguments);
        };
        
        
        exports.pump = function(readStream, writeStream, callback) {
          var callbackCalled = false;
        
          function call(a, b, c) {
            if (callback && !callbackCalled) {
              callback(a, b, c);
              callbackCalled = true;
            }
          }
        
          if (!readStream.pause) {
            readStream.pause = function() {readStream.emit('pause');};
          }
        
          if (!readStream.resume) {
            readStream.resume = function() {readStream.emit('resume');};
          }
        
          readStream.addListener('data', function(chunk) {
            if (writeStream.write(chunk) === false) readStream.pause();
          });
        
          writeStream.addListener('pause', function() {
            readStream.pause();
          });
        
          writeStream.addListener('drain', function() {
            readStream.resume();
          });
        
          writeStream.addListener('resume', function() {
            readStream.resume();
          });
        
          readStream.addListener('end', function() {
            writeStream.end();
          });
        
          readStream.addListener('close', function() {
            call();
          });
        
          readStream.addListener('error', function(err) {
            writeStream.end();
            call(err);
          });
        
          writeStream.addListener('error', function(err) {
            readStream.destroy();
            call(err);
          });
        };
        
        
        /**
         * Inherit the prototype methods from one constructor into another.
         *
         * The Function.prototype.inherits from lang.js rewritten as a standalone
         * function (not on Function.prototype). NOTE: If this file is to be loaded
         * during bootstrapping this function needs to be revritten using some native
         * functions as prototype setup using normal JavaScript does not work as
         * expected during bootstrapping (see mirror.js in r114903).
         *
         * @param {function} ctor Constructor function which needs to inherit the
         *     prototype.
         * @param {function} superCtor Constructor function to inherit prototype from.
         */
        exports.inherits = function(ctor, superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: { value: ctor, enumerable: false }
          });
        };
      },
      resolves: {
        events: "/home/dominic/dev/core/events.js"
      }
    },
    '/home/dominic/dev/core/assert.js': {
      closure: function (require,module,exports,__filename,__dirname){
        // http://wiki.commonjs.org/wiki/Unit_Testing/1.0
        //
        // THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
        //
        // Originally from narwhal.js (http://narwhaljs.org)
        // Copyright (c) 2009 Thomas Robinson <280north.com>
        //
        // Permission is hereby granted, free of charge, to any person obtaining a copy
        // of this software and associated documentation files (the 'Software'), to
        // deal in the Software without restriction, including without limitation the
        // rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        // sell copies of the Software, and to permit persons to whom the Software is
        // furnished to do so, subject to the following conditions:
        //
        // The above copyright notice and this permission notice shall be included in
        // all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        // AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
        // ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
        // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        
        // UTILITY
        var util = require('util');
        var pSlice = Array.prototype.slice;
        
        // 1. The assert module provides functions that throw
        // AssertionError's when particular conditions are not met. The
        // assert module must conform to the following interface.
        
        var assert = exports;
        
        // 2. The AssertionError is defined in assert.
        // new assert.AssertionError({ message: message,
        //                             actual: actual,
        //                             expected: expected })
        
        assert.AssertionError = function AssertionError(options) {
          this.name = 'AssertionError';
          this.message = options.message;
          this.actual = options.actual;
          this.expected = options.expected;
          this.operator = options.operator;
          var stackStartFunction = options.stackStartFunction || fail;
        
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, stackStartFunction);
          }
        };
        util.inherits(assert.AssertionError, Error);
        
        assert.AssertionError.prototype.toString = function() {
          if (this.message) {
            return [this.name + ':', this.message].join(' ');
          } else {
            return [this.name + ':',
                    JSON.stringify(this.expected),
                    this.operator,
                    JSON.stringify(this.actual)].join(' ');
          }
        };
        
        // assert.AssertionError instanceof Error
        
        assert.AssertionError.__proto__ = Error.prototype;
        
        // At present only the three keys mentioned above are used and
        // understood by the spec. Implementations or sub modules can pass
        // other keys to the AssertionError's constructor - they will be
        // ignored.
        
        // 3. All of the following functions must throw an AssertionError
        // when a corresponding condition is not met, with a message that
        // may be undefined if not provided.  All assertion methods provide
        // both the actual and expected values to the assertion error for
        // display purposes.
        
        function fail(actual, expected, message, operator, stackStartFunction) {
          throw new assert.AssertionError({
            message: message,
            actual: actual,
            expected: expected,
            operator: operator,
            stackStartFunction: stackStartFunction
          });
        }
        
        // EXTENSION! allows for well behaved errors defined elsewhere.
        assert.fail = fail;
        
        // 4. Pure assertion tests whether a value is truthy, as determined
        // by !!guard.
        // assert.ok(guard, message_opt);
        // This statement is equivalent to assert.equal(true, guard,
        // message_opt);. To test strictly for the value true, use
        // assert.strictEqual(true, guard, message_opt);.
        
        assert.ok = function ok(value, message) {
          if (!!!value) fail(value, true, message, '==', assert.ok);
        };
        
        // 5. The equality assertion tests shallow, coercive equality with
        // ==.
        // assert.equal(actual, expected, message_opt);
        
        assert.equal = function equal(actual, expected, message) {
          if (actual != expected) fail(actual, expected, message, '==', assert.equal);
        };
        
        // 6. The non-equality assertion tests for whether two objects are not equal
        // with != assert.notEqual(actual, expected, message_opt);
        
        assert.notEqual = function notEqual(actual, expected, message) {
          if (actual == expected) {
            fail(actual, expected, message, '!=', assert.notEqual);
          }
        };
        
        // 7. The equivalence assertion tests a deep equality relation.
        // assert.deepEqual(actual, expected, message_opt);
        
        assert.deepEqual = function deepEqual(actual, expected, message) {
          if (!_deepEqual(actual, expected)) {
            fail(actual, expected, message, 'deepEqual', assert.deepEqual);
          }
        };
        
        function _deepEqual(actual, expected) {
          // 7.1. All identical values are equivalent, as determined by ===.
          if (actual === expected) {
            return true;
        
          } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
            if (actual.length != expected.length) return false;
        
            for (var i = 0; i < actual.length; i++) {
              if (actual[i] !== expected[i]) return false;
            }
        
            return true;
        
          // 7.2. If the expected value is a Date object, the actual value is
          // equivalent if it is also a Date object that refers to the same time.
          } else if (actual instanceof Date && expected instanceof Date) {
            return actual.getTime() === expected.getTime();
        
          // 7.3. Other pairs that do not both pass typeof value == 'object',
          // equivalence is determined by ==.
          } else if (typeof actual != 'object' && typeof expected != 'object') {
            return actual == expected;
        
          // 7.4. For all other Object pairs, including Array objects, equivalence is
          // determined by having the same number of owned properties (as verified
          // with Object.prototype.hasOwnProperty.call), the same set of keys
          // (although not necessarily the same order), equivalent values for every
          // corresponding key, and an identical 'prototype' property. Note: this
          // accounts for both named and indexed properties on Arrays.
          } else {
            return objEquiv(actual, expected);
          }
        }
        
        function isUndefinedOrNull(value) {
          return value === null || value === undefined;
        }
        
        function isArguments(object) {
          return Object.prototype.toString.call(object) == '[object Arguments]';
        }
        
        function objEquiv(a, b) {
          if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
            return false;
          // an identical 'prototype' property.
          if (a.prototype !== b.prototype) return false;
          //~~~I've managed to break Object.keys through screwy arguments passing.
          //   Converting to array solves the problem.
          if (isArguments(a)) {
            if (!isArguments(b)) {
              return false;
            }
            a = pSlice.call(a);
            b = pSlice.call(b);
            return _deepEqual(a, b);
          }
          try {
            var ka = Object.keys(a),
                kb = Object.keys(b),
                key, i;
          } catch (e) {//happens when one is a string literal and the other isn't
            return false;
          }
          // having the same number of owned properties (keys incorporates
          // hasOwnProperty)
          if (ka.length != kb.length)
            return false;
          //the same set of keys (although not necessarily the same order),
          ka.sort();
          kb.sort();
          //~~~cheap key test
          for (i = ka.length - 1; i >= 0; i--) {
            if (ka[i] != kb[i])
              return false;
          }
          //equivalent values for every corresponding key, and
          //~~~possibly expensive deep test
          for (i = ka.length - 1; i >= 0; i--) {
            key = ka[i];
            if (!_deepEqual(a[key], b[key])) return false;
          }
          return true;
        }
        
        // 8. The non-equivalence assertion tests for any deep inequality.
        // assert.notDeepEqual(actual, expected, message_opt);
        
        assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
          if (_deepEqual(actual, expected)) {
            fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
          }
        };
        
        // 9. The strict equality assertion tests strict equality, as determined by ===.
        // assert.strictEqual(actual, expected, message_opt);
        
        assert.strictEqual = function strictEqual(actual, expected, message) {
          if (actual !== expected) {
            fail(actual, expected, message, '===', assert.strictEqual);
          }
        };
        
        // 10. The strict non-equality assertion tests for strict inequality, as
        // determined by !==.  assert.notStrictEqual(actual, expected, message_opt);
        
        assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
          if (actual === expected) {
            fail(actual, expected, message, '!==', assert.notStrictEqual);
          }
        };
        
        function expectedException(actual, expected) {
          if (!actual || !expected) {
            return false;
          }
        
          if (expected instanceof RegExp) {
            return expected.test(actual);
          } else if (actual instanceof expected) {
            return true;
          } else if (expected.call({}, actual) === true) {
            return true;
          }
        
          return false;
        }
        
        function _throws(shouldThrow, block, expected, message) {
          var actual;
        
          if (typeof expected === 'string') {
            message = expected;
            expected = null;
          }
        
          try {
            block();
          } catch (e) {
            actual = e;
          }
        
          message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
                    (message ? ' ' + message : '.');
        
          if (shouldThrow && !actual) {
            fail('Missing expected exception' + message);
          }
        
          if (!shouldThrow && expectedException(actual, expected)) {
            fail('Got unwanted exception' + message);
          }
        
          if ((shouldThrow && actual && expected &&
              !expectedException(actual, expected)) || (!shouldThrow && actual)) {
            throw actual;
          }
        }
        
        // 11. Expected to throw an error:
        // assert.throws(block, Error_opt, message_opt);
        
        assert.throws = function(block, /*optional*/error, /*optional*/message) {
          _throws.apply(this, [true].concat(pSlice.call(arguments)));
        };
        
        // EXTENSION! This is annoying to write outside this module.
        assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
          _throws.apply(this, [false].concat(pSlice.call(arguments)));
        };
        
        assert.ifError = function(err) { if (err) {throw err;}};
      },
      resolves: {
        util: "/home/dominic/dev/core/util.js"
      }
    },
    '/home/dominic/npm/.npm/curry/0.0.1/package/curry.js': {
      closure: function (require,module,exports,__filename,__dirname){
        module.exports = curry
        
        function curry (){
          var left, right, func, self
        
          for(key in arguments){
            var value = arguments[key]
            
            if(!right && Array.isArray(value))
              if (!func) 
                left = value
              else
                right = value
            else if (!func && typeof value === 'function')
              func = value
            else 
              self = value
          }
          return function (){
           return func.apply(self,append([].concat(left || []),arguments).concat(right || [])) 
          }
        }
        function append (a,args){
          for (i in args) 
            a.push(args[i])
          return a 
        }
            /*
            call styles:
            
            curry([left],fn,[right])
            curry(fn,[right])
            curry([left],fn)
            curry(fn)
        
            calling styles:
            curry([left],fn,[right],self)
            curry(fn,[right],self)
            curry([left],fn,self)
            curry(fn,self)
            */
      },
      resolves: {}
    },
    '/home/dominic/npm/.npm/traverser/0.0.1/package/iterators.js': {
      closure: function (require,module,exports,__filename,__dirname){
        //iterators
        //var log = require('logger')
        
        /*
        ~~~~~~~~~~~~~~~~~~~~~~~~
        Sync
        
        
        */
        /*
          i've discovered that js has some querks about properties being iteratred on
          for example: for (i in obj) will include prototype properties,
                  but Object.keys(obj) will not.
                  
                  for greatest flex, pass in a custom function to gen prop list.
        
                  when you are say, comparing objects, the correctness of iteration is essential.
        */
        
        exports.sync = {
          each: function (object,func){
            for( key in object){
              var value = object[key]
              func(value,key,object)
            }
          },
          find: function (object,func){
            for( key in object){
              var value = object[key]
              var r = func(value,key,object)
              if(r){
                return value
             }
            }
          },
          map: function (object,func){
            var m = []
            for( key in object){
              var value = object[key]
              m.push(func(value,key,object))
            }
            return m
          },
          copy: function (object,func){
            if('object' !== typeof object || object === null)
              return object
            var m = (object instanceof Array ? [] : {})
            for( key in object){
              var value = object[key]
              m[key] = func(value,key,object)
            }
            return m
          },
          max: function (object,func){
            var max = null
            for( key in object){
              var value = object[key]
                , r = func(value,key,object)
                if(r > max || max === null)
                  max = r
            }
            return max
          },
          min: function (object,func){
            var min = null
            for( key in object){
              var value = object[key]
                , r = func(value,key,object)
                if(r < min || min === null)
                  min = r
            }
            return min
          }
        }
        /*
        ~~~~~~~~~~~~~~~~~~~~~~~~
        Async
        
        
        */
        // keys function consistant with for
        function keysFor(obj){
          a = []
          for(i in obj)
            a.push(i)
          return a
        }
        
        var curry = require('curry')
        
        function async(object,func,collect,done){
          var keys = keysFor(object)
            , i = 0
            item()
            function next(r){
              if(collect){//call collect(r,key,value,object,done)
                var stop = collect(r,keys[i],object[keys[i]],object)
                if(stop) return done(stop)
              } 
              i ++ 
              if(i < keys.length)
                process.nextTick(item)
              else 
                done()
            }
            function item(){
            //func(value,key,next,object)
              func(object[keys[i]],keys[i],next,object)
            }
        }
        
        exports.async = {
          each: function (object,func,done){
            async(object,func,null,done)
          },
          find: function (object,func,done){
          
            async(object,func,collect,done)
            function collect(r,k,v){
              if(r)
                return v
            }
        
          },
          map: function (object,func,done){
            var map = []
            async(object,func,collect,curry([map],done))//curry creates a closure around map
            function collect(r,k,v){
            //  log('map',map,'push(',r,')')
              map.push(r)
            }
          },
          copy: function (object,func,done){
            var map = (object instanceof Array ? [] : {})
            async(object,func,collect,curry([map],done))
            function collect(r,k,v){
              map[k] = (r)
            }
          },
          max: function (object,func,done){
            var max 
            async(object,func,collect,fin)
            function collect(r,k,v){
              if(r > max || max == null)
                max = r
            }
            function fin (){
              done(max)
            }
          },
          min: function (object,func,done){
            var min
            async(object,func,collect,fin)
            function collect(r,k,v){
              if(r < min || min == null)
                min = r
            }
            function fin (){
              done(min)
            }
          },
        
        }
      },
      resolves: {
        curry: "/home/dominic/npm/.npm/curry/0.0.1/package/curry.js"
      }
    },
    '/home/dominic/npm/.npm/traverser/0.0.1/package/traverser.js': {
      closure: function (require,module,exports,__filename,__dirname){
        //traverser2
        var curry = require('curry')
          , sync = require('./iterators').sync
          , async = require('./iterators').async
        
        module.exports = traverse
        module.exports.sync = sync
        module.exports.async = async
        
        exports.isObject = isObject
        exports.isComplex = isComplex
        
        function isObject (props){
          return ('object' === typeof props.value)
        }
        
        var complex =
          { 'function': true
          , 'object': true
          , 'string': false
          , 'boolean': false
          , 'number': false
          , 'undefined': false
        }
        function isComplex (props){
          return complex[typeof props.value]
        }
        function defaultLeaf(p){
          return p.value
        }
        function defaultBranch (p){
          return p.iterate()
        }
        function defaultLeafAsync(p,next){
          next(p.value)
        }
        function defaultBranchAsync (p,next){
          //log('DEFAULT BRANCH ASYNC')
          p.iterate(next)
        }
        
        function traverse (object,opts,done){
        
          if('function' == typeof opts)
            opts = { each: opts
                   , done: done }
        
          opts.async = !!(opts.done)//async mode if done is defined.
        
          if (opts.each)
            opts.leaf = opts.branch = opts.each
          if(!opts.leaf)
            opts.leaf = opts.async ? defaultLeafAsync : defaultLeaf
          if(!opts.branch)
            opts.branch = opts.async ? defaultBranchAsync : defaultBranch
        
          if(!opts.isBranch)
            opts.isBranch = exports.isObject
        
          var cont = opts.done ? async : sync
        
          if(!opts.iterator)
            opts.iterator = 'map'
        
          if('string' == typeof opts.iterator){
            var s = opts.iterator
            opts.iterator = cont[s]
            
            if (!opts.iterator)
              throw new Error('\'' + s + '\' is not the name of a traverse iterator.'
                + ' try one of [' + Object.keys(cont) + ']')
            }
        
          var props = 
                { parent: null
                , key: null
                , value: object
                , before: true
                , circular: false
                , reference: false
                , path: [] 
                , seen: []
                , ancestors: []
                , iterate: curry([opts.iterator],iterate)
                }
        
          //setup iterator functions -- DIFFERENT IF ASYNC
          Object.keys(cont).forEach(function(key){
            var func = cont[key]
            props[key] = curry([func],iterate)
          })
        
          if(opts.pre){
            props.referenced = false
            var refs = []
            traverse(object, {branch: check})
            
            function check(p){
              if(p.reference)
                refs.push(p.value)
              else
                p.each()
            }
        
            props.repeated = refs
          }
                
          function iterate(iterator,done){
            var _parent = props.parent
              , _key = props.key
              , _value = props.value
              , _index = props.index
              , _referenced = props.referenced
              , r
            //log('DONE()',done)
            props.ancestors.push(props.value)
            props.parent = props.value
            props.next = c
            r = iterator(props.value,makeCall,c)
            //seperate this function for async
            if(!opts.async) return c(r)
            function c(r){
              //log('teardown branch ',r)
              
              props.key = _key
              props.value = _value
              props.parent = _parent
              props.index = _index
              if(opts.pre)
                props.referenced = _referenced
        
              props.ancestors.pop()
              if(opts.async) done(r)
              return r //returned will be ignored if async
            }
          }
        
          function makeCall(value,key,next){//next func here if async.
            var r, index
            //using immutable objects would simplify this greatly, 
            //because I could not have to teardown...
            //maybe. would have to not depend on closures.
            if(key !== null)
              props.path.push(key)
            props.key = key
            props.value = value
            if(opts.async)
              props.next = c
        
            if(opts.isBranch(props)){
              index = 
                { seen: props.seen.indexOf(props.value)
                , ancestors: props.ancestors.indexOf(props.value) }
                
                if(opts.pre){
                  index.repeated = props.repeated.indexOf(props.value)
                  props.referenced = (-1 !== index.repeated)
                }
        
              props.index = index
            
              props.circular = (-1 !== index.ancestors)
              ;(props.reference = (-1 !== index.seen)) 
                || props.seen.push(value)
        
              r = opts.branch(props,c)
            } else {
              r = opts.leaf(props,c)
            }
            
            if(!opts.async) return c(r) //finish up, if sync
            function c (r){
              if(key !== null)
                props.path.pop()
              if(opts.async) next(r)
              return r
            }
          }
          
         return makeCall(object,null,opts.done)
        }
      },
      resolves: {
        curry: "/home/dominic/npm/.npm/curry/0.0.1/package/curry.js",
        './iterators': "/home/dominic/npm/.npm/traverser/0.0.1/package/iterators.js"
      }
    },
    '/home/dominic/npm/.npm/traverser/0.0.1/package/index.js': {
      closure: function (require,module,exports,__filename,__dirname){
        var e = module.exports = require('./traverser')
      },
      resolves: {
        './traverser': "/home/dominic/npm/.npm/traverser/0.0.1/package/traverser.js"
      }
    },
    '/home/dominic/npm/.npm/render/0.0.2/package/render.js': {
      closure: function (require,module,exports,__filename,__dirname){
        //render2.js
        //a better renderer using traverser
        
        var traverser = require('traverser')
        //  , inspect = require('sys').inspect
        exports = module.exports = render
        
        exports.Special = Special
        
        function Special (string){
          if(!(this instanceof Special)) return new Special(string)
          this.toString = function(){return string}
        }
        
        var defaults = {
          indent: ''
        , pad: ''
        , padKey: ' '
        , padSingle: ['', '']
        , padJoin: [' ', ' ']
        , padMulti: ['', '']
        , padRoot: ['', '']
        , joiner: ', '
        , padJoinCompact: [' ', ' ']
        , joinerCompact: ', '
        , indentCompact: ''
        , compactLength: false
        , isCompact: function (object,p){
            if(!this.compactLength)
              return false
            var length = 0
            for(var i in object){
              if(object[i] && ('object' == typeof object[i] || 'function' == typeof object[i]))
                length += object[i].length || 5
              else
                length += ('' + object[i]).length + 2
            }
            return (length < this.compactLength)
          }
        , string: function (string,p){
            return JSON.stringify(string)
          }
        , value: function (value,p){
            if(p.value === undefined)
              return 'undefined'
            if('string' === typeof value){
              if(!this.string)
                require('logger')("!this.string", this)
        
              return this.string(value,p,function (z,x,c){return this.__proto__.string(z,x,c)})
            }
        //      return "\"" + value.split('\n').join('\n ') + "\""
        
            return JSON.stringify(value)
          }
        , key: function (key, p){
            return p.parent instanceof Array ? '' : (/^\w+$/(key) ? key : "'" + key + "'") + ":" + this.padKey
          }
        , join: function (lines,p,def){
            var self = this
              , pad = lines.length ? self.pad : ''
              , joiner = this.joiner
              , padJoin = this.padJoin
              , indentation = this.indent
        
            if(!lines.length)
              return ''
            if(this.isCompact(lines,p)){
              joiner = this.joinerCompact
              padJoin = this.padJoinCompact
              indentation = this.indentCompact
            }
              
        
            return ( padJoin[0] + 
                      lines.map 
                      ( function (e) {return indent(e, indentation)} ).join (joiner)
                    + padJoin[1])
          }
        , reference: function (rendered,p){
          return 'var' + p.index.repeated
        }
        , referenced: function (index,p){
           return 'var' + index + '='
        }
        , surround: function (objString,p){
            if(p.value instanceof Date || p.value instanceof RegExp || p.value instanceof Special)
              return p.value.toString()
            if(p.value instanceof Array)
              return '[' + objString + ']'
            if(p.value === null)
              return 'null'
            if('function' == typeof p.value)
              return  p.value.toString().replace(/{(\n|.)+}$/,'{...}')
            return '{' + objString + '}'
          }
        , multiline: function (objString,p){
          if(p.parent)
            return this.padMulti[0] + objString + this.padMulti[1]
          return this.padRoot[0] + objString + this.padRoot[1]
        }
        }
        function render (obj, options){
          options = options || {}
          if(options.multi){
            options.indent = '  '
            options.joiner = '\n, '
        /*    options.padSingle = ['','']
            options.padJoin = [' ',' ']*/
          }
        
            options.__proto__ = defaults
          return traverser(obj, {branch: branch, leaf: leaf, isBranch:isBranch, pre:true})
          
          function isBranch(p){
            return ('function' == typeof p.value || 'object' == typeof p.value)
          }
          function branch (p){
            var key = (p.parent ? call('key',p.key,p) : '')    
          
            if(p.reference){
             var r = call('reference',p.index.seen,p)
              if(r !== undefined) return key + r
            }
            var object = call('surround',call('join',p.map(),p),p)
              if(object && -1 !== object.indexOf('\n') )
                object = call('multiline',object,p)
        
            return key + (p.referenced ? call('referenced',p.index.repeated,p) : '') + object
          }
          function leaf (p){
            return (p.parent ? call('key',p.key,p) : '') + options.padSingle[0] + call('value',p.value,p) + options.padSingle[1]
          }
          function call(method,value,p){
            return options[method](value,p,function (x,y,z){return options.__proto__[method](x,y,z)})
          }
        }
        
        function indent (s, ch){
            return s.split('\n').join('\n' + ch)
        }
      },
      resolves: {
        traverser: "/home/dominic/npm/.npm/traverser/0.0.1/package/index.js"
      }
    },
    '/home/dominic/npm/.npm/it-is/0.0.1/package/assert.js': {
      closure: function (require,module,exports,__filename,__dirname){
        //asserters
        
        var assert = require('assert')
          , traverser = require('traverser')
          , render = require('render')
        
        exports = module.exports = {
          typeof: function (actual,expected,message){
            if(expected !== typeof actual)
              assert.fail(actual, expected, (actual + ' typeof ' + expected),'typeof',arguments.callee)
          }
        , instanceof: function (actual,expected,message){
            if(!(actual instanceof expected))
              assert.fail(actual,expected, message,'instanceof',arguments.callee)
          }
        , primitive: function (actual,message){
            if('function' == typeof actual || 'object' == typeof actual) 
              assert.fail(actual, 'must be number, string, boolean, or undefined'
                , message,'primitive',arguments.callee)
          }
        , complex: function (actual,message){
            if('function' !== typeof actual && 'object' !== typeof actual) 
              assert.fail(actual,'must be object or function' 
                , message,'complex',arguments.callee)
          }
        , function: function (actual,message){
            if('function' !== typeof actual) 
              assert.fail('function',actual 
                , message,'should be a',arguments.callee)
          }
        , property: function (actual,property,value,message){
            if(!actual[property] && value == null)
            //checks that property is defined on actual, even if it is undefined (but not deleted)
              assert.fail(actual , property
                , message,'must have property',arguments.callee)
            //if value is a function, assume it is an assertion... apply it to actual[property]
            if('function' == typeof value)
              value(actual[property])
            else if (value != null) //else if value is exiting, check it's equal to actual[property]
              exports.equal(actual[property],value, message) 
              
            //if you want to assert a value is null or undefined,
            //use .property(name,it.equal(null|undefined))
          }
        , has: has
        , every: every
        , throws: throws
        , matches : function (input,pattern,message) {
            if(!pattern(input))
              assert.fail(input, pattern
              , (message || '')  + "RegExp " +
              + pattern + ' didn\'t match \'' + input+ '\' ' , 'matches',arguments.callee)
          //JSON doesn't write functions, (i.e. regexps,). make a custom message
          }
        , like: function (actual,expected,respect,message) {
            respect = respect || {} 
            var op = 'like({' +
              [ respect.case ? 'case: true' : '' 
              , respect.whitespace ? 'whitespace: true' : '' 
              , respect.quotes ? 'quotes: true' : '' 
              ].join() 
              + '})'
              
            var a = '' + actual, e = '' + expected
            
            if(!respect.case) {
              a = a.toLowerCase()
              e = e.toLowerCase()
            }
            if(!respect.whitespace) {
              a = a.replace(/\s/g,'')
              e = e.replace(/\s/g,'')
            }
            if(!respect.quotes) {
              a = a.replace(/\"|\'/g,'\"')
              e = e.replace(/\"|\'/g,'\"')
            }
        
            if(a != e)
              assert.fail(a, e
              , message , 'like',arguments.callee)
          }
        }
        exports.__proto__ = assert
        
        //man, prototypal inheritence is WAY better than classical!
        //if only it supported multiple inheritence. that would be awesome.
        
        function throws(tested,checker) {
          try{
            tested()
          } catch (err){
            if(checker)
              checker(err)
            return 
          }
          throw new assert.AssertionError ({message: "expected function" + tested + "to throw"})
        }
        
        function every (array,func){
          try{
          assert.equal(typeof array,'object',"*is not an object*")
          }catch(err){
            err.every = array
            err.index = -1
            throw err
          }
          for(var i in array){
            try {
              func.call(null,array[i])
            } catch (err) {
              if(!(err instanceof Error) || !err.stack){
                var n = new Error("non error type '" + err + "' thrown as error.")
                n.thrownValue = err
                err = n
              }
        //      err.stack = //bad way. stack is a getter.
        //        "it/asserters.every intercepted error at item[" + render(i) + "]\n" + err.stack
              err.every = array
              err.index = i
              throw err
            }
          }
        }
        
        function has(obj,props) {
          var pathTo = []
          
          //traverser has lots og functions, so it needs a longer stack trace.
          var orig = Error.stackTraceLimit 
          Error.stackTraceLimit = orig + 20
        
          try{
            assert.ok(obj,"it has no properties!")
            assert.ok(props)
        
            traverser(props,{leaf:leaf, branch: branch})
          } catch (err){
              if(!(err instanceof Error) || !err.stack) {
                var n = new Error("non error type '" + err + "' thrown as error.")
                n.thrownValue = err
                err = n
              }
              err.stack = 
                "it/asserters.has intercepted error at path: " 
                  + renderPath(pathTo) + "\n" + err.stack
              err.props = props
              err.object = obj
              err.path = pathTo
              Error.stackTraceLimit = orig
        
              throw err
          }
          function leaf(p){
            pathTo = p.path
            var other = path(obj,p.path)
            if('function' == typeof p.value){
              p.value.call(p.value.parent,other)
            } 
            else {
            //since this is the leaf function, it cannot be an object.
            assert.equal(other,p.value)
            }
          }
          function branch (p){
            pathTo = p.path
        
            var other = path(obj,p.path)
            if('function' !== typeof p.value)
              exports.complex(other, other + " should be a type which can have properties, " + render(p.value)) //,typeof p.value)
            p.each()
          }
        }
        
        function path(obj,path,message){
          var object = obj
          for(i in path){
            var key = path[i]
            obj = obj[path[i]]
            if(obj === undefined) 
              assert.fail("expected " + render(object),renderPath(path),message,"hasPath",arguments.callee)
        //      assert.fail(obj,path,message,'hasPath',path)
        //      throw new Error ("object " + render (obj) + "did not have path:" + render(path))
          }
          return obj
        }
        
        function renderPath(path){
          return path.map(function (e){
            if(!isNaN(e))
              return '[' + e + ']'
            if(/^\w+$/(e))
              return '.' + e
            return '[' + JSON.stringify(e) + ']' 
          }).join('')
        }
      },
      resolves: {
        assert: "/home/dominic/dev/core/assert.js",
        traverser: "/home/dominic/npm/.npm/traverser/0.0.1/package/index.js",
        render: "/home/dominic/npm/.npm/render/0.0.2/package/render.js"
      }
    },
    '/home/dominic/npm/.npm/it-is/0.0.1/package/test/assert.expresso.js': {
      closure: function (require,module,exports,__filename,__dirname){
        //asserters.expresso.js
        
        var asserters = require('it-is/assert')
          , assert = require('assert')
        
        var deleted_a = {a: true}
        delete deleted_a.a
        
        var a,b,c,d,e
        var examples =
        { ok : {
            pass : [[1], [2], [-1], ['sadf'], [true], [[]], [{}]]
          , fail : [[0],[false],[null],[undefined]]
          }
          
        , equal : {
            pass : [ [1,1], [2,2.0], [-1,-1], ['sadf','sadf'], [true,1]
                   , [a = [], a], [b = {}, b]]
          , fail : [ [0,1], [[],[]] ]
          }
          
        , typeof : {
            pass : [ [1, 'number']
                   , [NaN, 'number']
                   , ['', 'string']
                   , [{}, 'object']
                   , [null,'object']
                   , [undefined, 'undefined'] ]
          , fail : [ [0, 'string'] ]
          }
          
        , instanceof : {
            pass : [ [{}, Object], [[], Object], [[], Array]
                   , [new Error, Error], [function (){}, Function]]
          , fail : [ [{}, Array] ]
          }
        , has : {// has basicially checks if expected is a sub tree of actual.
            pass : [ [{a: 1}, {a: 1}]
                   , [{a: 1, b: 2}, {a: 1}]
                   , [{a: 1}, {a: assert.ok}]  //also, it applies functions in expected 
                   ]
          , fail : [ [{a: 1}, {a: 1, b: 2}]
                   , [{a: 1}, {a: {}}] 
                   , [{}, {a: {}}] 
                   , [{a: false}, {a: assert.ok}] 
                   ]
          }
        , every : { 
            pass : [ [[1,2,3,4,5],assert.ok] ]
          , fail : [ [[1,2,3,4,5,false],assert.ok] ]
          }
        
        , primitive : {
            pass : [ [1], [2], [3], ['sadgsdf'] [true], [false], [undefined] ]
          , fail : [ [null], [[]], [{}], [new Error], [function (){}] ]
          }
        
        , complex : {
            pass : [ [null], [[]], [{}], [new Error], [function (){}] ]
          , fail : [ [1], [2], [3], ['sadgsdf'] [true], [false], [undefined] ]
          }
        , function : {
            pass : [ [function(){}], [/asdf/], [Error], [({}).constructor] ]
          , fail : [ [1], [2], [3], ['sadgsdf'] [true], [false], [undefined] ]
          }
        , matches : {
            pass : [ ['hello', /\w+/] , ['asdgsadg', /[a|s|d|g]+/] ]
          , fail : [ ['sgfg-', /^\w+$/] ]
          }
        //like (actual,expected,{case:boolean,whitespace:boolean,quotes:boolean}) //all default to on.
        
        , like : {
            pass : 
            [ ['hello\n', 'hello'] 
            , ['asdgsadg', 'ASDGSADG']
            , ['"quoted"', "'quoted'"]
            , ['1234', '1\n2\n3\n4\n']
            ]
          , fail : 
            [ ['hello\n', 'hello', {whitespace: true}] 
            , ['asdgsadg', 'ASDGSADG', {case: true}]
            , ['"quoted"', "'quoted'", {quotes: true}]
            ]
          }
        , property : {
            pass : [ [{a:true}, 'a'], [[],'length',0], ['hello','length', 5], [{a:1}, 'a', assert.ok ], [{a:null}, 'a', function (actual){assert.equal(actual,null)} ] ]
          , fail : [ [{}, 'a'], [deleted_a, 'a'], [{a:undefined}, 'a'], ['hello','length', 7] ,[{a:false}, 'a', assert.ok]]
          }
        }
        
        exports ['check examples'] = function (){
        //  check('ok')
          for(i in examples){
        //    console.log(i)
        //    console.log(examples[i])
            check(i)
          }
        }
        
        function check(name){
          //check passes
          examples[name].pass.forEach(function (e,k){
            console.log(name + '(' + e.join() + ')')
            asserters[name].apply(null,e)
          })
          //check fails
          examples[name].fail.forEach(function (e){
            console.log(name + '(' + e.join() + ') -> fail')
            try {
              asserters[name].apply(null,e)
              console.log('SHOULD HAVE FAILED')
            } catch (err){
              if(!(err instanceof assert.AssertionError)){
                console.log('should be assertion error')
                  throw err
                }
              return
            }
            assert.ok(false,"expected " + name + "(" + e.join() + ") to fail")
          })
        }
          
        exports ['every'] = function (){
          asserters.every([1,2,3,4,5,6],function (x){
            assert.ok('number' == typeof x)
          })
          assert.throws(function(){  
            asserters.every([1,2,'asda',4,5,6],function (x){
              assert.ok('number' == typeof x)
            })
          })
        }
        
        
        exports ['throws can check what object is thrown'] = function (){
        
          var examples = 
          [ [ 'throws', 
              [ function () {throw "HELLO"}
              , function (thrown) { assert.equal(thrown,"HELLO") } ] ]
          , [ 'throws', 
              [ function () {throw "HELLO"} ] ]
          ]
          examples.forEach(function (c){
            asserters[c[0]].apply(null,c[1])
          })
        }
        
        
        exports ['every intercepts error, records item errored at'] = function (){
          var examples = 
          [ [ [1,2,3,4,5,null], assert.ok, 5] 
          , [ [null,'sadf','sadfg'], assert.ok, 0] 
          , [ [null,null,null,1], assert.ifError, 3]
          ]
          //  asserters.every([null,null,null,1], assert.ifError)
            
          examples.forEach(function (e){
            try {  
              asserters.every(e[0],e[1])
            } catch (err) {
              assert.equal(err.index,e[2])
            }
          })
        }
        
        exports ['has intercepts error, records path item errored at'] = function (){
        
          var examples = 
          [ [ {a: null}, {a: assert.ok}, ['a']] 
          , [ {'a-b-c': {0: {x: false } } }, {'a-b-c': {0 : {x:assert.ok}}}, ['a-b-c',0,'x']] 
          , [ {a:{}},{a:{b: 1}}, ['a','b']]
          ]
        
        //  asserters.has()
            
          examples.forEach(function (e){
            try {  
              asserters.has(e[0],e[1])
            } catch (err) {
              return assert.deepEqual(err.path,e[2])
            }
            assert.ok(false,"expected has to throw error at path " + inspect(e[2]))
          })
        
        }
      },
      resolves: {
        'it-is/assert': "/home/dominic/npm/.npm/it-is/0.0.1/package/assert.js",
        assert: "/home/dominic/dev/core/assert.js"
      }
    }
  },
  main: "/home/dominic/npm/.npm/it-is/0.0.1/package/test/assert.expresso.js",
  request: "it-is/test/assert.expresso",
  paths: [
    "/home/dominic/npm",
    "/home/dominic/dev",
    "/home/dominic/.node_modules",
    "/home/dominic/.node_libraries",
    "/home/dominic/source/nvm/v0.4.2/lib/node"
  ],
  pwd: "/home/dominic/dev/bnr"
});
