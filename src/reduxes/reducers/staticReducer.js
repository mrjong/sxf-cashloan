/*
 * @Author: shawn
 * @LastEditTime: 2020-03-23 14:04:12
 */
/*
 * @Author: shawn
 * @LastEditTime : 2019-12-18 12:01:42
 */
import { handleActions } from 'redux-actions';

import {
	STATIC_USER_INFO,
	STATIC_CLEAR_STATE,
	STATIC_AUTH_ID,
	STATIC_CACHE_CONTACT
} from '../constants/staticConstants';
const initState = { userInfo: {} };
export default handleActions(
	{
		[STATIC_USER_INFO]: (state, action) => ({ ...state, ...action.payload }),
		[STATIC_AUTH_ID]: (state, action) => ({ ...state, ...action.payload }),
		[STATIC_CLEAR_STATE]: () => ({}),
		[STATIC_CACHE_CONTACT]: (state, action) => ({ ...state, ...action.payload })
	},
	initState
);
