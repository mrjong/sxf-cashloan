'use strict';

// 默认配置
var DEFAULT_CONFIG = {
	// 上报服务器域名配置
	track_url: 'http://localhost:3300/',
	// debug启动配置
	debug: false,
	// 本地存储配置
	local_storage: {
		// 存储方式  localStorage || cookie
		type: 'localStorage',
		// 存储名称
		name: '',
		// 关闭存储功能
		disable: false,
		// cookie存储时，采用安全的存储方式，即：
		//当secure属性设置为true时，cookie只有在https协议下才能上传到服务器，而在http协议下是没法上传的，所以也不会被窃听
		secure_cookie: false,
		// cookie存储时，跨主域名存储配置
		cross_subdomain_cookie: false,
		// cookie方法存储时，配置保存过期时间
		cookie_expiration: 1000
	},
	// 初始化sdk时触发的方法
	loaded: function loaded() {},
	// 单页面应用配置
	SPA: {
		// 开启SPA配置
		is: false,
		// SPA 实现类型，hash || history
		mode: 'hash'
	},
	// PV指标自动触发配置
	pageview: true,
	// 上报数据前，每个字段长度截取配置，默认不截取
	truncateLength: -1,
	// 会话超时时长，默认30分钟
	session_interval_mins: 30,
	isBpoint: true, // 是否开启断点发送，默认开启
	stackSize: 10, //信息存储栈大小 栈满 则打包 转存到待发送队列
	stackTime: 3, //信息存储栈时间（单位 秒） 定时扫描，栈有数据就发
	queueSize: 20, //待发送队列大小
	queueTime: 5 //待发送队列 自动扫描发送时间
};

// 配置
var CONFIG = {
	DEBUG: false,
	//   LIB_VERSION: "0.1.0",
	isBpoint: true, // 是否开启断点发送，默认开启
	stackSize: 10, //信息存储栈大小 栈满 则打包 转存到待发送队列
	stackTime: 3, //信息存储栈时间（单位 秒） 定时扫描，栈有数据就发

	queueSize: 20, //待发送队列大小
	queueTime: 5 //待发送队列 自动扫描发送时间
};

// People类系统保留属性，用户设置这些属性将无法成功

var _typeof =
	typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol'
		? function(obj) {
				return typeof obj;
		  }
		: function(obj) {
				return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype
					? 'symbol'
					: typeof obj;
		  };

var classCallCheck = function(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError('Cannot call a class as a function');
	}
};

var createClass = (function() {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ('value' in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	return function(Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);
		if (staticProps) defineProperties(Constructor, staticProps);
		return Constructor;
	};
})();

// Save the previous value of the device variable.
var previousDevice = window.device;

var device = {};

var changeOrientationList = [];

// Add device as a global object.
window.device = device;

// The <html> element.
var documentElement = window.document.documentElement;

// The client user agent string.
// Lowercase, so we can use the more efficient indexOf(), instead of Regex
var userAgent = window.navigator.userAgent.toLowerCase();

// Detectable television devices.
var television = [
	'googletv',
	'viera',
	'smarttv',
	'internet.tv',
	'netcast',
	'nettv',
	'appletv',
	'boxee',
	'kylo',
	'roku',
	'dlnadoc',
	'roku',
	'pov_tv',
	'hbbtv',
	'ce-html'
];

// Main functions
// --------------

device.macos = function() {
	return find('mac');
};

device.ios = function() {
	return device.iphone() || device.ipod() || device.ipad();
};

device.iphone = function() {
	return !device.windows() && find('iphone');
};

device.ipod = function() {
	return find('ipod');
};

device.ipad = function() {
	return find('ipad');
};

device.android = function() {
	return !device.windows() && find('android');
};

device.androidPhone = function() {
	return device.android() && find('mobile');
};

device.androidTablet = function() {
	return device.android() && !find('mobile');
};

device.blackberry = function() {
	return find('blackberry') || find('bb10') || find('rim');
};

device.blackberryPhone = function() {
	return device.blackberry() && !find('tablet');
};

device.blackberryTablet = function() {
	return device.blackberry() && find('tablet');
};

device.windows = function() {
	return find('windows');
};

device.windowsPhone = function() {
	return device.windows() && find('phone');
};

device.windowsTablet = function() {
	return device.windows() && find('touch') && !device.windowsPhone();
};

device.fxos = function() {
	return (find('(mobile') || find('(tablet')) && find(' rv:');
};

device.fxosPhone = function() {
	return device.fxos() && find('mobile');
};

device.fxosTablet = function() {
	return device.fxos() && find('tablet');
};

device.meego = function() {
	return find('meego');
};

device.cordova = function() {
	return window.cordova && location.protocol === 'file:';
};

device.nodeWebkit = function() {
	return _typeof(window.process) === 'object';
};

device.mobile = function() {
	return (
		device.androidPhone() ||
		device.iphone() ||
		device.ipod() ||
		device.windowsPhone() ||
		device.blackberryPhone() ||
		device.fxosPhone() ||
		device.meego()
	);
};

device.tablet = function() {
	return (
		device.ipad() ||
		device.androidTablet() ||
		device.blackberryTablet() ||
		device.windowsTablet() ||
		device.fxosTablet()
	);
};

device.desktop = function() {
	return !device.tablet() && !device.mobile();
};

device.television = function() {
	var i = 0;
	while (i < television.length) {
		if (find(television[i])) {
			return true;
		}
		i++;
	}
	return false;
};

device.portrait = function() {
	if (screen.orientation && Object.prototype.hasOwnProperty.call(window, 'onorientationchange')) {
		return screen.orientation.type.includes('portrait');
	}
	return window.innerHeight / window.innerWidth > 1;
};

device.landscape = function() {
	if (screen.orientation && Object.prototype.hasOwnProperty.call(window, 'onorientationchange')) {
		return screen.orientation.type.includes('landscape');
	}
	return window.innerHeight / window.innerWidth < 1;
};

// Public Utility Functions
// ------------------------

// Run device.js in noConflict mode,
// returning the device variable to its previous owner.
device.noConflict = function() {
	window.device = previousDevice;
	return this;
};

// Private Utility Functions
// -------------------------

// Simple UA string search
function find(needle) {
	return userAgent.indexOf(needle) !== -1;
}

// Check if documentElement already has a given class.
function hasClass(className) {
	return documentElement.className.match(new RegExp(className, 'i'));
}

// Add one or more CSS classes to the <html> element.
function addClass(className) {
	var currentClassNames = null;
	if (!hasClass(className)) {
		currentClassNames = documentElement.className.replace(/^\s+|\s+$/g, '');
		documentElement.className = currentClassNames + ' ' + className;
	}
}

// Remove single CSS class from the <html> element.
function removeClass(className) {
	if (hasClass(className)) {
		documentElement.className = documentElement.className.replace(' ' + className, '');
	}
}

// HTML Element Handling
// ---------------------

// Insert the appropriate CSS class based on the _user_agent.

if (device.ios()) {
	if (device.ipad()) {
		addClass('ios ipad tablet');
	} else if (device.iphone()) {
		addClass('ios iphone mobile');
	} else if (device.ipod()) {
		addClass('ios ipod mobile');
	}
} else if (device.macos()) {
	addClass('macos desktop');
} else if (device.android()) {
	if (device.androidTablet()) {
		addClass('android tablet');
	} else {
		addClass('android mobile');
	}
} else if (device.blackberry()) {
	if (device.blackberryTablet()) {
		addClass('blackberry tablet');
	} else {
		addClass('blackberry mobile');
	}
} else if (device.windows()) {
	if (device.windowsTablet()) {
		addClass('windows tablet');
	} else if (device.windowsPhone()) {
		addClass('windows mobile');
	} else {
		addClass('windows desktop');
	}
} else if (device.fxos()) {
	if (device.fxosTablet()) {
		addClass('fxos tablet');
	} else {
		addClass('fxos mobile');
	}
} else if (device.meego()) {
	addClass('meego mobile');
} else if (device.nodeWebkit()) {
	addClass('node-webkit');
} else if (device.television()) {
	addClass('television');
} else if (device.desktop()) {
	addClass('desktop');
}

if (device.cordova()) {
	addClass('cordova');
}

// Orientation Handling
// --------------------

// Handle device orientation changes.
function handleOrientation() {
	if (device.landscape()) {
		removeClass('portrait');
		addClass('landscape');
		walkOnChangeOrientationList('landscape');
	} else {
		removeClass('landscape');
		addClass('portrait');
		walkOnChangeOrientationList('portrait');
	}
	setOrientationCache();
}

function walkOnChangeOrientationList(newOrientation) {
	for (var index in changeOrientationList) {
		changeOrientationList[index](newOrientation);
	}
}

device.onChangeOrientation = function(cb) {
	if (typeof cb == 'function') {
		changeOrientationList.push(cb);
	}
};

// Detect whether device supports orientationchange event,
// otherwise fall back to the resize event.
var orientationEvent = 'resize';
if (Object.prototype.hasOwnProperty.call(window, 'onorientationchange')) {
	orientationEvent = 'orientationchange';
}

// Listen for changes in orientation.
if (window.addEventListener) {
	window.addEventListener(orientationEvent, handleOrientation, false);
} else if (window.attachEvent) {
	window.attachEvent(orientationEvent, handleOrientation);
} else {
	window[orientationEvent] = handleOrientation;
}

handleOrientation();

// Public functions to get the current value of type, os, or orientation
// ---------------------------------------------------------------------

function findMatch(arr) {
	for (var i = 0; i < arr.length; i++) {
		if (device[arr[i]]()) {
			return arr[i];
		}
	}
	return 'unknown';
}

device.type = findMatch(['mobile', 'tablet', 'desktop']);
device.os = findMatch([
	'ios',
	'iphone',
	'ipad',
	'ipod',
	'android',
	'blackberry',
	'windows',
	'fxos',
	'meego',
	'television'
]);

function setOrientationCache() {
	device.orientation = findMatch(['portrait', 'landscape']);
}

setOrientationCache();

var utf8Encode = function utf8Encode(string) {
	string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	var utftext = '',
		start,
		end;
	var stringl = 0,
		n;

	start = end = 0;
	stringl = string.length;

	for (n = 0; n < stringl; n++) {
		var c1 = string.charCodeAt(n);
		var enc = null;

		if (c1 < 128) {
			end++;
		} else if (c1 > 127 && c1 < 2048) {
			enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
		} else {
			enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
		}
		if (enc !== null) {
			if (end > start) {
				utftext += string.substring(start, end);
			}
			utftext += enc;
			start = end = n + 1;
		}
	}

	if (end > start) {
		utftext += string.substring(start, string.length);
	}

	return utftext;
};

