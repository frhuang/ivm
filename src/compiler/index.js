/**
 * compiler
 * @description: 实现对模板的编译，提取指令并将vm与视图关联起来
 */
var $$id = 0;

export default class Compiler {
  constructor (options) {
    this.$el = options.el;

    this.vm = options.vm;

    if (this.$el) {
      this.$fragment = nodeToFragement(this.$el);
      this.compile(this.$fragment);
      this.$el.appendChild(this.$fragment);
    }
  }

  compile (node, scope) {
    var self = this;
    node.$id = $$id++;
  }
}

