/*
 * @Author: shawn
 * @LastEditTime: 2019-11-12 09:38:32
 */
import { guid } from 'utils';
import fetch from 'sx-fetch';
import { store } from 'utils/store';

const TONFUDUN_BAOBEI = '/signup/getUsrRqpInf';
const { PROJECT_ENV } = process.env;
let elementId, sessionId;
let timer = null;
let isFetch = false;
let appId = '';
if (PROJECT_ENV === 'pro' || PROJECT_ENV === 'rc') {
	appId = '1479905';
} else {
	appId = '7811333';
}
function getTongFuDun() {
	const element = document.createElement('script');
	const ts = new Date().getTime();
	elementId = 'tonfudunScript';
	sessionId = guid();
	element.id = elementId;
	console.log('222');
	element.src = `https://pws.tongfudun.com/did/js/dp.js?appId=${appId}&sessionId=${sessionId}&ts=${ts}&callback=OnngFuDunCallBack`;
	document.body.appendChild(element);
}

// 通付盾验证成功后向后端报备下
function requestBackReport() {
	if (isFetch) {
		return;
	}
	isFetch = true;
	if (store.getTFDBack2()) {
		clearInterval(timer);
		isFetch = false;
		return;
	}
	fetch
		.get(`${TONFUDUN_BAOBEI}/${sessionId}`, null, {
			hideLoading: true
		})
		.then(() => {
			clearInterval(timer);
			console.log('then');
			store.setTFDBack2(true);
		})
		.catch(() => {})
		.finally(() => {
			console.log('finally');
			isFetch = false;
		});
}

// 请求通付盾接口 执行的回调
function jspCallBack(res) {
	if (res.success) {
		requestBackReport();
	}
}
/**
 * @description: 自动触发：刷新页面+路由跳转触发
 * @param {type}
 * @return:
 */
export const TFDInit = () => {
	console.log('循环上报', timer);
	if (store.getTFDBack1() && store.getToken() && !store.getTFDBack2()) {
		if (!timer) {
			console.log('循环上报112', timer);
			timer = setInterval(() => {
				TFDInit();
			}, 10000);
		}
		window.OnngFuDunCallBack = jspCallBack;
		document.getElementById(elementId) && document.body.removeChild(document.getElementById(elementId));
		document.getElementById('payegisIfm') && document.body.removeChild(document.getElementById('payegisIfm'));
		getTongFuDun();
		return;
	}
};
/**
 * @description:  TFDBack1:call了login标识  TFDBack2:报备成功
 * @param {type} 登录之后 需要手动触发
 * @return:
 */
export const TFDLogin = () => {
	store.removeTFDBack1();
	store.removeTFDBack2();
	store.setTFDBack1(true);
	timer = null;
	TFDInit();
};
