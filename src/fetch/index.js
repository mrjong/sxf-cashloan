import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { Toast } from 'antd-mobile';
import { store } from 'utils/store';
import { isWXOpen, pagesIgnore } from 'utils';
import Raven from 'raven-js';
import baseUrl from './baseUrlConf';

const fetchInit = () => {
	fetch.init({
		timeout: 10000, // 默认超时
		baseURL: baseUrl, // baseurl
		onShowErrorTip: (err, errorTip) => {
			console.log(err);
			setTimeout(() => {
				if (errorTip) Toast.fail('系统开小差，请稍后重试');
			}, 0);
		},
		onShowSuccessTip: (response) => {
			switch (response.data.code) {
				case '000000':
					return;
				// 重复请求
				case '999992':
					Toast.info(response.data.message);
					return;
				case '999997': // 未登录
					Raven.captureException(response.config.url, {
						extra: { code: '999997', message: '未登录' },
						level: 'info'
					});
					if (pagesIgnore(window.location.pathname)) {
						return;
					}
					Toast.info('未登录或登录超时，请重新登录');
					setTimeout(() => {
						window.ReactRouterHistory.replace('/login');
					}, 3000);
					return;
				default:
			}
		}
	});
	// 拦截请求
	fetch.axiosInstance.interceptors.request.use(
		(cfg) => {
			// 非微信去掉 fn-v-card-token-wechat
			if (!isWXOpen()) {
				Cookie.remove('FIN-HD-WECHAT-TOKEN');
			}
			// const TOKEN = Cookie.get('FIN-HD-AUTH-TOKEN');
			// TODO: 这里tocken 不能从 cookie 取值 因为目前它永远有效
			let tokenFromStorage = '';
			tokenFromStorage = store.getToken();
			if (tokenFromStorage && !location.pathname.indexOf('activity') > -1) {
				cfg.headers['FIN-HD-AUTH-TOKEN'] = tokenFromStorage;
			} else if (location.pathname.indexOf('activity') > -1) {
				cfg.headers['FIN-HD-AUTH-TOKEN'] = Cookie.get('FIN-HD-AUTH-TOKEN');
			} else {
				cfg.headers['FIN-HD-AUTH-TOKEN'] = '';
			}
			return cfg;
		},
		(error) => {
			Promise.reject(error);
		}
	);
	let isGoToLogin = false;
	// 拦截响应
	fetch.axiosInstance.interceptors.response.use(
		(response) => {
			return response;
		},
		(error) => {
			const { response = {}, message } = error;
			console.log(error.response);
			if (response && response.status === 401 && response.config) {
				if (isGoToLogin) {
					return;
				}
				// 防止多个提示
				isGoToLogin = true;
				Toast.info('未登录或登录超时，请重新登录');
				setTimeout(() => {
					isGoToLogin = false;
					window.ReactRouterHistory.replace('/login');
				}, 3000);
			} else if (message && message.canceled) {
				console.log('取消请求');
			} else if (response && response.config && response.config.hideToast) {
				console.log('hideToast  无需提示错误');
				return Promise.reject(error);
			} else {
				Toast.fail('系统开小差,请稍后重试');
				return Promise.reject('系统开小差,请稍后重试');
			}
		}
	);
};

export default fetchInit;
