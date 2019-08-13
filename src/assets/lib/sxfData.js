'use strict';
var DEFAULT_CONFIG = {
		track_url: 'http://localhost:3300/',
		debug: !1,
		local_storage: {
			type: 'localStorage',
			name: '',
			disable: !1,
			secure_cookie: !1,
			cross_subdomain_cookie: !1,
			cookie_expiration: 1e3
		},
		loaded: function() {},
		SPA: { is: !1, mode: 'hash' },
		pageview: !0,
		truncateLength: -1,
		session_interval_mins: 30,
		isBpoint: !0,
		stackSize: 10,
		stackTime: 3,
		queueSize: 20,
		queueTime: 5
	},
	CONFIG = { DEBUG: !1, isBpoint: !0, stackSize: 10, stackTime: 3, queueSize: 20, queueTime: 5 },
	_typeof =
		'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
			? function(e) {
					return typeof e;
			  }
			: function(e) {
					return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
						? 'symbol'
						: typeof e;
			  },
	classCallCheck = function(e, t) {
		if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
	},
	createClass = (function() {
		function i(e, t) {
			for (var n = 0; n < t.length; n++) {
				var i = t[n];
				(i.enumerable = i.enumerable || !1),
					(i.configurable = !0),
					'value' in i && (i.writable = !0),
					Object.defineProperty(e, i.key, i);
			}
		}
		return function(e, t, n) {
			return t && i(e.prototype, t), n && i(e, n), e;
		};
	})(),
	previousDevice = window.device,
	device = {},
	changeOrientationList = [];
