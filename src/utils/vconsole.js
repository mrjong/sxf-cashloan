export default (i, consoleshow) => {
	if ((i && i.length === 10 && i === '0110001111') || consoleshow || sessionStorage.getItem('consoleshow')) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://cdn.bootcss.com/vConsole/2.0.1/vconsole.min.js';
		head.appendChild(script);
		sessionStorage.setItem('consoleshow', true);
	} else if ((i && i.length === 10 && i === '1111000110') || consoleshow || sessionStorage.getItem('consoleshow')) {
		localStorage.clear();
		sessionStorage.clear();
		clearAllCookie();
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://cdn.bootcss.com/vConsole/2.0.1/vconsole.min.js';
		head.appendChild(script);
		sessionStorage.setItem('consoleshow', true);
		console.log('localStorage', localStorage);
		console.log('sessionStorage', sessionStorage);
		console.log('cookie', document.cookie);
	}
};
function clearAllCookie() {
	var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
	if (keys) {
		for (var i = keys.length; i--; ) document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
	}
}
