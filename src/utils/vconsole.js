export default (i,consoleshow) => {
	if ((i.length === 10&&i==='0110001111' )|| consoleshow) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = '/assets/lib/vconsole.min.js';
		head.appendChild(script);
	}
};
