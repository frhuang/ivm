import Dep from './dep';

export class Observer {
  constructor (value) {
    this.value = value;
    this.dep = new Dep();
  }
}