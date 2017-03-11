var uid = 0;

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

  notify () {
    this.subs.forEach((sub) => {
      sub.update();
    })
  }
}

Dep.target = null;