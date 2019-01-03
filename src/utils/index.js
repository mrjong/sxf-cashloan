import { buriedPointEvent } from 'utils/analytins';
import { bugLog } from 'utils/analytinsType';
import { Modal, Toast } from 'antd-mobile';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';


// 处理输入框失焦页面不回弹
export const handleInputBlur = () => {
  setTimeout(() => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    window.scrollTo(0, scrollTop);
  }, 100);
}

// 处理接口错误上报
export const handleErrorLog = (status, statusText) => {
  const logInfo = {
    DC_errorStatus: status,
    DC_errorStatusText: statusText,
    DC_errorUrl: document.URL,
    DC_errorTime: new Date(),
    DC_errorTitle: document.title
  }
  buriedPointEvent(bugLog.apiErrorLog, logInfo)
}

export const handleWindowError = () => {
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

    buriedPointEvent(bugLog.pageErrorLog, errorObj)


    // if (XMLHttpRequest) {
    // 	var xhr = new XMLHttpRequest();

    // 	xhr.open('post', 'http://localhost:3031/middleware/errorReport', true); // 上报给node中间层处理
    // 	xhr.setRequestHeader('Content-Type', 'application/json'); // 设置请求头
    // 	xhr.send(JSON.stringify(errorObj)); // 发送参数
    // }
  }
}

// 判断是否是微信打开
export const isWXOpen = () => {
  var ua = navigator.userAgent.toLowerCase();
  return (/micromessenger/.test(ua)) ? true : false;
}

export const pagesIgnore = (pathname = window.location.pathname) => {
  if (pathname) {
    let pageList = [];
    if (isWXOpen()) {
      pageList = [
        '/protocol/',
        '/activity/',
        '/others/',
        '/common/auth_page',
        '/landing/landing_page',
        '/home/home',
        '/common/wx_middle_page'
      ];
    } else {
      pageList = ['/protocol/', '/activity/', '/common/auth_page', '/landing/landing_page', '/others/'];
    }
    return pageList.some((item) => item && pathname.indexOf(item) > -1);
  }
}

