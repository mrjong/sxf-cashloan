import { Modal, Toast } from 'antd-mobile';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';

// 从url中返回search参数，返回对象
const getParamsFromUrl = url => {
  if (!url) {
    return false;
  }
  let theRequest = {};
  if (url.indexOf('?') !== -1) {
    const str = url.substr(1);
    const strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
    }
  }
  return theRequest;
};

// 获取设备类型，返回字符串
const getDeviceType = () => {
  const u = navigator.userAgent;
  const osType =
    u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 ?
    'ANDRIOD' :
    u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ?
    'IOS' :
    'PC';
  return osType;
};

// 检测是否是某种浏览器
const isSomeBrowser = type => {
  const u = navigator.userAgent.toLowerCase();
  return u.indexOf(type) > -1 && u.indexOf('micromessenger') <= -1;
};

// 定义需要特殊处理的浏览器
const bugBrowserArr = ['vivobrowser', 'oppobrowser'];

// 检测是否是某种 bug 浏览器
const isBugBrowser = () => {
  const u = navigator.userAgent.toLowerCase();
  const bugBrowserList = bugBrowserArr.filter(item => u.indexOf(item) > -1);
  return bugBrowserList.length > 0 && u.indexOf('micromessenger') <= -1;
};

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// 生成UUID,返回字符串
const guid = () => {
  return `${S4() + S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}`;
};

// 安卓关闭页面方法
const closePage = () => {
  if (window.Sxp) {
    return window.Sxp.closePage();
  }
  if (window.passValue) {
    return window.passValue();
  }
};

// 点击退出
let state = false;

const logoutAppHandler = that => {
  if (!state) {
    state = true;
    Modal.alert('', '确认退出登录？', [{
        text: '取消',
        onPress: () => {
          state = false;
        },
      },
      {
        text: '确定',
        onPress: () => {
          state = false;
          logoutApp(that);
        },
      },
    ]);
  }
};

// 退出的api
const API = {
  LOGOUT: '/signup/logout', // 用户退出登陆
};

// 退出功能
const logoutApp = that => {
  fetch.get(API.LOGOUT).then(
    result => {
      if (result && result.msgCode !== 'PTM0000') {
        result.msgInfo && Toast.info(result.msgInfo);
        return;
      }
      window.ReactRouterHistory.push('/login');
      sessionStorage.clear();
      localStorage.clear();
      Cookie.remove('fin-v-card-token');
      Cookie.remove('authFlag');
      Cookie.remove('VIPFlag');
    },
    err => {
      err.msgInfo && Toast.info(err.msgInfo);
    },
  );
};

// 正则校验表达式
const verifyReg = {
  phoneReg: /^[1][3,4,5,7,8][0-9]{9}$/,
  bankCardSimple: /^\d{14,25}$/,
};

// 正则校验工厂函数
const verfifyFactory = (val, testReg) => {
  // 一些其他判断 。。。。
  return val !== '' && testReg.test(val);
};

// 正则校验基本类型
const isAvailableFun = {
  phone(val, testReg = verifyReg.phoneReg) {
    return verfifyFactory(val, testReg);
  },
  bankCardSimple(val, testReg = verifyReg.bankCardSimple) {
    return verfifyFactory(val, testReg);
  },
};

// 定义需要拦截的路由
const interceptRouteArr = [
  '/login',
  '/home/home',
  '/order/order_page',
  '/mine/mine_page',
  '/mine/credit_extension_page',
  '/order/repayment_succ_page',
  '/mine/credit_list_page',
];

// 在需要路由拦截的页面 pushState
const changeHistoryState = () => {
  if (interceptRouteArr.includes(window.location.pathname)) {
    window.history.pushState(null, null, document.URL); //在IE中必须得有这两行
  }
};

/*rc-form 获取第一个错误 */
const getFirstError = error => {
  if (error) {
    const firstErr = error[Object.keys(error)[0]].errors;

    return firstErr[0].message;
  }
  return '';
};

export {
  getParamsFromUrl,
  getDeviceType,
  isSomeBrowser,
  isBugBrowser,
  guid,
  closePage,
  verifyReg,
  isAvailableFun,
  getFirstError,
  logoutAppHandler,
  interceptRouteArr,
  changeHistoryState,
};
