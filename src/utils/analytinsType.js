/*
 * @Author: shawn
 * @LastEditTime: 2020-05-13 10:30:10
 */
// DC 对外
// XDC mpos入口=>对内
import { isMPOS } from './common';
let prefix = `DC`;
// dc 多
// xdc少

if (isMPOS() || JSON.parse(sessionStorage.getItem('isMPOS'))) {
	prefix = 'XDC';
}
// console.log(JSON.parse(sessionStorage.getItem('isMPOS')),'test')
const login = {
	getCode: `${prefix}_LOGIN_GET_CODE`, // 注册登录页-点击获取验证码
	submit: `${prefix}_LOGIN_SUBMIT`, // 注册登录页-一键代还
	submitFail: `${prefix}_LOGIN_SUBMIT_FAIL`, // 失败
	queryUsrSCOpenIdFail: `${prefix}_QUERYUSRSCOPENIDFAIL`,
	goHome: `${prefix}_GOHOME`,
	goDownLoad: `${prefix}_GODOWNLOAD`,
	downloadModalShow: `${prefix}_DOWNLOADMODAL_SHOW`, //首页显示下载弹窗
	downloadModalBtnClick: `${prefix}_DOWNLOADMODALBTN_CLICK` //首页显示下载弹窗按钮点击
};

