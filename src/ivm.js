import Observer from './observer/index';
import Compiler from './compiler/index';

function Ivm(options) {
  this.$data = options.data || {};
  this.$el = typeof options.el === 'string'
    ? document.querySelector(options.el)
    : options.el || document.body;
  
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
  new Compiler({el: this.$el, vm: this});
}

Ivm.prototype = {
  _proxy: function (data) {
    var self = this;
    var proxy = ['data', 'computed'];
    proxy.forEach(function (item) {
      Object.keys(data[item]).forEach(function (key) {
        Object.defineProperty(self, key, {
          configurable: false,
          enumerable: true,
          get: function () {
            if (typeof self.$data[key] !== 'undefined') {
              return self.$data[key];
            } else if (typeof self.$options.computed[key] !== 'undefined') {
              return self.$options.computed[key].call(self);
            } else {
              return undefined
            }
          },
          set: function (val) {
            if (self.$data.hasOwnProperty(key)) {
              self.$data[key] = val;
            } else if (self.$options.computed.hasOwnProperty(key)) {
              self.$options.computed[key] = val;
            }
          }
        })
      })
    })
  },
  _proxyMethods: function (methods) {
    var self = this;
    Object.keys(methods).forEach(function (key) {
      self[key] = self.$options.methods[key];
    })
  }
}

export default Ivm;