/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-04-28 10:50:46
 */
// 这些要求这种备注，方便reducer直接查看
/**
 * @description: 选择银行卡的类型 withdraw:收款银行卡 withhold:还款银行卡 both:收款银行卡&还款银行卡
 * @param {type}
 * @return:
 */
export const COMMON_CARD_TYPE = 'COMMON_CARD_TYPE';
/**
 * @description: 收款银行卡信息
 * @param {type}
 * @return:
 */
export const COMMON_WITHDRAW_CARD_DATA = 'COMMON_WITHDRAW_CARD_DATA';
/**
 * @description: 还款银行卡信息
 * @param {type}
 * @return:
 */
export const COMMON_WITHHOLD_CARD_DATA = 'COMMON_WITHHOLD_CARD_DATA';
/**
 * @description: 签约借款页面信息
 * @param {type}
 * @return:
 */
export const COMMON_CONFIRM_AGENCY_INFO = 'COMMON_CONFIRM_AGENCY_INFO';
/**
 * @description: 优惠劵信息
 * @param {type}
 * @return:
 */
export const COMMON_COUPON_DATA = 'COMMON_COUPON_DATA';
/**
 * @description: 清除所有common
 * @param {type}
 * @return:
 */
export const COMMON_CLEAR_STATE = 'COMMON_CLEAR_STATE';

/**
 * @description: 首页弹窗
 * @param {type}
 * @return:
 */
export const COMMON_HOMEMODAL = 'COMMON_HOMEMODAL';

/**
 * @description: 保存选中联系人信息
 * @param {type}
 * @return:
 */
export const COMMON_SAVE_CONTACT = 'COMMON_SAVE_CONTACT';

/**
 * @description: 缓存选中联系人信息
 * @param {type}
 * @return:
 */
export const COMMON_CACHE_CONTACT = 'COMMON_CACHE_CONTACT';
/**
 * @description: 授信是否需要下一步
 * @param {type}
 * @return:
 */
export const COMMON_NEXT_STEP_STATUS = 'COMMON_NEXT_STEP_STATUS';

/**
 * @description: 设置逾期弹窗相关
 * @param {type}
 * @return:
 */
export const COMMON_OVERDUE_MODAL_INFO = 'COMMON_OVERDUE_MODAL_INFO';
/**
 * @description: 返回那个页面
 * @param {type}
 * @return:
 */
export const COMMON_BACK_ROUTER = 'COMMON_BACK_ROUTER';

/**
 * @description: 首页数据缓存
 * @param {type}
 * @return:
 */
export const COMMON_HOME_DATA = 'COMMON_HOME_DATA';

/**
 * @description: 首页banner数据缓存
 * @param {type}
 * @return:
 */
export const COMMON_HOME_BANNER_LIST = 'COMMON_HOME_BANNER_LIST';
/**
 * @description: 首页福利专区数据缓存
 * @param {type}
 * @return:
 */
export const COMMON_WELFARE_LIST = 'COMMON_WELFARE_LIST';
/**
 * @description: 用户提交授信的信息
 * @param {type}
 * @return:
 */
export const COMMON_APPLY_CREDIT_DTATA = 'COMMON_APPLY_CREDIT_DTATA';
/**
 * @description: 绑定储蓄卡信息
 * @param {type}
 * @return:
 */
export const COMMON_BIND_DEPOSIT_INFO = 'COMMON_BIND_DEPOSIT_INFO';
/**
 * @description: 缓存协议勾选
 * @param {type}
 * @return:
 */
export const COMMON_PROTOCOL_SELECT_FLAG = 'COMMON_PROTOCOL_SELECT_FLAG';

/**
 * @description: 展示全局协议弹窗
 * @param {type}
 * @return:
 */
export const COMMON_IFRAME_PROTOCOL_SHOW = 'COMMON_IFRAME_PROTOCOL_SHOW';

/**
 * @description: 用户提交预授信借款的信息
 * @param {type}
 * @return:
 */
export const COMMON_PRE_LOAN_DATA = 'COMMON_PRE_LOAN_DATA';

/**
 * @description: 用户额度的相关信息
 * @param {type}
 * @return:
 */
export const COMMON_CREDICT_INFO = 'COMMON_CREDICT_INFO';

/**
 * @description: 页面跳转类型
 * @param {type}
 * @return:
 */
export const COMMON_ROUTER_TYPE = 'COMMON_ROUTER_TYPE';
