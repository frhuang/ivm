import { isEqual, deepCopy, computeExpression } from '../utils/index';
import Dep from './dep';
import { Set } from '../utils/index'

var $uid = 0;

export default class Watcher {
  constructor (exp, scope, callback) {
    this.exp = exp;
    this.scope = scope;
    this.callback = callback || function () {};
    this.value = null;
    this.uid = $uid++;

    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.update();
  }
  get () {
    Dep.target = this;
    var value = computeExpression(this.exp, this.scope);
    Dep.target = null;
    this.cleanupDeps()
    return value;
  }
  addDep (dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }
  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }
  update (options) {
    var newVal = this.get();
    if (!isEqual(this.value, newVal)) {
      this.callback && this.callback(newVal, this.value, options);
      this.value = deepCopy(newVal);
    }
  }
}