/*
 * @Author: shawn
 * @LastEditTime: 2020-03-02 09:15:24
 */
import { createAction } from 'redux-actions';
import { STATIC_USER_INFO, STATIC_CLEAR_STATE, STATIC_AUTH_ID } from '../constants/staticConstants';

/**
 * 设置用户信息;
 */
export const setUserInfoAction = createAction(STATIC_USER_INFO, (info) => {
	// 保存最新用户信息
	// store.setUserInfo(info);
	return { userInfo: info || {} };
});
/**
 * 清除所有static
 */
export const staticClearState = createAction(STATIC_CLEAR_STATE, () => {});

/**
 * @description: 选择卡id
 * @param {type}
 * @return:
 */
export const setAuthId = createAction(STATIC_AUTH_ID, (info) => ({ authId: info || {} }));
