// 本地local存储 方法名与key值对应表
export const localList = {
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
  BackFlag: 'backFlag', // 是否返回的flag
  DisableBack: 'disableBack', // 禁止返回的标识
  LoginBack: 'loginBack', // 登录页协议返回
  QueryUsrSCOpenId: 'QueryUsrSCOpenId', // 用户标识
  H5Channel: 'h5Channel', // 存储h5Channel
};

// 本地session存储 方法名与key值对应表
export const sessionList = {
  TokenSession: 'fin-card-token',
  JumpUrlSession: 'jumpUrl',
  H5ChannelSession: 'h5Channel', // 存储h5Channel
};
