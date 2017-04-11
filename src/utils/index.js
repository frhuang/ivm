export const hasProto = '__proto__' in {}
/**
 * 判断是否相等
 * @param {*} a 
 * @param {*} b 
 */
export function isEqual(a, b) {
  return a == b || (
    isObject(a) && isObject(b)
    ? JSON.stringify(a) === JSON.stringify(b)
    : false
  )
}

/**
 * 是否是对象
 * @param {*} obj 
 */
export function isObject(obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * 深度复制
 * @param {*} from 
 */
export function deepCopy(from) {
  let dest;
  if (isObject(from)) {
    dest = JSON.parse(JSON.stringify(from))
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
export function computeExpression(exp, scope) {
  try {
    var e = exp.split('+');
    var val = scope.$data;
    var value = "";
    e.forEach(function(k) {
      value = val[k];
    })
    return value;
  } catch (e) {
    console.error('ERROR', e);
  }
}

export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}


export function isPlainObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

export class Set {
  constructor () {
    this.set = Object.create(null)
  }
  has (key) {
    return this.set[key] === true
  }
  add (key) {
    this.set[key] = true
  }
  clear () {
    this.set = Object.create(null)
  }
}