// 逻辑有待优化
export const headerIgnore = (type) => {
  const ua = window.navigator.userAgent;
  if (type === 'false') {
    if (
      !/MicroMessenger/i.test(ua) &&
      !/QQ/i.test(ua) &&
      !/AlipayClient/i.test(ua) &&
      !/SuiXingPay-Mpos/i.test(ua) &&
      !/SuiXingPay-Cashier/i.test(ua)
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    if (
      /MicroMessenger/i.test(ua) ||
      /QQ/i.test(ua) ||
      /AlipayClient/i.test(ua) ||
      /SuiXingPay-Mpos/i.test(ua) ||
      /SuiXingPay-Cashier/i.test(ua)
    ) {
      return true;
    } else {
      return false;
    }
  }
}

export const setTitle = (getTitle) => {
  var i = document.createElement('iframe');
  i.src = 'https://lns-wap.vbillbank.com/favicon.ico';
  i.style.display = 'none';
  i.onload = function () {
    setTimeout(function () {
      i.remove();
    }, 9);
  };
  document.title = getTitle;
  document.body.appendChild(i);
}

// 获取设备类型，返回字符串
export const getDeviceType = () => {
  const u = navigator.userAgent;
  const osType =
    u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 ?
      'ANDRIOD' :
      u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ?
        'IOS' :
        'PC';
  return osType;
}

/*rc-form 获取第一个错误 */
export const getFirstError = error => {
  if (error) {
    const firstErr = error[Object.keys(error)[0]].errors;

    return firstErr[0].message;
  }
  return '';
}

// 定义需要特殊处理的浏览器
const bugBrowserArr = ['vivobrowser', 'oppobrowser'];

// 检测是否是某种 bug 浏览器
export const isBugBrowser = () => {
  const u = navigator.userAgent.toLowerCase();
  const bugBrowserList = bugBrowserArr.filter(item => u.indexOf(item) > -1);
  return bugBrowserList.length > 0 && u.indexOf('micromessenger') <= -1;
}

// 检测是否是某种浏览器
export const isSomeBrowser = type => {
  const u = navigator.userAgent.toLowerCase();
  return u.indexOf(type) > -1 && u.indexOf('micromessenger') <= -1;
}

// 点击退出
let state = false;

export const logoutAppHandler = that => {
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
}

// 定义需要拦截的路由
export const interceptRouteArr = [
  '/login',
  '/home/home',
  '/order/order_page',
  '/mine/mine_page',
  '/mine/credit_extension_page',
  '/order/repayment_succ_page',
  '/mine/credit_list_page',
  '/home/essential_information',
  '/home/real_name',
];

// 在需要路由拦截的页面 pushState
export const changeHistoryState = () => {
  if (interceptRouteArr.includes(window.location.pathname)) {
    window.history.pushState(null, null, document.URL); //在IE中必须得有这两行
  }
}

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// 生成UUID,返回字符串
export const guid = () => {
  return `${S4() + S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}`;
}

// 安卓关闭页面方法
export const closePage = () => {
  if (window.Sxp) {
    return window.Sxp.closePage();
  }
  if (window.passValue) {
    return window.passValue();
  }
}

// 退出的api
const API = {
  LOGOUT: '/signup/logout', // 用户退出登陆
};

// 退出功能
export const logoutApp = that => {
  fetch.get(API.LOGOUT).then(
    result => {
      if (result && result.msgCode !== 'PTM0000') {
        result.msgInfo && Toast.info(result.msgInfo);
        return;
      }
      window.ReactRouterHistory.push('/login');
      // sessionStorage.clear();
      // localStorage.clear();
      // Cookie.remove('fin-v-card-token');
      Cookie.remove('authFlag');
      Cookie.remove('VIPFlag');
    },
    err => {
      err.msgInfo && Toast.info(err.msgInfo);
    },
  );
}

export const getNowDate = () => {
  var now = new Date();
  var year = now.getFullYear(); //得到年份
  var month = now.getMonth();//得到月份
  var date = now.getDate();//得到日期
  return `${year}${month}${date}`
}

// 正则校验表达式
export const verifyReg = {
  phoneReg: /^[1][3,4,5,7,8][0-9]{9}$/,
  bankCardSimple: /^\d{14,25}$/,
};

// 正则校验工厂函数
const verfifyFactory = (val, testReg) => {
  // 一些其他判断 。。。。
  return val !== '' && testReg.test(val);
};

// 正则校验基本类型
export const isAvailableFun = {
  phone(val, testReg = verifyReg.phoneReg) {
    return verfifyFactory(val, testReg);
  },
  bankCardSimple(val, testReg = verifyReg.bankCardSimple) {
    return verfifyFactory(val, testReg);
  },
}

export const validators = {
  number: val => /^[0-9]*$/.test(val),
  bankCardNumber: val => /^\d{16}|\d{24}$/.test(val), // 银行卡号 val.replace(/\s+/g, "")
  phone: val => /^1\d{10}$/.test(val), // 手机为以1开头的11位数字
  iDCardNumber: val => /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(val), // 身份证 中国的身份证号，一代身份证号是15位的数字，二代身份证都是18位的，最后一位校验位除了可能是数字还可能是‘X‘或‘x‘，所以有四种可能性：a.15位数字 b.18位数字 c.17位数字，第十八位是‘X‘ d.17位数字，第十八位是‘x‘
  enLength: (val, min, max) => {
    // 英文字符长度校验
    if (val.replace(/(^\s*)|(\s*$)/g, '') === '') {
      // /^(?!(\s+$))/
      return false;
    } else if (min) {
      if (val.length < min) {
        return false;
      } else if (max) {
        if (val.length > max) {
          return false;
        }
        return true;
      }
      return true;
    }
  },
  name: val => /^([\u4e00-\u9fa5]){2,20}$/.test(val),
  chLength: (val, min, max) => {
    // 中文字符长度校验121
    let minNum = min || 1;
    let maxNum = max || 100000;
    let chReg = new RegExp(`^(([\u4e00-\u9fa5])|(\\.)|(\\·)){${minNum},${maxNum}}$`);
    return chReg.test(val);
  },
}

function clearAllCookie() {
  var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
  if (keys) {
    for (var i = keys.length; i--;) document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
  }
}
export const vconsole = (i, consoleshow) => {
  if ((i && i.length === 10 && i === '0110001111') || consoleshow || sessionStorage.getItem('consoleshow')) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.bootcss.com/vConsole/2.0.1/vconsole.min.js';
    head.appendChild(script);
    sessionStorage.setItem('consoleshow', true);
    // console.log('localStorage', localStorage);
    // console.log('sessionStorage', sessionStorage);
    // console.log('cookie', document.cookie);
    // console.log('打印完成')
  } else if ((i && i.length === 10 && i === '1111000110') || consoleshow || sessionStorage.getItem('consoleshow')) {
    localStorage.clear();
    sessionStorage.clear();
    clearAllCookie();
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.bootcss.com/vConsole/2.0.1/vconsole.min.js';
    head.appendChild(script);
    sessionStorage.setItem('consoleshow', true);
    // console.log('localStorage', localStorage);
    // console.log('sessionStorage', sessionStorage);
    // console.log('cookie', document.cookie);
    // console.log('清除完成')
  }
}
