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
};

const mine = {
  faq: 'DC_MINE_FAQ', // 常见问题页
  saveConfirm: 'DC_MINE_SAVE_CONFIRM', // 绑定储蓄卡页-确定按钮
  creditConfirm: 'DC_MINE_CREDIT_CONFIRM', // 绑定信用卡页-确定按钮
};

const order = {
  demo: 'DEMO',
};

export { login, home, mine, order };