window.device = device;
var documentElement = window.document.documentElement,
	userAgent = window.navigator.userAgent.toLowerCase(),
	television = [
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
function find(e) {
	return !!~userAgent.indexOf(e);
}
function hasClass(e) {
	return documentElement.className.match(RegExp(e, 'i'));
}
function addClass(e) {
	var t = null;
	hasClass(e) ||
		((t = documentElement.className.replace(/^\s+|\s+$/g, '')), (documentElement.className = t + ' ' + e));
}
function removeClass(e) {
	hasClass(e) && (documentElement.className = documentElement.className.replace(' ' + e, ''));
}
function handleOrientation() {
	device.landscape()
		? (removeClass('portrait'), addClass('landscape'), walkOnChangeOrientationList('landscape'))
		: (removeClass('landscape'), addClass('portrait'), walkOnChangeOrientationList('portrait')),
		setOrientationCache();
}
function walkOnChangeOrientationList(e) {
	for (var t in changeOrientationList) changeOrientationList[t](e);
}
(device.macos = function() {
	return find('mac');
}),
	(device.ios = function() {
		return device.iphone() || device.ipod() || device.ipad();
	}),
	(device.iphone = function() {
		return !device.windows() && find('iphone');
	}),
	(device.ipod = function() {
		return find('ipod');
	}),
	(device.ipad = function() {
		return find('ipad');
	}),
	(device.android = function() {
		return !device.windows() && find('android');
	}),
	(device.androidPhone = function() {
		return device.android() && find('mobile');
	}),
	(device.androidTablet = function() {
		return device.android() && !find('mobile');
	}),
	(device.blackberry = function() {
		return find('blackberry') || find('bb10') || find('rim');
	}),
	(device.blackberryPhone = function() {
		return device.blackberry() && !find('tablet');
	}),
	(device.blackberryTablet = function() {
		return device.blackberry() && find('tablet');
	}),
	(device.windows = function() {
		return find('windows');
	}),
	(device.windowsPhone = function() {
		return device.windows() && find('phone');
	}),
	(device.windowsTablet = function() {
		return device.windows() && find('touch') && !device.windowsPhone();
	}),
	(device.fxos = function() {
		return (find('(mobile') || find('(tablet')) && find(' rv:');
	}),
	(device.fxosPhone = function() {
		return device.fxos() && find('mobile');
	}),
	(device.fxosTablet = function() {
		return device.fxos() && find('tablet');
	}),
	(device.meego = function() {
		return find('meego');
	}),
	(device.cordova = function() {
		return window.cordova && 'file:' === location.protocol;
	}),
	(device.nodeWebkit = function() {
		return 'object' === _typeof(window.process);
	}),
	(device.mobile = function() {
		return (
			device.androidPhone() ||
			device.iphone() ||
			device.ipod() ||
			device.windowsPhone() ||
			device.blackberryPhone() ||
			device.fxosPhone() ||
			device.meego()
		);
	}),
	(device.tablet = function() {
		return (
			device.ipad() ||
			device.androidTablet() ||
			device.blackberryTablet() ||
			device.windowsTablet() ||
			device.fxosTablet()
		);
	}),
	(device.desktop = function() {
		return !device.tablet() && !device.mobile();
	}),
	(device.television = function() {
		for (var e = 0; e < television.length; ) {
			if (find(television[e])) return !0;
			e++;
		}
		return !1;
	}),
	(device.portrait = function() {
		return screen.orientation && Object.prototype.hasOwnProperty.call(window, 'onorientationchange')
			? screen.orientation.type.includes('portrait')
			: 1 < window.innerHeight / window.innerWidth;
	}),
	(device.landscape = function() {
		return screen.orientation && Object.prototype.hasOwnProperty.call(window, 'onorientationchange')
			? screen.orientation.type.includes('landscape')
			: window.innerHeight / window.innerWidth < 1;
	}),
	(device.noConflict = function() {
		return (window.device = previousDevice), this;
	}),
	device.ios()
		? device.ipad()
			? addClass('ios ipad tablet')
			: device.iphone()
			? addClass('ios iphone mobile')
			: device.ipod() && addClass('ios ipod mobile')
		: device.macos()
		? addClass('macos desktop')
		: device.android()
		? device.androidTablet()
			? addClass('android tablet')
			: addClass('android mobile')
		: device.blackberry()
		? device.blackberryTablet()
			? addClass('blackberry tablet')
			: addClass('blackberry mobile')
		: device.windows()
		? device.windowsTablet()
			? addClass('windows tablet')
			: device.windowsPhone()
			? addClass('windows mobile')
			: addClass('windows desktop')
		: device.fxos()
		? device.fxosTablet()
			? addClass('fxos tablet')
			: addClass('fxos mobile')
		: device.meego()
		? addClass('meego mobile')
		: device.nodeWebkit()
		? addClass('node-webkit')
		: device.television()
		? addClass('television')
		: device.desktop() && addClass('desktop'),
	device.cordova() && addClass('cordova'),
	(device.onChangeOrientation = function(e) {
		'function' == typeof e && changeOrientationList.push(e);
	});
var orientationEvent = 'resize';
function findMatch(e) {
	for (var t = 0; t < e.length; t++) if (device[e[t]]()) return e[t];
	return 'unknown';
}
function setOrientationCache() {
	device.orientation = findMatch(['portrait', 'landscape']);
}
Object.prototype.hasOwnProperty.call(window, 'onorientationchange') &&
	(orientationEvent = 'orientationchange'),
	window.addEventListener
		? window.addEventListener(orientationEvent, handleOrientation, !1)
		: window.attachEvent
		? window.attachEvent(orientationEvent, handleOrientation)
		: (window[orientationEvent] = handleOrientation),
	handleOrientation(),
	(device.type = findMatch(['mobile', 'tablet', 'desktop'])),
	(device.os = findMatch([
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
	])),
	setOrientationCache();
var utf8Encode = function(e) {
		var t,
			n,
			i,
			o,
			r = '';
		for (
			t = n = 0, i = (e = (e + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')).length, o = 0;
			o < i;
			o++
		) {
			var a = e.charCodeAt(o),
				s = null;
			a < 128
				? n++
				: (s =
						127 < a && a < 2048
							? String.fromCharCode((a >> 6) | 192, (63 & a) | 128)
							: String.fromCharCode((a >> 12) | 224, ((a >> 6) & 63) | 128, (63 & a) | 128)),
				null !== s && (t < n && (r += e.substring(t, n)), (r += s), (t = n = o + 1));
		}
		return t < n && (r += e.substring(t, e.length)), r;
	},
	base64Encode = function(e) {
		var t,
			n,
			i,
			o,
			r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
			a = 0,
			s = 0,
			c = '',
			l = [];
		if (!e) return e;
		for (
			e = utf8Encode(e);
			(t = e.charCodeAt(a++)),
				(n = e.charCodeAt(a++)),
				(i = e.charCodeAt(a++)),
				(l[s++] =
					r[0 | (((o = (t << 16) | (n << 8) | i) >> 18) & 63)] +
					r[0 | ((o >> 12) & 63)] +
					r[0 | ((o >> 6) & 63)] +
					r[0 | (63 & o)]),
				a < e.length;

		);
		switch (((c = l.join('')), e.length % 3)) {
			case 1:
				c = c.slice(0, -2) + '==';
				break;
			case 2:
				c = c.slice(0, -1) + '=';
		}
		return c;
	},
	win$1 = void 0;
function toString(e) {
	return Object.prototype.toString.call(e);
}
function isObject(e) {
	return '[object Object]' === toString(e);
}
function isFunction(e) {
	return '[object Function]' === toString(e);
}
function each(e, t) {
	for (var n = 0, i = e.length; n < i && !1 !== t.call(e, e[n], n); n++);
}
win$1 =
	'undefined' == typeof window
		? {
				navigator: { userAgent: '' },
				location: { pathname: '', href: '' },
				document: { URL: '' },
				screen: { width: '', height: '' }
		  }
		: window;
var NA_VERSION = '-1',
	external = win$1.external,
	userAgent$1 = win$1.navigator.userAgent || '',
	appVersion = win$1.navigator.appVersion || '',
	vendor = win$1.navigator.vendor || '',
	detector = {},
	re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/,
	re_blackberry_10 = /\bbb10\b.+?\bversion\/([\d.]+)/,
	re_blackberry_6_7 = /\bblackberry\b.+\bversion\/([\d.]+)/,
	re_blackberry_4_5 = /\bblackberry\d+\/([\d.]+)/,
	DEVICES = [
		[
			'nokia',
			function(e) {
				return ~e.indexOf('nokia ') ? /\bnokia ([0-9]+)?/ : /\bnokia([a-z0-9]+)?/;
			}
		],
		[
			'samsung',
			function(e) {
				return ~e.indexOf('samsung')
					? /\bsamsung(?:[ \-](?:sgh|gt|sm))?-([a-z0-9]+)/
					: /\b(?:sgh|sch|gt|sm)-([a-z0-9]+)/;
			}
		],
		[
			'wp',
			function(e) {
				return !!(
					~e.indexOf('windows phone ') ||
					~e.indexOf('xblwp') ||
					~e.indexOf('zunewp') ||
					~e.indexOf('windows ce')
				);
			}
		],
		['pc', 'windows'],
		['ipad', 'ipad'],
		['ipod', 'ipod'],
		['iphone', /\biphone\b|\biph(\d)/],
		['mac', 'macintosh'],
		['mi', /\bmi[ \-]?([a-z0-9 ]+(?= build|\)))/],
		['hongmi', /\bhm\b|redmi[ \-]?([a-z0-9]+)/],
		['aliyun', /\baliyunos\b(?:[\-](\d+))?/],
		[
			'meizu',
			function(e) {
				return ~e.indexOf('meizu') ? /\bmeizu[\/ ]([a-z0-9]+)\b/ : /\bm([0-9cx]{1,4})\b/;
			}
		],
		['nexus', /\bnexus ([0-9s.]+)/],
		[
			'huawei',
			function(e) {
				var t = /\bmediapad (.+?)(?= build\/huaweimediapad\b)/;
				return ~e.indexOf('huawei-huawei')
					? /\bhuawei\-huawei\-([a-z0-9\-]+)/
					: t.test(e)
					? t
					: /\bhuawei[ _\-]?([a-z0-9]+)/;
			}
		],
		[
			'lenovo',
			function(e) {
				return ~e.indexOf('lenovo-lenovo') ? /\blenovo\-lenovo[ \-]([a-z0-9]+)/ : /\blenovo[ \-]?([a-z0-9]+)/;
			}
		],
		[
			'zte',
			function(e) {
				return /\bzte\-[tu]/.test(e) ? /\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/ : /\bzte[ _\-]?([a-su-z0-9\+]+)/;
			}
		],
		['vivo', /\bvivo(?: ([a-z0-9]+))?/],
		[
			'htc',
			function(e) {
				return /\bhtc[a-z0-9 _\-]+(?= build\b)/.test(e)
					? /\bhtc[ _\-]?([a-z0-9 ]+(?= build))/
					: /\bhtc[ _\-]?([a-z0-9 ]+)/;
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
			function(e) {
				return ~e.indexOf('blackberry') ? /\bblackberry\s?(\d+)/ : 'bb10';
			}
		]
	],
	OS = [
		[
			'wp',
			function(e) {
				return ~e.indexOf('windows phone ')
					? /\bwindows phone (?:os )?([0-9.]+)/
					: ~e.indexOf('xblwp')
					? /\bxblwp([0-9.]+)/
					: ~e.indexOf('zunewp')
					? /\bzunewp([0-9.]+)/
					: 'windows phone';
			}
		],
		['windows', /\bwindows nt ([0-9.]+)/],
		['macosx', /\bmac os x ([0-9._]+)/],
		[
			'iOS',
			function(e) {
				return /\bcpu(?: iphone)? os /.test(e)
					? /\bcpu(?: iphone)? os ([0-9._]+)/
					: ~e.indexOf('iph os ')
					? /\biph os ([0-9_]+)/
					: /\bios\b/;
			}
		],
		['yunos', /\baliyunos ([0-9.]+)/],
		[
			'Android',
			function(e) {
				return ~e.indexOf('android')
					? /\bandroid[ \/-]?([0-9.x]+)?/
					: ~e.indexOf('adr')
					? ~e.indexOf('mqqbrowser')
						? /\badr[ ]\(linux; u; ([0-9.]+)?/
						: /\badr(?:[ ]([0-9.]+))?/
					: 'android';
			}
		],
		['chromeos', /\bcros i686 ([0-9.]+)/],
		['linux', 'linux'],
		['windowsce', /\bwindows ce(?: ([0-9.]+))?/],
		['symbian', /\bsymbian(?:os)?\/([0-9.]+)/],
		[
			'blackberry',
			function(e) {
				var t = e.match(re_blackberry_10) || e.match(re_blackberry_6_7) || e.match(re_blackberry_4_5);
				return t ? { version: t[1] } : 'blackberry';
			}
		]
	],
	ENGINE = [
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
			function(e) {
				var t;
				if ((t = e.match(/\brv:([\d\w.]+).*\bgecko\/(\d+)/))) return { version: t[1] + '.' + t[2] };
			}
		],
		['presto', /\bpresto\/([0-9.]+)/],
		['androidwebkit', /\bandroidwebkit\/([0-9.]+)/],
		['coolpadwebkit', /\bcoolpadwebkit\/([0-9.]+)/],
		['u2', /\bu2\/([0-9.]+)/],
		['u3', /\bu3\/([0-9.]+)/]
	],
	BROWSER = [
		['edge', /edge\/([0-9.]+)/],
		[
			'sogou',
			function(e) {
				return ~e.indexOf('sogoumobilebrowser')
					? /sogoumobilebrowser\/([0-9.]+)/
					: !!~e.indexOf('sogoumse') || / se ([0-9.x]+)/;
			}
		],
		[
			'theworld',
			function() {
				var e = checkTW360External('theworld');
				return void 0 !== e ? e : 'theworld';
			}
		],
		[
			'360',
			function(e) {
				var t = checkTW360External('360se');
				return void 0 !== t
					? t
					: ~e.indexOf('360 aphone browser')
					? /\b360 aphone browser \(([^\)]+)\)/
					: /\b360(?:se|ee|chrome|browser)\b/;
			}
		],
		[
			'maxthon',
			function() {
				try {
					if (external && (external.mxVersion || external.max_version))
						return { version: external.mxVersion || external.max_version };
				} catch (e) {}
				return /\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/;
			}
		],
		['micromessenger', /\bmicromessenger\/([\d.]+)/],
		['qq', /\bm?qqbrowser\/([0-9.]+)/],
		['green', 'greenbrowser'],
		['tt', /\btencenttraveler ([0-9.]+)/],
		[
			'liebao',
			function(e) {
				if (~e.indexOf('liebaofast')) return /\bliebaofast\/([0-9.]+)/;
				if (!~e.indexOf('lbbrowser')) return !1;
				var t;
				try {
					external && external.LiebaoGetVersion && (t = external.LiebaoGetVersion());
				} catch (e) {}
				return { version: t || NA_VERSION };
			}
		],
		['tao', /\btaobrowser\/([0-9.]+)/],
		['coolnovo', /\bcoolnovo\/([0-9.]+)/],
		['saayaa', 'saayaa'],
		['baidu', /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
		['ie', re_msie],
		['mi', /\bmiuibrowser\/([0-9.]+)/],
		[
			'opera',
			function(e) {
				var t = /\bopera.+version\/([0-9.ab]+)/;
				return t.test(e) ? t : /\bopr\/([0-9.]+)/;
			}
		],
		['oupeng', /\boupeng\/([0-9.]+)/],
		['yandex', /yabrowser\/([0-9.]+)/],
		[
			'ali-ap',
			function(e) {
				return 0 < e.indexOf('aliapp') ? /\baliapp\(ap\/([0-9.]+)\)/ : /\balipayclient\/([0-9.]+)\b/;
			}
		],
		['ali-ap-pd', /\baliapp\(ap-pd\/([0-9.]+)\)/],
		['ali-am', /\baliapp\(am\/([0-9.]+)\)/],
		['ali-tb', /\baliapp\(tb\/([0-9.]+)\)/],
		['ali-tb-pd', /\baliapp\(tb-pd\/([0-9.]+)\)/],
		['ali-tm', /\baliapp\(tm\/([0-9.]+)\)/],
		['ali-tm-pd', /\baliapp\(tm-pd\/([0-9.]+)\)/],
		[
			'uc',
			function(e) {
				return ~e.indexOf('ucbrowser/')
					? /\bucbrowser\/([0-9.]+)/
					: ~e.indexOf('ubrowser/')
					? /\bubrowser\/([0-9.]+)/
					: /\buc\/[0-9]/.test(e)
					? /\buc\/([0-9.]+)/
					: ~e.indexOf('ucweb')
					? /\bucweb([0-9.]+)?/
					: /\b(?:ucbrowser|uc)\b/;
			}
		],
		['chrome', / (?:chrome|crios|crmo)\/([0-9.]+)/],
		[
			'android',
			function(e) {
				if (~e.indexOf('android')) return /\bversion\/([0-9.]+(?: beta)?)/;
			}
		],
		[
			'blackberry',
			function(e) {
				var t = e.match(re_blackberry_10) || e.match(re_blackberry_6_7) || e.match(re_blackberry_4_5);
				return t ? { version: t[1] } : 'blackberry';
			}
		],
		['safari', /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
		['webview', /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/],
		['firefox', /\bfirefox\/([0-9.ab]+)/],
		['nokia', /\bnokiabrowser\/([0-9.]+)/]
	];
function checkTW360External(e) {
	if (external)
		try {
			var t = external.twGetRunPath.toLowerCase(),
				n = external.twGetSecurityID(win$1),
				i = external.twGetVersion(n);
			if (t && !~t.indexOf(e)) return !1;
			if (i) return { version: i };
		} catch (e) {}
}
function IEMode(e) {
	if (!re_msie.test(e)) return null;
	var t, n, i, o, r;
	if (~e.indexOf('trident/') && (t = /\btrident\/([0-9.]+)/.exec(e)) && 2 <= t.length) {
		var a = (i = t[1]).split('.');
		(a[0] = parseInt(a[0], 10) + 4), (r = a.join('.'));
	}
	var s = (o = (t = re_msie.exec(e))[1]).split('.');
	return (
		void 0 === r && (r = o),
		(s[0] = parseInt(s[0], 10) - 4),
		(n = s.join('.')),
		void 0 === i && (i = n),
		{ browserVersion: r, browserMode: o, engineVersion: i, engineMode: n, compatible: i !== n }
	);
}
function detect(e, t, n) {
	var i = isFunction(t) ? t.call(null, n) : t;
	if (!i) return null;
	var o = { name: e, version: NA_VERSION, codename: '' },
		r = toString(i);
	if (!0 === i) return o;
	if ('[object String]' === r) {
		if (~n.indexOf(i)) return o;
	} else {
		if (isObject(i)) return i.hasOwnProperty('version') && (o.version = i.version), o;
		if (i.exec) {
			var a = i.exec(n);
			if (a) return (o.version = 2 <= a.length && a[1] ? a[1].replace(/_/g, '.') : NA_VERSION), o;
		}
	}
}
var na = { name: '', version: '' };
function init(n, e, t, i) {
	var o = na;
	each(e, function(e) {
		var t = detect(e[0], e[1], n);
		if (t) return (o = t), !1;
	}),
		t.call(i, o.name, o.version);
}
var parse = function(e) {
	e = (e || '').toLowerCase();
	var o = {};
	init(
		e,
		DEVICES,
		function(e, t) {
			var n = parseFloat(t);
			(o.device = { name: e, version: n, fullVersion: t }), (o.device[e] = n);
		},
		o
	),
		init(
			e,
			OS,
			function(e, t) {
				var n = parseFloat(t);
				(o.os = { name: e, version: n, fullVersion: t }), (o.os[e] = n);
			},
			o
		);
	var r = IEMode(e);
	return (
		init(
			e,
			ENGINE,
			function(e, t) {
				var n = t;
				r && ((t = r.engineVersion || r.engineMode), (n = r.engineMode));
				var i = parseFloat(t);
				(o.engine = {
					name: e,
					version: i,
					fullVersion: t,
					mode: parseFloat(n),
					fullMode: n,
					compatible: !!r && r.compatible
				}),
					(o.engine[e] = i);
			},
			o
		),
		init(
			e,
			BROWSER,
			function(e, t) {
				var n = t;
				r && ('ie' === e && (t = r.browserVersion), (n = r.browserMode));
				var i = parseFloat(t);
				(o.browser = {
					name: e,
					version: i,
					fullVersion: t,
					mode: parseFloat(n),
					fullMode: n,
					compatible: !!r && r.compatible
				}),
					(o.browser[e] = i);
			},
			o
		),
		o
	);
};
detector = parse(userAgent$1 + ' ' + appVersion + ' ' + vendor);
var detector$1 = detector,
	networkType = '',
	ArrayProto = Array.prototype,
	FuncProto = Function.prototype,
	slice = ArrayProto.slice,
	nativeBind = FuncProto.bind,
	win = void 0;
win =
	'undefined' == typeof window
		? {
				navigator: { userAgent: '' },
				location: { pathname: '', href: '' },
				document: { URL: '' },
				screen: { width: '', height: '' }
		  }
		: window;
var breaker = {},
	_ = {
		each: function(e, t, n) {
			if (null != e)
				if (Array.prototype.forEach && e.forEach === Array.prototype.forEach) e.forEach(t, n);
				else if (e.length === +e.length) {
					for (var i = 0, o = e.length; i < o; i++) if (i in e && t.call(n, e[i], i, e) === breaker) return;
				} else for (var r in e) if (e.hasOwnProperty.call(e, r) && t.call(n, e[r], r, e) === breaker) return;
		},
		extend: function(n) {
			return (
				_.each(Array.prototype.slice.call(arguments, 1), function(e) {
					for (var t in e) void 0 !== e[t] && (n[t] = e[t]);
				}),
				n
			);
		},
		isObject: function(e) {
			return e === Object(e) && !_.isArray(e);
		},
		isUndefined: function(e) {
			return void 0 === e;
		},
		isArguments: function(e) {
			return !(!e || !hasOwnProperty.call(e, 'callee'));
		},
		toArray: function(e) {
			return e
				? e.toArray
					? e.toArray()
					: _.isArray(e)
					? Array.prototype.slice.call(e)
					: _.isArguments(e)
					? Array.prototype.slice.call(e)
					: _.values(e)
				: [];
		},
		values: function(e) {
			var t = [];
			return (
				null === e ||
					_.each(e, function(e) {
						t[t.length] = e;
					}),
				t
			);
		},
		JSONDecode: function(e) {
			try {
				return JSON.parse(e);
			} catch (e) {
				return {};
			}
		},
		JSONEncode: function(e) {
			try {
				return JSON.stringify(e);
			} catch (e) {
				return '';
			}
		},
		isFunction: function(e) {
			var t = !1;
			return 'function' == typeof e && (t = !0), t;
		},
		base64Encode: function(e) {
			return base64Encode(e);
		},
		sha1: function(e) {
			return '';
		},
		truncate: function(e, n) {
			var i = void 0;
			return (
				'string' == typeof e
					? (i = e.slice(0, n))
					: _.isArray(e)
					? ((i = []),
					  _.each(e, function(e) {
							i.push(_.truncate(e, n));
					  }))
					: _.isObject(e)
					? ((i = {}),
					  _.each(e, function(e, t) {
							i[t] = _.truncate(e, n);
					  }))
					: (i = e),
				i
			);
		},
		isNumber: function(e) {
			return '[object Number]' == Object.prototype.toString.call(e);
		},
		isString: function(e) {
			return '[object String]' == Object.prototype.toString.call(e);
		},
		HTTPBuildQuery: function(e, t) {
			var n = void 0,
				i = [];
			return (
				_.isUndefined(t) && (t = '&'),
				_.each(e, function(e, t) {
					(n = encodeURIComponent(e && '' + e)), (i[i.length] = encodeURIComponent(t) + '=' + n);
				}),
				i.join(t)
			);
		},
		trim: function(e) {
			if (e) return e.replace(/(^\s*)|(\s*$)/g, '');
		},
		checkTime: function(e) {
			return !!e && /^(\d{4})-(\d{2})-(\d{2})$/.test(e);
		},
		getHost: function(e) {
			var t = '',
				n = (e = e || document.URL).match(/.*\:\/\/([^\/]*).*/);
			return n && (t = n[1]), t;
		},
		getQueryParam: function(e, t) {
			var n = t.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
				i = RegExp('[\\?&]' + n + '=([^&#]*)').exec(e);
			return null === i || (i && 'string' != typeof i[1] && i[1].length)
				? ''
				: decodeURIComponent(i[1]).replace(/\+/g, ' ');
		},
		deleteEmptyProperty: function(e) {
			if (this.isObject(e)) {
				for (var t in e)
					e.hasOwnProperty(t) && ((null !== e[t] && !this.isUndefined(e[t]) && '' !== e[t]) || delete e[t]);
				return e;
			}
		}
	};
(_.isArray =
	Array.isArray ||
	function(e) {
		return '[object Array]' === Object.prototype.toString.apply(e);
	}),
	(_.loadScript = function(e) {
		e = _.extend(
			{
				success: function() {},
				error: function() {},
				appendCall: function(e) {
					document.getElementsByTagName('head')[0].appendChild(e);
				}
			},
			e
		);
		var t = null;
		'css' === e.type && (((t = document.createElement('link')).rel = 'stylesheet'), (t.href = e.url)),
			'js' === e.type &&
				(((t = document.createElement('script')).async = 'async'),
				t.setAttribute('charset', 'UTF-8'),
				(t.src = e.url),
				(t.type = 'text/javascript')),
			(t.onload = t.onreadystatechange = function() {
				(this.readyState && 'loaded' !== this.readyState && 'complete' !== this.readyState) ||
					(e.success(), (t.onload = t.onreadystatechange = null));
			}),
			(t.onerror = function() {
				e.error(), (t.onerror = null);
			}),
			e.appendCall(t);
	}),
	(_.register_event = (function() {
		function s(e) {
			return e && ((e.preventDefault = s.preventDefault), (e.stopPropagation = s.stopPropagation)), e;
		}
		return (
			(s.preventDefault = function() {
				this.returnValue = !1;
			}),
			(s.stopPropagation = function() {
				this.cancelBubble = !0;
			}),
			function(e, t, n, i, o) {
				if (e)
					if (e.addEventListener && !i) e.addEventListener(t, n, !!o);
					else {
						var r = 'on' + t;
						console.log('ontype', r),
							(e[r] = (function(o, r, a) {
								return function(e) {
									if ((e = e || s(window.event))) {
										var t,
											n,
											i = !0;
										return (
											_.isFunction(a) && (t = a(e)), (n = r.call(o, e)), (!1 !== t && !1 !== n) || (i = !1), i
										);
									}
								};
							})(e, n, e[r]));
					}
				else console.error('No valid element provided to register_event');
			}
		);
	})()),
	(_.register_hash_event = function(e) {
		_.register_event(window, 'hashchange', e);
	}),
	(_.getHashParam = function(e, t) {
		var n = e.match(RegExp(t + '=([^&]*)'));
		return n ? n[1] : null;
	}),
	(_.info = {
		properties: function(e) {
			return (
				'pv' === e && (networkType = _.getNetworkType()),
				{
					netType: networkType,
					Os: detector$1.os.name,
					bs: detector$1.browser.name,
					bVer: detector$1.browser.fullVersion
				}
			);
		}
	}),
	(_.innerEvent = {
		on: function(e, t) {
			this._list || (this._list = {}), this._list[e] || (this._list[e] = []), this._list[e].push(t);
		},
		off: function(e) {
			this._list || (this._list = {}), this._list[e] && delete this._list[e];
		},
		trigger: function() {
			var e = Array.prototype.slice.call(arguments),
				t = this._list && this._list[e[0]];
			if (t && 0 !== t.length)
				for (var n = 0; n < t.length; n++) 'function' == typeof t[n] && t[n].apply(this, e);
		}
	}),
	(_.sendRequest = function(e, t, n) {
		(t._ = '' + new Date().getTime()), (e += '?' + _.HTTPBuildQuery(t));
		var i = document.createElement('img');
		(i.src = e),
			(i.width = 1),
			(i.height = 1),
			_.isFunction(n) && n(0),
			(i.onload = function() {
				this.onload = null;
			}),
			(i.onerror = function() {
				this.onerror = null;
			}),
			(i.onabort = function() {
				this.onabort = null;
			});
	}),
	(_.UUID = (function() {
		function n() {
			for (var e = 1 * new Date(), t = 0; e == 1 * new Date(); ) t++;
			return e.toString(16) + t.toString(16);
		}
		return function() {
			var e = screen.height * screen.width + '';
			e = e && /\d{5,}/.test(e) ? e.toString(16) : (31242 * Math.random() + '').replace('.', '').slice(0, 8);
			var t =
				n() +
				'-' +
				Math.random()
					.toString(16)
					.replace('.', '') +
				'-' +
				(function() {
					var e,
						t,
						n = navigator.userAgent,
						o = [],
						i = 0;
					function r(e, t) {
						var n,
							i = 0;
						for (n = 0; n < t.length; n++) i |= o[n] << (8 * n);
						return e ^ i;
					}
					for (e = 0; e < n.length; e++)
						(t = n.charCodeAt(e)), o.unshift(255 & t), o.length < 4 || ((i = r(i, o)), (o = []));
					return 0 < o.length && (i = r(i, o)), i.toString(16);
				})() +
				'-' +
				e +
				'-' +
				n();
			return t || (Math.random() + '' + Math.random() + Math.random()).slice(2, 15);
		};
	})()),
	(_.localStorage = {
		error: function(e) {
			console.error('localStorage error: ' + e);
		},
		get: function(e) {
			try {
				return window.localStorage.getItem(e);
			} catch (e) {
				_.localStorage.error(e);
			}
			return null;
		},
		parse: function(e) {
			try {
				return _.JSONDecode(_.localStorage.get(e)) || {};
			} catch (e) {}
			return null;
		},
		set: function(e, t) {
			try {
				window.localStorage.setItem(e, t);
			} catch (e) {
				_.localStorage.error(e);
			}
		},
		remove: function(e) {
			try {
				window.localStorage.removeItem(e);
			} catch (e) {
				_.localStorage.error(e);
			}
		}
	}),
	(_.cookie = {
		get: function(e) {
			for (var t = e + '=', n = document.cookie.split(';'), i = 0; i < n.length; i++) {
				for (var o = n[i]; ' ' == o[0]; ) o = o.substring(1, o.length);
				if (!o.indexOf(t)) return decodeURIComponent(o.substring(t.length, o.length));
			}
			return null;
		},
		parse: function(e) {
			var t;
			try {
				t = _.JSONDecode(_.cookie.get(e)) || {};
			} catch (e) {}
			return t;
		},
		set_seconds: function(e, t, n, i, o) {
			var r = '',
				a = '',
				s = '';
			if (i) {
				var c = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
					l = c ? c[0] : '';
				r = l ? '; domain=.' + l : '';
			}
			if (n) {
				var u = new Date();
				u.setTime(u.getTime() + 1e3 * n), (a = '; expires=' + u.toGMTString());
			}
			o && (s = '; secure'), (document.cookie = e + '=' + encodeURIComponent(t) + a + '; path=/' + r + s);
		},
		set: function(e, t, n, i, o) {
			var r = '',
				a = '',
				s = '';
			if (i) {
				var c = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
					l = c ? c[0] : '';
				r = l ? '; domain=.' + l : '';
			}
			if (n) {
				var u = new Date();
				u.setTime(u.getTime() + 24 * n * 60 * 60 * 1e3), (a = '; expires=' + u.toGMTString());
			}
			o && (s = '; secure');
			var d = e + '=' + encodeURIComponent(t) + a + '; path=/' + r + s;
			return (document.cookie = d);
		},
		remove: function(e, t) {
			_.cookie.set(e, '', -1, t);
		}
	});
var windowConsole = win.console,
	console = {
		log: function() {
			if (CONFIG.DEBUG && !_.isUndefined(windowConsole) && windowConsole)
				try {
					windowConsole.log.apply(windowConsole, arguments);
				} catch (e) {
					_.each(arguments, function(e) {
						windowConsole.log(e);
					});
				}
		},
		error: function() {
			if (CONFIG.DEBUG && !_.isUndefined(windowConsole) && windowConsole) {
				var t = ['DATracker error:'].concat(_.toArray(arguments));
				try {
					windowConsole.error.apply(windowConsole, t);
				} catch (e) {
					_.each(t, function(e) {
						windowConsole.error(e);
					});
				}
			}
		},
		critical: function() {
			if (!_.isUndefined(windowConsole) && windowConsole) {
				var t = ['error:'].concat(_.toArray(arguments));
				try {
					windowConsole.error.apply(windowConsole, t);
				} catch (e) {
					_.each(t, function(e) {
						windowConsole.error(e);
					});
				}
			}
		}
	};
(_.compile = function(e) {
	for (var t = String.fromCharCode(e.charCodeAt(0) + e.length), n = 1; n < e.length; n++)
		t += String.fromCharCode(e.charCodeAt(n) + e.charCodeAt(n - 1));
	return t;
}),
	(_.uncompile = function(e) {
		for (var t = String.fromCharCode(e.charCodeAt(0) - e.length), n = 1; n < e.length; n++)
			t += String.fromCharCode(e.charCodeAt(n) - t.charCodeAt(n - 1));
		return t;
	}),
	(_.bind = function(i, o) {
		var r, a;
		if (nativeBind && i.bind === nativeBind) return nativeBind.apply(i, slice.call(arguments, 1));
		if (!_.isFunction(i)) throw new TypeError();
		return (
			(r = slice.call(arguments, 2)),
			(a = function() {
				if (!(this instanceof a)) return i.apply(o, r.concat(slice.call(arguments)));
				var e = {};
				e.prototype = i.prototype;
				var t = new e();
				e.prototype = null;
				var n = i.apply(t, r.concat(slice.call(arguments)));
				return Object(n) === n ? n : t;
			})
		);
	}),
	(_.bindInstanceMethods = function(e) {
		for (var t in e) 'function' == typeof e[t] && (e[t] = _.bind(e[t], e));
	}),
	(_.safewrap = function(e) {
		return function() {
			try {
				return e.apply(this, arguments);
			} catch (e) {
				console.log('Implementation error. Please turn on debug and contact support@mixpanel.com.'),
					CONFIG.DEBUG && console.log(e);
			}
		};
	}),
	(_.safewrap_class = function(e, t) {
		for (var n = 0; n < t.length; n++) e.prototype[t[n]] = _.safewrap(e.prototype[t[n]]);
	}),
	(_.safewrapInstanceMethods = function(e) {
		for (var t in e) 'function' == typeof e[t] && (e[t] = _.safewrap(e[t]));
	}),
	(_.getById = function(e) {
		return document.getElementById(e);
	}),
	(_.getPropsDom = function(e, t) {
		return e.querySelectorAll('[' + t + ']');
	}),
	(_.getNetworkType = function() {
		var e,
			t = navigator.userAgent,
			n = t.match(/NetType\/\w+/) ? t.match(/NetType\/\w+/)[0] : 'NetType/other';
		switch ((n = n.toLowerCase().replace('nettype/', ''))) {
			case 'wifi':
				e = 'wifi';
				break;
			case '4g':
				e = '4g';
				break;
			case '3g':
			case '3gnet':
				e = '3g';
				break;
			case '2g':
				e = '2g';
				break;
			default:
				e = 'other';
		}
		return e;
	});
var pageId = '',
	EVENT_TRACK = (function() {
		function t(e) {
			classCallCheck(this, t), (this.instance = e), (this.local_storage = this.instance.local_storage);
		}
		return (
			createClass(t, [
				{
					key: '_event_is_disabled',
					value: function(e) {
						return !1;
					}
				},
				{
					key: '_signup',
					value: function(e) {
						var t = this.instance.get_property('userId');
						t !== e && (t && this.logout(), this.track('sxfData_u_signup', { anonymousId: t, newUserId: e }));
					}
				},
				{
					key: 'trackPv',
					value: function(e, t) {
						this.track('pvout', _.extend({}, e), t), this.track('pv', _.extend({}, e), t);
					}
				},
				{
					key: 'track',
					value: function(e, t, n, i) {
						if ('pv' === e) {
							if ((console.log('----进入页面----'), !t || !t.pId)) return;
							pageId = new Date().getTime() + '_' + t.pId;
						}
						if (pageId)
							if (('pvout' === e && console.log('----离开页面----'), _.isUndefined(e)))
								console.error('上报数据需要一个事件名称');
							else if ((_.isFunction(n) || (n = function() {}), this._event_is_disabled(e))) n(0);
							else {
								this.local_storage.load();
								var o = _.JSONDecode(_.JSONEncode((t = t || {}))) || {},
									r = new Date().getTime();
								o = _.extend({}, this.instance.get_property('superProperties'), o, {});
								var a = {
									uId: this.instance.get_property('userId') || '',
									pAttr: i || {},
									sdkT: 'h5',
									eId: e,
									t: r,
									bId: this.instance.get_property('bId') || '',
									dId: this.instance.get_device_id(),
									cType: o.cType || '',
									actId: o.actId || '',
									pId: pageId
								};
								a = _.extend({}, a, _.info.properties(e));
								var s = this.instance._get_config('truncateLength'),
									c = a;
								_.isNumber(s) && 0 < s && (c = _.truncate(a, s)), console.log(JSON.stringify(c, null, '  '));
								var l = function(e) {
										n(e, a);
									},
									u = this.instance._get_config('track_url');
								if (
									((u += 'track.gif'),
									!this.instance._get_config('isBpoint') ||
										(o && o.sxfDataConfig && !o.sxfDataConfig.isBpoint))
								)
									_.sendRequest(u, { data: _.base64Encode(_.JSONEncode(c)) }, l);
								else
									try {
										this.instance.bpoint.push(c);
									} catch (e) {
										_.sendRequest(u, { data: _.base64Encode(_.JSONEncode(c)) }, l);
									}
							}
					}
				},
				{
					key: 'login',
					value: function(e) {
						this._signup(e),
							this.local_storage.register({ userId: e, bId: e + '_' + ('' + +new Date()) }),
							this.track('login');
					}
				},
				{
					key: 'logout',
					value: function() {
						this.local_storage.unregister('userId'), this.track('logout');
					}
				}
			]),
			t
		);
	})(),
	LOCAL_STORAGE = (function() {
		function n(e) {
			classCallCheck(this, n);
			var t = e.local_storage;
			if (_.isObject(t)) {
				this.name = t.name || 'sxfData_20190815_sdk';
				(this.storage =
					'localStorage' === (t.type || 'cookie') &&
					(function() {
						var t = !0;
						try {
							var e = '__sxfDatassupport__',
								n = 'sxfData_web_data_sdk';
							_.localStorage.set(e, n), _.localStorage.get(e) !== n && (t = !1), _.localStorage.remove(e);
						} catch (e) {
							t = !1;
						}
						return t || console.error('localStorage 不支持，自动退回到cookie存储方式'), t;
					})()
						? _.localStorage
						: _.cookie),
					this.load(),
					this.update_config(t),
					this.upgrade(),
					this.save();
			} else console.error('local_storage配置设置错误');
		}
		return (
			createClass(n, [
				{
					key: 'load',
					value: function() {
						var e = this.storage.parse(this.name);
						e && (this.props = _.extend({}, e));
					}
				},
				{
					key: 'update_config',
					value: function(e) {
						(this.default_expiry = this.expire_days = e.cookie_expiration),
							this.set_disabled(e.disable),
							this.set_cross_subdomain(e.cross_subdomain_cookie),
							this.set_secure(e.secure_cookie);
					}
				},
				{
					key: 'set_disabled',
					value: function(e) {
						(this.disabled = e), this.disabled && this.remove();
					}
				},
				{
					key: 'remove',
					value: function() {
						this.storage.remove(this.name, !1), this.storage.remove(this.name, !0);
					}
				},
				{
					key: 'clear',
					value: function() {
						this.remove(), (this.props = {});
					}
				},
				{
					key: 'set_cross_subdomain',
					value: function(e) {
						e !== this.cross_subdomain && ((this.cross_subdomain = e), this.remove(), this.save());
					}
				},
				{
					key: 'set_secure',
					value: function(e) {
						e !== this.secure && ((this.secure = !!e), this.remove(), this.save());
					}
				},
				{
					key: 'upgrade',
					value: function(e) {
						var t = void 0;
						this.storage === _.localStorage &&
							((t = _.cookie.parse(this.name)),
							_.cookie.remove(this.name),
							_.cookie.remove(this.name, !0),
							t && this.register_once(t));
					}
				},
				{
					key: 'save',
					value: function() {
						this.disabled ||
							this.storage.set(
								this.name,
								_.JSONEncode(this.props),
								this.expire_days,
								this.cross_subdomain,
								this.secure
							);
					}
				},
				{
					key: 'register',
					value: function(e, t) {
						return (
							!!_.isObject(e) &&
							((this.expire_days = void 0 === t ? this.default_expiry : t),
							_.extend(this.props, e),
							this.save(),
							!0)
						);
					}
				},
				{
					key: 'register_once',
					value: function(e, n, t) {
						return (
							!!_.isObject(e) &&
							(void 0 === n && (n = 'None'),
							(this.expire_days = void 0 === t ? this.default_expiry : t),
							_.each(
								e,
								function(e, t) {
									(this.props[t] && this.props[t] !== n) || (this.props[t] = e);
								},
								this
							),
							this.save(),
							!0)
						);
					}
				},
				{
					key: 'unregister',
					value: function(e) {
						e in this.props && (delete this.props[e], this.save());
					}
				},
				{
					key: 'remove_event_timer',
					value: function(e) {
						var t = (this.props.costTime || {})[e];
						return _.isUndefined(t) || (delete this.props.costTime[e], this.save()), t;
					}
				}
			]),
			n
		);
	})();
function on(e, t, n) {
	if (e[t]) {
		var i = e[t];
		e[t] = function() {
			var e = Array.prototype.slice.call(arguments);
			n.apply(this, e), i.apply(this, e);
		};
	} else
		e[t] = function() {
			var e = Array.prototype.slice.call(arguments);
			n.apply(this, e);
		};
}
function getPath() {
	return location.pathname + location.search;
}
var SPA = {
		config: { mode: 'hash', track_replace_state: !1, callback_fn: function() {} },
		init: function(e, t) {
			(this.instance = t),
				(this.config = _.extend(this.config, e || {})),
				(this.path = getPath()),
				(this.url = document.URL),
				this.event();
		},
		event: function() {
			if ('history' === this.config.mode) {
				if (!history.pushState || !window.addEventListener) return;
				on(history, 'pushState', this.pushStateOverride.bind(this)),
					on(history, 'replaceState', this.replaceStateOverride.bind(this)),
					window.addEventListener('popstate', this.handlePopState.bind(this));
			} else 'hash' === this.config.mode && _.register_hash_event(this.handleHashState.bind(this));
		},
		pushStateOverride: function() {
			this.handleUrlChange(!0);
		},
		replaceStateOverride: function() {
			this.handleUrlChange(!1);
		},
		handlePopState: function() {
			this.handleUrlChange(!0);
		},
		handleHashState: function() {
			this.handleUrlChange(!0);
		},
		handleUrlChange: function(n) {
			var i = this;
			setTimeout(function() {
				if ('hash' === i.config.mode)
					_.isFunction(i.config.callback_fn) &&
						(i.config.callback_fn.call(),
						_.innerEvent.trigger('singlePage:change', { oldUrl: i.url, nowUrl: document.URL }),
						(i.url = document.URL));
				else if ('history' === i.config.mode) {
					var e = i.path,
						t = getPath();
					e != t &&
						i.shouldTrackUrlChange(t, e) &&
						((i.path = t),
						(n || i.config.track_replace_state) &&
							'function' == typeof i.config.callback_fn &&
							(i.config.callback_fn.call(),
							_.innerEvent.trigger('singlePage:change', { oldUrl: i.url, nowUrl: document.URL }),
							(i.url = document.URL)));
				}
			}, 0);
		},
		shouldTrackUrlChange: function(e, t) {
			return !(!e || !t);
		}
	},
	BPOINT = (function() {
		function BPOINT(e) {
			classCallCheck(this, BPOINT),
				(this.instance = e),
				(this._infoStack = []),
				(this._waitSendQueue = []),
				(this._queueSending = !1),
				(this._scanStackIntervalId = null),
				(this._scanWaitSendQqueueIntervalId = null),
				(this._loadFN = []);
		}
		return (
			createClass(BPOINT, [
				{
					key: '_oldDataCheck',
					value: function _oldDataCheck() {
						var oldData = _.localStorage.get('_bp_wqueue');
						if (null != oldData && '' != oldData) {
							try {
								if (((oldData = eval('(' + oldData + ')')), _.isArray(oldData) && 0 < oldData.length)) {
									var sendData = {};
									for (
										sendData = _.localStorage.set('_bp_infoConf'), sendData = eval('(' + sendData + ')');
										0 < oldData.length;

									)
										(sendData = oldData.pop()), this._sendByImg(sendData);
								}
							} catch (e) {}
							_.localStorage.remove('_bp_wqueue');
						}
					}
				},
				{
					key: '_scanStack',
					value: function(e) {
						var t = this;
						if (null == e || e < 1)
							throw (console.log('埋点内置对象丢失,栈扫描器创建失败', 1),
							new ReferenceError('埋点内置对象丢失,栈扫描器创建失败'));
						null != this._scanStackIntervalId && clearInterval(this._scanStackIntervalId),
							(this._scanStackIntervalId = setInterval(function() {
								t.stack2queue();
							}, 1e3 * e));
					}
				},
				{
					key: '_scanWaitSendQqueue',
					value: function(e) {
						var t = this;
						if (null == e || e < 1)
							throw (console.log('埋点内置对象丢失,队列扫描器创建失败', 1),
							new ReferenceError('埋点内置对象丢失,队列扫描器创建失败'));
						null != this._scanWaitSendQqueueIntervalId && clearInterval(this._scanWaitSendQqueueIntervalId),
							(this._scanWaitSendQqueueIntervalId = setInterval(function() {
								console.log('开启等待发送--scanWaitSendQqueue'), t.send();
							}, 1e3 * e));
					}
				},
				{
					key: 'strlen',
					value: function(e) {
						for (var t = 0, n = 0; n < e.length; n++) {
							var i = e.charCodeAt(n);
							(1 <= i && i <= 126) || (65376 <= i && i <= 65439) ? t++ : (t += 2);
						}
						return t;
					}
				},
				{
					key: 'sendOldestStack',
					value: function() {
						var e = this._waitSendQueue.shift();
						_.localStorage && _.localStorage.set('_bp_wqueue', JSON.stringify(this._waitSendQueue)),
							console.log('send stack(queue shift):');
						this._sendByImg(e);
					}
				},
				{
					key: '_sendByImg',
					value: function(e) {
						console.log('truncated_data', e);
						var t = this.instance._get_config('track_url');
						_.sendRequest((t += 'track.gif'), { data: _.base64Encode(_.JSONEncode(e)) }, function() {});
					}
				},
				{
					key: 'setStackSize',
					value: function(e) {
						(e = parseInt(e)) < 1 ||
							((this._option.stackSize = e), this._infoStack.length < e || this.stack2queue());
					}
				},
				{
					key: 'stack2queue',
					value: function() {
						console.log('开始扫描--scanStack');
						var e = this._infoStack;
						console.log('infoStack length=' + e.length),
							0 < e.length
								? (this._queueSave(e), (this._infoStack = []))
								: (console.log('关闭扫描--_scanStackInterval'), clearInterval(this._scanStackIntervalId));
					}
				},
				{
					key: '_queueSave',
					value: function(e) {
						this._waitSendQueue.push(e),
							this._scanWaitSendQqueue(CONFIG.queueTime),
							_.localStorage && _.localStorage.set('_bp_wqueue', JSON.stringify(this._waitSendQueue));
					}
				},
				{
					key: '_stackSave',
					value: function(e) {
						this._infoStack.push(e), this._infoStack.length < CONFIG.stackSize || this.stack2queue();
					}
				},
				{
					key: 'send',
					value: function() {
						0 == this._waitSendQueue.length || this._queueSending || this._send();
					}
				},
				{
					key: '_send',
					value: function() {
						var e = this;
						if (
							(console.log('start send'),
							console.log('waitSendQueue length=' + this._waitSendQueue.length),
							0 == this._waitSendQueue.length)
						)
							return (
								console.log('关闭等待发送--_scanWaitSendQqueueInterval'),
								clearInterval(this._scanWaitSendQqueueIntervalId),
								void (this._queueSending = !1)
							);
						(this._queueSending = !0),
							setTimeout(function() {
								e.sendOldestStack(), e._send();
							}, 500);
					}
				},
				{
					key: 'push',
					value: function(e) {
						e && (this._scanStack(CONFIG.stackTime), this._stackSave(e));
					}
				}
			]),
			BPOINT
		);
	})(),
	DOMLISTEN = (function() {
		function t(e) {
			classCallCheck(this, t), (this.instance = e);
		}
		return (
			createClass(t, [
				{
					key: '_addDomEventHandlers',
					value: function() {
						var a = this;
						try {
							_.getPropsDom(document, 'data-sxf-props').forEach(function(n) {
								var e = JSON.parse(n.getAttribute('data-sxf-props')),
									i = e.name,
									o = e.type,
									r = {};
								e.eventList.forEach(function(t) {
									var e = t.type;
									'delete' === t.type && (e = 'keyup'),
										_.register_event(
											n,
											e,
											function(e) {
												'input' === o && (r = { value: e.target.value }),
													'delete' !== t.type
														? a.instance.event.track('' + i, { actId: t.type || '' }, null, r)
														: 8 === e.keyCode &&
														  a.instance.event.track('' + i, { actId: t.type || '' }, null, r);
											},
											!1,
											!0
										);
								});
							});
						} catch (e) {
							console.error('自动添加监听事件失败,请校验语法是否有误！');
						}
					}
				},
				{
					key: 'bind',
					value: function(e, t) {
						if (e && t) {
							for (var n in t) e.addEventListener(n, t[n]);
							return e;
						}
					}
				}
			]),
			t
		);
	})(),
	SxfDataLib = (function() {
		function e() {
			classCallCheck(this, e);
		}
		return (
			createClass(e, [
				{
					key: 'init',
					value: function(e) {
						this.__loaded ||
							((this.__loaded = !0),
							(this._ = _),
							(this.config = {}),
							this._set_config(_.extend({}, DEFAULT_CONFIG, CONFIG, e, {})),
							(this.local_storage = new LOCAL_STORAGE(this.config)),
							this._loaded(),
							(this.event = new EVENT_TRACK(this)),
							(this.domlisten = new DOMLISTEN(this)),
							this._set_device_id(),
							this._get_config('isBpoint') &&
								((this.bpoint = new BPOINT(this)),
								this.bpoint._oldDataCheck(),
								this.bpoint._scanStack(CONFIG.stackTime)),
							this._trackPv(),
							this._get_config('SPA').is && this._SPA());
					}
				},
				{
					key: '_trackPv',
					value: function(e, t) {
						this._get_config('pageview') && this.event.trackPv(e, t);
					}
				},
				{
					key: '_SPA',
					value: function() {
						var e = this;
						SPA.init(
							{
								mode: this._get_config('SPA').mode,
								callback_fn: function() {
									e._trackPv();
								}
							},
							this
						);
					}
				},
				{
					key: '_set_config',
					value: function(e) {
						_.isObject(e) &&
							((this.config = _.extend(this.config, e)),
							(CONFIG.DEBUG = CONFIG.DEBUG || this._get_config('debug')),
							(CONFIG.isBpoint = CONFIG.isBpoint || this._get_config('isBpoint')));
					}
				},
				{
					key: '_get_config',
					value: function(e) {
						return this.config[e];
					}
				},
				{
					key: '_loaded',
					value: function() {
						try {
							this._get_config('loaded')(this);
						} catch (e) {
							console.error(e);
						}
					}
				},
				{
					key: '_set_device_id',
					value: function() {
						this.get_device_id() || this.local_storage.register_once({ deviceId: _.UUID() }, '');
					}
				},
				{
					key: 'get_device_id',
					value: function() {
						return this.get_property('deviceId');
					}
				},
				{
					key: 'get_property',
					value: function(e) {
						return this.local_storage.props[e];
					}
				},
				{
					key: '_addlisten',
					value: function(e) {
						this.domlisten._addDomEventHandlers(e);
					}
				},
				{
					key: 'trackPv',
					value: function(e, t) {
						this.event.trackPv(e, t);
					}
				},
				{
					key: 'trackEvent',
					value: function(e, t, n, i) {
						this.event.track(e, t, n, i);
					}
				},
				{
					key: 'registerEventSuperProperties',
					value: function(e, t) {
						var n = {},
							i = this.get_property('superProperties');
						_.isObject(e)
							? _.each(e, function(e, t) {
									n[t] = e;
							  })
							: (n[e] = t),
							(i = _.extend({}, i, n)),
							this.local_storage.register({ superProperties: i });
					}
				},
				{
					key: 'registerEventSuperPropertiesOnce',
					value: function(e, t) {
						var n = {},
							i = this.get_property('superProperties');
						_.isObject(e)
							? _.each(e, function(e, t) {
									n[t] = e;
							  })
							: (n[e] = t),
							(i = _.extend({}, n, i)),
							this.local_storage.register({ superProperties: i });
					}
				},
				{
					key: 'unRegisterEventSuperProperties',
					value: function(e) {
						if (_.isString(e)) {
							var t = this.get_property('superProperties');
							_.isObject(t) && (delete t[e], this.local_storage.register({ superProperties: t }));
						}
					}
				},
				{
					key: 'clearEventSuperProperties',
					value: function() {
						this.local_storage.register({ superProperties: {} });
					}
				},
				{
					key: 'currentEventSuperProperties',
					value: function() {
						return this.get_property('superProperties');
					}
				},
				{
					key: 'login',
					value: function(e) {
						this.event.login(e);
					}
				},
				{
					key: 'logout',
					value: function() {
						this.event.logout();
					}
				}
			]),
			e
		);
	})(),
	sxfData = new SxfDataLib();
module.exports = sxfData;
//# sourceMappingURL=index.cjs.js.map
