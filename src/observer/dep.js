let uid = 0;
export default class Dep {
  constructor () {
    this.id = uid++;
    this.subs = [];
  }

  addSub (sub) {
    this.subs.push(sub);
  }

  removeSub (sub) {
    var index = this.subs.indexOf(sub);

    if (index != -1) {
      this.subs.splice(index, 1);
    }
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify (options) {
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

Dep.target = null;
const depTarget = []

export function pushTarget (target) {
  if (Dep.target) depTarget.push(Dep.target)
  Dep.target = target
}

export function popTarget () {
  Dep.target = depTarget.pop()
}
