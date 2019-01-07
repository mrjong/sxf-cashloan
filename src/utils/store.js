// 本地存储
import { storeTypes } from './storeTypes';
import { isBugBrowser } from 'utils';

const { localStorage, sessionStorage } = window;
// 默认使用sessionstorage
let STORAGE_METHOD = sessionStorage;
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
		keys.forEach((key) => {
			values[key] = this.getItem(key);
		});
		return values;
	},
	multiRemove(keys) {
		keys.forEach((key) => this.removeItem(key));
	}
};

let store = {};
// 需要区别对待的存储字段
let list = [ 'Token', 'JumpUrl', 'H5Channel' ];
// 本地存储工厂函数，生成 set get remove 方法(优先使用sessionstorage)
const storeFactory = (funcName, key) => {
	STORAGE_METHOD = isBugBrowser() && list.includes(funcName) ? localStorage : sessionStorage;
	store[`set${funcName}`] = (data) => {
		storageUtil.setItem(key, data);
	};
	store[`get${funcName}`] = () => storageUtil.getItem(key);
	store[`remove${funcName}`] = () => storageUtil.removeItem(key);
};

// 循环添加存储方法(包括local session)
for (let funName in storeTypes) {
	storeFactory(funName, storeTypes[funName]);
}

store['newType'] = ({ key, value }, type) => {
	if (type === 'get') {
		let value2 = localStorage.getItem(key);
		return JSON.parse(value2);
	} else if (type === 'remove') {
		localStorage.removeItem(key);
	} else {
		STORAGE_METHOD.setItem(key, JSON.stringify(value));
	}
};

export { store };
