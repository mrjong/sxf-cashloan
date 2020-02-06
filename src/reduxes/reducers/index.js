/*
 * @Author: shawn
 * @LastEditTime : 2020-02-05 17:54:48
 */
/*
 * @Author: shawn
 * @LastEditTime : 2019-12-18 12:01:35
 */
import { combineReducers } from 'redux';
import staticReducer from './staticReducer';
import commonReducer from './commonReducer';
import specialReducer from './specialReducer';
//创建导航状态数据商店redux
let obj = { staticState: staticReducer, commonState: commonReducer, specialState: specialReducer },
	_store = null;

let rootReducer = combineReducers(obj);

const createReducers = (reducers, key) => {
	let newReducer = {};
	newReducer[key] = reducers;
	combineReducers(obj);
	obj = Object.assign(obj, newReducer);
	return combineReducers(obj);
};

export const injectReducer = (reducers, key) => {
	_store.replaceReducer(createReducers(reducers, key));
};

export const injectStore = (store) => (_store = store);

export default rootReducer;
