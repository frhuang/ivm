## ivm
ivm是一个轻量的前端MVVM框架，参考vue的实现原理。

api跟vue的一样，详细api查看 [http://cn.vuejs.org/v2/api/](http://cn.vuejs.org/v2/api/)

##双向绑定的核心：

1、Object.defineProperty劫持对象的getter, setter从而实现对数据的监控。

2、发布/ 订阅者模式实现数据与视图的自动同步

-- 发布/ 订阅者模式，其实就是addEventListener，大致实现像这样：

```javascript
function EventHandle() {
	var events = {};
	this.on = function (event, callback) {
		callback = callback || function () { };
		if (typeof events[event] === 'undefined') {
			events[event] = [callback];
		} else {
			events[event].push(callback);
		}
	};

	this.emit = function (event, args) {
	  events[event].forEach(function (fn) {
			fn(args);
		});
	};

	this.off = function (event) {
		delete events[event];
	};
}
```

