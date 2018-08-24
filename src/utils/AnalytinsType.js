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
  repayment: 'DC_ORDER_DETAILS_REPAYMENT', // 账单详情页-主动还款按钮
  repaymentFirst: 'DC_ORDER_DETAILS_REPAYMENT_FIRST', // 账单详情页-付款详情-立即还款按钮
};

const membership = {
  confirmBuyPre: 'DC_MEMBERSHIP_CONFIRM_BUY_PRE', // 会员卡购买页-确认购买按钮
  bindCardCredit: 'DC_MEMBERSHIP_BIND_CARD_CREDIT', // 会员卡购买页-绑定银行卡-信用卡页-确认绑定按钮
  bindCardSave: 'DC_MEMBERSHIP_BIND_CARD_SAVE', // 会员卡购买页-绑定银行卡-储蓄卡页-确认绑定按钮
  confirmBuy: 'DC_MEMBERSHIP_CONFIRM_BUY', // 会员卡购买-确认购买页-确认购买按钮
};

export { login, home, mine, order, membership };
