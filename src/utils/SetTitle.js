export default (getTitle) => {
	var i = document.createElement('iframe');
	i.src = 'https://lns-wap.vbillbank.com/favicon.ico';
	i.style.display = 'none';
	i.onload = function() {
		setTimeout(function() {
			i.remove();
		}, 9);
	};
	document.title = getTitle;
	document.body.appendChild(i);
};
