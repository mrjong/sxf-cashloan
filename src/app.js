/*eslint-disable*/
import React from 'react';
import { render } from 'react-dom';
import router from 'routers';
import 'utils/Back';
import { BrowserRouter } from 'react-router-dom';
import 'assets/styles/scss/main.scss';
import fetchinit from "utils/FetchInit"
import { initAnalytics } from './utils/Analytins';
import fastClick from 'fastclick';
fastClick.prototype.focus = function(targetElement) {
    targetElement.focus();
  };
fastClick.attach(document.body);
var sa = require('sa-sdk-javascript/sensorsdata.min.js');
if (!window.sa) {
  window.sa = sa;
}
fetchinit();
initAnalytics();
const renders = Component =>
  render(
    <BrowserRouter>
      <Component />
    </BrowserRouter>,
    document.getElementById('root'),
  );
renders(router);
// 取消警告
console.disableYellowBox = true;
