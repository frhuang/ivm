/**
 * compiler
 * @description: 实现对模板的编译，提取指令并将vm与视图关联起来
 */
import Watcher from '../observer/watcher';
import { computeExpression } from '../utils/index';
import { parseTextExp, parseClassExp, parseStyleExp} from './parser/index';
import { nodeToFragement, checkDirective, updater } from './helpers';
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

    if (node.childNodes && node.childNodes.length) {
      [].slice.call(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          self.compileTextNode(child, scope);
        } else if (child.nodeType === 1) {
          self.compileElementNode(child, scope);
        }
      });
    }
  }

  compileTextNode (node, scope) {
    var text = node.textContent.trim();
    if (!text) return;

    var exp = parseTextExp(text);
    scope = scope || this.vm;
    this.bindWatcher(node, scope, exp, 'text');
  }

  compileElementNode (node, scope) {
    var attrs = [].slice.call(node.attributes);
    var lazyCompileDir = '';
    var lazyCompileExp = '';
    var self = this;
    scope = scope || this.vm;
    attrs.forEach((attr) => {
      var attrName = attr.name;
      var exp = attr.value;
      var dir = checkDirective(attrName);
      if (dir.type) {
        if (dir.type === 'for' || dir.type === 'if') {
          lazyCompileDir = dir.type;
          lazyCompileExp = exp;
        } else {
          var handler = self[dir.type + 'Handler'].bind(self);
          if (handler) {
            handler(node, scope, exp, dir.prop);
          } else {
            console.error('找不到' + dir.type + '指令');
          }
        }
        node.removeAttribute(attrName);
      }
    });

    if (lazyCompileExp) {
      this[lazyCompileDir + 'Handler'](node, scope, lazyCompileExp);
    } else {
      this.compile(node, scope);
    }
  }

  bindWatcher (node, scope, exp, dir, prop) {
    var updateFn = updater[dir];
    var watcher = new Watcher(exp, scope, function (newVal) {
      updateFn && updateFn(node, newVal, prop);
    })
  }

  onHandler (node, scope, exp, eventType) {
    if (!eventType) {
      return console.error('绑定方法有误 ');
    }
    var fn = scope[exp];
    if (typeof fn === 'function') {
      node.addEventListener(eventType, fn.bind(scope));
    } else {
      node.addEventListener(eventType, () => {
        computedExpression(exp, scope);
      })
    }
  }

  modelHandler (node, scope, exp, prop) {
    if (node.tagName.toLowerCase() === 'input') {
      var self = this;
      switch (node.type) {
        case 'checkbox':
          this.bindWatcher(node, scope, exp, 'checkbox');
          node.addEventListener('change', (e) => {
            var target = e.target;
            var value = target.value || target.$id;
            var index = scope[exp].indexOf(value);
            if (target.checked && index < 0) {
              scope[exp].push(value);
            } else if (!target.checked && index > -1) {
              scope[exp].splice(index, 1);
            }
          });
          break;
        case 'radio':
          ths.bindWatcher(node, scope, exp, 'radio');
          node.addEventListener('change', (e) => {
            var newVal = e.target.value;
            scope[exp] = newVal;
          });
          break;
        case 'file':
          this.bindWatcher(node, scope, exp, 'value');
          node.addEventListener('change', (e) => {
            var newVal = e.target.value;
            scope[exp] = newVal;
          });
          break;
        default: 
          this.bindWatcher(node, scope, exp, 'value');
          node.addEventListener('input', (e) => {
            node.isInputting = true;
            var newVal = e.target.value;
            scope[exp] = newVal;
          });
          break;
      }
    }
  }

  htmlHandler (node, scope, exp, prop) {
    var updateFn = updater.html;
    var self = this;
    var watcher = new Watcher(exp, scope, (newVal) => {
      updateFn && updateFn(node, newVal, prop);
      self.compile(node, scope);
    });
  }

  showHandler (node, scope, exp, prop) {
    this.bindWatcher(node, scope, exp, 'style', 'display');
  }

  bindHandler (node, scope, exp, attr) {
    switch (attr) {
      case 'class': 
        exp = '"' + node.className + '"' + parseClassExp(exp);
        break;
      case 'style': 
        var styleStr = node.getAttribute('style');
        exp = '"' + styleStr + ';"+' + parseStyleExp(exp);
        break;
      default:
    }
    this.bindWatcher(node, scope, exp, 'attr', attr);
  }

  ifHandler (node, scope, exp, prop) {
    this.compile(node, scope);
    var refNode = document.createTextNode('');
    node.parentNode.insertBefore(refNode, node);
    var current = node.parentNode.removeChild(node);
    this.bindWatcher(current, scope, exp, 'dom', refNode);
  }

  forHandler (node, scope, exp, prop) {
    var self = this;
    var itemName = exp.split('in')[0].replace(/\s/g, '');
    var attrNames = exp.split('in')[1].replace(/\s/g, '').split('.');
    var parentNode = node.parentNode;
    var startNode = document.createTextNode('');
    var endNode = document.createTextNode('');
    var range = document.createRange();
    parentNode.replaceChild(endNode, node);
    parentNode.insertBefore(startNode, endNode);
    var watcher = new Watcher(attrNames.join('.'), scope, (newArray, oldArray, options) => {
      range.setStart(startNode, 0);
      range.setEnd(endNode, 0);
      range.deleteContents();
      newArray.forEach((item, index) => {
        var cloneNode = node.cloneNode(true);
        parentNode.insertBefore(cloneNode, endNode);
        var forScope = Object.create(scope);
        forScope.$data.$index = index;
        forScope.$data[itemName] = item;
        self.compile(cloneNode, forScope);
      });
    });
  }
}