var base64Encode = function base64Encode(data) {
	var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var o1,
		o2,
		o3,
		h1,
		h2,
		h3,
		h4,
		bits,
		i = 0,
		ac = 0,
		enc = '',
		tmp_arr = [];

	if (!data) {
		return data;
	}

	data = utf8Encode(data);

	do {
		// pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);

		bits = (o1 << 16) | (o2 << 8) | o3;

		h1 = (bits >> 18) & 0x3f;
		h2 = (bits >> 12) & 0x3f;
		h3 = (bits >> 6) & 0x3f;
		h4 = bits & 0x3f;

		// use hexets to index into b64, and append result to encoded string
		tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);

	enc = tmp_arr.join('');

	switch (data.length % 3) {
		case 1:
			enc = enc.slice(0, -2) + '==';
			break;
		case 2:
			enc = enc.slice(0, -1) + '=';
			break;
	}

	return enc;
};

// 兼容单元测试环境
var win$1 = void 0;
if (typeof window === 'undefined') {
	win$1 = {
		navigator: {
			userAgent: ''
		},
		location: {
			pathname: '',
			href: ''
		},
		document: {
			URL: ''
		},
		screen: {
			width: '',
			height: ''
		}
	};
} else {
	win$1 = window;
}

function toString(object) {
	return Object.prototype.toString.call(object);
}

function isObject(object) {
	return toString(object) === '[object Object]';
}

function isFunction(object) {
	return toString(object) === '[object Function]';
}

function each(object, factory) {
	for (var i = 0, l = object.length; i < l; i++) {
		if (factory.call(object, object[i], i) === false) {
			break;
		}
	}
}

var NA_VERSION = '-1';
var external = win$1.external;
var userAgent$1 = win$1.navigator.userAgent || '';
var appVersion = win$1.navigator.appVersion || '';
var vendor = win$1.navigator.vendor || '';
var detector = {};

var re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;
var re_blackberry_10 = /\bbb10\b.+?\bversion\/([\d.]+)/;
var re_blackberry_6_7 = /\bblackberry\b.+\bversion\/([\d.]+)/;
var re_blackberry_4_5 = /\bblackberry\d+\/([\d.]+)/;

