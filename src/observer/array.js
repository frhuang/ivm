import { def } from "../utils/index"

const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto)

;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach((method) => {
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator () {
    // let i = arguments.length
    const args = []
    for (let i = 0, l = arguments.length; i < l; i++) {
      args.push(arguments[i]);
    }
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push': 
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted && inserted.length) {
      ob.observerArray(inserted)
    }
    ob.dep.notify()
    return result
  })

})