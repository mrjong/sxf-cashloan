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
	utf8Encode = function(e) {
		var t,
			n,
			r,
			o,
			i = '';
		for (
			t = n = 0, r = (e = (e + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')).length, o = 0;
			o < r;
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
				null !== s && (t < n && (i += e.substring(t, n)), (i += s), (t = n = o + 1));
		}
		return t < n && (i += e.substring(t, e.length)), i;
	},
	base64Encode = function(e) {
		var t,
			n,
			r,
			o,
			i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
			a = 0,
			s = 0,
			c = '',
			u = [];
		if (!e) return e;
		for (
			e = utf8Encode(e);
			(t = e.charCodeAt(a++)),
				(n = e.charCodeAt(a++)),
				(r = e.charCodeAt(a++)),
				(u[s++] =
					i[0 | (((o = (t << 16) | (n << 8) | r) >> 18) & 63)] +
					i[0 | ((o >> 12) & 63)] +
					i[0 | ((o >> 6) & 63)] +
					i[0 | (63 & o)]),
				a < e.length;

		);
		switch (((c = u.join('')), e.length % 3)) {
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
	for (var n = 0, r = e.length; n < r && !1 !== t.call(e, e[n], n); n++);
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
	userAgent = win$1.navigator.userAgent || '',
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
				r = external.twGetVersion(n);
			if (t && !~t.indexOf(e)) return !1;
			if (r) return { version: r };
		} catch (e) {}
}
function IEMode(e) {
	if (!re_msie.test(e)) return null;
	var t, n, r, o, i;
	if (~e.indexOf('trident/') && (t = /\btrident\/([0-9.]+)/.exec(e)) && 2 <= t.length) {
		var a = (r = t[1]).split('.');
		(a[0] = parseInt(a[0], 10) + 4), (i = a.join('.'));
	}
	var s = (o = (t = re_msie.exec(e))[1]).split('.');
	return (
		void 0 === i && (i = o),
		(s[0] = parseInt(s[0], 10) - 4),
		(n = s.join('.')),
		void 0 === r && (r = n),
		{ browserVersion: i, browserMode: o, engineVersion: r, engineMode: n, compatible: r !== n }
	);
}
function detect(e, t, n) {
	var r = isFunction(t) ? t.call(null, n) : t;
	if (!r) return null;
	var o = { name: e, version: NA_VERSION, codename: '' },
		i = toString(r);
	if (!0 === r) return o;
	if ('[object String]' === i) {
		if (~n.indexOf(r)) return o;
	} else {
		if (isObject(r)) return r.hasOwnProperty('version') && (o.version = r.version), o;
		if (r.exec) {
			var a = r.exec(n);
			if (a) return (o.version = 2 <= a.length && a[1] ? a[1].replace(/_/g, '.') : NA_VERSION), o;
		}
	}
}
var na = { name: '', version: '' };
function init(n, e, t, r) {
	var o = na;
	each(e, function(e) {
		var t = detect(e[0], e[1], n);
		if (t) return (o = t), !1;
	}),
		t.call(r, o.name, o.version);
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
		var i = IEMode(e);
		return (
			init(
				e,
				ENGINE,
				function(e, t) {
					var n = t;
					i && ((t = i.engineVersion || i.engineMode), (n = i.engineMode));
					var r = parseFloat(t);
					(o.engine = {
						name: e,
						version: r,
						fullVersion: t,
						mode: parseFloat(n),
						fullMode: n,
						compatible: !!i && i.compatible
					}),
						(o.engine[e] = r);
				},
				o
			),
			init(
				e,
				BROWSER,
				function(e, t) {
					var n = t;
					i && ('ie' === e && (t = i.browserVersion), (n = i.browserMode));
					var r = parseFloat(t);
					(o.browser = {
						name: e,
						version: r,
						fullVersion: t,
						mode: parseFloat(n),
						fullMode: n,
						compatible: !!i && i.compatible
					}),
						(o.browser[e] = r);
				},
				o
			),
			o
		);
	},
	detector$1 = (detector = parse(userAgent + ' ' + appVersion + ' ' + vendor)),
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
					for (var r = 0, o = e.length; r < o; r++) if (r in e && t.call(n, e[r], r, e) === breaker) return;
				} else for (var i in e) if (e.hasOwnProperty.call(e, i) && t.call(n, e[i], i, e) === breaker) return;
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
			var r = void 0;
			return (
				'string' == typeof e
					? (r = e.slice(0, n))
					: _.isArray(e)
					? ((r = []),
					  _.each(e, function(e) {
							r.push(_.truncate(e, n));
					  }))
					: _.isObject(e)
					? ((r = {}),
					  _.each(e, function(e, t) {
							r[t] = _.truncate(e, n);
					  }))
					: (r = e),
				r
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
				r = [];
			return (
				_.isUndefined(t) && (t = '&'),
				_.each(e, function(e, t) {
					(n = encodeURIComponent(e && '' + e)), (r[r.length] = encodeURIComponent(t) + '=' + n);
				}),
				r.join(t)
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
				r = RegExp('[\\?&]' + n + '=([^&#]*)').exec(e);
			return null === r || (r && 'string' != typeof r[1] && r[1].length)
				? ''
				: decodeURIComponent(r[1]).replace(/\+/g, ' ');
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
			function(e, t, n, r, o) {
				if (e)
					if (e.addEventListener && !r) e.addEventListener(t, n, !!o);
					else {
						var i = 'on' + t;
						console.log('ontype', i),
							(e[i] = (function(o, i, a) {
								return function(e) {
									if ((e = e || s(window.event))) {
										var t,
											n,
											r = !0;
										return (
											_.isFunction(a) && (t = a(e)), (n = i.call(o, e)), (!1 !== t && !1 !== n) || (r = !1), r
										);
									}
								};
							})(e, n, e[i]));
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
				'pv' === e && (networkType = _.getNetworkType()), { netType: networkType, Os: detector$1.os.name }
			);
		}
	}),
	(_.ajax = {
		post: function(e, t, n, r) {
			console.log(e, '----------url');
			var o = this;
			o.callback = n || function(e) {};
			try {
				var i = new XMLHttpRequest();
				i.open('POST', e, !0),
					i.setRequestHeader('Content-type', 'application/json'),
					(i.withCredentials = !0),
					(i.ontimeout = function() {
						o.callback({ status: 0, error: !0, message: 'request ' + e + ' time out' });
					}),
					(i.onreadystatechange = function() {
						4 === i.readyState &&
							o.callback(
								200 === i.status
									? _.JSONDecode(i.responseText)
									: { status: 0, error: !0, message: 'Bad HTTP status: ' + i.status + ' ' + i.statusText }
							);
					}),
					(i.timeout = r || 5e3),
					console.log(t, '=======options'),
					i.send(_.JSONEncode(t));
			} catch (e) {
				console.error(e);
			}
		},
		get: function(e, t) {
			try {
				var n = new XMLHttpRequest();
				n.open('GET', e, !0),
					(n.withCredentials = !0),
					(n.onreadystatechange = function() {
						4 === n.readyState &&
							(200 === n.status
								? t && t(n.responseText)
								: t &&
								  t({ status: 0, error: !0, message: 'Bad HTTP status: ' + n.status + ' ' + n.statusText }));
					}),
					n.send(null);
			} catch (e) {}
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
	(_.sendRequest = function(e, t, n, r) {
		if ('img' === t) {
			e += '?' + _.HTTPBuildQuery(n);
			var o = document.createElement('img');
			(o.src = e),
				(o.width = 1),
				(o.height = 1),
				_.isFunction(r) && r(0),
				(o.onload = function() {
					this.onload = null;
				}),
				(o.onerror = function() {
					this.onerror = null;
				}),
				(o.onabort = function() {
					this.onabort = null;
				});
		} else
			'get' === t
				? ((e += '?' + _.HTTPBuildQuery(n)), _.ajax.get(e, r))
				: 'post' === t && _.ajax.post(e, n, r);
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
						r = 0;
					function i(e, t) {
						var n,
							r = 0;
						for (n = 0; n < t.length; n++) r |= o[n] << (8 * n);
						return e ^ r;
					}
					for (e = 0; e < n.length; e++)
						(t = n.charCodeAt(e)), o.unshift(255 & t), o.length < 4 || ((r = i(r, o)), (o = []));
					return 0 < o.length && (r = i(r, o)), r.toString(16);
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
			for (var t = e + '=', n = document.cookie.split(';'), r = 0; r < n.length; r++) {
				for (var o = n[r]; ' ' == o[0]; ) o = o.substring(1, o.length);
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
		set_seconds: function(e, t, n, r, o) {
			var i = '',
				a = '',
				s = '';
			if (r) {
				var c = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
					u = c ? c[0] : '';
				i = u ? '; domain=.' + u : '';
			}
			if (n) {
				var l = new Date();
				l.setTime(l.getTime() + 1e3 * n), (a = '; expires=' + l.toGMTString());
			}
			o && (s = '; secure'), (document.cookie = e + '=' + encodeURIComponent(t) + a + '; path=/' + i + s);
		},
		set: function(e, t, n, r, o) {
			var i = '',
				a = '',
				s = '';
			if (r) {
				var c = document.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
					u = c ? c[0] : '';
				i = u ? '; domain=.' + u : '';
			}
			if (n) {
				var l = new Date();
				l.setTime(l.getTime() + 24 * n * 60 * 60 * 1e3), (a = '; expires=' + l.toGMTString());
			}
			o && (s = '; secure');
			var d = e + '=' + encodeURIComponent(t) + a + '; path=/' + i + s;
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
	(_.bind = function(r, o) {
		var i, a;
		if (nativeBind && r.bind === nativeBind) return nativeBind.apply(r, slice.call(arguments, 1));
		if (!_.isFunction(r)) throw new TypeError();
		return (
			(i = slice.call(arguments, 2)),
			(a = function() {
				if (!(this instanceof a)) return r.apply(o, i.concat(slice.call(arguments)));
				var e = {};
				e.prototype = r.prototype;
				var t = new e();
				e.prototype = null;
				var n = r.apply(t, i.concat(slice.call(arguments)));
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
var classCallCheck = function(e, t) {
		if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
	},
	createClass = (function() {
		function r(e, t) {
			for (var n = 0; n < t.length; n++) {
				var r = t[n];
				(r.enumerable = r.enumerable || !1),
					(r.configurable = !0),
					'value' in r && (r.writable = !0),
					Object.defineProperty(e, r.key, r);
			}
		}
		return function(e, t, n) {
			return t && r(e.prototype, t), n && r(e, n), e;
		};
	})(),
	pageId = '',
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
					value: function(e, t, n, r) {
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
									i = new Date().getTime();
								o = _.extend({}, this.instance.get_property('superProperties'), o, {});
								var a = {
									uId: this.instance.get_property('userId') || '',
									pAttr: r || {},
									sdkT: 'h5',
									eId: e,
									t: i,
									bId: this.instance.get_property('bId') || '',
									dId: this.instance.get_device_id(),
									cType: o.cType || '',
									actId: o.actId || '',
									pId: pageId,
									dAttr: { bs: detector$1.browser.name, bVer: detector$1.browser.fullVersion }
								};
								a = _.extend({}, a, _.info.properties(e));
								var s = this.instance._get_config('truncateLength'),
									c = a;
								_.isNumber(s) && 0 < s && (c = _.truncate(a, s)), console.log(JSON.stringify(c, null, '  '));
								var u = function(e) {
										n(e, a);
									},
									l = this.instance._get_config('track_url');
								if (
									((l += 'track.gif'),
									!this.instance._get_config('isBpoint') ||
										(o && o.sxfDataConfig && !o.sxfDataConfig.isBpoint))
								)
									_.sendRequest(l, 'post', { data: _.base64Encode(_.JSONEncode(c)) }, u);
								else
									try {
										this.instance.bpoint.push(c);
									} catch (e) {
										_.sendRequest(l, 'post', { data: c }, u);
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
		var r = e[t];
		e[t] = function() {
			var e = Array.prototype.slice.call(arguments);
			n.apply(this, e), r.apply(this, e);
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
			var r = this;
			setTimeout(function() {
				if ('hash' === r.config.mode)
					_.isFunction(r.config.callback_fn) &&
						(r.config.callback_fn.call(),
						_.innerEvent.trigger('singlePage:change', { oldUrl: r.url, nowUrl: document.URL }),
						(r.url = document.URL));
				else if ('history' === r.config.mode) {
					var e = r.path,
						t = getPath();
					e != t &&
						r.shouldTrackUrlChange(t, e) &&
						((r.path = t),
						(n || r.config.track_replace_state) &&
							'function' == typeof r.config.callback_fn &&
							(r.config.callback_fn.call(),
							_.innerEvent.trigger('singlePage:change', { oldUrl: r.url, nowUrl: document.URL }),
							(r.url = document.URL)));
				}
			}, 0);
		},
		shouldTrackUrlChange: function(e, t) {
			return !(!e || !t);
		}
	},
	BPOINT = (function() {
		function t(e) {
			classCallCheck(this, t),
				(this.instance = e),
				(this._infoStack = []),
				(this._waitSendQueue = []),
				(this._queueSending = !1),
				(this._scanStackIntervalId = null),
				(this._scanWaitSendQqueueIntervalId = null),
				(this._loadFN = []);
		}
		return (
			createClass(t, [
				{
					key: '_oldDataCheck',
					value: function() {
						var e = _.localStorage.get('_bp_wqueue');
						if (null != e && '' != e) {
							try {
								if (
									(_.localStorage.set('_bp_wqueue_copy', e),
									(e = JSON.parse(e)) && _.isArray(e) && 0 < e.length)
								)
									for (; 0 < e.length; ) {
										var t = e.shift();
										this._sendByImg(t);
									}
							} catch (e) {}
							_.localStorage.remove('_bp_wqueue_copy');
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
							var r = e.charCodeAt(n);
							(1 <= r && r <= 126) || (65376 <= r && r <= 65439) ? t++ : (t += 2);
						}
						return t;
					}
				},
				{
					key: 'sendOldestStack',
					value: function() {
						var e = this._waitSendQueue.shift();
						_.localStorage && _.localStorage.set('_bp_wqueue', JSON.stringify(this._waitSendQueue));
						this._sendByImg(e);
					}
				},
				{
					key: '_sendByImg',
					value: function(e) {
						console.log('truncated_data', e);
						var t = this.instance._get_config('track_url');
						(t += 'sxf'),
							console.log('原数据', e),
							console.log('JSONEncode', _.JSONEncode(e)),
							console.log('base64Encode', _.base64Encode(_.JSONEncode(e))),
							_.sendRequest(t, 'post', { data: _.base64Encode(_.JSONEncode(e)) }, function() {});
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
			t
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
									r = e.name,
									o = e.type,
									i = {};
								e.eventList.forEach(function(t) {
									var e = t.type;
									'delete' === t.type && (e = 'keyup'),
										_.register_event(
											n,
											e,
											function(e) {
												'input' === o && (i = { value: e.target.value }),
													'delete' !== t.type
														? a.instance.event.track('' + r, { actId: t.type || '' }, null, i)
														: 8 === e.keyCode &&
														  a.instance.event.track('' + r, { actId: t.type || '' }, null, i);
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
					value: function(e, t, n, r) {
						this.event.track(e, t, n, r);
					}
				},
				{
					key: 'registerEventSuperProperties',
					value: function(e, t) {
						var n = {},
							r = this.get_property('superProperties');
						_.isObject(e)
							? _.each(e, function(e, t) {
									n[t] = e;
							  })
							: (n[e] = t),
							(r = _.extend({}, r, n)),
							this.local_storage.register({ superProperties: r });
					}
				},
				{
					key: 'registerEventSuperPropertiesOnce',
					value: function(e, t) {
						var n = {},
							r = this.get_property('superProperties');
						_.isObject(e)
							? _.each(e, function(e, t) {
									n[t] = e;
							  })
							: (n[e] = t),
							(r = _.extend({}, n, r)),
							this.local_storage.register({ superProperties: r });
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