// http://zakwu.me/2015/12/15/an-zhuo-shou-ji-uashou-ji/ 参考
// 硬件设备信息识别表达式。
// 使用数组可以按优先级排序。
var DEVICES = [
	[
		'nokia',
		function(ua) {
			// 不能将两个表达式合并，因为可能出现 "nokia; nokia 960"
			// 这种情况下会优先识别出 nokia/-1
			if (ua.indexOf('nokia ') !== -1) {
				return /\bnokia ([0-9]+)?/;
			} else {
				return /\bnokia([a-z0-9]+)?/;
			}
		}
	],
	// 三星有 Android 和 WP 设备。
	[
		'samsung',
		function(ua) {
			if (ua.indexOf('samsung') !== -1) {
				return /\bsamsung(?:[ \-](?:sgh|gt|sm))?-([a-z0-9]+)/;
			} else {
				return /\b(?:sgh|sch|gt|sm)-([a-z0-9]+)/;
			}
		}
	],
	[
		'wp',
		function(ua) {
			return (
				ua.indexOf('windows phone ') !== -1 ||
				ua.indexOf('xblwp') !== -1 ||
				ua.indexOf('zunewp') !== -1 ||
				ua.indexOf('windows ce') !== -1
			);
		}
	],
	['pc', 'windows'],
	['ipad', 'ipad'],
	// ipod 规则应置于 iphone 之前。
	['ipod', 'ipod'],
	['iphone', /\biphone\b|\biph(\d)/],
	['mac', 'macintosh'],
	// 小米
	['mi', /\bmi[ \-]?([a-z0-9 ]+(?= build|\)))/],
	// 红米
	['hongmi', /\bhm\b|redmi[ \-]?([a-z0-9]+)/],
	['aliyun', /\baliyunos\b(?:[\-](\d+))?/],
	[
		'meizu',
		function(ua) {
			return ua.indexOf('meizu') >= 0 ? /\bmeizu[\/ ]([a-z0-9]+)\b/ : /\bm([0-9cx]{1,4})\b/;
		}
	],
	['nexus', /\bnexus ([0-9s.]+)/],
	[
		'huawei',
		function(ua) {
			var re_mediapad = /\bmediapad (.+?)(?= build\/huaweimediapad\b)/;
			if (ua.indexOf('huawei-huawei') !== -1) {
				return /\bhuawei\-huawei\-([a-z0-9\-]+)/;
			} else if (re_mediapad.test(ua)) {
				return re_mediapad;
			} else {
				return /\bhuawei[ _\-]?([a-z0-9]+)/;
			}
		}
	],
	[
		'lenovo',
		function(ua) {
			if (ua.indexOf('lenovo-lenovo') !== -1) {
				return /\blenovo\-lenovo[ \-]([a-z0-9]+)/;
			} else {
				return /\blenovo[ \-]?([a-z0-9]+)/;
			}
		}
	],
	// 中兴
	[
		'zte',
		function(ua) {
			if (/\bzte\-[tu]/.test(ua)) {
				return /\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/;
			} else {
				return /\bzte[ _\-]?([a-su-z0-9\+]+)/;
			}
		}
	],
	// 步步高
	['vivo', /\bvivo(?: ([a-z0-9]+))?/],
	[
		'htc',
		function(ua) {
			if (/\bhtc[a-z0-9 _\-]+(?= build\b)/.test(ua)) {
				return /\bhtc[ _\-]?([a-z0-9 ]+(?= build))/;
			} else {
				return /\bhtc[ _\-]?([a-z0-9 ]+)/;
			}
		}
	],
	['oppo', /\boppo[_]([a-z0-9]+)/],
	['konka', /\bkonka[_\-]([a-z0-9]+)/],
	['sonyericsson', /\bmt([a-z0-9]+)/],
	['coolpad', /\bcoolpad[_ ]?([a-z0-9]+)/],
	['lg', /\blg[\-]([a-z0-9]+)/],
	['android', /\bandroid\b|\badr\b/],
	[
		'blackberry',
		function(ua) {
			if (ua.indexOf('blackberry') >= 0) {
				return /\bblackberry\s?(\d+)/;
			}
			return 'bb10';
		}
	]
];
// 操作系统信息识别表达式
var OS = [
	[
		'wp',
		function(ua) {
			if (ua.indexOf('windows phone ') !== -1) {
				return /\bwindows phone (?:os )?([0-9.]+)/;
			} else if (ua.indexOf('xblwp') !== -1) {
				return /\bxblwp([0-9.]+)/;
			} else if (ua.indexOf('zunewp') !== -1) {
				return /\bzunewp([0-9.]+)/;
			}
			return 'windows phone';
		}
	],
	['windows', /\bwindows nt ([0-9.]+)/],
	['macosx', /\bmac os x ([0-9._]+)/],
	[
		'iOS',
		function(ua) {
			if (/\bcpu(?: iphone)? os /.test(ua)) {
				return /\bcpu(?: iphone)? os ([0-9._]+)/;
			} else if (ua.indexOf('iph os ') !== -1) {
				return /\biph os ([0-9_]+)/;
			} else {
				return /\bios\b/;
			}
		}
	],
	['yunos', /\baliyunos ([0-9.]+)/],
	[
		'Android',
		function(ua) {
			if (ua.indexOf('android') >= 0) {
				return /\bandroid[ \/-]?([0-9.x]+)?/;
			} else if (ua.indexOf('adr') >= 0) {
				if (ua.indexOf('mqqbrowser') >= 0) {
					return /\badr[ ]\(linux; u; ([0-9.]+)?/;
				} else {
					return /\badr(?:[ ]([0-9.]+))?/;
				}
			}
			return 'android';
			//return /\b(?:android|\badr)(?:[\/\- ](?:\(linux; u; )?)?([0-9.x]+)?/;
		}
	],
	['chromeos', /\bcros i686 ([0-9.]+)/],
	['linux', 'linux'],
	['windowsce', /\bwindows ce(?: ([0-9.]+))?/],
	['symbian', /\bsymbian(?:os)?\/([0-9.]+)/],
	[
		'blackberry',
		function(ua) {
			var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
			return m ? { version: m[1] } : 'blackberry';
		}
	]
];
//浏览器内核
var ENGINE = [
	['edgehtml', /edge\/([0-9.]+)/],
	['trident', re_msie],
	[
		'blink',
		function() {
			return 'chrome' in win$1 && 'CSS' in win$1 && /\bapplewebkit[\/]?([0-9.+]+)/;
		}
	],
	['webkit', /\bapplewebkit[\/]?([0-9.+]+)/],
	[
		'gecko',
		function(ua) {
			var match;
			if ((match = ua.match(/\brv:([\d\w.]+).*\bgecko\/(\d+)/))) {
				return {
					version: match[1] + '.' + match[2]
				};
			}
		}
	],
	['presto', /\bpresto\/([0-9.]+)/],
	['androidwebkit', /\bandroidwebkit\/([0-9.]+)/],
	['coolpadwebkit', /\bcoolpadwebkit\/([0-9.]+)/],
	['u2', /\bu2\/([0-9.]+)/],
	['u3', /\bu3\/([0-9.]+)/]
];
var BROWSER = [
	// Microsoft Edge Browser, Default browser in Windows 10.
	['edge', /edge\/([0-9.]+)/],
	// Sogou.
	[
		'sogou',
		function(ua) {
			if (ua.indexOf('sogoumobilebrowser') >= 0) {
				return /sogoumobilebrowser\/([0-9.]+)/;
			} else if (ua.indexOf('sogoumse') >= 0) {
				return true;
			}
			return / se ([0-9.x]+)/;
		}
	],
	// TheWorld (世界之窗)
	// 由于裙带关系，TheWorld API 与 360 高度重合。
	// 只能通过 UA 和程序安装路径中的应用程序名来区分。
	// TheWorld 的 UA 比 360 更靠谱，所有将 TheWorld 的规则放置到 360 之前。
	[
		'theworld',
		function() {
			var x = checkTW360External('theworld');
			if (typeof x !== 'undefined') {
				return x;
			}
			return 'theworld';
		}
	],
	// 360SE, 360EE.
	[
		'360',
		function(ua) {
			var x = checkTW360External('360se');
			if (typeof x !== 'undefined') {
				return x;
			}
			if (ua.indexOf('360 aphone browser') !== -1) {
				return /\b360 aphone browser \(([^\)]+)\)/;
			}
			return /\b360(?:se|ee|chrome|browser)\b/;
		}
	],
	// Maxthon
	[
		'maxthon',
		function() {
			try {
				if (external && (external.mxVersion || external.max_version)) {
					return {
						version: external.mxVersion || external.max_version
					};
				}
			} catch (ex) {
				/* */
			}
			return /\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/;
		}
	],
	['micromessenger', /\bmicromessenger\/([\d.]+)/],
	['qq', /\bm?qqbrowser\/([0-9.]+)/],
	['green', 'greenbrowser'],
	['tt', /\btencenttraveler ([0-9.]+)/],
	[
		'liebao',
		function(ua) {
			if (ua.indexOf('liebaofast') >= 0) {
				return /\bliebaofast\/([0-9.]+)/;
			}
			if (ua.indexOf('lbbrowser') === -1) {
				return false;
			}
			var version;
			try {
				if (external && external.LiebaoGetVersion) {
					version = external.LiebaoGetVersion();
				}
			} catch (ex) {
				/* */
			}
			return {
				version: version || NA_VERSION
			};
		}
	],
	['tao', /\btaobrowser\/([0-9.]+)/],
	['coolnovo', /\bcoolnovo\/([0-9.]+)/],
	['saayaa', 'saayaa'],
	// 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
	['baidu', /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
	// 后面会做修复版本号，这里只要能识别是 IE 即可。
	['ie', re_msie],
	['mi', /\bmiuibrowser\/([0-9.]+)/],
	// Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
	[
		'opera',
		function(ua) {
			var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
			var re_opera_new = /\bopr\/([0-9.]+)/;
			return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
		}
	],
	['oupeng', /\boupeng\/([0-9.]+)/],
	['yandex', /yabrowser\/([0-9.]+)/],
	// 支付宝手机客户端
	[
		'ali-ap',
		function(ua) {
			if (ua.indexOf('aliapp') > 0) {
				return /\baliapp\(ap\/([0-9.]+)\)/;
			} else {
				return /\balipayclient\/([0-9.]+)\b/;
			}
		}
	],
	// 支付宝平板客户端
	['ali-ap-pd', /\baliapp\(ap-pd\/([0-9.]+)\)/],
	// 支付宝商户客户端
	['ali-am', /\baliapp\(am\/([0-9.]+)\)/],
	// 淘宝手机客户端
	['ali-tb', /\baliapp\(tb\/([0-9.]+)\)/],
	// 淘宝平板客户端
	['ali-tb-pd', /\baliapp\(tb-pd\/([0-9.]+)\)/],
	// 天猫手机客户端
	['ali-tm', /\baliapp\(tm\/([0-9.]+)\)/],
	// 天猫平板客户端
	['ali-tm-pd', /\baliapp\(tm-pd\/([0-9.]+)\)/],
	// UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
	// UC 桌面版浏览器携带 Chrome 信息，需要放在 Chrome 之前。
	[
		'uc',
		function(ua) {
			if (ua.indexOf('ucbrowser/') >= 0) {
				return /\bucbrowser\/([0-9.]+)/;
			} else if (ua.indexOf('ubrowser/') >= 0) {
				return /\bubrowser\/([0-9.]+)/;
			} else if (/\buc\/[0-9]/.test(ua)) {
				return /\buc\/([0-9.]+)/;
			} else if (ua.indexOf('ucweb') >= 0) {
				// `ucweb/2.0` is compony info.
				// `UCWEB8.7.2.214/145/800` is browser info.
				return /\bucweb([0-9.]+)?/;
			} else {
				return /\b(?:ucbrowser|uc)\b/;
			}
		}
	],
	['chrome', / (?:chrome|crios|crmo)\/([0-9.]+)/],
	// Android 默认浏览器。该规则需要在 safari 之前。
	[
		'android',
		function(ua) {
			if (ua.indexOf('android') === -1) {
				return;
			}
			return /\bversion\/([0-9.]+(?: beta)?)/;
		}
	],
	[
		'blackberry',
		function(ua) {
			var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
			return m ? { version: m[1] } : 'blackberry';
		}
	],
	['safari', /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
	// 如果不能被识别为 Safari，则猜测是 WebView。
	['webview', /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
	['firefox', /\bfirefox\/([0-9.ab]+)/],
	['nokia', /\bnokiabrowser\/([0-9.]+)/]
];
// 针对同源的 TheWorld 和 360 的 external 对象进行检测。
// @param {String} key, 关键字，用于检测浏览器的安装路径中出现的关键字。
// @return {Undefined,Boolean,Object} 返回 undefined 或 false 表示检测未命中。
function checkTW360External(key) {
	if (!external) {
		return;
	} // return undefined.
	try {
		//        360安装路径：
		//        C:%5CPROGRA~1%5C360%5C360se3%5C360SE.exe
		var runpath = external.twGetRunPath.toLowerCase();
		// 360SE 3.x ~ 5.x support.
		// 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
		// 因此只能用 try/catch 而无法使用特性判断。
		var security = external.twGetSecurityID(win$1);
		var version = external.twGetVersion(security);

		if (runpath && runpath.indexOf(key) === -1) {
			return false;
		}
		if (version) {
			return { version: version };
		}
	} catch (ex) {
		/* */
	}
}
// 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
// @param {String} ua, userAgent string.
// @return {Object}
function IEMode(ua) {
	if (!re_msie.test(ua)) {
		return null;
	}

	var m, engineMode, engineVersion, browserMode, browserVersion;

	// IE8 及其以上提供有 Trident 信息，
	// 默认的兼容模式，UA 中 Trident 版本不发生变化。
	if (ua.indexOf('trident/') !== -1) {
		m = /\btrident\/([0-9.]+)/.exec(ua);
		if (m && m.length >= 2) {
			// 真实引擎版本。
			engineVersion = m[1];
			var v_version = m[1].split('.');
			v_version[0] = parseInt(v_version[0], 10) + 4;
			browserVersion = v_version.join('.');
		}
	}

	m = re_msie.exec(ua);
	browserMode = m[1];
	var v_mode = m[1].split('.');
	if (typeof browserVersion === 'undefined') {
		browserVersion = browserMode;
	}
	v_mode[0] = parseInt(v_mode[0], 10) - 4;
	engineMode = v_mode.join('.');
	if (typeof engineVersion === 'undefined') {
		engineVersion = engineMode;
	}

	return {
		browserVersion: browserVersion,
		browserMode: browserMode,
		engineVersion: engineVersion,
		engineMode: engineMode,
		compatible: engineVersion !== engineMode
	};
}
// UserAgent Detector.
// @param {String} ua, userAgent.
// @param {Object} expression
// @return {Object}
//    返回 null 表示当前表达式未匹配成功。
function detect(name, expression, ua) {
	var expr = isFunction(expression) ? expression.call(null, ua) : expression;
	if (!expr) {
		return null;
	}
	var info = {
		name: name,
		version: NA_VERSION,
		codename: ''
	};
	var t = toString(expr);
	if (expr === true) {
		return info;
	} else if (t === '[object String]') {
		if (ua.indexOf(expr) !== -1) {
			return info;
		}
	} else if (isObject(expr)) {
		// Object
		if (expr.hasOwnProperty('version')) {
			info.version = expr.version;
		}
		return info;
	} else if (expr.exec) {
		// RegExp
		var m = expr.exec(ua);
		if (m) {
			if (m.length >= 2 && m[1]) {
				info.version = m[1].replace(/_/g, '.');
			} else {
				info.version = NA_VERSION;
			}
			return info;
		}
	}
}

var na = { name: '', version: '' };
// 初始化识别。
function init(ua, patterns, factory, detector) {
	var detected = na;
	each(patterns, function(pattern) {
		var d = detect(pattern[0], pattern[1], ua);
		if (d) {
			detected = d;
			return false;
		}
	});
	factory.call(detector, detected.name, detected.version);
}
// 解析 UserAgent 字符串
// @param {String} ua, userAgent string.
// @return {Object}
var parse = function parse(ua) {
	ua = (ua || '').toLowerCase();
	var d = {};

	init(
		ua,
		DEVICES,
		function(name, version) {
			var v = parseFloat(version);
			d.device = {
				name: name,
				version: v,
				fullVersion: version
			};
			d.device[name] = v;
		},
		d
	);

	init(
		ua,
		OS,
		function(name, version) {
			var v = parseFloat(version);
			d.os = {
				name: name,
				version: v,
				fullVersion: version
			};
			d.os[name] = v;
		},
		d
	);

	var ieCore = IEMode(ua);

	init(
		ua,
		ENGINE,
		function(name, version) {
			var mode = version;
			// IE 内核的浏览器，修复版本号及兼容模式。
			if (ieCore) {
				version = ieCore.engineVersion || ieCore.engineMode;
				mode = ieCore.engineMode;
			}
			var v = parseFloat(version);
			d.engine = {
				name: name,
				version: v,
				fullVersion: version,
				mode: parseFloat(mode),
				fullMode: mode,
				compatible: ieCore ? ieCore.compatible : false
			};
			d.engine[name] = v;
		},
		d
	);

	init(
		ua,
		BROWSER,
		function(name, version) {
			var mode = version;
			// IE 内核的浏览器，修复浏览器版本及兼容模式。
			if (ieCore) {
				// 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
				if (name === 'ie') {
					version = ieCore.browserVersion;
				}
				mode = ieCore.browserMode;
			}
			var v = parseFloat(version);
			d.browser = {
				name: name,
				version: v,
				fullVersion: version,
				mode: parseFloat(mode),
				fullMode: mode,
				compatible: ieCore ? ieCore.compatible : false
			};
			d.browser[name] = v;
		},
		d
	);
	return d;
};

detector = parse(userAgent$1 + ' ' + appVersion + ' ' + vendor);

var detector$1 = detector;

var networkType = '';
var ArrayProto = Array.prototype;
var FuncProto = Function.prototype;
var slice = ArrayProto.slice;
var nativeBind = FuncProto.bind;
// 兼容单元测试环境
var win = void 0;
if (typeof window === 'undefined') {
	win = {
		navigator: {
			userAgent: ''
		},
		location: {
			pathname: '',
			href: ''
		},
		document: {
			URL: ''
		},
		screen: {
			width: '',
			height: ''
		}
	};
} else {
	win = window;
}

var breaker = {};

var _ = {
	each: function each(obj, iterator, context) {
		if (obj === null || obj === undefined) {
			return;
		}
		if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
			obj.forEach(iterator, context);
		} else if (obj.length === +obj.length) {
			for (var i = 0, l = obj.length; i < l; i++) {
				if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
					return;
				}
			}
		} else {
			for (var key in obj) {
				if (obj.hasOwnProperty.call(obj, key)) {
					if (iterator.call(context, obj[key], key, obj) === breaker) {
						return;
					}
				}
			}
		}
	},
	extend: function extend(obj) {
		_.each(Array.prototype.slice.call(arguments, 1), function(source) {
			for (var prop in source) {
				if (source[prop] !== void 0) {
					obj[prop] = source[prop];
				}
			}
		});
		return obj;
	},
	isObject: function isObject(obj) {
		return obj === Object(obj) && !_.isArray(obj);
	},
	isUndefined: function isUndefined(obj) {
		return obj === void 0;
	},
	isArguments: function isArguments(obj) {
		return !!(obj && hasOwnProperty.call(obj, 'callee'));
	},
	toArray: function toArray(iterable) {
		if (!iterable) {
			return [];
		}
		if (iterable.toArray) {
			return iterable.toArray();
		}
		if (_.isArray(iterable)) {
			return Array.prototype.slice.call(iterable);
		}
		if (_.isArguments(iterable)) {
			return Array.prototype.slice.call(iterable);
		}
		return _.values(iterable);
	},
	values: function values(obj) {
		var results = [];
		if (obj === null) {
			return results;
		}
		_.each(obj, function(value) {
			results[results.length] = value;
		});
		return results;
	},

	// 转化成json
	JSONDecode: function JSONDecode(string) {
		try {
			return JSON.parse(string);
		} catch (error) {
			return {};
		}
	},

	// json转化为string
	JSONEncode: function JSONEncode(json) {
		try {
			return JSON.stringify(json);
		} catch (error) {
			return '';
		}
	},

	// 判断类型是否为function
	isFunction: function isFunction(fn) {
		var bool = false;
		if (typeof fn === 'function') {
			bool = true;
		}
		return bool;
	},
	base64Encode: function base64Encode$$1(str) {
		return base64Encode(str);
	},
	sha1: function sha1$$1(str) {
		return '';
	},

	// 对象的字段值截取
	truncate: function truncate(obj, length) {
		var ret = void 0;
		if (typeof obj === 'string') {
			ret = obj.slice(0, length);
		} else if (_.isArray(obj)) {
			ret = [];
			_.each(obj, function(val) {
				ret.push(_.truncate(val, length));
			});
		} else if (_.isObject(obj)) {
			ret = {};
			_.each(obj, function(val, key) {
				ret[key] = _.truncate(val, length);
			});
		} else {
			ret = obj;
		}
		return ret;
	},
	isNumber: function isNumber(obj) {
		return Object.prototype.toString.call(obj) == '[object Number]';
	},
	isString: function isString(str) {
		return Object.prototype.toString.call(str) == '[object String]';
	},
	HTTPBuildQuery: function HTTPBuildQuery(formdata, arg_separator) {
		var use_val = void 0,
			use_key = void 0,
			tmp_arr = [];

		if (_.isUndefined(arg_separator)) {
			arg_separator = '&';
		}

		_.each(formdata, function(val, key) {
			use_val = encodeURIComponent(val && val.toString());
			use_key = encodeURIComponent(key);
			tmp_arr[tmp_arr.length] = use_key + '=' + use_val;
		});

		return tmp_arr.join(arg_separator);
	},

	// 删除左右两端的空格
	trim: function trim(str) {
		if (!str) return;
		return str.replace(/(^\s*)|(\s*$)/g, '');
	},

	// 验证yyyy-MM-dd日期格式
	checkTime: function checkTime(timeString) {
		var reg = /^(\d{4})-(\d{2})-(\d{2})$/;
		if (timeString) {
			if (!reg.test(timeString)) {
				return false;
			} else {
				return true;
			}
		} else {
			return false;
		}
	},

	// 返回指定url的域名
	// 若不传入url，返回当前网页的域名
	getHost: function getHost(url) {
		var host = '';
		if (!url) {
			url = document.URL;
		}
		var regex = /.*\:\/\/([^\/]*).*/;
		var match = url.match(regex);
		if (match) {
			host = match[1];
		}
		return host;
	},

	// 获取url上指定参数的值
	getQueryParam: function getQueryParam(url, param) {
		var target = param.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
		var regexS = '[\\?&]' + target + '=([^&#]*)';
		var regex = new RegExp(regexS);
		var results = regex.exec(url);
		if (results === null || (results && typeof results[1] !== 'string' && results[1].length)) {
			return '';
		} else {
			return decodeURIComponent(results[1]).replace(/\+/g, ' ');
		}
	},

	// 删除对象中空字段
	deleteEmptyProperty: function deleteEmptyProperty(obj) {
		if (!this.isObject(obj)) {
			return;
		}
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (obj[key] === null || this.isUndefined(obj[key]) || obj[key] === '') {
					delete obj[key];
				}
			}
		}
		return obj;
	}
};
_.isArray =
	Array.isArray ||
	function(obj) {
		return Object.prototype.toString.apply(obj) === '[object Array]';
	};

