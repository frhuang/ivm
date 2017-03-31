(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Ivm = factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var uid = 0;

var Dep = function () {
  function Dep() {
    classCallCheck(this, Dep);

    this.id = uid++;
    this.subs = [];
    // this.subs = {}
  }

  createClass(Dep, [{
    key: "addSub",
    value: function addSub(sub) {
      // if (!this.subs[target.uid]) {  //防止重复添加
      //   this.subs[target.uid] = target;
      // }
      this.subs.push(sub);
    }
  }, {
    key: "removeSub",
    value: function removeSub(sub) {
      var index = this.subs.indexOf(sub);

      if (index != -1) {
        this.subs.splice(index, 1);
      }
    }
  }, {
    key: "depend",
    value: function depend() {
      if (Dep.target) {
        Dep.target.addDep(this);
      }
    }
  }, {
    key: "notify",
    value: function notify(options) {
      // for (var uid in this.subs) {
      //   this.subs[uid].update(options);
      // }
      var subs = this.subs.slice();
      for (var i = 0, l = subs.length; i < l; i++) {
        subs[i].update();
      }
    }
  }]);
  return Dep;
}();

Dep.target = null;

var hasProto = '__proto__' in {};
/**
 * 判断是否相等
 * @param {*} a 
 * @param {*} b 
 */
function isEqual(a, b) {
  return a == b || (isObject(a) && isObject(b) ? JSON.stringify(a) === JSON.stringify(b) : false);
}

/**
 * 是否是对象
 * @param {*} obj 
 */
function isObject(obj) {
  return obj !== null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
}

/**
 * 深度复制
 * @param {*} from 
 */
function deepCopy(from) {
  var dest = void 0;
  if (isObject(from)) {
    dest = JSON.parse(JSON.stringify(from));
  } else {
    dest = from;
  }
  return dest;
}

/**
 * 解析表达式
 * @param {*} exp 
 * @param {*} scope 
 */
function computeExpression(exp, scope) {
  try {
    var e = exp.split('.');
    var val = scope.$data;
    e.forEach(function (k) {
      val = val[k];
    });
    return val;
  } catch (e) {
    console.error('ERROR', e);
  }
}

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

var Set = function () {
  function Set() {
    classCallCheck(this, Set);

    this.set = Object.create(null);
  }

  createClass(Set, [{
    key: 'has',
    value: function has(key) {
      return this.set[key] === true;
    }
  }, {
    key: 'add',
    value: function add(key) {
      this.set[key] = true;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.set = Object.create(null);
    }
  }]);
  return Set;
}();

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    // let i = arguments.length
    var args = [];
    for (var i = 0, l = arguments.length; i < l; i++) {
      args.push(arguments[i]);
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted = void 0;
    switch (method) {
      case 'push':
        inserted = args;
        break;
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted && inserted.length) {
      ob.observerArray(inserted);
    }
    ob.dep.notify();
    return result;
  });
});

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

var Observer = function () {
  function Observer(data) {
    classCallCheck(this, Observer);

    this.data = data;
    this.vmCount = 0;
    this.dep = new Dep();
    def(data, '__ob__', this);
    if (Array.isArray(data)) {
      var augment = hasProto ? protoAugment : copyAugment;
      augment(data, arrayMethods, arrayKeys);
      this.observerArray(data);
    } else {
      this.observerObject(data);
    }
  }

  createClass(Observer, [{
    key: 'observerArray',
    value: function observerArray(items) {
      for (var i = 0, l = items.length; i < l; i++) {
        observe(items[i]);
      }
    }
  }, {
    key: 'observerObject',
    value: function observerObject(obj) {
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i], obj[keys[i]]);
      }
    }
  }]);
  return Observer;
}();

function protoAugment(target, src) {
  target.__proto__ = src;
}

function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

function observe(value, asRootData) {
  if (!isObject(value)) return;
  var ob = void 0;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (Array.isArray(value) || isPlainObject(value)) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob;
}

