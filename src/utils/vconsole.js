export default (i,consoleshow) => {
	if ((i && i.length === 10&&i==='0110001111' ) || consoleshow || sessionStorage.getItem('consoleshow')) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://cdn.bootcss.com/vConsole/2.0.1/vconsole.min.js';
        head.appendChild(script);
        sessionStorage.setItem('consoleshow',true)
	}
};