_.loadScript = function(para) {
	para = _.extend(
		{
			success: function success() {},
			error: function error() {},
			appendCall: function appendCall(g) {
				document.getElementsByTagName('head')[0].appendChild(g);
			}
		},
		para
	);

	var g = null;
	if (para.type === 'css') {
		g = document.createElement('link');
		g.rel = 'stylesheet';
		g.href = para.url;
	}
	if (para.type === 'js') {
		g = document.createElement('script');
		g.async = 'async';
		g.setAttribute('charset', 'UTF-8');
		g.src = para.url;
		g.type = 'text/javascript';
	}
	g.onload = g.onreadystatechange = function() {
		if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
			para.success();
			g.onload = g.onreadystatechange = null;
		}
	};
	g.onerror = function() {
		para.error();
		g.onerror = null;
	};
	// if iframe
	para.appendCall(g);
};

_.register_event = (function() {
	// http://dean.edwards.name/weblog/2005/10/add-event/
	// https://gist.github.com/1930440

	/**
	 * @param {Object} element
	 * @param {string} type
	 * @param {function} handler
	 * @param {boolean=} oldSchool
	 * @param {boolean=} useCapture
	 */
	var register_event = function register_event(element, type, handler, oldSchool, useCapture) {
		if (!element) {
			console$1.error('No valid element provided to register_event');
			return;
		}

		if (element.addEventListener && !oldSchool) {
			element.addEventListener(type, handler, !!useCapture);
		} else {
			var ontype = 'on' + type;
			console$1.log('ontype', ontype);
			var old_handler = element[ontype]; // can be undefined
			element[ontype] = makeHandler(element, handler, old_handler);
		}
	};

	function makeHandler(element, new_handler, old_handlers) {
		var handler = function handler(event) {
			event = event || fixEvent(window.event);

			//这基本上发生在firefox中的其他脚本中
			//覆盖onload回调函数，不传递事件
			// 对象指向以前定义的回调。所有的浏览器
			//没有定义窗口。事件实现addEventListener
			//因此，dom_loaded处理程序仍然会像往常一样被触发。
			if (!event) {
				return undefined;
			}

			var ret = true;
			var old_result, new_result;

			if (_.isFunction(old_handlers)) {
				old_result = old_handlers(event);
			}
			new_result = new_handler.call(element, event);

			if (false === old_result || false === new_result) {
				ret = false;
			}

			return ret;
		};

		return handler;
	}

	function fixEvent(event) {
		if (event) {
			event.preventDefault = fixEvent.preventDefault;
			event.stopPropagation = fixEvent.stopPropagation;
		}
		return event;
	}
	fixEvent.preventDefault = function() {
		this.returnValue = false;
	};
	fixEvent.stopPropagation = function() {
		this.cancelBubble = true;
	};

	return register_event;
})();

_.register_hash_event = function(callback) {
	_.register_event(window, 'hashchange', callback);
};

_.getHashParam = function(hash, param) {
	var matches = hash.match(new RegExp(param + '=([^&]*)'));
	return matches ? matches[1] : null;
};
// 客户端基本属性
_.info = {
	properties: function properties(event_name) {
		// 生成唯一pageId
		if (event_name === 'pv') {
			networkType = _.getNetworkType();
		}
		return {
			// 网络类型
			netType: networkType,

			// 操作系统
			Os: detector$1.os.name,
			// 浏览器名称
			bs: detector$1.browser.name,
			// 浏览器版本
			bVer: detector$1.browser.fullVersion
		};
	}
};

// 消息订阅/推送
_.innerEvent = {
	/**
	 * 订阅
	 *  */

	on: function on(key, fn) {
		if (!this._list) {
			this._list = {};
		}
		if (!this._list[key]) {
			this._list[key] = [];
		}
		this._list[key].push(fn);
	},
	off: function off(key) {
		if (!this._list) {
			this._list = {};
		}
		if (!this._list[key]) {
			return;
		} else {
			delete this._list[key];
		}
	},
	/**
	 * 推送
	 */
	trigger: function trigger() {
		var args = Array.prototype.slice.call(arguments);
		var key = args[0];
		var arrFn = this._list && this._list[key];
		if (!arrFn || arrFn.length === 0) {
			return;
		}
		for (var i = 0; i < arrFn.length; i++) {
			if (typeof arrFn[i] == 'function') {
				arrFn[i].apply(this, args);
			}
		}
	}
};

// 发送数据
_.sendRequest = function(url, data, callback) {
	data['_'] = new Date().getTime().toString();
	url += '?' + _.HTTPBuildQuery(data);
	var img = document.createElement('img');
	img.src = url;
	img.width = 1;
	img.height = 1;
	if (_.isFunction(callback)) {
		callback(0);
	}
	img.onload = function() {
		this.onload = null;
	};
	img.onerror = function() {
		this.onerror = null;
	};
	img.onabort = function() {
		this.onabort = null;
	};
};

