/*
 * @Author: shawn
 * @LastEditTime : 2020-02-05 10:54:00
 */
/*
 * @Author: shawn
 * @LastEditTime : 2019-12-18 12:01:35
 */
import { combineReducers } from 'redux';
import * as staticReducer from './staticReducer';
import * as commonReducer from './commonReducer';
import * as specialReducer from './specialReducer';

let obj = { ...staticReducer, ...commonReducer, ...specialReducer },
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
