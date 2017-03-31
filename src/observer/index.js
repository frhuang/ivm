import Dep from './dep';
import { arrayMethods } from './array'
import { 
  def, 
  isObject, 
  hasProto, 
  hasOwn, 
  isPlainObject } from '../utils/index'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

export default class Observer {
  constructor (data) {
    this.data = data;
    this.vmCount = 0
    this.dep = new Dep();
    def(data, '__ob__', this);
    if (Array.isArray(data)) {
      const augment = hasProto 
        ? protoAugment
        : copyAugment
      augment(data, arrayMethods, arrayKeys);
      this.observerArray(data);
    } else {
      this.observerObject(data);
    }
  }

  observerArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
  
  observerObject (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
}


function protoAugment (target, src) {
  target.__proto__ = src;
}

function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key])
  }
}

function observe (value, asRootData) {
  if (!isObject(value)) return;
  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (Array.isArray(value) || isPlainObject(value) ){
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

function defineReactive(obj, key, val) {
  const dep = new Dep()
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return;
  }
  let childOb = observe(val) 
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
        if (Array.isArray(val)) {
          dependArray(val)
        }
      }
      return val
    },
    set: function (newVal) {
      if (val === newVal) return;

      val = newVal;
      childOb = observe(newVal)
      dep.notify();
    }
    });
}

function dependArray (value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}