// uuid
_.UUID = (function() {
	var T = function T() {
		var d = 1 * new Date(),
			i = 0;
		while (d == 1 * new Date()) {
			i++;
		}
		return d.toString(16) + i.toString(16);
	};
	var R = function R() {
		return Math.random()
			.toString(16)
			.replace('.', '');
	};
	var UA = function UA(n) {
		var ua = navigator.userAgent,
			i,
			ch,
			buffer = [],
			ret = 0;

		function xor(result, byte_array) {
			var j,
				tmp = 0;
			for (j = 0; j < byte_array.length; j++) {
				tmp |= buffer[j] << (j * 8);
			}
			return result ^ tmp;
		}

		for (i = 0; i < ua.length; i++) {
			ch = ua.charCodeAt(i);
			buffer.unshift(ch & 0xff);
			if (buffer.length >= 4) {
				ret = xor(ret, buffer);
				buffer = [];
			}
		}

		if (buffer.length > 0) {
			ret = xor(ret, buffer);
		}

		return ret.toString(16);
	};

	return function() {
		// 有些浏览器取个屏幕宽度都异常...
		var se = String(screen.height * screen.width);
		if (se && /\d{5,}/.test(se)) {
			se = se.toString(16);
		} else {
			se = String(Math.random() * 31242)
				.replace('.', '')
				.slice(0, 8);
		}
		var val = T() + '-' + R() + '-' + UA() + '-' + se + '-' + T();
		if (val) {
			return val;
		} else {
			return (String(Math.random()) + String(Math.random()) + String(Math.random())).slice(2, 15);
		}
	};
})();

// 存储方法封装 localStorage  cookie
_.localStorage = {
	error: function error(msg) {
		console$1.error('localStorage error: ' + msg);
	},

	get: function get(name) {
		try {
			return window.localStorage.getItem(name);
		} catch (err) {
			_.localStorage.error(err);
		}
		return null;
	},

	parse: function parse(name) {
		try {
			return _.JSONDecode(_.localStorage.get(name)) || {};
		} catch (err) {
			// noop
		}
		return null;
	},

	set: function set(name, value) {
		try {
			window.localStorage.setItem(name, value);
		} catch (err) {
			_.localStorage.error(err);
		}
	},

	remove: function remove(name) {
		try {
			window.localStorage.removeItem(name);
		} catch (err) {
			_.localStorage.error(err);
		}
	}
};
_.cookie = {
	get: function get(name) {
		var nameEQ = name + '=';
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1, c.length);
			}
			if (c.indexOf(nameEQ) === 0) {
				return decodeURIComponent(c.substring(nameEQ.length, c.length));
			}
		}
		return null;
	},

	parse: function parse(name) {
		var cookie;
		try {
			cookie = _.JSONDecode(_.cookie.get(name)) || {};
		} catch (err) {
			// noop
		}
		return cookie;
	},

	set_seconds: function set_seconds(name, value, seconds, cross_subdomain, is_secure) {
		var cdomain = '',
			expires = '',
			secure = '';

		if (cross_subdomain) {
			var matches = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
				domain = matches ? matches[0] : '';

			cdomain = domain ? '; domain=.' + domain : '';
		}

		if (seconds) {
			var date = new Date();
			date.setTime(date.getTime() + seconds * 1000);
			expires = '; expires=' + date.toGMTString();
		}

		if (is_secure) {
			secure = '; secure';
		}

		document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
	},

	set: function set(name, value, days, cross_subdomain, is_secure) {
		var cdomain = '',
			expires = '',
			secure = '';

		if (cross_subdomain) {
			var matches = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
				domain = matches ? matches[0] : '';

			cdomain = domain ? '; domain=.' + domain : '';
		}

		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = '; expires=' + date.toGMTString();
		}

		if (is_secure) {
			secure = '; secure';
		}

		var new_cookie_val = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
		document.cookie = new_cookie_val;
		return new_cookie_val;
	},

	remove: function remove(name, cross_subdomain) {
		_.cookie.set(name, '', -1, cross_subdomain);
	}
};

var windowConsole = win.console;
var console$1 = {
	log: function log() {
		if (CONFIG.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
			try {
				windowConsole.log.apply(windowConsole, arguments);
			} catch (err) {
				_.each(arguments, function(arg) {
					windowConsole.log(arg);
				});
			}
		}
	},
	error: function error() {
		if (CONFIG.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
			var args = ['DATracker error:'].concat(_.toArray(arguments));
			try {
				windowConsole.error.apply(windowConsole, args);
			} catch (err) {
				_.each(args, function(arg) {
					windowConsole.error(arg);
				});
			}
		}
	},
	critical: function critical() {
		if (!_.isUndefined(windowConsole) && windowConsole) {
			var args = ['error:'].concat(_.toArray(arguments));
			try {
				windowConsole.error.apply(windowConsole, args);
			} catch (err) {
				_.each(args, function(arg) {
					windowConsole.error(arg);
				});
			}
		}
	}
};
/**
    字符串加密
    简单的加密方法
  */
_.compile = function(code) {
	var c = String.fromCharCode(code.charCodeAt(0) + code.length);
	for (var i = 1; i < code.length; i++) {
		c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
	}
	return c;
};

/**
    字符串解谜
    对应上面的字符串加密方法
  */
_.uncompile = function(code) {
	var c = String.fromCharCode(code.charCodeAt(0) - code.length);
	for (var i = 1; i < code.length; i++) {
		c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
	}
	return c;
};

// UNDERSCORE
// Embed part of the Underscore Library
_.bind = function(func, context) {
	var args, _bound;
	if (nativeBind && func.bind === nativeBind) {
		return nativeBind.apply(func, slice.call(arguments, 1));
	}
	if (!_.isFunction(func)) {
		throw new TypeError();
	}
	args = slice.call(arguments, 2);
	_bound = function bound() {
		if (!(this instanceof _bound)) {
			return func.apply(context, args.concat(slice.call(arguments)));
		}
		var ctor = {};
		ctor.prototype = func.prototype;
		var self = new ctor();
		ctor.prototype = null;
		var result = func.apply(self, args.concat(slice.call(arguments)));
		if (Object(result) === result) {
			return result;
		}
		return self;
	};
	return _bound;
};

_.bindInstanceMethods = function(obj) {
	for (var func in obj) {
		if (typeof obj[func] === 'function') {
			obj[func] = _.bind(obj[func], obj);
		}
	}
};

_.safewrap = function(f) {
	return function() {
		try {
			return f.apply(this, arguments);
		} catch (e) {
			console$1.log('Implementation error. Please turn on debug and contact support@mixpanel.com.');
			if (CONFIG.DEBUG) {
				console$1.log(e);
			}
		}
	};
};

_.safewrap_class = function(klass, functions) {
	for (var i = 0; i < functions.length; i++) {
		klass.prototype[functions[i]] = _.safewrap(klass.prototype[functions[i]]);
	}
};

_.safewrapInstanceMethods = function(obj) {
	for (var func in obj) {
		if (typeof obj[func] === 'function') {
			obj[func] = _.safewrap(obj[func]);
		}
	}
};
_.getById = function(id) {
	return document.getElementById(id);
};

_.getPropsDom = function(parentNode, propsName) {
	return parentNode.querySelectorAll('[' + propsName + ']');
};
_.getNetworkType = function() {
	var ua = navigator.userAgent;
	var networkStr = ua.match(/NetType\/\w+/) ? ua.match(/NetType\/\w+/)[0] : 'NetType/other';
	networkStr = networkStr.toLowerCase().replace('nettype/', '');
	var networkType;
	switch (networkStr) {
		case 'wifi':
			networkType = 'wifi';
			break;
		case '4g':
			networkType = '4g';
			break;
		case '3g':
			networkType = '3g';
			break;
		case '3gnet':
			networkType = '3g';
			break;
		case '2g':
			networkType = '2g';
			break;
		default:
			networkType = 'other';
	}
	return networkType;
};

var pageId = '';

var EVENT_TRACK = (function() {
	function EVENT_TRACK(instance) {
		classCallCheck(this, EVENT_TRACK);

		this.instance = instance;
		this['local_storage'] = this.instance['local_storage'];
	}
	/**
	 * TODO
	 * 判断指定事件是否被禁止上报
	 * @param {String} event_name
	 * @returns {Boolean}
	 */

	createClass(EVENT_TRACK, [
		{
			key: '_event_is_disabled',
			value: function _event_is_disabled(event_name) {
				return false;
			}
			/**
			 * 用户注册
			 * @param {String} user_id
			 */
		},
		{
			key: '_signup',
			value: function _signup(user_id) {
				// 默认是空值,若有值则调用退出
				var anonymous_id = this.instance.get_property('userId');
				if (anonymous_id !== user_id) {
					if (anonymous_id) {
						this.logout();
					}
					this.track('sxfData_u_signup', {
						anonymousId: anonymous_id,
						newUserId: user_id
					});
				}
			}
			/**
			 * 页面离开时触发
			 * @param {Object} properties  pv属性
			 * @param {*} callback
			 */
		},
		{
			key: 'trackPvOut',
			value: function trackPvOut(properties, callback) {
				this.track('pvout', _.extend({}, properties), callback);
			}
			/**
			 * 发送PV事件，在此之前检测session
			 * @param {Object} properties  pv属性
			 * @param {*} callback
			 */
		},
		{
			key: 'trackPv',
			value: function trackPv(properties, callback) {
				console$1.log('----进入页面----');
				this.track('pv', _.extend({}, properties), callback);
			}
			/**
			 * 追踪事件（上报用户事件触发数据）
			 * @param {String} event_name 事件名称（必须）
			 * @param {Object} properties 事件属性
			 * @param {Function} callback 上报后的回调方法
			 * @returns {Object} track_data 上报的数据
			 */
		},
		{
			key: 'track',
			value: function track(event_name, properties, callback, track_data) {
				if (event_name === 'pv') {
					if (properties && properties.pId) {
						pageId = new Date().getTime().toString() + '_' + properties.pId;
					} else {
						new Error('pId不能为空');
					}
				}
				if (_.isUndefined(event_name)) {
					console$1.error('上报数据需要一个事件名称');
					return;
				}
				if (!_.isFunction(callback)) {
					callback = function callback() {};
				}
				if (this._event_is_disabled(event_name)) {
					callback(0);
					return;
				}
				// 重新在本地取数据读取到缓存
				this['local_storage'].load();
				// 事件属性
				properties = properties || {};
				// 标记：传入的属性另存一份
				var user_set_properties = _.JSONDecode(_.JSONEncode(properties)) || {};

				// 事件触发时间
				var time = new Date().getTime();

				// 设置通用的事件属性
				user_set_properties = _.extend(
					{},
					this.instance.get_property('superProperties'),
					user_set_properties,
					{}
				);

				// 上报数据
				var data = {
					// 用户ID
					uId: this.instance.get_property('userId') || '',
					// 私有属性
					pAttr: track_data || {},
					// h5 android ios
					sdkT: 'h5',
					// 事件名称
					eId: event_name,
					// 事件触发时间
					t: time,
					// 客户端唯一凭证(设备凭证)
					dId: this.instance.get_device_id(),
					// 事件自定义属性
					cType: user_set_properties.cType || '',
					actId: user_set_properties.actId || '',
					pId: pageId // 页面id
				};
				// 合并客户端信息
				data = _.extend({}, data, _.info.properties(event_name));
				// 上报数据对象字段截取
				var truncateLength = this.instance._get_config('truncateLength');
				var truncated_data = data;
				if (_.isNumber(truncateLength) && truncateLength > 0) {
					truncated_data = _.truncate(data, truncateLength);
				}

				console$1.log(JSON.stringify(truncated_data, null, '  '));

				var callback_fn = function callback_fn(response) {
					callback(response, data);
				};
				var url = this.instance._get_config('track_url');
				url += 'track.gif';
				if (
					!this.instance._get_config('isBpoint') ||
					(user_set_properties &&
						user_set_properties.sxfDataConfig &&
						!user_set_properties.sxfDataConfig.isBpoint)
				) {
					_.sendRequest(
						url,
						{
							data: _.base64Encode(_.JSONEncode(truncated_data))
							//   token: this.instance._get_config("token")
						},
						callback_fn
					);
				} else {
					try {
						this.instance['bpoint'].push(truncated_data);
					} catch (error) {
						_.sendRequest(
							url,
							{
								data: _.base64Encode(_.JSONEncode(truncated_data))
							},
							callback_fn
						);
					}
				}
			}
			/**
			 * 用户登录和注册时调用
			 * @param {String} user_id
			 */
		},
		{
			key: 'login',
			value: function login(user_id) {
				this._signup(user_id);
				this['local_storage'].register({ userId: user_id });
				this.track('login');
			}
			// 清除本地用户信息，退出用户（选则调用）
		},
		{
			key: 'logout',
			value: function logout() {
				this['local_storage'].unregister('userId');
				this.track('logout');
			}
		}
	]);
	return EVENT_TRACK;
})();

