/*
 * @Author: shawn
 * @LastEditTime : 2020-02-05 14:27:00
 */
/*eslint-disable*/
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers, { injectStore } from 'reduxes/reducers';

const finalCreateStore = compose(applyMiddleware(thunk))(createStore);
let store;
// window.devToolsExtension ? window.devToolsExtension() : f => f,
store = finalCreateStore(reducers);
store.subscribe(() => {
  console.log('[LOG--]', store.getState());
});
// 注入到reducer中
injectStore(store);
export default store;
