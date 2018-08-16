import { Modal, Toast } from 'antd-mobile';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import storage from './storage';

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
    u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
      ? 'ANDRIOD'
      : u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
        ? 'IOS'
        : 'PC';
  return osType;
};

// 获取设备类型，返回字符串
const isSomeBrowser = type => {
  const u = navigator.userAgent.toLowerCase();
  return (u.indexOf(type) > -1) && (u.indexOf('micromessenger') <= -1);
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
let state = false

const logoutAppHandler = that => {
  if (!state) {
    state = true
    Modal.alert('', '确认退出登录？', [
      {
        text: '取消', onPress: () => {
          state = false
        }
      },
      {
        text: '确定', onPress: () => {
          state = false
          logoutApp(that)
        }
      },
    ]);
  }
}

// 退出的api
const API = {
  LOGOUT: '/signup/logout', // 用户退出登陆
};


// 退出功能
const logoutApp = that => {
  fetch.get(API.LOGOUT).then(result => {
    if (result && result.msgCode !== 'PTM0000') {
      result.msgInfo && Toast.info(result.msgInfo);
      return;
    }
    window.ReactRouterHistory.push('/login')
    sessionStorage.clear();
    localStorage.clear();
    Cookie.remove('fin-v-card-token');
    Cookie.remove('authFlag');
    Cookie.remove('VIPFlag');
  }, err => {
    err.msgInfo && Toast.info(err.msgInfo);
  });
}


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
    storage.local.setItem('confirmRepaymentModalData', data);
  },

  // 获取确认代还信息弹框数据
  getRepaymentModalData() {
    return storage.local.getItem('confirmRepaymentModalData');
  },

  // 清除认代还信息弹框数据
  removeRepaymentModalData() {
    storage.local.removeItem('confirmRepaymentModalData');
  },

  // 保存首页信用卡信息
  setHomeCardIndexData(data) {
    storage.local.setItem('homeCardIndexData', data);
  },

  // 获取首页信用卡信息
  getHomeCardIndexData() {
    return storage.local.getItem('homeCardIndexData');
  },

  // 清除首页信用卡信息
  removeHomeCardIndexData() {
    storage.local.removeItem('homeCardIndexData');
  },

  // 保存跳转的url
  setBackUrl(data) {
    storage.local.setItem('backUrl', data);
  },

  // 获取跳转的url
  getBackUrl() {
    return storage.local.getItem('backUrl');
  },

  // 清除跳转的url
  removeBackUrl() {
    return storage.local.removeItem('backUrl');
  },

  // 保存跳转路由中的银行卡信息
  setCardData(data) {
    storage.local.setItem('cardData', data);
  },

  // 获取跳转路由中的银行卡信息
  getCardData() {
    return storage.local.getItem('cardData');
  },

  // 清除跳转路由中的银行卡信息
  removeCardData() {
    return storage.local.removeItem('cardData');
  },

  // 设置跳转魔蝎授权页 授权后返回的url
  setMoxieBackUrl(data) {
    storage.local.setItem('moxieBackUrl', data);
  },

  // 获取跳转魔蝎授权页 授权后返回的url
  getMoxieBackUrl() {
    return storage.local.getItem('moxieBackUrl');
  },

  // 清除跳转魔蝎授权页 授权后返回的url
  removeMoxieBackUrl() {
    return storage.local.removeItem('moxieBackUrl');
  },

  // 保存会员卡是否购买的flag
  setVIPFlag(data) {
    storage.local.setItem('VIPFlag', data);
  },

  // 获取会员卡是否购买的flag
  getVIPFlag() {
    return storage.local.getItem('VIPFlag');
  },

  // 清除会员卡是否购买的flag
  removeVIPFlag() {
    return storage.local.removeItem('VIPFlag');
  },

  // 保存是否实名认证的flag
  setAuthFlag(data) {
    storage.local.setItem('authFlag', data);
  },

  // 获取是否实名认证的flag
  getAuthFlag() {
    return storage.local.getItem('authFlag');
  },

  // 清除是否实名认证的flag
  removeAuthFlag() {
    return storage.local.removeItem('authFlag');
  },
  // 保存用户手机号
  setUserPhone(data) {
    storage.local.setItem('userPhone', data);
  },

  // 获取用户手机号
  getUserPhone() {
    return storage.local.getItem('userPhone');
  },

  // 清除用户手机号
  removeUserPhone() {
    return storage.local.removeItem('userPhone');
  },
  // 保存用户信息
  setUserInfo(data) {
    return storage.local.setItem('userInfo', data);
  },
  // 获取用户信息
  getUserInfo() {
    return storage.local.getItem('userInfo');
  },
  // 保存会员卡参数
  setParamVip(data) {
    return storage.local.setItem('paramVip', data);
  },
  // 获取会员卡参数
  getParamVip() {
    return storage.local.getItem('paramVip');
  },
  // 清除会员卡参数
  removeParamVip() {
    return storage.local.removeItem('paramVip');
  },
  // 保存会员卡信息
  setVIPInfo(data) {
    return storage.local.setItem('vIPInfo', data);
  },
  // 获取会员卡信息
  getVIPInfo() {
    return storage.local.getItem('vIPInfo');
  },
  // 清除会员卡信息
  removeVIPInfo() {
    return storage.local.removeItem('vIPInfo');
  },
  // 保存会员卡入口与出口
  setVipBackUrl(data) {
    return storage.local.setItem('vipBackUrl', data);
  },
  // 获取会员卡入口与出口
  getVipBackUrl() {
    return storage.local.getItem('vipBackUrl');
  },
  // 移除会员卡入口与出口
  removeVipBackUrl() {
    return storage.local.removeItem('vipBackUrl');
  },
  // 保存定位信息
  setPosition(data) {
    return storage.local.setItem('position', data);
  },
  // 获取定位信息
  getPosition() {
    return storage.local.getItem('position');
  },
  // 清除定位信息
  removePosition() {
    return storage.local.removeItem('position');
  },

  setProtocolFinancialData(data) {
    return storage.local.setItem('protocolFinancialData', data);
  },
  getProtocolFinancialData() {
    return storage.local.getItem('protocolFinancialData');
  },
  removeProtocolFinancialData() {
    return storage.local.removeItem('protocolFinancialData');
  },
  // 付款成功信息
  getOrderSuccess() {
    return storage.local.getItem('orderSuccess');
  },
  // 借款成功信息
  setOrderSuccess(data) {
    return storage.local.setItem('orderSuccess', data);
  },
  // 付款成功信息
  removeOrderSuccess() {
    return storage.local.removeItem('orderSuccess');
  },
  // 订单信息
  getBackData() {
    return storage.local.getItem('backData');
  },
  // 订单信息
  setBackData(data) {
    return storage.local.setItem('backData', data);
  },
  // 订单信息
  removeBackData() {
    return storage.local.removeItem('backData');
  },
  setBillNo(data) {
    return storage.local.setItem('billNo', data);
  },
  getBillNo() {
    return storage.local.getItem('billNo');
  },
  // 消息详情
  setMsgObj(data) {
    return storage.local.setItem('MsgObj', data);
  },
  // 消息详情
  getMsgObj() {
    return storage.local.getItem('MsgObj');
  },
  // 消息详情
  removeMsgObj() {
    return storage.local.removeItem('MsgObj');
  },
  // 消息详情
  setMsgBackData(data) {
    return storage.local.setItem('MsgBackData', data);
  },
  // 消息详情
  getMsgBackData() {
    return storage.local.getItem('MsgBackData');
  },
  // 消息详情
  removeMsgBackData() {
    return storage.local.removeItem('MsgBackData');
  },
  // local-token
  setToken(data) {
    return storage.local.setItem('fin-card-token', data);
  },
  // local-token
  getToken() {
    return storage.local.getItem('fin-card-token');
  },
  // local-token
  removeToken() {
    return storage.local.removeItem('fin-card-token');
  },
  // session-token
  setTokenSession(data) {
    return storage.session.setItem('fin-card-token', data);
  },
  // session-token
  getTokenSession() {
    return storage.session.getItem('fin-card-token');
  },
  // session-token
  removeTokenSession() {
    return storage.session.removeItem('fin-card-token');
  },

  setHistoryRouter(data) {
    return storage.local.setItem('historyRouter', data);
  },

  getHistoryRouter() {
    return storage.local.getItem('historyRouter');
  },

  removeHistoryRouter() {
    return storage.local.removeItem('historyRouter');
  },
  // 保存四项认证进入绑卡页的标识
  setCheckCardRouter(data) {
    return storage.local.setItem('checkCardRouter', data);
  },
  // 获取四项认证进入绑卡页的标识
  getCheckCardRouter() {
    return storage.local.getItem('checkCardRouter');
  },
  // 清除四项认证进入绑卡页的标识
  removeCheckCardRouter() {
    return storage.local.removeItem('checkCardRouter');
  },
  // 保存 banner 信息
  setBannerData(data) {
    return storage.local.setItem('bannerData', data);
  },
  // 获取 banner 信息
  getBannerData() {
    return storage.local.getItem('bannerData');
  },
  // 去除 banner 信息
  removeBannerData() {
    return storage.local.removeItem('bannerData');
  },

  // 保存 去外链标识
  setOutLinkUrl(data) {
    return storage.local.setItem('outLintUrl', data);
  },
  // 获取 去外链标识
  getOutLinkUrl() {
    return storage.local.getItem('outLintUrl');
  },
  // 去除 去外链标识
  removeOutLinkUrl() {
    return storage.local.removeItem('outLintUrl');
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
  isSomeBrowser,
  guid,
  closePage,
  verifyReg,
  isAvailableFun,
  getFirstError,
  store,
  logoutAppHandler,
};
