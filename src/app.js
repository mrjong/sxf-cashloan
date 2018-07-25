/*eslint-disable*/
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import store from 'reduxs/store';
import router from 'routers';
import 'utils/Back';
import { BrowserRouter } from 'react-router-dom';
import 'assets/styles/scss/main.scss';
import { initAnalytics } from './utils/Analytins';
import fastClick from 'fastclick';

fastClick.attach(document.body);
var sa = require('sa-sdk-javascript/sensorsdata.min.js');
if (!window.sa) {
  window.sa = sa;
}
initAnalytics();
const renders = Component =>
  render(
    // <Provider>
      <BrowserRouter>
        <Component />
      </BrowserRouter>,
    // </Provider>,
    document.getElementById('root'),
  );
renders(router);
// 取消警告
console.disableYellowBox = true;
