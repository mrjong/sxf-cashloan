/*eslint-disable*/
import React from 'react';
import { render } from 'react-dom';
import router from 'routers';
import 'utils/Back';
import { BrowserRouter } from 'react-router-dom';
import 'assets/styles/scss/main.scss';
import fetchInit from './fetch';
import { initAnalytics } from './utils/analytins';
import { handleWindowError } from 'utils';
import { isMPOS } from 'utils/common';
import ErrorBoundary from 'components/ErrorBoundary';
import fastClick from 'fastclick';

fastClick.prototype.focus = function(targetElement) {
	targetElement.focus();
};
fastClick.attach(document.body);
var sa = require('sa-sdk-javascript/sensorsdata.min.js');
if (!window.sa) {
	window.sa = sa;
}
handleWindowError();
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
