const login = {
	getCode: 'DC_LOGIN_GET_CODE', // 注册登录页-点击获取验证码
	submit: 'DC_LOGIN_SUBMIT' // 注册登录页-一键代还
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
	lenders: 'DC_HOME_LENDERS', // 放款日期-立即放款
	borrowingPreSubmit: 'DC_HOME_BORROWING_PRE_SUBMIT', // 选择借款要素弹框页-点击确认按钮
	borrowingSubmit: 'DC_HOME_BORROWING_SUBMIT', // 代还确认页-点击确认借款按钮
	informationMyselfFrontCard: 'DC_HOME_BASE_INFO_FRONT_CARD', // 实名认证页-点击拍摄身份证正面
	informationMyselfBackCard: 'DC_HOME_BASE_INFO_BACK_CARD', // 实名认证页-点击拍摄身份证反面
	informationTapNameInp: 'DC_HOME_BASE_INFO_USERNAME', // 实名认证页-点击姓名输入框
	informationTapIDInp: 'DC_HOME_BASE_INFO_IDCARD', // 实名认证页-点击身份证号输入框
	informationTapHoldIdCard: 'DC_HOME_BASE_INFO_HOLD_IDCARD', // 实名认证页-点击手持身份证
	informationConfirm: 'DC_HOME_BASE_INFO_CONFIRM', // 实名认证页-确定按钮
	basicInfoBury: 'DC_HOME_BASE_INFO_BURY', // 基本信息输入框下拉框埋点
	basicInfoComplete: 'DC_HOME_BASICINFO_COMPLETE', // 基本信息页-确定按钮
	landingPage: 'DC_HOME_LANDING_PAGE', // 落地页
	bannerClick: 'DC_HOME_BANNER_CLICK', // 点击banner
	repaymentBtnClick3: 'DC_HOME_CLICK_REPAYMENT3', // 首页LN0003状态的点击
	repaymentBtnClick6: 'DC_HOME_CLICK_REPAYMENT6', // 首页LN0006状态的点击
	repaymentBtnClick8: 'DC_HOME_CLICK_REPAYMENT8', // 首页LN0008状态的点击
};

const mine = {
	faq: 'DC_MINE_FAQ', // 常见问题页
	saveConfirm: 'DC_MINE_SAVE_CONFIRM', // 绑定储蓄卡页-确定按钮
	creditConfirm: 'DC_MINE_CREDIT_CONFIRM', // 绑定信用卡页-确定按钮
	creditExtension: 'DC_MINE_CREDIT_EXTENSION', // 风控授信项页 从哪进入（首页、我的）
	creditExtensionConfirm: 'DC_MINE_CREDIT_EXTENSION_CONFIRM', // 风控授信项页-点击提交代还金申请按钮
	creditExtensionBack: 'DC_MINE_CREDIT_EXTENSION_BACK', // 风控授信项页
	creditExtensionRealName: 'DC_MINE_CREDIT_EXTENSION_REAL_NAME', // 风控授信项页 点击实名认证
	creditExtensionBaseInfo: 'DC_MINE_CREDIT_EXTENSION_BASE_INFO', // 风控授信项页 点击基本信息认证
	creditExtensionOperator: 'DC_MINE_CREDIT_EXTENSION_OPERATOR', // 风控授信项页 点击运营商认证
	creditExtensionZM: 'DC_MINE_CREDIT_EXTENSION_ZM' // 风控授信项页 点击芝麻分认证
};

const order = {
	repayment: 'DC_ORDER_DETAILS_REPAYMENT', // 账单详情页-主动还款按钮
	repaymentFirst: 'DC_ORDER_DETAILS_REPAYMENT_FIRST', // 账单详情页-付款详情-立即还款按钮
	returnHome: 'DC_ORDER_BACK_HOME' // 还款完成页-返回首页按钮
};

const membership = {
	confirmBuyPre: 'DC_MEMBERSHIP_CONFIRM_BUY_PRE', // 会员卡购买页-确认购买按钮
	bindCardCredit: 'DC_MEMBERSHIP_BIND_CARD_CREDIT', // 会员卡购买页-绑定银行卡-信用卡页-确认绑定按钮
	bindCardSave: 'DC_MEMBERSHIP_BIND_CARD_SAVE', // 会员卡购买页-绑定银行卡-储蓄卡页-确认绑定按钮
	confirmBuy: 'DC_MEMBERSHIP_CONFIRM_BUY' // 会员卡购买-确认购买页-确认购买按钮
};

const bugLog = {
	apiErrorLog: 'DC_API_ERROR_LOG',  // 接口异常报错日志
	pageErrorLog: 'DC_PAGE_ERROR_LOG'  // 页面异常报错日志
}

export { login, home, mine, order, membership, bugLog };
