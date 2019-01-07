// DC 对外
// XDC mpos入口=>对内
let prefix = `DC`;
console.log(sessionStorage.getItem('isMpos'))
if (sessionStorage.getItem('isMpos')) {
	prefix = 'XDC';
}
const login = {
	getCode: `${prefix}_LOGIN_GET_CODE`, // 注册登录页-点击获取验证码
	submit: `${prefix}_LOGIN_SUBMIT` // 注册登录页-一键代还
};

const home = {
	applyCreditRepayment: `${prefix}_HOME_APPLY_CREDIT_REPAYMENT`, // 首页-点击申请信用卡代还按钮
	updateBill: `${prefix}_HOME_UPDATE_BILL`, // 首页-点击更新账单
	easyRepay: `${prefix}_HOME_EASY_REPAYMENT`, // 首页-点击一键还卡（代还）
	repayOtherCredit: `${prefix}_HOME_REPAY_OTHER_CREDIT`, // 首页-点击代还其他信用卡
	viewBill: `${prefix}_HOME_VIEW_BILL`, // 首页-点击查看代还账单
	durationDay30: `${prefix}_HOME_DURATION_DAY_30`, // 代还期限-30天
	durationMonth3: `${prefix}_HOME_DURATION_MONTH_3`, // 代还期限-3个月
	durationMonth6: `${prefix}_HOME_DURATION_MONTH_6`, // 代还期限-6个月
	durationMonth12: `${prefix}_HOME_DURATION_MONTH_12`, // 代还期限-12个月
	lenders: `${prefix}_HOME_LENDERS`, // 放款日期-立即放款
	borrowingPreSubmit: `${prefix}_HOME_BORROWING_PRE_SUBMIT`, // 选择借款要素弹框页-点击确认按钮
	borrowingSubmit: `${prefix}_HOME_BORROWING_SUBMIT`, // 代还确认页-点击确认借款按钮
	informationMyselfFrontCard: `${prefix}_HOME_BASE_INFO_FRONT_CARD`, // 实名认证页-点击拍摄身份证正面
	informationMyselfBackCard: `${prefix}_HOME_BASE_INFO_BACK_CARD`, // 实名认证页-点击拍摄身份证反面
	informationTapNameInp: `${prefix}_HOME_BASE_INFO_USERNAME`, // 实名认证页-点击姓名输入框
	informationTapIDInp: `${prefix}_HOME_BASE_INFO_IDCARD`, // 实名认证页-点击身份证号输入框
	informationTapHoldIdCard: `${prefix}_HOME_BASE_INFO_HOLD_IDCARD`, // 实名认证页-点击手持身份证
	informationConfirm: `${prefix}_HOME_BASE_INFO_CONFIRM`, // 实名认证页-确定按钮
	basicInfoBury: `${prefix}_HOME_BASE_INFO_BURY`, // 基本信息输入框下拉框埋点
	basicInfoComplete: `${prefix}_HOME_BASICINFO_COMPLETE`, // 基本信息页-确定按钮
	landingPage: `${prefix}_HOME_LANDING_PAGE`, // 落地页
	bannerClick: `${prefix}_HOME_BANNER_CLICK`, // 点击banner
	repaymentBtnClick3: `${prefix}_HOME_CLICK_REPAYMENT3`, // 首页LN0003状态的点击
	repaymentBtnClick6: `${prefix}_HOME_CLICK_REPAYMENT6`, // 首页LN0006状态的点击
	repaymentBtnClick8: `${prefix}_HOME_CLICK_REPAYMENT8` // 首页LN0008状态的点击
};

const mine = {
	faq: `${prefix}_MINE_FAQ`, // 常见问题页
	saveConfirm: `${prefix}_MINE_SAVE_CONFIRM`, // 绑定储蓄卡页-确定按钮
	creditConfirm: `${prefix}_MINE_CREDIT_CONFIRM`, // 绑定信用卡页-确定按钮
	creditExtension: `${prefix}_MINE_CREDIT_EXTENSION`, // 风控授信项页 从哪进入（首页、我的）
	creditExtensionConfirm: `${prefix}_MINE_CREDIT_EXTENSION_CONFIRM`, // 风控授信项页-点击提交代还金申请按钮
	creditExtensionBack: `${prefix}_MINE_CREDIT_EXTENSION_BACK`, // 风控授信项页
	creditExtensionRealName: `${prefix}_MINE_CREDIT_EXTENSION_REAL_NAME`, // 风控授信项页 点击实名认证
	creditExtensionBaseInfo: `${prefix}_MINE_CREDIT_EXTENSION_BASE_INFO`, // 风控授信项页 点击基本信息认证
	creditExtensionOperator: `${prefix}_MINE_CREDIT_EXTENSION_OPERATOR`, // 风控授信项页 点击运营商认证
	creditExtensionZM: `${prefix}_MINE_CREDIT_EXTENSION_ZM` // 风控授信项页 点击芝麻分认证
};

const order = {
	repayment: `${prefix}_ORDER_DETAILS_REPAYMENT`, // 账单详情页-主动还款按钮
	repaymentFirst: `${prefix}_ORDER_DETAILS_REPAYMENT_FIRST`, // 账单详情页-付款详情-立即还款按钮
	returnHome: `${prefix}_ORDER_BACK_HOME` // 还款完成页-返回首页按钮
};

const membership = {
	confirmBuyPre: `${prefix}_MEMBERSHIP_CONFIRM_BUY_PRE`, // 会员卡购买页-确认购买按钮
	bindCardCredit: `${prefix}_MEMBERSHIP_BIND_CARD_CREDIT`, // 会员卡购买页-绑定银行卡-信用卡页-确认绑定按钮
	bindCardSave: `${prefix}_MEMBERSHIP_BIND_CARD_SAVE`, // 会员卡购买页-绑定银行卡-储蓄卡页-确认绑定按钮
	confirmBuy: `${prefix}_MEMBERSHIP_CONFIRM_BUY` // 会员卡购买-确认购买页-确认购买按钮
};

const bugLog = {
	apiErrorLog: `${prefix}_API_ERROR_LOG`, // 接口异常报错日志
	pageErrorLog: `${prefix}_PAGE_ERROR_LOG` // 页面异常报错日志
};

const mpos_service_authorization ={
    anth_btn:`${prefix}_AUTH_PAGE_AUTH_BTN`
}

export { login, home, mine, order, membership, bugLog };
