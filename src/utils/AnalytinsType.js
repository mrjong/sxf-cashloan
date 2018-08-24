const login = {
  getCode: 'DC_LOGIN_GET_CODE', // 注册登录页-点击获取验证码
  submit: 'DC_LOGIN_SUBMIT', // 注册登录页-一键代还
};

const home = {
  applyCreditRepayment: 'DC_HOME_APPLY_CREDIT_REPAYMENT', // 首页-点击申请信用卡代还按钮
  updateBill: 'DC_HOME_UPDATE_BILL', // 首页-点击更新账单
  easyRepay: 'DC_HOME_EASY_REPAYMENT', // 首页-点击一键还卡（代还）
  repayOtherCredit: 'DC_HOME_REPAY_OTHER_CREDIT', // 首页-点击代还其他信用卡
  viewBill: 'DC_HOME_VIEW_BILL', // 首页-点击查看代还账单
  durationDay30: 'DC_HOME_DURATION_DAY_30', // 代还期限-30天
  durationMonth3: 'DC_HOME_DURATION_MONTH_3', // 代还期限-3个月
  durationMonth6: 'DC_HOME_DURATION_MONTH_6', // 代还期限-6个月
  durationMonth12: 'DC_HOME_DURATION_MONTH_12', // 代还期限-12个月
  borrowingPreSubmit: 'DC_HOME_BORROWING_PRE_SUBMIT', // 选择借款要素弹框页-点击确认按钮
  borrowingSubmit: 'DC_HOME_BORROWING_SUBMIT', // 代还确认页-点击确认借款按钮
  informationMyselfFrontCard: 'DC_HOME_BASE_INFO_FRONT_CARD', // 实名认证页-点击拍摄身份证正面
  informationMyselfBackCard: 'DC_HOME_BASE_INFO_BACK_CARD', // 实名认证页-点击拍摄身份证反面
  informationTapNameInp: 'DC_HOME_BASE_INFO_USERNAME', // 实名认证页-点击姓名输入框
  informationTapIDInp: 'DC_HOME_BASE_INFO_IDCARD', // 实名认证页-点击身份证号输入框
  informationTapHoldIdCard: 'DC_HOME_BASE_INFO_HOLD_IDCARD', // 实名认证页-点击手持身份证
  informationConfirm: 'DC_HOME_BASE_INFO_CONFIRM', // 实名认证页-确定按钮
};

const mine = {
  faq: 'DC_MINE_FAQ', // 常见问题页
  saveConfirm: 'DC_MINE_SAVE_CONFIRM', // 绑定储蓄卡页-确定按钮
  creditConfirm: 'DC_MINE_CREDIT_CONFIRM', // 绑定信用卡页-确定按钮
  creditExtension: 'DC_MINE_CREDIT_EXTENSION', // 风控授信项页
};

const order = {
  repayment: 'DC_ORDER_DETAILS_REPAYMENT', // 账单详情页-主动还款按钮
  repaymentFirst: 'DC_ORDER_DETAILS_REPAYMENT_FIRST', // 账单详情页-付款详情-立即还款按钮
  returnHome: 'DC_ORDER_BACK_HOME', // 还款完成页-返回首页按钮
};

export { login, home, mine, order };
