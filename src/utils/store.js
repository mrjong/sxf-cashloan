// 本地存储
import storage from './storage';

let store = {};

// 本地local存储 方法名与key值对应表
const storeListLocal = {
  RepaymentModalData: 'confirmRepaymentModalData', // 保存确认代还信息弹框数据
  HomeCardIndexData: 'homeCardIndexData', // 保存首页信用卡信息
  BackUrl: 'backUrl', // 保存跳转的url
  CardData: 'cardData', // 跳转路由中的银行卡信息
  MoxieBackUrl: 'moxieBackUrl', // 跳转魔蝎授权页 授权后返回的url
  VIPFlag: 'VIPFlag', // 会员卡是否购买的flag
  AuthFlag: 'authFlag', // 是否实名认证的flag
  UserPhone: 'userPhone', // 用户手机号
  UserInfo: 'userInfo', // 用户信息
  ParamVip: 'paramVip', // 会员卡参数
  VIPInfo: 'vIPInfo', // 会员卡信息
  VipBackUrl: 'vipBackUrl', // 会员卡入口与出口
  Position: 'position', // 定位信息
  ProtocolFinancialData: 'protocolFinancialData',
  OrderSuccess: 'orderSuccess', // 付款成功信息
  BackData: 'backData', // 订单信息
  BillNo: 'billNo',
  MsgObj: 'MsgObj', // // 消息详情
  MsgBackData: 'MsgBackData', // 消息详情
  Token: 'fin-card-token', // local-token
  HistoryRouter: 'historyRouter', // 历史路由
  CheckCardRouter: 'checkCardRouter', // 保存四项认证进入绑卡页的标识
  BannerData: 'bannerData', // 保存 banner 信息
  OutLinkUrl: 'outLintUrl', // 去外链标识
  CouponData: 'couponData', // 跳转路由中优惠劵的信息
  LandingPageImgUrl: 'landingPageImgUrl', // 落地页图片
  HadShowModal: 'hadShowModal', // 是否开过弹框
  JumpUrl: 'jumpUrl', // 调整的url
  QueryUsrSCOpenId: 'QueryUsrSCOpenId', // 用户标识
};

// 本地session存储 方法名与key值对应表
const storeListSession = {
  TokenSession: 'fin-card-token',
  JumpUrlSession: 'jumpUrl',
};

// 本地存储工厂函数，生成 set get remove 方法
const storeFactory = (funcName, key, storeType = 'local') => {
  store[`set${funcName}`] = data => {
    storage[storeType].setItem(key, data);
  };
  store[`get${funcName}`] = () => storage[storeType].getItem(key);
  store[`remove${funcName}`] = () => storage[storeType].removeItem(key);
};

// 循环添加 local 存储方法
for (let funName in storeListLocal) {
  storeFactory(funName, storeListLocal[funName], 'local');
}

// 循环添加 session 存储方法
for (let funName in storeListSession) {
  storeFactory(funName, storeListSession[funName], 'session');
}

export { store };