var LOCAL_STORAGE = (function() {
	/**
	 *
	 * @param {Object} config
	 */
	function LOCAL_STORAGE(config) {
		classCallCheck(this, LOCAL_STORAGE);

		var local_storage = config['local_storage'];
		if (_.isObject(local_storage)) {
			this['name'] = local_storage['name'] || 'sxfData_' + '20190815' + '_sdk';
			var storage_type = local_storage['type'] || 'cookie';

			// 判断是否支持 localStorage
			var localStorage_supported = function localStorage_supported() {
				var supported = true;
				try {
					var key = '__sxfDatassupport__',
						val = 'sxfData_web_data_sdk';
					_.localStorage.set(key, val);
					if (_.localStorage.get(key) !== val) {
						supported = false;
					}
					_.localStorage.remove(key);
				} catch (error) {
					supported = false;
				}
				if (!supported) {
					console$1.error('localStorage 不支持，自动退回到cookie存储方式');
				}
				return supported;
			};

			if (storage_type === 'localStorage' && localStorage_supported()) {
				this['storage'] = _.localStorage;
			} else {
				this['storage'] = _.cookie;
			}

			this.load();
			this.update_config(local_storage);
			// TODO: upgrade
			this.upgrade();
			this.save();
		} else {
			console$1.error('local_storage配置设置错误');
		}
	}
	// 加载本地存储信息

	createClass(LOCAL_STORAGE, [
		{
			key: 'load',
			value: function load() {
				var localData = this['storage'].parse(this['name']);
				if (localData) {
					this['props'] = _.extend({}, localData);
				}
			}
			// 更新配置信息
		},
		{
			key: 'update_config',
			value: function update_config(localStorageConfig) {
				// 到期时间(cookie存储设置有效)
				this.default_expiry = this.expire_days = localStorageConfig['cookie_expiration'];
				this.set_disabled(localStorageConfig['disable']);
				this.set_cross_subdomain(localStorageConfig['cross_subdomain_cookie']);
				this.set_secure(localStorageConfig['secure_cookie']);
			}
			// 设置关闭本地保存操作，设置为关闭后，本地数据移除
		},
		{
			key: 'set_disabled',
			value: function set_disabled(disabled) {
				this.disabled = disabled;
				if (this.disabled) {
					this.remove();
				}
			}
			// 移除本地数据
		},
		{
			key: 'remove',
			value: function remove() {
				// cookie存储时，移除二级域以及子域下的cookie,此时参数有两个
				this.storage.remove(this.name, false);
				this.storage.remove(this.name, true);
			}
			// 清除存储的数据
		},
		{
			key: 'clear',
			value: function clear() {
				this.remove();
				this['props'] = {};
			}
			/**
			 * 跨子域设置,cookie存储方式下有效
			 * @param {Boolean} cross_subdomain
			 */
		},
		{
			key: 'set_cross_subdomain',
			value: function set_cross_subdomain(cross_subdomain) {
				if (cross_subdomain !== this.cross_subdomain) {
					this.cross_subdomain = cross_subdomain;
					this.remove();
					this.save();
				}
			}
			/**
			 * cookie存储方式下有效
			 * cookie存储时，采用安全的方式存储数据，调用该方法后，重新保存数据
			 * 当secure属性设置为true时，cookie只有在https协议下才能上传到服务器，
			 * 而在http协议下是没法上传的，所以也不会被窃听
			 * @param {Boolean} secure
			 */
		},
		{
			key: 'set_secure',
			value: function set_secure(secure) {
				if (secure !== this.secure) {
					this.secure = secure ? true : false;
					this.remove();
					this.save();
				}
			}
			// sdk升级，旧的sdk存储数据移到新的sdk存储数据中，然后删除旧的存储数据（暂不实现）
			// 存储方式改变，改为cookie切换到 localStorage
		},
		{
			key: 'upgrade',
			value: function upgrade(config) {
				var old_cookie = void 0;
				if (this.storage === _.localStorage) {
					old_cookie = _.cookie.parse(this.name);
					_.cookie.remove(this.name);
					_.cookie.remove(this.name, true);

					if (old_cookie) {
						this.register_once(old_cookie);
					}
				}
			}
			// 数据保存到本地
		},
		{
			key: 'save',
			value: function save() {
				// disabled配置为true, 数据不保存到本地
				if (this.disabled) {
					return;
				}
				this.storage.set(
					this['name'],
					_.JSONEncode(this['props']),
					this.expire_days,
					this.cross_subdomain,
					this.secure
				);
			}
			/**
			 * 缓存指定的数据，同时将该数据保存到本地
			 * @param {Object} props
			 * @param {Number} days
			 * @returns {Boolean} 返回true表示成功
			 */
		},
		{
			key: 'register',
			value: function register(props, days) {
				if (_.isObject(props)) {
					this.expire_days = typeof days === 'undefined' ? this.default_expiry : days;
					_.extend(this['props'], props);
					this.save();
					return true;
				}
				return false;
			}
			/**
			 * 只缓存一次指定的数据，下次设置该数据时不会覆盖前一次数据
			 * 若想更新已设置的属性值，那么default_value参数值要等于本地缓存数据中需重置的属性的值(默认值)
			 * this['props'][prop] === default_value   prop为需更新的属性
			 * @param {Object} props
			 * @param {*} default_value
			 * @param {Number} days
			 * @returns {Boolean} 返回true表示成功
			 */
		},
		{
			key: 'register_once',
			value: function register_once(props, default_value, days) {
				if (_.isObject(props)) {
					if (typeof default_value === 'undefined') {
						default_value = 'None';
					}
					this.expire_days = typeof days === 'undefined' ? this.default_expiry : days;

					_.each(
						props,
						function(val, prop) {
							if (!this['props'][prop] || this['props'][prop] === default_value) {
								this['props'][prop] = val;
							}
						},
						this
					);

					this.save();
					return true;
				}
				return false;
			}
			/**
			 * 移除指定的缓存数据，同时也清除本地的对应数据
			 * @param {string} prop
			 */
		},
		{
			key: 'unregister',
			value: function unregister(prop) {
				if (prop in this['props']) {
					delete this['props'][prop];
					this.save();
				}
			}
			/**
			 * 移除指定计时器，同时将本地存储的该计时器信息清除
			 * @param {String} event_name
			 * @returns {Date} 返回移除该计时器的时间戳
			 */
		},
		{
			key: 'remove_event_timer',
			value: function remove_event_timer(event_name) {
				var timers = this['props']['costTime'] || {};
				var timestamp = timers[event_name];
				if (!_.isUndefined(timestamp)) {
					delete this['props']['costTime'][event_name];
					this.save();
				}
				return timestamp;
			}
		}
	]);
	return LOCAL_STORAGE;
})();

/**
 * 单页面模块
 */
function on(obj, event, callFn) {
	if (obj[event]) {
		var fn = obj[event];
		obj[event] = function() {
			var args = Array.prototype.slice.call(arguments);
			callFn.apply(this, args);
			fn.apply(this, args);
		};
	} else {
		obj[event] = function() {
			var args = Array.prototype.slice.call(arguments);
			callFn.apply(this, args);
		};
	}
}

function getPath() {
	return location.pathname + location.search;
}

var SPA = {
	config: {
		mode: 'hash',
		track_replace_state: false,
		callback_fn: function callback_fn() {}
	},
	init: function init(config, instance) {
		this.instance = instance;
		this.config = _.extend(this.config, config || {});
		this.path = getPath();
		this.url = document.URL;
		this.event();
	},
	event: function event() {
		if (this.config.mode === 'history') {
			if (!history.pushState || !window.addEventListener) return;
			on(history, 'pushState', this.pushStateOverride.bind(this));
			on(history, 'replaceState', this.replaceStateOverride.bind(this));
			window.addEventListener('popstate', this.handlePopState.bind(this));
		} else if (this.config.mode === 'hash') {
			_.register_hash_event(this.handleHashState.bind(this));
		}
	},
	pushStateOverride: function pushStateOverride() {
		this.handleUrlChange(true);
	},
	replaceStateOverride: function replaceStateOverride() {
		this.handleUrlChange(false);
	},
	handlePopState: function handlePopState() {
		this.handleUrlChange(true);
	},
	handleHashState: function handleHashState() {
		this.handleUrlChange(true);
	},
	handleUrlChange: function handleUrlChange(historyDidUpdate) {
		var _this = this;

		setTimeout(function() {
			if (_this.config.mode === 'hash') {
				if (_.isFunction(_this.config.callback_fn)) {
					_this.config.callback_fn.call();
					_.innerEvent.trigger('singlePage:change', {
						oldUrl: _this.url,
						nowUrl: document.URL
					});
					_this.url = document.URL;
				}
			} else if (_this.config.mode === 'history') {
				var oldPath = _this.path;
				var newPath = getPath();
				if (oldPath != newPath && _this.shouldTrackUrlChange(newPath, oldPath)) {
					console.log('----离开页面----');
					_this.instance['event'].trackPvOut();
					_this.path = newPath;
					if (historyDidUpdate || _this.config.track_replace_state) {
						if (typeof _this.config.callback_fn === 'function') {
							_this.config.callback_fn.call();
							_.innerEvent.trigger('singlePage:change', {
								oldUrl: _this.url,
								nowUrl: document.URL
							});
							_this.url = document.URL;
						}
					}
				}
			}
		}, 0);
	},
	shouldTrackUrlChange: function shouldTrackUrlChange(newPath, oldPath) {
		return !!(newPath && oldPath);
	}
};

