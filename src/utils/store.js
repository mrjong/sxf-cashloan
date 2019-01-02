// 本地存储
import { localList, sessionList } from './storeTypes';

const { localStorage, sessionStorage } = window;

let STORAGE_METHOD = localStorage

const storageUtil = {
  setItem(key, value) {
    STORAGE_METHOD.setItem(key, JSON.stringify(value));
  },
  getItem(key) {
    const value = STORAGE_METHOD.getItem(key);
    return JSON.parse(value);
  },
  clear() {
    STORAGE_METHOD.clear();
  },
  removeItem(key) {
    STORAGE_METHOD.removeItem(key);
  },
  multiGet(keys) {
    const values = {};
    keys.forEach(key => {
      values[key] = this.getItem(key);
    });
    return values;
  },
  multiRemove(keys) {
    keys.forEach(key => this.removeItem(key));
  },
}

let store = {};
// 本地存储工厂函数，生成 set get remove 方法
const storeFactory = (funcName, key, storeType = 'local') => {
  STORAGE_METHOD = storeType === 'local' ? localStorage : sessionStorage
  store[`set${funcName}`] = data => {
    storageUtil.setItem(key, data);
  };
  store[`get${funcName}`] = () => storageUtil.getItem(key);
  store[`remove${funcName}`] = () => storageUtil.removeItem(key);
};

// 循环添加 local 存储方法
for (let funName in localList) {
  storeFactory(funName, localList[funName], 'local');
}

// 循环添加 session 存储方法
for (let funName in sessionList) {
  storeFactory(funName, sessionList[funName], 'session');
}

export { store };
