/*
 * @Author: shawn
 * @LastEditTime : 2020-02-05 13:41:06
 */
/*
 * @Author: shawn
 * @LastEditTime : 2019-12-18 15:07:06
 */
import { createAction } from 'redux-actions';

import { SPECIAL_SHOW_RED_DOT, SPECIAL_CLEAR_STATE, SPECIAL_MSG_COUNT } from '../constants/specialConstants';

/**
 * @description: tab是否显示红点
 * @param {type}
 * @return:
 */
export const showRedDot = createAction(SPECIAL_SHOW_RED_DOT, (info) => ({
	showRedDot: info || 0
}));
/**
 * @description: 清除状态
 * @param {type}
 * @return:
 */
export const specialClearState = createAction(SPECIAL_CLEAR_STATE, () => {});
/**
 * @description: 消息条数
 * @param {type}
 * @return:
 */
export const setMsgCount = createAction(SPECIAL_MSG_COUNT, (info) => ({ msgCount: info }));
