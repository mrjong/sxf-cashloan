import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { Toast } from 'antd-mobile';
import pagesIgnore from 'utils/pagesIgnore';
import { store } from 'utils/store';
import { isBugBrowser, isWXOpen } from 'utils/common';
import handleErrorLog from './handleErrorLog.js'
import { buriedPointEvent } from 'utils/Analytins';
import { bug_log } from 'utils/AnalytinsType';

const fetchinit = () => {
	let timer;
	let timerList = [];
	let num = 0;
	// 拦截请求
	fetch.axiosInstance.interceptors.request.use(
		(cfg) => {
			// console.log(cfg);
			// 非微信去掉 fn-v-card-token-wechat
			if (!isWXOpen()) {
				Cookie.remove('fin-v-card-token-wechat');
			}
			// const TOKEN = Cookie.get('fin-v-card-token');
			// TODO: 这里tocken 不能从 cookie 取值 因为目前它永远有效
			let tokenFromStotage = '';
			if (isBugBrowser()) {
				tokenFromStotage = store.getToken();
			} else {
				tokenFromStotage = store.getTokenSession();
			}
			if (tokenFromStotage && !location.pathname.indexOf('activity') > -1) {
				cfg.headers['fin-v-card-token'] = tokenFromStotage;
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
					Toast.loading('数据加载中...', 10);
				}, 300);
				timerList.push(timer);
			}
			return cfg;
		},
		(error) => {
			console.log('sessionStorage:', sessionStorage);
			console.log('localStorage', localStorage);
			console.log('cookie', document.cookie);
			Promise.reject(error);
		}
	);
	// 响应拦截
	fetch.axiosInstance.interceptors.response.use(
		(response) => {
			num--;
			if (num <= 0) {
				if (timer) {
					for (let i = 0; i < timerList.length; i++) {
						clearTimeout(timerList[i]);
					}
					timer = undefined;
					timerList = [];
					Toast.hide();
				}
			} else {
				Toast.loading('数据加载中...', 10);
			}
			return response;
		},
		(error) => {
			// url路径统一从config中取，有响应则取status,statusText，超时则取error.message
			console.log('----异常日志----')
			(error.response && handleErrorLog(
				error.response.status, 
				error.response.statusText, 
				error.config.url)) 
			|| (error.config && handleErrorLog(
			error.message,
			error.message,
			error.config.url))

			num--;
			for (let i = 0; i < timerList.length; i++) {
				clearTimeout(timerList[i]);
			}
			timer = undefined;
			timerList = [];
			Toast.hide();
			return Promise.reject(error);
		}
	);
	fetch.init({
		timeout: 10000, // 默认超时
		baseURL: '/wap', // baseurl
		onShowErrorTip: (err, errorTip) => {
			// console.log('sessionStorage:', sessionStorage);
			// console.log('localStorage', localStorage);
			// console.log('cookie', document.cookie);
			if (errorTip) Toast.fail('系统开小差，请稍后重试');
		},
		onShowSuccessTip: (response, successTip) => {
			switch (response.data.msgCode) {
				case 'PTM0000':
					return;
				case 'PTM1000': // 用户登录超时
					if (pagesIgnore(window.location.pathname)) {
						return;
					}
					// console.log('sessionStorage:', sessionStorage);
					// console.log('localStorage', localStorage);
					// console.log('cookie', document.cookie);
					Toast.info('登录超时，请重新登陆');
					setTimeout(() => {
						window.ReactRouterHistory.replace('/login');
					}, 3000);
					return;
				case 'PTM0100': // 未登录
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
};

export default fetchinit;
