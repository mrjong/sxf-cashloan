/*
 * @Author: shawn
 * @LastEditTime : 2020-02-05 14:09:08
 */
/*
 * @Author: shawn
 * @LastEditTime : 2019-12-18 12:01:42
 */
import { handleActions } from 'redux-actions';

import { SPECIAL_SHOW_RED_DOT, SPECIAL_CLEAR_STATE, SPECIAL_MSG_COUNT } from '../constants/specialConstants';
const initState = { showRedDot: 0 };
export default handleActions(
	{
		[SPECIAL_MSG_COUNT]: (state, action) => ({ ...state, ...action.payload }),
		[SPECIAL_SHOW_RED_DOT]: (state, action) => ({ ...state, ...action.payload }),
		[SPECIAL_CLEAR_STATE]: () => ({})
	},
	initState
);