var BPOINT = (function() {
	function BPOINT(instance) {
		classCallCheck(this, BPOINT);

		this.instance = instance;
		this._infoStack = []; //信息存储栈 收集的信息将暂存到这里 等待打包移动到待发送队列

		this._waitSendQueue = []; //待发送队列，存储多个信息存储栈帧 等待被发送给后台

		this._queueSending = false; //是否在队列递归发送栈帧

		this._scanStackIntervalId = null; //stack 扫描定时器的id

		this._scanWaitSendQqueueIntervalId = null; //WaitSendQqueue 扫描定时器的id
		this._loadFN = []; //用于存储调用者需要在插件load时的执行的fn
	}
	/**
	 * 上一个页面的历史数据提交
	 * @private
	 */

	createClass(BPOINT, [
		{
			key: '_oldDataCheck',
			value: function _oldDataCheck() {
				var oldData = _.localStorage.get('_bp_wqueue');
				if (oldData != null && oldData != '') {
					try {
						oldData = eval('(' + oldData + ')');
						if (_.isArray(oldData) && oldData.length > 0) {
							var sendData = {};
							sendData = _.localStorage.set('_bp_infoConf');
							sendData = eval('(' + sendData + ')');

							for (; oldData.length > 0; ) {
								sendData = oldData.pop();
								//数据发送
								//发送栈帧+环境配置信息
								this._sendByImg(sendData);
							}
						}
					} catch (e) {}

					_.localStorage.remove('_bp_wqueue');
				}
			}
			/**
			 * 扫描信息栈中是否有数据 有数据 则将数据栈移入队列
			 * @param t
			 * @private
			 */
		},
		{
			key: '_scanStack',
			value: function _scanStack(t) {
				var _this = this;

				if (t != null && t >= 1) {
					if (this._scanStackIntervalId != null) {
						//如果已经存在定时器 需要先删除此定时，再创建新的定时器，防止出现重复定时器创建，最终导致内存泄露
						clearInterval(this._scanStackIntervalId);
					}
					this._scanStackIntervalId = setInterval(function() {
						_this.stack2queue();
					}, t * 1000);
				} else {
					console$1.log('埋点内置对象丢失,栈扫描器创建失败', 1);
					throw new ReferenceError('埋点内置对象丢失,栈扫描器创建失败');
				}
			}
		},
		{
			key: '_scanWaitSendQqueue',
			value: function _scanWaitSendQqueue(t) {
				var _this2 = this;

				if (t != null && t >= 1) {
					if (this._scanWaitSendQqueueIntervalId != null) {
						//如果已经存在定时器 需要先删除此定时，再创建新的定时器，防止出现重复定时器创建，最终导致内存泄露
						clearInterval(this._scanWaitSendQqueueIntervalId);
					}
					this._scanWaitSendQqueueIntervalId = setInterval(function() {
						console$1.log('开启等待发送--scanWaitSendQqueue');
						_this2.send();
					}, t * 1000);
				} else {
					console$1.log('埋点内置对象丢失,队列扫描器创建失败', 1);
					throw new ReferenceError('埋点内置对象丢失,队列扫描器创建失败');
				}
			}
			/*计算输入的字节*/
		},
		{
			key: 'strlen',
			value: function strlen(str) {
				var len = 0;
				for (var i = 0; i < str.length; i++) {
					// 取出单个字符
					var c = str.charCodeAt(i);
					//单字节加1 ，0~9，a~z
					if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
						len++;
					} else {
						len += 2;
					}
				}
				return len;
			}
			/**
			 * 发送队列里最老的栈帧
			 */
		},
		{
			key: 'sendOldestStack',
			value: function sendOldestStack() {
				var stack = this._waitSendQueue.shift();
				if (_.localStorage) {
					_.localStorage.set('_bp_wqueue', JSON.stringify(this._waitSendQueue));
				}

				console$1.log('send stack(queue shift):');

				var sendData = {};
				sendData = stack;

				//数据发送
				//发送栈帧+环境配置信息
				this._sendByImg(sendData);
			}
		},
		{
			key: '_sendByImg',
			value: function _sendByImg(truncated_data) {
				console$1.log('truncated_data', truncated_data);
				var url = this.instance._get_config('track_url');
				url += 'track.gif';
				_.sendRequest(
					url,
					{
						data: _.base64Encode(_.JSONEncode(truncated_data))
					},
					function() {}
				);
			}
			/**
			 * 设置存在埋点信息的栈的大小
			 * 调用此方法，如果栈的数据量>stackSize，则触发栈帧入待发送队列
			 * @param stackSize 栈的大小 大于0的整数 如果是小数或者字符串，将先使用parseInt处理
			 */
		},
		{
			key: 'setStackSize',
			value: function setStackSize(stackSize) {
				stackSize = parseInt(stackSize);
				if (stackSize < 1) {
					return;
				}
				this._option.stackSize = stackSize;

				if (this._infoStack.length >= stackSize) {
					// 如果已经满了 则送入待发送队列
					this.stack2queue();
				}
			}

			/**
			 * 栈帧入队列  等待被发送
			 */
		},
		{
			key: 'stack2queue',
			value: function stack2queue() {
				console$1.log('开始扫描--scanStack');
				var is = this._infoStack;
				// if (window._sxfmt && window._sxfmt.length > 0) {
				//   console.log("_sxfmt.length=" + _sxfmt.length);
				//   console.log(_sxfmt);
				//   is = is.concat(_sxfmt);
				//   window._sxfmt = [];
				// }

				console$1.log('infoStack length=' + is.length);
				if (is.length > 0) {
					this._queueSave(is);
					this._infoStack = [];
				} else {
					console$1.log('关闭扫描--_scanStackInterval');
					clearInterval(this._scanStackIntervalId);
				}
			}
		},
		{
			key: '_queueSave',
			value: function _queueSave(is) {
				this._waitSendQueue.push(is);
				this._scanWaitSendQqueue(CONFIG.queueTime);
				if (_.localStorage) {
					_.localStorage.set('_bp_wqueue', JSON.stringify(this._waitSendQueue));
				}
			}
		},
		{
			key: '_stackSave',
			value: function _stackSave(infoObj) {
				this._infoStack.push(infoObj);
				//检查信息栈是否已经满了
				if (this._infoStack.length >= CONFIG.stackSize) {
					// 如果已经满了 则送入待发送队列
					this.stack2queue();
				}
			}
		},
		{
			key: 'send',
			value: function send() {
				if (this._waitSendQueue.length == 0 || this._queueSending) {
					return;
				}

				this._send();
			}
			/**
			 * 将队列的栈帧都间隔递归发送出去
			 */
		},
		{
			key: '_send',
			value: function _send() {
				var _this3 = this;

				console$1.log('start send');
				console$1.log('waitSendQueue length=' + this._waitSendQueue.length);
				if (this._waitSendQueue.length == 0) {
					console$1.log('关闭等待发送--_scanWaitSendQqueueInterval');
					clearInterval(this._scanWaitSendQqueueIntervalId);
					this._queueSending = false;
					return;
				}

				this._queueSending = true;
				setTimeout(function() {
					_this3.sendOldestStack();
					_this3._send();
				}, 500);
			}

			/**
			 * 收集的信息入栈
			 * @param infoObj
			 *
			 *  {
			 *      oc : //业务编码 opeCode
			 *      ac ：//行为编码 actionCode
			 *      v ：//行为结果 value 例如 输入框产生的值
			 *      ed:  //扩展信息 json
			 *  }
			 *
			 */
		},
		{
			key: 'push',
			value: function push(infoObj) {
				if (infoObj) {
					//   infoObj.dateTime = new Date().getTime();
					this._scanStack(CONFIG.stackTime);
					this._stackSave(infoObj);
				}
			}
		}
	]);
	return BPOINT;
})();

var DOMLISTEN = (function() {
	function DOMLISTEN(instance) {
		classCallCheck(this, DOMLISTEN);

		this.instance = instance;
	}

	createClass(DOMLISTEN, [
		{
			key: '_addDomEventHandlers',
			value: function _addDomEventHandlers() {
				var _this = this;

				try {
					var rcidom = _.getPropsDom(document, 'data-sxf-props');
					rcidom.forEach(function(domItem) {
						var eventItem = JSON.parse(domItem.getAttribute('data-sxf-props'));
						var eventName = eventItem.name;
						var eventType = eventItem.type;
						var eventList = eventItem.eventList;
						var data = {};
						eventList.forEach(function(eventItem) {
							var type = eventItem.type;
							if (eventItem.type === 'delete') {
								type = 'keyup';
							}
							_.register_event(
								domItem,
								type,
								function(e) {
									if (eventType === 'input') {
										data = {
											value: e.target.value
										};
									}
									if (eventItem.type === 'delete') {
										if (e.keyCode === 8) {
											_this.instance['event'].track(
												'' + eventName,
												{ actId: eventItem.type || '' },
												null,
												data
											);
										}
										return;
									}
									_this.instance['event'].track('' + eventName, { actId: eventItem.type || '' }, null, data);
								},
								false,
								true
							);
						});
					});
				} catch (error) {
					console$1.error('自动添加监听事件失败,请校验语法是否有误！');
				}
			}
		},
		{
			key: 'bind',
			value: function bind(dom, kve) {
				if (dom && kve) {
					for (var k in kve) {
						dom.addEventListener(k, kve[k]);
					}

					return dom;
				}
			}
		}
	]);
	return DOMLISTEN;
})();

