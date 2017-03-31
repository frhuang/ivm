var uid = 0;

export default class Dep {
  constructor () {
    this.id = uid++;
    this.subs = [];
    // this.subs = {}
  }

  addSub (sub) {
    // if (!this.subs[target.uid]) {  //防止重复添加
		//   this.subs[target.uid] = target;
	  // }
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
    // for (var uid in this.subs) {
    //   this.subs[uid].update(options);
    // }
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

Dep.target = null;