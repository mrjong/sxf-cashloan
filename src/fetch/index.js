import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { Toast } from 'antd-mobile';
import { SXFToast } from 'utils/SXFToast';
import { store } from 'utils/store';
import { isWXOpen, handleErrorLog, pagesIgnore } from 'utils';
// import { singleLoading } from './util';

const fetchInit = () => {
	let num = 0;
	let timer = null;
	let timerList = [];
	fetch.init({
		timeout: 10000, // 默认超时
		baseURL: '/wap', // baseurl
		onShowErrorTip: (err, errorTip) => {
			// Toast.info('系统开小差，请稍后重试');
			setTimeout(() => {
				if (errorTip) Toast.fail('系统开小差，请稍后重试');
			}, 0);
		},
		onShowSuccessTip: (response, successTip) => {
			switch (response.data.msgCode) {
				case 'PTM0000':
					return;
				case 'PTM1000': // 用户登录超时
					handleErrorLog('PTM1000', '登录超时，请重新登陆');
					if (pagesIgnore(window.location.pathname)) {
						return;
					}
					Toast.info('登录超时，请重新登陆');
					setTimeout(() => {
						window.ReactRouterHistory.replace('/login');
					}, 3000);
					return;
				case 'PTM0100': // 未登录
					handleErrorLog('PTM0100', '未登录');
					if (pagesIgnore(window.location.pathname)) {
						return;
					}
					Toast.info('请先登录');
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
				Cookie.remove('fin-v-card-token-wechat');
			}
			// const TOKEN = Cookie.get('fin-v-card-token');
			// TODO: 这里tocken 不能从 cookie 取值 因为目前它永远有效
			let tokenFromStorage = '';
			tokenFromStorage = store.getToken();
			if (tokenFromStorage && !location.pathname.indexOf('activity') > -1) {
				cfg.headers['fin-v-card-token'] = tokenFromStorage;
			} else if (location.pathname.indexOf('activity') > -1) {
				cfg.headers['fin-v-card-token'] = Cookie.get('fin-v-card-token');
			} else {
				cfg.headers['fin-v-card-token'] = '';
			}
			num++;
			if (!cfg.hideLoading) {
				// 防止时间短，出现loading 导致闪烁
				timer = setTimeout(() => {
					// 处理多个请求，只要一个loading
					if (timerList.length > 1) {
						return;
					}
					SXFToast.loading('数据加载中...', 10);
				}, 300);
				timerList.push(timer);
			}
			return cfg;
		},
		(error) => {
			Promise.reject(error);
		}
	);
	// 拦截响应
	fetch.axiosInstance.interceptors.response.use(
		(response) => {
			num--;
			if (num <= 0) {
				if (timer) {
					for (let i = 0; i < timerList.length; i++) {
						clearTimeout(timerList[i]);
					}
					timer = null;
					timerList = [];
					SXFToast.hide();
				}
			} else {
				SXFToast.loading('数据加载中...', 10);
			}
			return response;
		},
		(error) => {
			// 有响应则取status,statusText，超时则取error.message
			try {
				console.log('----异常日志----');
				if (error.response) {
					handleErrorLog(error.response.status, error.response.statusText, error.config);
				} else if (error.config) {
					handleErrorLog(error.message, error.message, error.config);
				}
			} catch (err) {
				// console.log(err)
			}

			num--;
			for (let i = 0; i < timerList.length; i++) {
				clearTimeout(timerList[i]);
			}
			timer = null;
			timerList = [];
			SXFToast.hide();
			let error2 = new Error('系统开小差，请稍后重试');
			return Promise.reject(error2);
		}
	);
};

export default fetchInit;
