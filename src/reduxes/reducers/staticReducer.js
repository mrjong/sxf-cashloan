/*
 * @Author: shawn
 * @LastEditTime : 2020-02-05 14:08:56
 */
/*
 * @Author: shawn
 * @LastEditTime : 2019-12-18 12:01:42
 */
import { handleActions } from 'redux-actions';

import {
	STATIC_USER_INFO,
	STATIC_PROTOCOL_PREVIEW_INFO,
	STATIC_CLEAR_STATE,
	STATIC_AUTH_ID
} from '../constants/staticConstants';
const initState = { userInfo: {} };
export default handleActions(
	{
		[STATIC_USER_INFO]: (state, action) => ({ ...state, ...action.payload }),
		[STATIC_PROTOCOL_PREVIEW_INFO]: (state, action) => ({ ...state, ...action.payload }),
		[STATIC_AUTH_ID]: (state, action) => ({ ...state, ...action.payload }),
		[STATIC_CLEAR_STATE]: () => ({})
	},
	initState
);
