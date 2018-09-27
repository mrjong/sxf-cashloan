import { isWXOpen } from './common';

export default (pathname = window.location.pathname) => {
  if (pathname) {
    let pageList = [];
    if (isWXOpen()) {
    // if (true) {
      pageList = ['/protocol/', '/common/auth_page', '/landing/landing_page', '/home/home', '/order/order_page', '/mine/mine_page', '/common/wx_middle_page'];
    } else {
      pageList = ['/protocol/', '/common/auth_page', '/landing/landing_page'];
    }
    return pageList.some(item => item && pathname.indexOf(item) > -1);
  }
};
