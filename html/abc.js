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
  if(!this.process)
    this.process = {
      EventEmitter: function EventEmitter(){}
    , nextTick: function (f){return setTimeout(f,0)}
    , title: 'browser'
    , versions: {}
    }
    if(navigator)
      navigator.userAgent
        .split(/\s+\(.*?\)\s+|\s/)
        .forEach(function (e){ 
          var v =/(\w+)\/([\d|.]+)/(e)
          process.versions[v[1]] = v[2]//(e)})
        })
  function b_require (req,parent){

    var fn
    if(!parent) {
      fn = payload.main
    } else //if(req[0] == '.')
      fn = parent.resolves[req]

//    console.log('parent', parent)
//    console.log('filename', fn)

    if(!payload.modules[fn]){
      throw new Error('could not load:\'' + fn +"' expected one of:" + JSON.stringify(Object.keys(payload.modules)))
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
    }
  },
  main: "/home/dominic/dev/core/assert.js",
  request: "assert",
  paths: [
    "/home/dominic/npm",
    "/home/dominic/dev",
    "/home/dominic/.node_modules",
    "/home/dominic/.node_libraries",
    "/home/dominic/source/nvm/v0.4.2/lib/node"
  ],
  pwd: "/home/dominic/dev/bnr"
});
