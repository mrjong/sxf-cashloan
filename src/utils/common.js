import storage from './storage';

// 从url中返回search参数，返回对象
const getParamsFromUrl = url => {
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
    u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
      ? 'ANDRIOD'
      : u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
        ? 'IOS'
        : 'PC';
  return osType;
};

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// 生成UUID,返回字符串
const guid = () => {
  return `${S4() + S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
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

// 本地存储
const store = {
  // 保存确认代还信息弹框数据
  setRepaymentModalData(data) {
    storage.session.setItem('confirmRepaymentModalData', data);
  },

  // 获取确认代还信息弹框数据
  getRepaymentModalData() {
    return storage.session.getItem('confirmRepaymentModalData');
  },

  // 保存跳转的url
  setBackUrl(data) {
    storage.session.setItem('backUrl', data);
  },

  // 获取跳转的url
  getBackUrl() {
    return storage.session.getItem('backUrl');
  },

  // 清除跳转的url
  removeBackUrl() {
    return storage.session.removeItem('backUrl');
  },

  // 保存跳转路由中的银行卡信息
  setCardData(data) {
    storage.session.setItem('cardData', data);
  },

  // 获取跳转路由中的银行卡信息
  getCardData() {
    return storage.session.getItem('cardData');
  },

  // 清除跳转路由中的银行卡信息
  removeCardData() {
    return storage.session.removeItem('cardData');
  },

  // 设置跳转魔蝎授权页 授权后返回的url
  setMoxieBackUrl(data) {
    storage.session.setItem('moxieBackUrl', data);
  },

  // 获取跳转魔蝎授权页 授权后返回的url
  getMoxieBackUrl() {
    return storage.session.getItem('moxieBackUrl');
  },

  // 清除跳转魔蝎授权页 授权后返回的url
  removeMoxieBackUrl() {
    return storage.session.removeItem('moxieBackUrl');
  },
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
  guid,
  closePage,
  verifyReg,
  isAvailableFun,
  getFirstError,
  store,
};
