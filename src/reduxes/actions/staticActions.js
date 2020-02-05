/*
 * @Author: shawn
 * @LastEditTime : 2019-12-31 11:26:13
 */
import { createAction } from 'redux-actions';
import { store } from '@/utils/store';
import { STATIC_TOAST_STATE, STATIC_MODAL_STATE, STATIC_USER_INFO, STATIC_CLEAR_STATE, STATIC_AUTH_ID } from '../constants';

/**
 * 设置用户信息;
 */
export const setUserInfoAction = createAction(STATIC_USER_INFO, info => {
  // 保存最新用户信息
  store.setUserInfo(info);
  return { userInfo: info || {} };
});
/**
 * toast显示状态;
 */
export const toastAction = createAction(STATIC_TOAST_STATE, info => ({ toast: info || {} }));

/**
 * modal显示状态
 */
export const modalAction = createAction(STATIC_MODAL_STATE, info => ({ modal: info || {} }));

/**
 * 清除所有static
 */
export const staticClearState = createAction(STATIC_CLEAR_STATE, info => {});

/**
 * @description: 选择卡id
 * @param {type}
 * @return:
 */
export const setAuthId = createAction(STATIC_AUTH_ID, info => ({ authId: info || {} }));
