import qs from 'qs';
import { store } from 'utils/store';

// 获取h5Channel
export const getH5Channel = () => {
	const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
	const ua = navigator.userAgent;
	let h5Channel = '';
	if (queryData.h5Channel) {
		h5Channel = queryData.h5Channel;
	} else if (store.getH5Channel()) {
		h5Channel = store.getH5Channel();
	} else if (/SuiXingPay-Mpos/i.test(ua)) {
		h5Channel = 'MPOS';
	} else {
		h5Channel = 'OTHER';
	}
	return h5Channel;
};

export const getTestABTag = () => {
	return store.getTestABTag() || 'other';
};

// 判断是对内mpos还是对外
export const isMPOS = () => {
	const ua = navigator.userAgent;
	sessionStorage.setItem('isMPOS', /SuiXingPay-Mpos/i.test(ua) ? true : false);
	return /SuiXingPay-Mpos/i.test(ua) ? true : false;
};

// 设置h5Channel
export const setH5Channel = (channel) => {
	const queryData = qs.parse(location.search, { ignoreQueryPrefix: true });
	const ua = navigator.userAgent;
	const sessionH5Channel = store.getH5Channel();
	if (queryData.h5Channel) {
		store.setH5Channel(queryData.h5Channel);
	} else if (channel) {
		store.setH5Channel(channel);
	} else if (/SuiXingPay-Mpos/i.test(ua)) {
		store.setH5Channel('MPOS');
	} else if (sessionH5Channel) {
		store.setH5Channel(sessionH5Channel);
	} else {
		store.setH5Channel('OTHER');
	}
};

// 千分位展示 格式化
export const thousandFormatNum = (num) => {
	num = num + '';
	if (!num.includes('.')) {
		num += '.';
	}
	return num
		.replace(/(\d)(?=(\d{3})+\.)/g, function($0, $1) {
			return $1 + ',';
		})
		.replace(/\.$/, '');
};
