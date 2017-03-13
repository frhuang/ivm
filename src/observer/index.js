import Dep from './dep';

export default class Observer {
  constructor (data) {
    this.data = data;
    this.observe(data);
  }

  observe (data) {
    var self = this;

    if (!data || typeof data !== 'object') {
      return;
    }
    Object.keys(data).forEach((key) => {
      self.observeObject(data, key, data[key]);
    })
  }

  observeObject (data, key, val) {
    var dep = new Dep();
    var self = this;
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: false,
      get: function () {
        Dep.target && dep.addSub(Dep.target);
        return val;
      },
      set: function (newVal) {
        if (val === newVal) return;

        val = newVal;
        if (Array.isArray(newVal)) {
          self.observeArray(newVal, dep);
        } else {
          self.observe(newVal);
        }
        dep.notify();
      }
    });

    if (Array.isArray(val)) {
      self.observeArray(val, dep);
    } else {
      self.observe(val);
    }
  }

  observeArray (arr, dep) {
    var self = this;
    arr.__proto__ = self.defineReactiveArray(dep);
    arr.forEach((item) => {
      self.observe(item);
    })
  }
  //改写Array原型实现数组监视
  defineReactiveArray (dep) {
    var arrayPrototype = Array.prototype;
    var arrayMethods = Object.create(arrayPrototype);
    var self = this;

    var methods = [
      'pop',
      'push',
      'sort',
      'shift',
      'splice',
      'unshift',
      'reverse'
    ];

    methods.forEach((method) => {
      var original = arrayPrototype[method];
      Object.defineProperty(arrayMethods, method, {
        value: function () {
          var args = [];
          for (let i = 0, l = arguments.length; i < l; i++) {
            args.push(arguments[i]);
          }
          var result = original.apply(this, args);
          var inserted;
          switch (method) {
            case 'push':
            case 'unshift':
              inserted = args;
              break;
            case 'splice': 
              inserted = args.slice(2);
              break;
          }
          if (inserted && inserted.length) {
            self.observeArray(inserted, dep);
          }
          dep.notify({method, args});
          return result;
        },
        enumerable: true,
        writable: true,
        configurable: true
      })
    });

    Object.defineProperty(arrayMethods, '$set', {
      value: function (index, value) {
        if (index >= this.length) {
          index = this.length;
        }
        return this.splice(index, 1, value)[0];
      }
    });

    Object.defineProperty(arrayMethods, '$remove', {
      value: function (item) {
        var index = this.indexOf(item);
        if (index > -1) {
          return this.splice(index, 1);
        }
      }
    });

    return arrayMethods;
  }
}