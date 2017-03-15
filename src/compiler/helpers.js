export function nodeToFragment(node) {
  var fragement = document.createDocumentFragment(), child;
  while (child = node.firstChild) {
    if (isIgnorable(child)) {
      node.removeChild(child);
    } else {
      fragement.appendChild(child);
    }
  }
  return fragement;
}

export function isIgnorable(node) {
  var regIgnorable = /^[\t\n\r]+/;
  return (node.nodeType == 8) || ((node.nodeType == 3) && (regIgnorable.test(node.textContent)));
}

export function checkDirective(attrName) {
  var dir = {};
  if (attrName.indexOf('v-') === 0) {
    var parse = attrName.substring(2).split(':');
    dir.type = parse[0];
    dir.prop = parse[1];
  } else if (attrName.indexOf('@') === 0) {
    dir.type = 'on';
    dir.prop = attrName.substring(1);
  } else if (attrName.indexOf(':') === 0) {
    dir.type = 'bind';
    dir.prop = attrName.substring(1);
  }
  return dir;
}

export const updater = {
  text: function (node, newVal) {
    node.textContent = typeof newVal === 'undefined' ? '' : newVal;
  },
  html: function (node, newVal) {
    node.innerHTML = typeof newVal == 'undefined' ? '' : newVal;
  },
  value: function (node, newVal) {
    if (!node.isInputting) {
      node.value = newVal ? newVal : '';
    }
    node.isInputting = false;
  },
  checkbox: function (node, newVal) {
    var value = node.value || node.$id;
    if (newVal.indexOf(value) < 0) {
      node.checked = false;
    } else {
      node.checked = true;
    }
  },
  attr: function (node, newVal, attrName) {
    newVal = typeof newVal === 'undefined' ? '' : newVal;
    node.setAttribute(attrName, newVal);
  },
  style: function (node, newVal, attrName) {
    newVal = typeof newVal === 'undefined' ? '' : newVal;
    if (attrName === 'display') {
      newVal = newVal ? 'initial' : 'none';
    }
    node.style[attrName] = newVal;
  },
  dom: function (node, newVal, nextNode) {
    if (newVal) {
      nextNode.parentNode.insertBefore(node, nextNode);
    } else {
      nextNode.parentNode.removeChild(node);
    }
  }
}