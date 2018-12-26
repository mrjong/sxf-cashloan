/*eslint-disable*/
import React from 'react';
import { render } from 'react-dom';
import router from 'routers';
import 'utils/Back';
import { BrowserRouter } from 'react-router-dom';
import 'assets/styles/scss/main.scss';
import fetchinit from 'utils/FetchInit';
import { initAnalytics } from './utils/Analytins';
import ErrorBoundary from 'components/errorboundary_page';
import fastClick from 'fastclick';
import { buriedPointEvent } from 'utils/Analytins';
import { bug_log } from 'utils/AnalytinsType';

window.onerror = function (errorMessage, scriptURI, lineNo, columnNo, error) {
	console.log('errorMessage: ' + errorMessage); // 异常信息
	console.log('scriptURI: ' + scriptURI); // 异常文件路径
	console.log('lineNo: ' + lineNo); // 异常行号
	console.log('columnNo: ' + columnNo); // 异常列号
	console.log('error: ' + error); // 异常堆栈信息

	// 构建错误对象
	var errorObj = {
		errorMessage: errorMessage || null,
		scriptURI: scriptURI || null,
		lineNo: lineNo || null,
		columnNo: columnNo || null,
		stack: error && error.stack ? error.stack : null
	};

  buriedPointEvent(bug_log.page_error_log, errorObj)


	// if (XMLHttpRequest) {
	// 	var xhr = new XMLHttpRequest();

	// 	xhr.open('post', 'http://localhost:3031/middleware/errorReport', true); // 上报给node中间层处理
	// 	xhr.setRequestHeader('Content-Type', 'application/json'); // 设置请求头
	// 	xhr.send(JSON.stringify(errorObj)); // 发送参数
	// }
}
fastClick.prototype.focus = function (targetElement) {
	targetElement.focus();
};
fastClick.attach(document.body);
var sa = require('sa-sdk-javascript/sensorsdata.min.js');
if (!window.sa) {
	window.sa = sa;
}
fetchinit();
initAnalytics();
const renders = (Component) =>
	render(
		<BrowserRouter>
			<ErrorBoundary>
				<Component />
			</ErrorBoundary>
		</BrowserRouter>,
		document.getElementById('root')
	);
renders(router);
// 取消警告
console.disableYellowBox = true;
