export function parseTextExp(text) {
  var regText =/\{\{((?:.|\n)+?)\}\}/g
  var pieces = text.split(regText);
  var matches = text.match(regText);

  var tokens = [];
  pieces.forEach((piece) => {
    if (matches && matches.indexOf('{{' + piece + '}}') > -1) {
      tokens.push(piece);
    } else if (piece) {
      tokens.push('`' + piece + '`');
    }
  });
  return tokens.join('+');
}

export function parseClassExp(exp) {
  if (!exp) return;

  var regObj = /\{(.+?)\}/g;
  var regArr = /\[(.+?)\]/g;
  var result = [];
  if (regObj.test(exp)) {
    var subExp = exp.replace(/[\s\{\}]/g, '').split(',');
    subExp.forEach((exp) => {
      var key = '"' + sub.split(':')[0].replace(/['"`]/g, '') + ' "';
      var value = sub.split(':')[1];
      result.push('((' + value + ')?' + key + ':"")')
    });
  } else if (regArr.test(exp)) {
    var subExp = exp.replace(/[\s\[\]]/g, '').split(',');
    result = subExp.map((sub) => {
      return '(' + sub + ')' + '+" "';
    });
  }
  return result.join('+');
}

export function parseStyleExp(exp) {
  if (!exp) return;

  var regObj = /\{(.+?)\}/g;
  var regArr = /\[(.+?)\]/g;
  var result = [];
  if (regObj.test(exp)) {
    var subExp = exp.replace(/[\s\{\}]/g, '').split(',');
    subExp.forEach((sub) => {
      var key = '"' + sub.split(':')[0].replace(/['"`]/g, '') + ':"+';
      var value = sub.split(':')[1];
      result.push(key + value + '+";"');
    });
  } else if (regArr.test(exp)) {
    var subExp = exp.replace(/[\s\[\]]/g, '').split(',');
    result = subExp.map((sub) => {
      return '(' + sub + ')' + '+";"';
    });
  }
  return result.join('+');
}