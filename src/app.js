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

const { PROJECT_ENV, RELEASE_VERSION } = process.env;
console.log(RELEASE_VERSION,'RELEASE_VERSION')

if (PROJECT_ENV === 'pro') { // 生产环境配置
	// Raven.config('https://bdac99feaf3e4e6390fd8f81c5cdebd0@sentry.vbillbank.com/2',{
	// 	release: 'sentry_v1.0'
	// }).install()
	Raven.config('https://bdac99feaf3e4e6390fd8f81c5cdebd0@sentry.vbillbank.com/2', {
		release: RELEASE_VERSION
	}).install()
} else {
	// Raven.config('https://2bd9584d60104f3096c53d8ff54e8939@sentry-test.vbillbank.com/3',{
	// 	release: 'sentry_test_v1.0'
	// }).install()
	Raven.config('https://2bd9584d60104f3096c53d8ff54e8939@sentry-test.vbillbank.com/3', {
		release: RELEASE_VERSION
	}).install()
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
