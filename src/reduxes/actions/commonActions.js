/*
 * @Author: shawn
 * @LastEditTime: 2020-04-28 10:50:18
 */
import { createAction } from 'redux-actions';
import {
	COMMON_CARD_TYPE,
	COMMON_WITHDRAW_CARD_DATA,
	COMMON_WITHHOLD_CARD_DATA,
	COMMON_CONFIRM_AGENCY_INFO,
	COMMON_CLEAR_STATE,
	COMMON_HOMEMODAL,
	COMMON_COUPON_DATA,
	COMMON_SAVE_CONTACT,
	COMMON_NEXT_STEP_STATUS,
	COMMON_OVERDUE_MODAL_INFO,
	COMMON_BACK_ROUTER,
	COMMON_HOME_DATA,
	COMMON_HOME_BANNER_LIST,
	COMMON_WELFARE_LIST,
	COMMON_APPLY_CREDIT_DTATA,
	COMMON_BIND_DEPOSIT_INFO,
	COMMON_PROTOCOL_SELECT_FLAG,
	COMMON_IFRAME_PROTOCOL_SHOW,
	COMMON_PRE_LOAN_DATA,
	COMMON_CREDICT_INFO,
	COMMON_ROUTER_TYPE
} from '../constants/commonConstants';

/**
 * @description: 设置选择银行卡的类型 withdraw:收款银行卡 withhold:还款银行卡
 * @param {type}
 * @return:
 */
export const setCardTypeAction = createAction(COMMON_CARD_TYPE, (info) => ({ cardType: info }));

/**
 * @description: 设置收款银行卡信息
 * @param {type}
 * @return:
 */
export const setWithdrawCardDataAction = createAction(COMMON_WITHDRAW_CARD_DATA, (info) => ({
	withdrawCardData: info
}));

/**
 * @description: 设置还款银行卡信息
 * @param {type}
 * @return:
 */
export const setWithholdCardDataAction = createAction(COMMON_WITHHOLD_CARD_DATA, (info) => ({
	withholdCardData: info
}));

/**
 * @description: 设置优惠劵信息
 * @param {type}
 * @return:
 */
export const setCouponDataAction = createAction(COMMON_COUPON_DATA, (info) => ({ couponData: info }));

/**
 * @description: 设置签约借款页面信息
 * @param {type}
 * @return:
 */
export const setConfirmAgencyInfoAction = createAction(COMMON_CONFIRM_AGENCY_INFO, (info) => ({
	confirmAgencyInfo: info
}));

/**
 * @description: 自动清除store状态
 * @param {type}
 * @return:
 */
export const commonClearState = createAction(COMMON_CLEAR_STATE, () => {});

/**
 * @description: 首页弹窗状态
 * @param {type}
 * @return:
 */
export const setHomeModalAction = createAction(COMMON_HOMEMODAL, (info) => ({ homeModal: info || {} }));

/**
 * @description: 保存选中联系人信息
 * @param {type}
 * @return:
 */
export const setSaveContactAction = createAction(COMMON_SAVE_CONTACT, (info) => ({
	saveContact: info || {}
}));

/**
 * @description: 授信是否需要下一步
 * @param {type}
 * @return:
 */
export const setNextStepStatus = createAction(COMMON_NEXT_STEP_STATUS, (info) => ({ nextStepStatus: info }));

/**
 * @description: 设置逾期弹窗相关
 * @param {type}
 * @return:
 */
export const setOverDueModalInfo = createAction(COMMON_OVERDUE_MODAL_INFO, (info) => ({
	overdueModalInfo: info
}));
/**
 * @description: 授信是否需要下一步
 * @param {type}
 * @return:
 */
export const setBackRouter = createAction(COMMON_BACK_ROUTER, (info) => ({ backRouter: info }));

/**
 * @description: 首页数据缓存
 * @param {type}
 * @return:
 */
export const setHomeData = createAction(COMMON_HOME_DATA, (info) => ({ homeData: info }));

/**
 * @description: 首页banner数据缓存
 * @param {type}
 * @return:
 */
export const setBannerList = createAction(COMMON_HOME_BANNER_LIST, (info) => ({ bannerList: info }));

/**
 * @description: 首页banner数据缓存
 * @param {type}
 * @return:
 */
export const setWelfareList = createAction(COMMON_WELFARE_LIST, (info) => ({ welfareList: info }));

/**
 * @description: 用户提交授信的信息
 * @param {type}
 * @return:
 */
export const setApplyCreditData = createAction(COMMON_APPLY_CREDIT_DTATA, (info) => ({
	applyCreditData: info
}));

/**
 * @description: 设置绑定储蓄卡页面信息
 * @param {type}
 * @return:
 */
export const setBindDepositInfoAction = createAction(COMMON_BIND_DEPOSIT_INFO, (info) => ({
	bindDepositInfo: info
}));

/**
 * @description: 设置协议勾选缓存
 * @param {type}
 * @return:
 */
export const setProtocolSelFlagAction = createAction(COMMON_PROTOCOL_SELECT_FLAG, (info) => ({
	protocolSelFlag: info
}));

/**
 * @description: 展示全局协议弹窗
 * @param {type}
 * @return:
 */
export const setIframeProtocolShow = createAction(COMMON_IFRAME_PROTOCOL_SHOW, (info) => ({
	iframeProtocolData: info
}));

/**
 * @description: 用户提交预授信借款的信息
 * @param {type}
 * @return:
 */
export const setPreLoanDataAction = createAction(COMMON_PRE_LOAN_DATA, (info) => ({ preLoanData: info }));

/**
 * @description: 用户额度的相关信息
 * @param {type}
 * @return:
 */
export const setCredictInfoAction = createAction(COMMON_CREDICT_INFO, (info) => ({ credictInfo: info }));

/**
 * @description: 页面跳转类型
 * @param {type}
 * @return:
 */
export const setRouterTypeAction = createAction(COMMON_ROUTER_TYPE, (info) => ({ routerType: info }));
