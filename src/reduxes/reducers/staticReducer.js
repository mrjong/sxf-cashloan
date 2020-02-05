/*
 * @Author: shawn
 * @LastEditTime : 2020-02-05 10:59:02
 */
/*
 * @Author: shawn
 * @LastEditTime : 2019-12-18 12:01:42
 */
import { handleActions } from 'redux-actions';

import { STATIC_USER_INFO, STATIC_CLEAR_STATE, STATIC_AUTH_ID } from '../constants';
const initState = { userInfo: {} };
export const staticState = handleActions(
	{
		[STATIC_USER_INFO]: (state, action) => ({ ...state, ...action.payload }),
		[STATIC_AUTH_ID]: (state, action) => ({ ...state, ...action.payload }),
		[STATIC_CLEAR_STATE]: () => ({})
	},
	initState
);
