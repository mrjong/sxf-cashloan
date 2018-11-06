import { isWXOpen } from './common';

export default (pathname = window.location.pathname) => {
  if (pathname) {
    let pageList = [];
    if (isWXOpen()) {
    // if (true) {
      pageList = ['/protocol/', '/common/auth_page', '/landing/landing_page', '/home/home', '/common/wx_middle_page', '/others/'];
    } else {
      pageList = ['/protocol/', '/common/auth_page', '/landing/landing_page', '/others/'];
    }
    return pageList.some(item => item && pathname.indexOf(item) > -1);
  }
};
