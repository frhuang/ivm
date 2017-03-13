import { isEqual, deepCopy, computeExpression } from '../utils';
import Dep from './dep';

var $uid = 0;

export default class Watcher {
  constructor (exp, scope, callback) {
    this.exp = exp;
    this.scope = scope;
    this.callback = callback || function () {};
    this.value = null;
    this.uid = $uid++;
    this.update();
  }
  get () {
    Dep.target = this;
    var value = computeExpression(this.exp, this.scope);
    Dep.target = null;
    return value;
  }
  update (options) {
    var newVal = this.get();
    if (!isEqual(this.value, newVal)) {
      this.callback && this.callback(newVal, this.value, options);
      this.value = deepCopy(newVal);
    }
  }
}