const home = {
	applyCreditRepayment: `${prefix}_HOME_APPLY_CREDIT_REPAYMENT`, // 首页-点击申请信用卡代还按钮
	homeContinueApply: `${prefix}_HOME_CONTINUE_APPLY`, // 还卡-继续申请  增加属性，继续页面：基本信息认证，银行列表，运营商认证
	HomeCardRenew: `${prefix}_HOME_CARD_RENEW`, // 借钱换信用卡  重新更新
	easyRepay: `${prefix}_HOME_EASY_REPAYMENT`, // 首页-点击一键还卡（代还）
	repayOtherCredit: `${prefix}_HOME_REPAY_OTHER_CREDIT`, // 首页-点击代还其他信用卡
	viewBill: `${prefix}_HOME_VIEW_BILL`, // 首页-点击查看代还账单
	durationDay30: `${prefix}_MINE_CREDIT_EXTENSION_DURATION_DAY_30`, // 申请期限-30天
	durationMonth3: `${prefix}_MINE_CREDIT_EXTENSION_DURATION_MONTH_3`, // 申请期限-3个月
	durationMonth6: `${prefix}_MINE_CREDIT_EXTENSION_DURATION_MONTH_6`, // 申请期限-6个月
	durationMonth9: `${prefix}_MINE_CREDIT_EXTENSION_DURATION_MONTH_9`, // 申请期限-9个月
	durationMonth12: `${prefix}_MINE_CREDIT_EXTENSION_DURATION_MONTH_12`, // 申请期限-12个月
	moneyCreditCardConfirm: `${prefix}_MONEY_CREDIT_CARD_CONFIRM`, // 借钱还信用卡-提交申请成功
	moneyCreditCardConfirmBtn: `${prefix}_MONEY_CREDIT_CARD_CONFIRM_BTN`, // 借钱还信用卡-提交申请按钮
	// compensationCreditCardConfirm: `${prefix}_COMPENSATION_CREDIT_CARD_CONFIRM`, // 代偿信用卡-确认
	userRetrieveContinue: `${prefix}_USER_RETRIEVE_CONTINUE`, // 用户挽回-再等等
	userRetrieveQuit: `${prefix}_USER_RETRIEVE_QUIT`, // 用户挽回-放弃
	repaymentIntentionAll: `${prefix}_REPAYMENT_INTENTION_ALL`, // 还款意愿-全额还款
	repaymentIntentionLowest: `${prefix}_REPAYMENT_INTENTION_LOWEST`, // 还款意愿-最低还款
	repaymentIntentionPart: `${prefix}_REPAYMENT_INTENTION_PART`, // 还款意愿-部分还款
	lenders: `${prefix}_HOME_LENDERS`, // 放款日期-立即放款
	lendersOrder: `${prefix}_HOME_LENDERS_ORDER`, // 放款日期-预约放款
	borrowingSubmit: `${prefix}_HOME_BORROWING_PRE_SUBMIT`, // 代还信息确认页-点击确认按钮
	borrowingSubmitResult: `${prefix}_HOME_BORROWING_PRE_SUBMIT_RESULT`, // 代还信息确认页-点击确认按钮-结果事件
	informationMyselfFrontCard: `${prefix}_HOME_BASE_INFO_FRONT_CARD`, // 实名认证页-点击拍摄身份证正面
	informationMyselfBackCard: `${prefix}_HOME_BASE_INFO_BACK_CARD`, // 实名认证页-点击拍摄身份证反面
	informationTapNameInp: `${prefix}_HOME_BASE_INFO_USERNAME`, // 实名认证页-点击姓名输入框
	informationTapIDInp: `${prefix}_HOME_BASE_INFO_IDCARD`, // 实名认证页-点击身份证号输入框
	informationConfirm: `${prefix}_HOME_BASE_INFO_CONFIRM`, // 实名认证页-确定按钮
	basicInfoBury: `${prefix}_HOME_BASE_INFO_BURY`, // 基本信息输入框下拉框埋点
	basicInfoComplete: `${prefix}_HOME_BASICINFO_COMPLETE`, // 基本信息页-确定按钮
	landingPage: `${prefix}_HOME_LANDING_PAGE`, // 落地页
	bannerClick: `${prefix}_HOME_BANNER_CLICK`, // 点击banner
	cardResult: `${prefix}_HOME_CARD_RESULT`, // 信用卡提交结果埋点
	operatorResult: `${prefix}_HOME_OPERATOR_RESULT`, // 运营商提交结果埋点
	faceAuthResult: `${prefix}_HOME_FACEAUTH_RESULT`, // 人脸提交结果埋点
	downloadBtnClick: `${prefix}_DOWNLOAD_BTN_CLICK`, // 下载页点击按钮事件
	machineAudit: `${prefix}_RETURN_CARD_VIEWING_PROGRESS_MACHINE`, //机器审核
	quickLoan: `${prefix}_RETURN_CARD_VIEWING_PROGRESS_LOAN`, //快速放款
	signedLoan: `${prefix}_RETURN_CARD_VIEWING_PROGRESS_BORROWING`, //立即签约借款
	applyLoan: `${prefix}_RETURN_CARD_VIEWING_PROGRESS_APPLY`, //申请借钱还信用卡
	billImport: `${prefix}_RETURN_CARD_VIEWING_PROGRESS_IMPORT`, //账单导入
	billContinueImport: `${prefix}_RETURN_CARD_VIEWING_PROGRESS_CONTINUEIMPORT`, //继续导入信用卡账单
	continueRealInfo: `${prefix}_RETURN_CARD_VIEWING_PROGRESS_OPERATOR`, //继续确认身份信息
	selectCreditCardResult: `${prefix}_CARD_SELECTION_CARDSELECTION`, //选择信用卡_选卡结果
	addCreditCard: `${prefix}_CARD_SELECTION_NEWCARD`, //新增需要还款信用卡
	importOtherCreditCard: `${prefix}_ADD_SCHEDULE_CREDIT_CARDS`, //选择导入其他信用卡
	replaceCard: `${prefix}_APPLY_LOAN_CARD_REPLACEMENT`, //申请借钱还-更换卡
	gotIt: `${prefix}_QUICK_PAY_GOTIT`, //快速打款中-我知道了
	assessingBindCard: `${prefix}_RAPID_ASSESSMENT_BINDING_CARD`, //快速评估中-绑卡
	protocolSmsFail: `${prefix}_HOME_PROTOCOL_SMS_FAIL`, // 签约借款页协议绑卡校验失败埋点
	protocolBindFail: `${prefix}_HOME_PROTOCOL_BIND_FAIL`, // 签约借款页协议绑卡绑定失败埋点
	protocolBindBtnClick: `${prefix}_HOME_PROTOCOL_MODAL_BTN_CLICK`, // 签约借款页协议绑卡短验弹框按钮点击
	warningModalClose: `${prefix}_HOME_WARNING_MODAL_CLOSE`, // 签约借款-警示-关闭
	warningTips: `${prefix}_HOME_WARNING_TIPS`, // 签约借款-警示-继续申请借款-提示
	warningProtoClick: `${prefix}_HOME_WARNING_PROTOCOL_CLICK`, // 签约借款-警示-勾选协议
	loanBtnClick: `${prefix}_HOME_BORROWING_SUBMIT_BTN_CLICK`, // 签约借款-点击签约借款按钮 (只有代偿)
	loanApplyingClick: `${prefix}_HOME_LOAN_APPLYING_CLICK`, // 点击-首页-查看进度 放款申请提交中状态下首页卡片按钮点击

	dialogInformation: `${prefix}_QUESTION_FEEDBACK_BASIC_INFORMATION`,
	dialogInformation_wait: `${prefix}_QUESTION_FEEDBACK_BASIC_INFORMATION_CONTINUE`,
	dialogInformation_close: `${prefix}_QUESTION_FEEDBACK_BASIC_INFORMATION_CLOSE`,

	dialogMoxieBank: `${prefix}_QUESTION_FEEDBACK_BANK`,
	dialogMoxieBank_wait: `${prefix}_QUESTION_FEEDBACK_BANK_CONTINUE`,
	dialogMoxieBank_close: `${prefix}_QUESTION_FEEDBACK_BANK_CLOSE`,

	dialogLoanRepay: `${prefix}_QUESTION_FEEDBACK_APPLY`,
	dialogLoanRepay_wait: `${prefix}_QUESTION_FEEDBACK_APPLY_CONTINUE`,
	dialogLoanRepay_close: `${prefix}_QUESTION_FEEDBACK_APPLY_CLOSE`,

	feedModalOperator: `${prefix}_TIPS_OPERATORS_RETRIEVE`, //找回运营商密码
	feedModalInterbank: `${prefix}_TIPS_INTERNETBANK_RETRIEVE`, //找回信用卡密码
	feedModalSubmit: `${prefix}_TIPS_OTHERISSUES`, //反馈问题提交事件
	feedModalBtnClick: `${prefix}_TIPS_RISSUES`, //选择问题按钮点击总事件
	goSuperMarket: `${prefix}_HOME_GOTO_LOAN_SUPERMARKET`, //还卡-点击进入贷超页面按钮
	protocolAlertChange: `${prefix}_PROTOCOL_ALERT_CHANGE`,
	protocolAlertClose: `${prefix}_PROTOCOL_ALERT_CLOSE`,
	landingImgClick: `${prefix}_HOME_LANDING_IMG_CLICK`, // 落地页图片交互点击
	configModalShow: `${prefix}_HOME_CONFIG_MODAL_SHOW`, //活动配置弹窗show事件
	configModalJoinClick: `${prefix}_HOME_CONFIG_MODAL_JOIN_CLICK`, // 首页配置化弹框点击参与按钮
	configModalCloseClick: `${prefix}_HOME_CONFIG_MODAL_CLOSE_CLICK`, // 首页配置化弹框点击关闭按钮

	selectContactClick: `${prefix}_HOME_SELECT_CONTACT_CLICK`, // 签约借款-指定联系人-请选择/修改
	reContactConfirmClick: `${prefix}_HOME_RECOM_CONTACT_CONFIRM`, // 推荐联系人-确认
	reContactSaveClick: `${prefix}_HOME_RECOM_CONTACT_SAVE`, // 推荐联系人-确认(联系人列表不为空时,指定联系人确认按钮)
	speContactConfirmClick: `${prefix}_HOME_SPECIFY_CONTACT_CONFIRM`, // 联系人列表为空时,指定联系人确认按钮
	speContactSaveClick: `${prefix}_HOME_SPECIFY_CONTACT_SAVE`, // 修改联系人-保存
	reContactConfirmModify: `${prefix}_HOME_RECOM_CONTACT_MODIFY`, // 联系人列表不为空时,指定联系人-修改
	loanTipGetNowClick: `${prefix}_HOME_LOAN_TIP_GET_NOW`, // 签约借款-温馨提示-现在申请
	loanTipGetLaterClick: `${prefix}_HOME_LOAN_TIP_GET_LATER`, // 签约借款-温馨提示-稍后申请
	abTestbasicInfoA: `${prefix}_abTestbasicInfoA`, // 基本信息ab测试
	abTestbasicInfoB: `${prefix}_abTestbasicInfoB`, // 基本信息ab测试

	riskGuaranteeModalOk: `${prefix}_RISKGUARANTEE_MODAL_OK`, // 风险保障计划弹窗-ok
	riskGuaranteeModalCancel: `${prefix}_RISKGUARANTEE_MODAL_CANCEL`, // 风险保障计划弹窗-cancel
	riskGuaranteeModalChecked: `${prefix}_RISKGUARANTEE_MODAL_CHECKED`, // 风险保障计划弹窗-协议勾选
	riskGuaranteeModalPlanClick: `${prefix}_RISKGUARANTEE_MODAL_PLAN_CLICK`, // 风险保障计划弹窗-点击计划
	riskGuaranteePlanClick: `${prefix}_RISKGUARANTEE_PLAN_CLICK`, // 签约页-风险计划点击
	riskGuaranteeChangePlanText: `${prefix}_RISKGUARANTEE_CHANGE_PLAN_TEXT`, // 签约页-风险计划文本切换
	riskGuaranteeResultTry: `${prefix}_RISKGUARANTEE_RESULT_TRY_CLICK`, // 风险保障计划结果页-try
	riskGuaranteeResultBackHome: `${prefix}_RISKGUARANTEE_RESULT_BACKHOME_CLICK`, // 风险保障计划结果页-backhome
	repayPlanClick: `${prefix}_REPAY_PLAN_CLICK`, // 签约页-还款计划点击

	lendLoanBtnClick: `${prefix}_HOME_LEND_CONFIRM_LOAN_BTN`, // 点击-放款确认页-【立即放款至信用卡】
	lendSaveBtnClick: `${prefix}_HOME_LEND_CONFIRM_SAVE_BTN`, // 点击-放款确认页-【保留额度稍后借款】
	lendCheckDetail: `${prefix}_HOME_LEND_CONFIRM_CHECK_DETAIL` // 点击-放款确认页-【查看】
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
	creditExtensionFaceAuth: `${prefix}_MINE_CREDIT_EXTENSION_FACEAUTH`, // 风控授信项页 点击人脸识别认证
	creditExtensionZM: `${prefix}_MINE_CREDIT_EXTENSION_ZM`, // 风控授信项页 点击芝麻分认证
	protocolSmsFail: `${prefix}_MINE_PROTOCOL_SMS_FAIL`, // 绑定储蓄卡页协议绑卡校验失败埋点
	protocolBindFail: `${prefix}_MINE_PROTOCOL_BIND_FAIL` // 绑定储蓄卡页协议绑卡绑定失败埋点
};

