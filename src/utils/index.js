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
    with (scope) {
      return eval(exp);
    }
  } catch (e) {
    console.error('ERROR', e);
  }
}