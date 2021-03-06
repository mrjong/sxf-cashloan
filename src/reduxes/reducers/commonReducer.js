/*
 * @Author: shawn
 * @LastEditTime: 2020-04-28 10:51:36
 */
import { handleActions } from 'redux-actions';

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
 * @description: commonState 初始化
 * @param {type}
 * @return:
 */
const initState = {
	homeModal: {},
	withdrawCardData: {},
	withholdCardData: {},
	cardType: '',
	confirmAgencyInfo: {},
	couponData: {},
	saveContact: {},
	cacheContact: {},
	nextStepStatus: false,
	homeData: {},
	bannerList: [],
	welfareList: {},
	overdueModalInfo: {},
	applyCreditData: {},
	backRouter: '',
	msgCount: 0,
	bindDepositInfo: {},
	iframeProtocolData: {},
	preLoanData: {},
	credictInfo: {},
	routerType: ''
};
export default handleActions(
	{
		[COMMON_CARD_TYPE]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_WITHDRAW_CARD_DATA]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_WITHHOLD_CARD_DATA]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_CONFIRM_AGENCY_INFO]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_HOMEMODAL]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_COUPON_DATA]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_SAVE_CONTACT]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_NEXT_STEP_STATUS]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_BACK_ROUTER]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_HOME_DATA]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_HOME_BANNER_LIST]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_WELFARE_LIST]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_OVERDUE_MODAL_INFO]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_APPLY_CREDIT_DTATA]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_BIND_DEPOSIT_INFO]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_PROTOCOL_SELECT_FLAG]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_IFRAME_PROTOCOL_SHOW]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_PRE_LOAN_DATA]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_CREDICT_INFO]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_ROUTER_TYPE]: (state, action) => ({ ...state, ...action.payload }),
		[COMMON_CLEAR_STATE]: () => ({})
	},
	initState
);