const order = {
	repayment: `${prefix}_ORDER_DETAILS_REPAYMENT`, // 账单详情页-主动还款按钮
	repaymentFirst: `${prefix}_ORDER_DETAILS_REPAYMENT_FIRST`, // 账单详情页-付款详情-立即还款按钮
	returnHome: `${prefix}_ORDER_BACK_HOME`, // 还款完成页-返回首页按钮
	openNow: `${prefix}_ORDER_OPEN_NOW`, // 还款完成页-弹框里立即开启按钮
	closeModal: `${prefix}_ORDER_CLOSE_MODAL`, // 还款完成页-弹框里关闭按钮
	viewRepayInfoBtn: `${prefix}_VIEW_REPAYINFO_BTN`, // 查看还款信息按钮点击
	gotoRepayConfirmPage: `${prefix}_GOTO_REPAYCONFIRM_PAGE`, // 点击去还款确认页按钮
	repayConfirmSubmitBtn: `${prefix}_REPAYCONFIRM_SUBMITBTN`, // 确认还款按钮点击
	couponUseAlert_no: `${prefix}_COUPONUSEALERT_NO`, // 优惠券使用弹窗按钮点击
	couponUseAlert_yes: `${prefix}_COUPONUSEALERT_YES`, // 优惠券使用弹窗按钮点击
	repayResultStatus: `${prefix}_REPAYRESULT_STATUS`, // 还款完成页-还款状态
	continueRepayBtn: `${prefix}_CONTINUEREPAY_BTN`, // 结果页-继续还款按钮点击
	payAllOrderBtnClick: `${prefix}_PAYALL_BTN_CLICK`, // 一键结清按钮点击
	feesClick: `${prefix}_ORDER_DETAIL_FEES_CLICK`, // 账单勾选页-本金勾选
	riskFeesClick: `${prefix}_ORDER_DETAIL_RISKFEES_CLICK`, // 账单勾选页-风险保障金勾选
	splitOrderTipOk: `${prefix}_SPLIT_ORDER_TIP_OK`, // 账单勾选页-合并还款确认
	splitOrderTipCancel: `${prefix}_SPLIT_ORDER_TIP_CANCEL` // 账单勾选页-分单还款确认
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

const mpos_service_authorization = {
	auth_btn: `${prefix}_AUTH_PAGE_AUTH_BTN`,
	auth_page: `${prefix}_MPOS_AUTH_PAGE`
};

const activity = {
	newUserEntry: `${prefix}_NEW_USER_ACTIVITY_ENTRY`, // 拉新活动运营入口来源埋点
	couponEntry: `${prefix}_COUPON_ACTIVITY_ENTRY`, // 领取优惠券活动运营
	dazhuanpan_316_entry: `${prefix}_DAZHUANPAN_316_ACTIVITY_ENTRY`, // 316大转盘入口区分
	dazhuanpan_316_draw_result: `${prefix}_DAZHUANPAN_316_DRAW_RESULT`, // 316大转盘中奖情况
	jupeiEntry: `${prefix}_JUPEI_ACTIVITY_ENTRY`, //拒就赔活动
	funsisongEntry: `${prefix}_ACTIVITY_FUNSISONG_ENTRY`, // 放肆送活动入口
	couponBtnClick: `${prefix}_ACTIVITY_COUPON_GET`, // 放肆送活动领取按钮点击
	redBagBtnClick: `${prefix}_ACTIVITY_REDBAG_GET`, // 放肆送活动还信用卡赚钱按钮点击
	joinNowClick: `${prefix}_ACTIVITY_CHECK_COUPON`, // 放肆送活动弹框立即参与按钮点击
	checkCouponClick: `${prefix}_ACTIVITY_JOIN_NOW`, // 放肆送活动弹框查看优惠劵按钮点击
	homeModalBtnClick: `${prefix}_ACTIVITY_HOME_MODAL_CLICK`, // 放肆送活动中mpos 还到弹窗 点击
	mianxi418Entry: `${prefix}_ACTIVITY_MIANXI_418_ENTRY`, // 最高免息30天 活动入口
	mianxi418Btn: `${prefix}_ACTIVITY_MIANXI_418_BTN`, // 最高免息30天 按钮
	wenjuanEntry: `${prefix}_ACTIVITY_WENJUAN_ENTRY`, // 问卷入口
	wenjuanBtn: `${prefix}_ACTIVITY_WENJUAN_BTN`, // 问卷提交按钮
	wenjuanShare: `${prefix}_ACTIVITY_WENJUAN_SHARE`, // 问卷提交分享
	wenjuanHome: `${prefix}_ACTIVITY_WENJUAN_Home`, // 问卷去首页
	jjpEntry: `${prefix}_ACTIVITY_JUJIUPEI_ENTRY`, //拒就赔活动入口
	jjpGetBtn: `${prefix}_ACTIVITY_JUJIUPEI_GET_BTN`, //拒就赔领取按钮点击
	jjpMposConfirmBtn: `${prefix}_ACTIVITY_JUJIUPEI_MPOS_CONFIRM`, //拒就赔mpos中弹框确定按钮点击
	jjpWxConfirmBtn: `${prefix}_ACTIVITY_JUJIUPEI_WX_CONFIRM`, //拒就赔微信中弹框确定按钮点击
	jjpHomeModalClick: `${prefix}_ACTIVITY_JUJIUPEI_HOME_MODAL_CLICK`, //拒就赔首页弹框按钮点击
	brandEntry: `${prefix}_ACTIVITY_BRAND_ENTRY`, // 品牌活动入口
	brandBtnClick: `${prefix}_ACTIVITY_BRAND_TIYAN_BTN`, // 品牌活动还到体验按钮点击
	brandHomeModalClick: `${prefix}_ACTIVITY_BRAND_HOME_MODAL_CLICK`, // 品牌活动首页弹框开启生涯模式按钮点击
	fenqiHomeModalGoBtn: `${prefix}_FENQI_HOME_MODAL_GO_BTN`, //现金分期活动弹窗按钮点击
	fenqiHomeModalClose: `${prefix}_FENQI_HOME_MODAL_CLOSE`, //现金分期活动弹窗关闭
	mayReceiveBtn: `${prefix}_ACTIVITY_TWO_RECEIVE`, // 五月狂欢活动 畅想双重豪礼 领取 按钮
	mayExtractBtn: `${prefix}_ACTIVITY_TWO_EXTRACT`, // 五月狂欢活动 畅想双重豪礼 抽奖 按钮
	mayNewRecBtn: `${prefix}_ACTIVITY_NEW_ONEKEYCOLLECTION`, // 五月狂欢活动 新用户专享 一键领取 按钮
	mayNewRulesBtn: `${prefix}_ACTIVITY_NEW_ACTIVITYRULES`, // 五月狂欢活动 新用户专享 活动规则 按钮
	mayNewConfirmRecBtn: `${prefix}_ACTIVITY_NEW_RECEIVEIMMEDIATELY_CONFIRMRECEIPT`, // 五月狂欢活动 新用户专享-马上领取 确认领取 按钮
	mayNewUseNowBtn: `${prefix}_ACTIVITY_NEW_CONGRATULATIONS_USEIMMEDIATELY`, // 五月狂欢活动 新用户专享-恭喜您 马上使用 按钮
	mayNewToOldBtn: `${prefix}_ACTIVITY_NEW_SORRY_JUMP`, // 五月狂欢活动 新用户专享-抱歉 跳转老用户专享 按钮
	mayOldDrawBtn: `${prefix}_ACTIVITY_OLD_STARTRAFFLE`, // 五月狂欢活动 老用户专享-开始抽奖 按钮
	mayOldToNewBtn: `${prefix}_ACTIVITY_OLD_SORRY_JUMP`, // 五月狂欢活动 老用户专享-跳转新用户专享 按钮
	mayOldAuthTipsBtn: `${prefix}_ACTIVITY_OLD_TIPS_AUTHENTICATION`, // 五月狂欢活动 老用户专享-提示 填写认证资料 按钮
	mayOldNoPrizeBtn: `${prefix}_ACTIVITY_OLD_FRIENDSHIPTIPS_NOPRIZE`, // 五月狂欢活动 老用户专享-友情提示-奖品数量-知道了 按钮
	mayOldNoChanceBtn: `${prefix}_ACTIVITY_OLD_FRIENDSHIPTIPS_NOCHANCE`, // 五月狂欢活动 老用户专享-友情提示-抽奖机会-知道了 按钮
	mayOldUseNowBtn: `${prefix}_ACTIVITY_OLD_CONGRATULATIONS`, // 五月狂欢活动 老用户专享-恭喜你 立即使用 按钮
	mayOldRulesBtn: `${prefix}_ACTIVITY_OLD_ACTIVITYRULES`, // 五月狂欢活动 老用户专享 活动规则 按钮
	mayOldMyPrizeBtn: `${prefix}_ACTIVITY_OLD_MYPRIZE`, // 五月狂欢活动 老用户专享 我的奖品 按钮
	mayOldMyPrizeUseBtn: `${prefix}_ACTIVITY_OLD_MYPRIZE_IMMEDIATEUSE`, // 五月狂欢活动 老用户专享-我的奖品 立即使用 按钮
	mayJoinSuccess: `${prefix}_ACTIVITY_JOIN_SUCCESS`, // 五月狂欢活动 成功参与埋点（调用后台接口）
	koubeiEntry: `${prefix}_ACTIVITY_KOUBEI_ENTRY`, // 口碑活动入口来源
	koubeiBtnClick: `${prefix}_ACTIVITY_KOUBEI_TIYAN_BTN`, // 口碑活动还到体验按钮点击
	koubeiHomeOldModalClick: `${prefix}_ACTIVITY_KOUBEI_HOME_OLDMODAL_CLICK`, // 口碑活动首页老用户弹框
	koubeiHomeNewModalClick: `${prefix}_ACTIVITY_KOUBEI_HOME_NEWMODAL_CLICK`, // 口碑活动首页新用户弹框
	jd618Entry: `${prefix}_JD618_ENTRY`,
	freebillEntry: `${prefix}_FREEBILL_ENTRY`,
	jd618BtnClick: `${prefix}_ACTIVITY_JD618_BTN`,
	jd618ModalBtnClick: `${prefix}_ACTIVITY_JD618_MODAL_BTN`,
	freeBillBtnClick: `${prefix}_ACTIVITY_FREEBILL_BTN`,
	freeBillHomeModalClose: `${prefix}_FREEBILLHOMEMODALCLOSE`,
	mianxi715Entry: `${prefix}_ACTIVITY_MIANXI_715_ENTRY`, // 七月活动 活动入口
	mianxi715NewBtn: `${prefix}_ACTIVITY_MIANXI_715_NEW_GET_BTN`, // 七月活动 首贷用户领取按钮
	mianxi715OldBtn: `${prefix}_ACTIVITY_MIANXI_715_OLD_GET_BTN`, // 七月活动 复贷用户领取按钮
	mianxi715NewPrizeBtn: `${prefix}_ACTIVITY_MIANXI_715_NEW_PRIZE_BTN`, // 七月活动 首贷用户奖品弹框按钮点击
	mianxi715OldPrizeBtn: `${prefix}_ACTIVITY_MIANXI_715_OLD_PRIZE_BTN`, // 七月活动 复贷用户奖品弹框按钮点击
	MposH5Channel: `${prefix}_MPOS_H5CHANNEL`, // 七月26活动 首页弹窗按钮点击
	mianxi822Entry: `${prefix}_ACTIVITY_MIANXI_822_ENTRY`, // 100元利息红包限时领活动 活动入口
	mianxi822UseBtn: `${prefix}_ACTIVITY_MIANXI_822_USE_BTN`, // 100元利息红包限时领活动 领取按钮
	mianxi822ModalUseBtn: `${prefix}_ACTIVITY_MIANXI_822_MODAL_USE`, // 100元利息红包限时领活动 弹窗-去使用
	mianxi822ModalJoinBtn: `${prefix}_ACTIVITY_MIANXI_822_MODAL_JOIN`, // 100元利息红包限时领活动 弹窗-去参与
	mianxi822LoginBtn: `${prefix}_ACTIVITY_MIANXI_822_LOGIN_BTN`, // 100元利息红包限时领活动 注册弹窗-确定
	newUserActivityEntry: `${prefix}_ACTIVITY_NEWUSERS_ENTRY`, // 重启新手活动 进入入口
	newUserActivityUseNow: `${prefix}_ACTIVITY_NEWUSERS_USE_NOW`, // 重启新手活动 点击已领取去使用
	newUserActivityGetNow: `${prefix}_ACTIVITY_NEWUSERS_GET_NOW`, // 重启新手活动 点击立即领取
	couponTestActivityEntry: `${prefix}_ACTIVITY_COUPONTEST_ENTRY`, // 还款券测试 进入入口
	couponTestActivityUseNow: `${prefix}_ACTIVITY_COUPONTEST_USE_NOW`, // 还款券测试 点击已领取去使用
	couponTestModalJoinBtn: `${prefix}_ACTIVITY_COUPONTEST_MODAL_JOIN`, // 还款券测试 首页弹窗-收入囊中
	anXinActivityEntry: `${prefix}_ACTIVITY_ANXIN_ENTRY`, // 安心计划各个活动落地页 进入入口
	anXinActivityListGoClick: `${prefix}_ACTIVITY_ANXIN_LIST_GO`, // 安心计划活动列表页 go按钮的点击
	anXinActivityListDownLoadClick: `${prefix}_ACTIVITY_ANXIN_LIST_DOWNLOAD`, // 安心计划活动列表页 下载按钮的点击
	anXinActivityDetailJoinClick: `${prefix}_ACTIVITY_ANXIN_DETAIL_JOIN`, // 安心计划活动详情页 申请/参加活动按钮的点击
	anXinActivityDetailMoreClick: `${prefix}_ACTIVITY_ANXIN_DETAIL_MORE`, // 安心计划活动详情页 更多福利按钮的点击
	anXinActivityCouponCheckClick: `${prefix}_ACTIVITY_ANXIN_COUPON_NOTICE_CHECK`, // 安心计划首页优惠劵提示弹框 去查看按钮的点击
	anXinActivityCouponCloseClick: `${prefix}_ACTIVITY_ANXIN_COUPON_NOTICE_CLOSE`, // 安心计划首页优惠劵提示弹框  关闭按钮的点击
	rewardResultModalShow: `${prefix}_ACTIVITY_REWARD_RESULT_MODAL_SHOW`, //复贷活动15天弹窗
	rewardResultModalClick: `${prefix}_ACTIVITY_REWARD_RESULT_MODAL_CLICK`,
	rewardTipModalShow: `${prefix}_ACTIVITY_REWARD_TIP_MODAL_SHOW`, //复贷活动还款提示弹窗
	rewardTipModalClose: `${prefix}_ACTIVITY_REWARD_TIP_MODAL_CLOSE`
};

const moxie_bank_list = {
	bankChooes: `${prefix}_CREDIT_BANK_CHOOES`, // 拉新活动运营入口来源埋点
	bankRefresh: `${prefix}_CREDIT_BANK_REFRESH` // 领取优惠券活动运营
};

const mpos_ioscontrol_page = {
	iosControlPageView: `${prefix}_MPOS_HD_WECHAT`, // mpos 管控页页面/mpos引流微信页面加载完成
	copySuccess: `${prefix}_COPY_SUCCESS` // mpos 管控页页面/mpos引流微信页面复制成功
};

const manualAudit = {
	order_button: `${prefix}_AWAITING_AUDIT_ORDER`, //等待人工审核-预约
	order_rule: `${prefix}_RESERVATION_MANPOWER_PROBLEM`, //人工审核-问题按钮
	order_time_9: `${prefix}_RESERVATION_MANPOWER_9`, //人工审核-时间
	order_time_11: `${prefix}_RESERVATION_MANPOWER_11`, //人工审核-时间
	order_time_13: `${prefix}_RESERVATION_MANPOWER_13`, //人工审核-时间
	order_time_15: `${prefix}_RESERVATION_MANPOWER_15`, //人工审核-时间
	order_time_17: `${prefix}_RESERVATION_MANPOWER_17`, //人工审核-时间
	order_submit: `${prefix}_RESERVATION_MANPOWER_CONFIRM`, //人工审核-提交按钮
	pageview: `${prefix}_RETURN_CARD_VIEWING_PROGRESS_MANUALAUDIT`, //人工审核
	follow_button: `${prefix}_AWAITING_AUDIT_FOLLOW` //等待人工审核-关注
};

const other = {
	mposDownloadPageAB: `${prefix}_MPOS_DOWNLOAD_PAGE_AB`, //页面埋点
	mposDownloadPage: `${prefix}_MPOS_DOWNLOAD_PAGE`, //页面埋点
	mposDownloadBtnClick: `${prefix}_MPOS_DOWNLOAD_BUTTON_CLICK`, //mpos下载页按钮点击事件
	outerDownloadBtnClick: `${prefix}_OUTER_DOWNLOAD_BUTTON_CLICK`, //外部下载页按钮点击事件
	previewMaintenance: `${prefix}_MAINTENANCE_PAGE`, //进入系统维护页面
	weixinDownloadPage: `${prefix}_WEIXIN_DOWNLOAD_PAGE`, //微信下载页pv
	weixinDownloadBtnClick: `${prefix}_WEIXIN_DOWNLOAD_BTN_CLICK`, //微信下载页按钮点击事件
	productIntroduceBtnClick: `${prefix}_PRODUCT_INTRODUCE_BTN_CLICK`, //产品介绍页按钮点击事件

	tfdStart: `${prefix}_TFD_START`, // 开始调用通付盾
	tfdInitStart: `${prefix}_TFD_INIT_START`, // 通付盾开始加载js
	tfdInit: `${prefix}_TFD_INIT`, // 通付盾加载js
	tfdCallback: `${prefix}_TFD_CALLBACK` // 通付盾回调执行
};

const daicao = {
	loginBtn: `${prefix}_DAICAO_LOGIN_BTN`, //代超登录按钮
	loginPageTime: `${prefix}_DAICAO_LOGINPAGE_DURATION_TIME`, //代超登录页停留时间
	downloadPageTime: `${prefix}_DAICAO_DOWNLOADPAGE_DURATION_TIME`, // 代超下载页停留时间
	downloadBtnClick: `${prefix}_DAICAO_DOWNLOAD_BUTTON_CLICK`, //代超下载页按钮
	downloadPageView: `${prefix}_DAICAO_DOWNLOAD_PAGEVIEW`, //代超下载页pageview
	smsCodeBtnClick: `${prefix}_DAICAO_GET_SMSCODE_BTN`, // 贷超登录页获取验证码按钮
	modalBtnClick: `${prefix}_DAICAO_MODAL_BTN`, // 贷超登录页弹框按钮
	selectProtocol: `${prefix}_DAICAO_SELECT_PROTOCOL`, // 贷超登录页勾选协议
	mpos_push_loginBtn: `${prefix}_DAICAO_MPOS_PUSH_LOGIN_BTN`,
	mpos_push_modalBtnClick: `${prefix}_DAICAO_MPOS_PUSH_LOGIN_MODALBTN_CLICK`,
	mpos_push_modalshow: `${prefix}_DAICAO_MPOS_PUSH_LOGIN_MODAL_SHOW`
};

const loan_fenqi = {
	day30: `${prefix}_FENQI_DATE_DAY_30`,
	month3: `${prefix}_FENQI_DATE_MONTH_3`,
	month6: `${prefix}_FENQI_DATE_MONTH_6`,
	month9: `${prefix}_FENQI_DATE_MONTH_9`,
	month12: `${prefix}_FENQI_DATE_MONTH_12`,
	moneyBlur: `${prefix}_FENQI_MONEY_BLUR`,
	repayPlan: `${prefix}_FENQI_REPAY_PLAN`,
	resaveCard: `${prefix}_FENQI_RESAVECARD`,
	payCard: `${prefix}_FENQI_PAYCARD`,
	contract: `${prefix}_FENQI_CONTRACT`,
	clickSubmit: `${prefix}_FENQI_CLICK_SUBMIT`,
	submitResult: `${prefix}_FENQI_SUBMIT_RESULT`,
	fenqiGoBack: `${prefix}_FENQI_GO_BACK`,
	fenqiDownload: `${prefix}_FENQI_DOWNLOAD_CLICK`,
	fenqiHomeApplyBtn: `${prefix}_FENQI_HOME_APPLY_BTN`,
	protocolSmsFail: `${prefix}_FENQI_PROTOCOL_SMS_FAIL`, // 现金分期签约借款页协议绑卡校验失败埋点
	protocolBindFail: `${prefix}_FENQI_PROTOCOL_BIND_FAIL`, // 现金分期签约借款页协议绑卡绑定失败埋点
	protocolBindBtnClick: `${prefix}_FENQI_PROTOCOL_MODAL_BTN_CLICK` // 现金分期签约借款页协议绑卡短验弹框按钮点击
};

const wxTest = {
	wxTestDownPageTime: `${prefix}_WXTESTDOWNPAGETIME`, //下载页 页面时长
	wxTestLoginPageTime: `${prefix}_WXTESTLOGINPAGETIME`, // mpos登录页 页面时长
	wxTestMposLoginPageTime: `${prefix}_WXTESTMPOSLOGINPAGETIME`, // mpos登录页 页面时长
	btnClick_download: `${prefix}_BTNCLICK_DOWNLOAD`, //下载页 按钮点击
	btnClick_login: `${prefix}_BTNCLICK_LOGIN`, //mpos登录页 登录按钮点击
	sendSmsCodeMposClick: `${prefix}_SENDSMSCODEMPOSCLICK`, //mpos登录页 发送验证码次数
	wxTestLoginBtnClick: `${prefix}_WXTESTLOGINBTNCLICK`, // 登录页 按钮 点击次数
	wxTestLoginSmsCode: `${prefix}_WXTESTLOGINSMSCODE` //  登录页 发送验证码次数
};
const wxTabBar = {
	onlineService: `${prefix}_WX_ONLINE_SERVICE`, // 微信tab栏在线客服浏览次数
	helpCenterView: `${prefix}_WX_HELPCENTERVIEW`, // 微信tab栏常见问题浏览次数
	onlineBtnClick: `${prefix}_WX_ONLINEBTNCLICK` // 微信tab栏常见问题里面在线客服点击次数
};
const helpCenter = {
	feedback: `${prefix}_MINE_CREDIT_FEEDBACK`,
	select_class: `${prefix}_MINE_CLASSIFICATION_CHOICE`,
	submit_succ: `${prefix}_CLASSIFICATION_SUCCESSFUL_SUBMISSION`,

	fast_entry: `${prefix}_HELPCENTER_FASTENTRY`,
	hot_issue: `${prefix}_HELPCENTER_HOTISSUES`,
	classification: `${prefix}_HELPCENTER_CLASSIFICATION`,
	goOnline: `${prefix}_HELPCENTER_CONSULTATION`,

	realname: `${prefix}_REALNAME_CLICKQUESTION`,
	basic: `${prefix}_BASIC_CLICKQUESTION`,
	operators: `${prefix}_OPERATORS_CLICKQUESTION`,
	creditCard: `${prefix}_CREDIT_CARD_CLICKQUESTION`,
	submission: `${prefix}_SUBMISSION_CLICKQUESTION`,
	toexamine: `${prefix}_TOEXAMINE_CLICKQUESTION`,
	quota: `${prefix}_QUOTA_CLICKQUESTION`,
	repayment: `${prefix}_REPAYMENT_CLICKQUESTION`
};
const addinfo = {
	DC_ADDINFO_SUBMIT: `${prefix}_ADDINFO_SUBMIT`, // 补充信息下一步
	DC_ADDINFO_SUBMIT_RESULT: `${prefix}_ADDINFO_SUBMIT_RESULT`, // 补充信息下一步
	DC_ADDINFO_LOAD_YELLOW_CARD: `${prefix}_ADDINFO_LOAD_YELLOW_CARD` // 加载黄卡成功
};

const miniprogram = {
	loginBtnClick: `${prefix}_LOGIN_BTN_CLICK`, // 登录按钮点击数
	copyModalShow: `${prefix}_COPY_MODAL_SHOW`, // 弹窗浏览数
	copyModalBtnClick: `${prefix}_COPY_MODAL_BTN_CLICK` // 弹窗按钮点击数
};

const preApproval = {
	// 预授信补充联系人返回
	addContractBack: `${prefix}_YSX_ADDCONTRACT_BACK`,
	// 预授信补充联系人选择关系1
	addContractRelation1: `${prefix}_YSX_ADDCONTRACT_RELATION1`,
	// 预授信补充联系人选择关系2
	addContractRelation2: `${prefix}_YSX_ADDCONTRACT_RELATION2`,
	// 预授信补充联系人协议勾选
	addContractCheckbox: `${prefix}_YSX_ADDCONTRACT_CHECKBOX`,
	// 预授信补充联系人提交
	addContractSubmit: `${prefix}_YSX_ADDCONTRACT_SUBMIT`,
	// 预授信补充联系人提交结果
	addContractSubmitResult: `${prefix}_YSX_ADDCONTRACT_SUBMIT_RESULT`,
	// 预授信补充联系人输入框下拉框埋点
	addContractBury: `${prefix}_YSX_ADDCONTRACT_BURY`
};

const preLoan = {
	// 内/外-预授信-首页-去借钱
	homeLoanBtn: `${prefix}_YSX_HOME_LOAN_BTN`,
	// 内/外-预授信-首页-放款中
	homeLoaningBtn: `${prefix}_YSX_HOME_LOANING_BTN`,
	// 内/外-预授信-首页-去还款
	homePrePayBtn: `${prefix}_YSX_HOME_PAY_BTN`,
	// 内/外-预授信-首页-被拒绝
	homePreRefuseBtn: `${prefix}_YSX_HOME_REFUSE_BTN`,
	// 内/外-预授信-签约借款-返回
	loanPageBack: `${prefix}_YSX_LOAN_PAGE_BACK`,
	// 内/外-预授信-签约借款-借款金额 失焦后上报借款金额
	loanAmtInputBlur: `${prefix}_YSX_LOAN_AMT_INPUT_BLUR`,
	// 内/外-预授信-签约借款-借多久
	loanTermClick: `${prefix}_YSX_LOAN_TERM_CLICK`,
	// 内/外-预授信-签约借款- 1期 3期 6期 9期 12期
	loanDateMonth1: `${prefix}_YSX_LOAN_DATE_MONTH_1`,
	loanDateMonth3: `${prefix}_YSX_LOAN_DATE_MONTH_3`,
	loanDateMonth6: `${prefix}_YSX_LOAN_DATE_MONTH_6`,
	loanDateMonth9: `${prefix}_YSX_LOAN_DATE_MONTH_9`,
	loanDateMonth12: `${prefix}_YSX_LOAN_DATE_MONTH_12`,
	// 内/外-预授信-签约借款-还款计划
	loanRepayPlan: `${prefix}_YSX_LOAN_REPAY_PLAN`,
	// 内/外-预授信-签约借款-收款银行卡
	loanResaveCard: `${prefix}_YSX_LOAN_RESAVE_CARD`,
	// 内/外-预授信-签约借款-还款银行卡
	loanPayCard: `${prefix}_YSX_LOAN_PAY_CARD`,
	// 内/外-预授信-签约借款-协议勾选
	loanProtocolSelect: `${prefix}_YSX_LOAN_PROTOCOL_SELECT`,
	// 内/外-预授信-签约借款-签约借款按钮点击
	loanSignBtn: `${prefix}_YSX_LOAN_SIGN_BTN`,
	// 内/外-预授信-签约结果
	loanSignResult: `${prefix}_YSX_LOAN_SIGN_RESULT`
};
const H5CHANNEL_TEST = {
	href: `${prefix}_H5CHANNEL_TEST_HREF`,
	auth: `${prefix}_H5CHANNEL_TEST_auth`,
	noauth: `${prefix}_H5CHANNEL_TEST_noauth`,
	loginhref: `${prefix}_H5CHANNEL_TEST_loginhref`,
	loginWillS: `${prefix}_H5CHANNEL_TEST_loginWillS`,
	loginWillE: `${prefix}_H5CHANNEL_TEST_loginWillE`
};

export {
	H5CHANNEL_TEST,
	login,
	home,
	mine,
	order,
	membership,
	bugLog,
	mpos_service_authorization,
	activity,
	moxie_bank_list,
	mpos_ioscontrol_page,
	loan_fenqi,
	other,
	daicao,
	manualAudit,
	wxTest,
	helpCenter,
	wxTabBar,
	addinfo,
	miniprogram,
	preApproval,
	preLoan
};

export const DC_PAYCARD = `${prefix}_PAYCARD`; // 代偿-还款银行卡