var SxfDataLib = (function() {
	function SxfDataLib() {
		classCallCheck(this, SxfDataLib);
	}
	/**
	 *
	 * sxfData.init
	 *
	 * ### Usage:
	 *
	 *     // 初始化
	 *
	 *             sxfData.init({
	 *                 local_storage: {
	 *                 type: 'localStorage'
	 *                 }
	 *             });
	 * ### Notes:
	 *
	 * 注意：配置项说明暂请查看 src/config.js文件中的 DEFAULT_CONFIG 类，里面有详细注解说明。
	 *
	 *
	 * @param {Object} config 初始化配置
	 */

	createClass(SxfDataLib, [
		{
			key: 'init',
			value: function init(config) {
				if (this['__loaded']) {
					return;
				}
				this['__loaded'] = true;

				this._ = _;
				this['config'] = {};
				this._set_config(
					_.extend({}, DEFAULT_CONFIG, CONFIG, config, {
						// token: token
					})
				);
				this['local_storage'] = new LOCAL_STORAGE(this['config']);
				// 运行钩子函数
				this._loaded();
				// 实例化事件对象
				this['event'] = new EVENT_TRACK(this);

				this['domlisten'] = new DOMLISTEN(this);
				// 设置设备凭证
				this._set_device_id();
				// 开启是否断点发送
				if (this._get_config('isBpoint')) {
					this['bpoint'] = new BPOINT(this);
					this['bpoint']._oldDataCheck();
					this['bpoint']._scanStack(CONFIG.stackTime);
				}
				this._trackPv();
				// 单页面
				if (this._get_config('SPA').is) {
					this._SPA();
				}
			}
			// 内部使用的PV方法
		},
		{
			key: '_trackPv',
			value: function _trackPv(properties, callback) {
				// 配置为自动触发PV事件
				if (this._get_config('pageview')) {
					this['event'].trackPv(properties, callback);
				}
			}
			// 单页面应用（影响PV）
		},
		{
			key: '_SPA',
			value: function _SPA() {
				var _this = this;

				SPA.init(
					{
						mode: this._get_config('SPA').mode,
						callback_fn: function callback_fn() {
							_this._trackPv();
						}
					},
					this
				);
			}
			/**
			 * 设置配置
			 * @param {Object} config
			 */
		},
		{
			key: '_set_config',
			value: function _set_config(config) {
				if (_.isObject(config)) {
					this['config'] = _.extend(this['config'], config);
					CONFIG.DEBUG = CONFIG.DEBUG || this._get_config('debug');
					CONFIG.isBpoint = CONFIG.isBpoint || this._get_config('isBpoint');
				}
			}
			/**
			 * 获取某个配置
			 * @param {String} prop_name
			 * @returns {*}
			 */
		},
		{
			key: '_get_config',
			value: function _get_config(prop_name) {
				return this['config'][prop_name];
			}
			// sdk初始化之前触发的钩子函数，该方法必须在初始化子模块前以及上报数据前使用
		},
		{
			key: '_loaded',
			value: function _loaded() {
				try {
					this._get_config('loaded')(this);
				} catch (error) {
					console$1.error(error);
				}
			}
			/**
			 * 设置本地设备凭证
			 * 若是首次访问（本地无设备凭证），上报用户首次访问网站事件
			 */
		},
		{
			key: '_set_device_id',
			value: function _set_device_id() {
				if (!this.get_device_id()) {
					this['local_storage'].register_once({ deviceId: _.UUID() }, '');
				}
			}

			// 获取唯一凭证（设备标记）
		},
		{
			key: 'get_device_id',
			value: function get_device_id() {
				return this.get_property('deviceId');
			}
			// 获取指定本地存储属性（缓存和本地）
		},
		{
			key: 'get_property',
			value: function get_property(prop_name) {
				return this['local_storage']['props'][prop_name];
			}
			/**
			 * 设置一个指定事件的耗时监听器
			 * @param {String} event_name
			 */
			// 监听事件
		},
		{
			key: '_addlisten',
			value: function _addlisten(id) {
				this['domlisten']._addDomEventHandlers(id);
			}

			/**
			 *
			 * sxfData.trackPv
			 *
			 * ### Usage:
			 *
			 *     // pv 默认情况下，sdk内部是自动触发PV事件的，若想手动触发，请调用该方法（注意先配置停止自动触发PV事件）
			 *     sxfData.trackPv();
			 *     // 禁止自动触发PV事件配置
			 *     sxfData.init({
			 *         pageview: false
			 *          });
			 *
			 *
			 * ### Notes:
			 *
			 * 页面pv
			 *
			 * @param {Object} properties pv属性
			 * @param {Function} callback 回调函数
			 */
		},
		{
			key: 'trackPv',
			value: function trackPv(properties, callback) {
				this['event'].trackPv(properties, callback);
			}

			/**
			 *
			 * sxfData.trackEvent
			 *
			 * ### Usage:
			 *      sxfData.trackEvent("buy", { price: '￥123', id: 'xxxx-xxxx-xxxx' });
			 *
			 * ### Notes:
			 *
			 *   追踪事件（上报用户事件触发数据）
			 *
			 * @param {String} event_name 事件名称（必须）
			 * @param {Object} properties 事件属性
			 * @param {Function} callback 上报后的回调方法
			 * @param {String} event_type 自定义事件类型
			 * @returns {Object} track_data 上报的数据
			 */
		},
		{
			key: 'trackEvent',
			value: function trackEvent(event_name, properties, callback, event_type) {
				this['event'].track(event_name, properties, callback, event_type);
			}

			/**
			 *
			 * sxfData.registerEventSuperProperties
			 *
			 * ### Usage:
			 *
			 *       sxfData.init({
			 *     // 钩子函数
			 *     loaded: function(sdk) {
			 *       // 这里给每个事件都设置一个通用属性
			 *       sdk.registerEventSuperProperties({ test: "通用属性设置" });
			 *     }
			 *   });
			 *
			 * ### Notes:
			 *
			 * 设置事件自定义通用属性
			 * 成功设置事件通用属性后，再通过 trackEvent: 追踪事件时，事件通用属性会被添加进每个事件中。
			 * 重复调用 registerEventSuperProperties: 会覆盖之前已设置的通用属性。
			 *
			 * @param {Object} prop 原属性（必须）
			 * @param {Object} to 需要替换属性
			 */
		},
		{
			key: 'registerEventSuperProperties',
			value: function registerEventSuperProperties(prop, to) {
				var set_props = {};
				var super_properties = this.get_property('superProperties');
				if (_.isObject(prop)) {
					_.each(prop, function(v, k) {
						set_props[k] = v;
					});
				} else {
					set_props[prop] = to;
				}
				// 注意合并顺序
				super_properties = _.extend({}, super_properties, set_props);
				this['local_storage'].register({
					superProperties: super_properties
				});
			}

			/**
			 *
			 * sxfData.registerEventSuperPropertiesOnce
			 *
			 * ### Usage:
			 *
			 *       sxfData.init({
			 *     // 钩子函数
			 *     loaded: function(sdk) {
			 *       // 这里给每个事件都设置一个通用属性
			 *       sdk.registerEventSuperPropertiesOnce({ test: "通用属性设置" });
			 *     }
			 *   });
			 *
			 * ### Notes:
			 *
			 * 设置事件自定义通用属性
			 * 成功设置事件通用属性后，再通过 trackEvent: 追踪事件时，事件通用属性会被添加进每个事件中。
			 * 不覆盖之前已经设定的通用属性。
			 *
			 * @param {Object} prop 原属性（必须）
			 * @param {Object} to 需要替换属性
			 */
		},
		{
			key: 'registerEventSuperPropertiesOnce',
			value: function registerEventSuperPropertiesOnce(prop, to) {
				var set_props = {};
				var super_properties = this.get_property('superProperties');
				if (_.isObject(prop)) {
					_.each(prop, function(v, k) {
						set_props[k] = v;
					});
				} else {
					set_props[prop] = to;
				}
				// 注意合并顺序
				super_properties = _.extend({}, set_props, super_properties);
				this['local_storage'].register({
					superProperties: super_properties
				});
			}
			/**
			 * 删除指定通用事件属性
			 * @param {String} prop_name
			 */
			/**
			 *
			 * sxfData.unRegisterEventSuperProperties
			 *
			 * ### Usage:
			 *
			 *       sxfData.init({
			 *     // 钩子函数
			 *     loaded: function(sdk) {
			 *       // 这里给每个事件都设置一个通用属性
			 *       sdk.unRegisterEventSuperProperties({ test: "通用属性设置" });
			 *     }
			 *   });
			 *
			 * ### Notes:
			 *
			 * 设置事件自定义通用属性
			 * 成功设置事件通用属性后，再通过 trackEvent: 追踪事件时，事件通用属性会被添加进每个事件中。
			 * 不覆盖之前已经设定的通用属性。
			 *
			 * @param {Object} prop 原属性（必须）
			 * @param {Object} to 需要替换属性
			 */
		},
		{
			key: 'unRegisterEventSuperProperties',
			value: function unRegisterEventSuperProperties(prop_name) {
				if (_.isString(prop_name)) {
					var super_properties = this.get_property('superProperties');
					if (_.isObject(super_properties)) {
						delete super_properties[prop_name];
						this['local_storage'].register({
							superProperties: super_properties
						});
					}
				}
			}
			/**
			 *
			 * sxfData.clearEventSuperProperties
			 *
			 * ### Usage:
			 *
			 *       sxfData.clearEventSuperProperties();
			 *
			 * ### Notes:
			 *
			 * 清空通用属性
			 *
			 */
		},
		{
			key: 'clearEventSuperProperties',
			value: function clearEventSuperProperties() {
				this['local_storage'].register({
					superProperties: {}
				});
			}
			/**
			 *
			 * sxfData.currentEventSuperProperties
			 *
			 * ### Usage:
			 *
			 *       sxfData.currentEventSuperProperties();
			 *
			 * ### Notes:
			 *
			 * 查看当前已设置的通用事件属性
			 *
			 */
		},
		{
			key: 'currentEventSuperProperties',
			value: function currentEventSuperProperties() {
				return this.get_property('superProperties');
			}
			/**
			 *
			 * sxfData.login
			 *
			 * ### Usage:
			 *
			 *       sxfData.login('xxxx');
			 *
			 * ### Notes:
			 *
			 * 用户登录和注册时调用
			 *@param {String} user_id
			 */
		},
		{
			key: 'login',
			value: function login(user_id) {
				this['event'].login(user_id);
			}
			/**
			 *
			 * sxfData.logout
			 *
			 * ### Usage:
			 *
			 *       sxfData.logout();
			 *
			 * ### Notes:
			 *
			 * 清除本地用户信息，退出用户（选则调用）,建议平台网站不必调用（无需匿名用户的平台）
			 */
		},
		{
			key: 'logout',
			value: function logout() {
				this['event'].logout();
			}
		}
	]);
	return SxfDataLib;
})();

var sxfData = new SxfDataLib();

module.exports = sxfData;
//# sourceMappingURL=index.cjs.js.map