function defineReactive(obj, key, val) {
  var dep = new Dep();
  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }
  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function get$$1() {
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (Array.isArray(val)) {
          dependArray(val);
        }
      }
      return val;
    },
    set: function set$$1(newVal) {
      if (val === newVal) return;

      val = newVal;
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

function dependArray(value) {
  for (var e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

var $uid = 0;

var Watcher = function () {
  function Watcher(exp, scope, callback) {
    classCallCheck(this, Watcher);

    this.exp = exp;
    this.scope = scope;
    this.callback = callback || function () {};
    this.value = null;
    this.uid = $uid++;

    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.update();
  }

  createClass(Watcher, [{
    key: 'get',
    value: function get$$1() {
      Dep.target = this;
      var value = computeExpression(this.exp, this.scope);
      Dep.target = null;
      this.cleanupDeps();
      return value;
    }
  }, {
    key: 'addDep',
    value: function addDep(dep) {
      var id = dep.id;
      if (!this.newDepIds.has(id)) {
        this.newDepIds.add(id);
        this.newDeps.push(dep);
        if (!this.depIds.has(id)) {
          dep.addSub(this);
        }
      }
    }
  }, {
    key: 'cleanupDeps',
    value: function cleanupDeps() {
      var i = this.deps.length;
      while (i--) {
        var dep = this.deps[i];
        if (!this.newDepIds.has(dep.id)) {
          dep.removeSub(this);
        }
      }
      var tmp = this.depIds;
      this.depIds = this.newDepIds;
      this.newDepIds = tmp;
      this.newDepIds.clear();
      tmp = this.deps;
      this.deps = this.newDeps;
      this.newDeps = tmp;
      this.newDeps.length = 0;
    }
  }, {
    key: 'update',
    value: function update(options) {
      var newVal = this.get();
      if (!isEqual(this.value, newVal)) {
        this.callback && this.callback(newVal, this.value, options);
        this.value = deepCopy(newVal);
      }
    }
  }]);
  return Watcher;
}();

function parseTextExp(text) {
  var regText = /\{\{(.+?)\}\}/g;
  var pieces = text.split(regText);
  var matches = text.match(regText);

  var tokens = [];
  pieces.forEach(function (piece) {
    if (matches && matches.indexOf('{{' + piece + '}}') > -1) {
      tokens.push(piece);
    } else if (piece) {
      tokens.push('`' + piece + '`');
    }
  });
  return tokens.join('+');
}

function parseClassExp(exp) {
  if (!exp) return;

  var regObj = /\{(.+?)\}/g;
  var regArr = /\[(.+?)\]/g;
  var result = [];
  if (regObj.test(exp)) {
    var subExp = exp.replace(/[\s\{\}]/g, '').split(',');
    subExp.forEach(function (exp) {
      var key = '"' + sub.split(':')[0].replace(/['"`]/g, '') + ' "';
      var value = sub.split(':')[1];
      result.push('((' + value + ')?' + key + ':"")');
    });
  } else if (regArr.test(exp)) {
    var subExp = exp.replace(/[\s\[\]]/g, '').split(',');
    result = subExp.map(function (sub) {
      return '(' + sub + ')' + '+" "';
    });
  }
  return result.join('+');
}

function parseStyleExp(exp) {
  if (!exp) return;

  var regObj = /\{(.+?)\}/g;
  var regArr = /\[(.+?)\]/g;
  var result = [];
  if (regObj.test(exp)) {
    var subExp = exp.replace(/[\s\{\}]/g, '').split(',');
    subExp.forEach(function (sub) {
      var key = '"' + sub.split(':')[0].replace(/['"`]/g, '') + ':"+';
      var value = sub.split(':')[1];
      result.push(key + value + '+";"');
    });
  } else if (regArr.test(exp)) {
    var subExp = exp.replace(/[\s\[\]]/g, '').split(',');
    result = subExp.map(function (sub) {
      return '(' + sub + ')' + '+";"';
    });
  }
  return result.join('+');
}

function nodeToFragement(node) {
  var fragement = document.createDocumentFragment(),
      child;
  while (child = node.firstChild) {
    if (isIgnorable(child)) {
      node.removeChild(child);
    } else {
      fragement.appendChild(child);
    }
  }
  return fragement;
}

function isIgnorable(node) {
  var regIgnorable = /^[\t\n\r]+/;
  return node.nodeType == 8 || node.nodeType == 3 && regIgnorable.test(node.textContent);
}

function checkDirective(attrName) {
  var dir = {};
  if (attrName.indexOf('v-') === 0) {
    var parse = attrName.substring(2).split(':');
    dir.type = parse[0];
    dir.prop = parse[1];
  } else if (attrName.indexOf('@') === 0) {
    dir.type = 'on';
    dir.prop = attrName.substring(1);
  } else if (attrName.indexOf(':') === 0) {
    dir.type = 'bind';
    dir.prop = attrName.substring(1);
  }
  return dir;
}

var updater = {
  text: function text(node, newVal) {
    node.textContent = typeof newVal === 'undefined' ? '' : newVal;
  },
  html: function html(node, newVal) {
    node.innerHTML = typeof newVal == 'undefined' ? '' : newVal;
  },
  value: function value(node, newVal) {
    if (!node.isInputting) {
      node.value = newVal ? newVal : '';
    }
    node.isInputting = false;
  },
  checkbox: function checkbox(node, newVal) {
    var value = node.value || node.$id;
    if (newVal.indexOf(value) < 0) {
      node.checked = false;
    } else {
      node.checked = true;
    }
  },
  attr: function attr(node, newVal, attrName) {
    newVal = typeof newVal === 'undefined' ? '' : newVal;
    node.setAttribute(attrName, newVal);
  },
  style: function style(node, newVal, attrName) {
    newVal = typeof newVal === 'undefined' ? '' : newVal;
    if (attrName === 'display') {
      newVal = newVal ? 'initial' : 'none';
    }
    node.style[attrName] = newVal;
  },
  dom: function dom(node, newVal, nextNode) {
    if (newVal) {
      nextNode.parentNode.insertBefore(node, nextNode);
    } else {
      nextNode.parentNode.removeChild(node);
    }
  }
};

/**
 * compiler
 * @description: 实现对模板的编译，提取指令并将vm与视图关联起来
 */
var $$id = 0;

var Compiler = function () {
  function Compiler(options) {
    classCallCheck(this, Compiler);

    this.$el = options.el;

    this.vm = options.vm;

    if (this.$el) {
      this.$fragment = nodeToFragement(this.$el);
      this.compile(this.$fragment);
      this.$el.appendChild(this.$fragment);
    }
  }

  createClass(Compiler, [{
    key: 'compile',
    value: function compile(node, scope) {
      var self = this;
      node.$id = $$id++;

      if (node.childNodes && node.childNodes.length) {
        [].slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            self.compileTextNode(child, scope);
          } else if (child.nodeType === 1) {
            self.compileElementNode(child, scope);
          }
        });
      }
    }
  }, {
    key: 'compileTextNode',
    value: function compileTextNode(node, scope) {
      var text = node.textContent.trim();
      if (!text) return;

      var exp = parseTextExp(text);
      scope = scope || this.vm;
      this.textHandler(node, scope, exp);
    }
  }, {
    key: 'compileElementNode',
    value: function compileElementNode(node, scope) {
      var attrs = [].slice.call(node.attributes);
      var lazyCompileDir = '';
      var lazyCompileExp = '';
      var self = this;
      scope = scope || this.vm;
      attrs.forEach(function (attr) {
        var attrName = attr.name;
        var exp = attr.value;
        var dir = checkDirective(attrName);
        if (dir.type) {
          if (dir.type === 'for' || dir.type === 'if') {
            lazyCompileDir = dir.type;
            lazyCompileExp = exp;
          } else {
            var handler = self[dir.type + 'Handler'].bind(self);
            if (handler) {
              handler(node, scope, exp, dir.prop);
            } else {
              console.error('找不到' + dir.type + '指令');
            }
          }
          node.removeAttribute(attrName);
        }
      });

      if (lazyCompileExp) {
        this[lazyCompileDir + 'Handler'](node, scope, lazyCompileExp);
      } else {
        this.compile(node, scope);
      }
    }
  }, {
    key: 'bindWatcher',
    value: function bindWatcher(node, scope, exp, dir, prop) {
      var updateFn = updater[dir];
      var watcher = new Watcher(exp, scope, function (newVal) {
        updateFn && updateFn(node, newVal, prop);
      });
    }
  }, {
    key: 'onHandler',
    value: function onHandler(node, scope, exp, eventType) {
      if (!eventType) {
        return console.error('绑定方法有误 ');
      }
      var fn = scope[exp];
      if (typeof fn === 'function') {
        node.addEventListener(eventType, fn.bind(scope));
      } else {
        node.addEventListener(eventType, function () {
          computedExpression(exp, scope);
        });
      }
    }
  }, {
    key: 'modelHandler',
    value: function modelHandler(node, scope, exp, prop) {
      if (node.tagName.toLowerCase() === 'input') {
        var self = this;
        switch (node.type) {
          case 'checkbox':
            this.bindWatcher(node, scope, exp, 'checkbox');
            node.addEventListener('change', function (e) {
              var target = e.target;
              var value = target.value || target.$id;
              var index = scope[exp].indexOf(value);
              if (target.checked && index < 0) {
                scope[exp].push(value);
              } else if (!target.checked && index > -1) {
                scope[exp].splice(index, 1);
              }
            });
            break;
          case 'radio':
            ths.bindWatcher(node, scope, exp, 'radio');
            node.addEventListener('change', function (e) {
              var newVal = e.target.value;
              scope[exp] = newVal;
            });
            break;
          case 'file':
            this.bindWatcher(node, scope, exp, 'value');
            node.addEventListener('change', function (e) {
              var newVal = e.target.value;
              scope[exp] = newVal;
            });
            break;
          default:
            this.bindWatcher(node, scope, exp, 'value');
            node.addEventListener('input', function (e) {
              node.isInputting = true;
              var newVal = e.target.value;
              scope[exp] = newVal;
            });
            break;
        }
      }
    }
  }, {
    key: 'htmlHandler',
    value: function htmlHandler(node, scope, exp, prop) {
      var updateFn = updater.html;
      var self = this;
      var watcher = new Watcher(exp, scope, function (newVal) {
        updateFn && updateFn(node, newVal, prop);
        self.compile(node, scope);
      });
    }
  }, {
    key: 'textHandler',
    value: function textHandler(node, scope, exp, prop) {
      this.bindWatcher(node, scope, exp, 'text');
    }
  }, {
    key: 'showHandler',
    value: function showHandler(node, scope, exp, prop) {
      this.bindWatcher(node, scope, exp, 'style', 'display');
    }
  }, {
    key: 'bindHandler',
    value: function bindHandler(node, scope, exp, attr) {
      switch (attr) {
        case 'class':
          exp = '"' + node.className + '"' + parseClassExp(exp);
          break;
        case 'style':
          var styleStr = node.getAttribute('style');
          exp = '"' + styleStr + ';"+' + parseStyleExp(exp);
          break;
        default:
      }
      this.bindWatcher(node, scope, exp, 'attr', attr);
    }
  }, {
    key: 'ifHandler',
    value: function ifHandler(node, scope, exp, prop) {
      this.compile(node, scope);
      var refNode = document.createTextNode('');
      node.parentNode.insertBefore(refNode, node);
      var current = node.parentNode.removeChild(node);
      this.bindWatcher(current, scope, exp, 'dom', refNode);
    }
  }, {
    key: 'forHandler',
    value: function forHandler(node, scope, exp, prop) {
      var self = this;
      var itemName = exp.split('in')[0].replace(/\s/g, '');
      var attrNames = exp.split('in')[1].replace(/\s/g, '').split('.');
      var parentNode = node.parentNode;
      var startNode = document.createTextNode('');
      var endNode = document.createTextNode('');
      var range = document.createRange();
      parentNode.replaceChild(endNode, node);
      parentNode.insertBefore(startNode, endNode);
      var watcher = new Watcher(attrNames.join('.'), scope, function (newArray, oldArray, options) {
        range.setStart(startNode, 0);
        range.setEnd(endNode, 0);
        range.deleteContents();
        newArray.forEach(function (item, index) {
          var cloneNode = node.cloneNode(true);
          parentNode.insertBefore(cloneNode, endNode);
          var forScope = Object.create(scope);
          forScope.$index = index;
          forScope[itemName] = item;
          self.compile(cloneNode, forScope);
        });
      });
    }
  }]);
  return Compiler;
}();

function Ivm(options) {
  this.$data = options.data || {};
  this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el || document.body;

  options = Object.assign({}, {
    computed: {},
    methods: {}
  }, options);
  this.$options = options;
  this.window = window;
  this._proxy(options);
  this._proxyMethods(options.methods);
  var ob = new Observer(this.$data);

  if (!ob) return;
  new Compiler({ el: this.$el, vm: this });
}

Ivm.prototype = {
  _proxy: function _proxy(data) {
    var self = this;
    var proxy = ['data', 'computed'];
    proxy.forEach(function (item) {
      Object.keys(data[item]).forEach(function (key) {
        Object.defineProperty(self, key, {
          configurable: false,
          enumerable: true,
          get: function get() {
            if (typeof self.$data[key] !== 'undefined') {
              return self.$data[key];
            } else if (typeof self.$options.computed[key] !== 'undefined') {
              return self.$options.computed[key].call(self);
            } else {
              return undefined;
            }
          },
          set: function set(val) {
            if (self.$data.hasOwnProperty(key)) {
              self.$data[key] = val;
            } else if (self.$options.computed.hasOwnProperty(key)) {
              self.$options.computed[key] = val;
            }
          }
        });
      });
    });
  },
  _proxyMethods: function _proxyMethods(methods) {
    var self = this;
    Object.keys(methods).forEach(function (key) {
      self[key] = self.$options.methods[key];
    });
  }
};

return Ivm;

})));
//# sourceMappingURL=ivm.js.map
