/*eslint-disable*/
import React from 'react';
import { render } from 'react-dom';
import router from 'routers';
import 'utils/Back';
import { BrowserRouter } from 'react-router-dom';
import 'assets/styles/scss/main.scss';
import fetchInit from './fetch';
import { initAnalytics } from './utils/analytins';
import { isMPOS } from 'utils/common';
import ErrorBoundary from 'components/ErrorBoundary';
import fastClick from 'fastclick';
import Raven from 'raven-js'

const { PROJECT_ENV } = process.env;

if (PROJECT_ENV === 'pro') { // 生产环境配置
	Raven.config('http://e287773905124b9bab6bfaa7e9716d8e@47.98.151.46:9000/4').install()
} else {
	Raven.config('http://e287773905124b9bab6bfaa7e9716d8e@47.98.151.46:9000/4').install()
}

fastClick.prototype.focus = function(targetElement) {
	targetElement.focus();
};
fastClick.attach(document.body);
var sa = require('sa-sdk-javascript/sensorsdata.min.js');
if (!window.sa) {
	window.sa = sa;
}
isMPOS();
fetchInit();
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
