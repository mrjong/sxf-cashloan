import { guid } from 'utils';
import { Toast } from 'antd-mobile';
import fetch from 'sx-fetch';

const TONFUDUN_BAOBEI = '/signup/getUsrRqpInf';
const { PROJECT_ENV } = process.env;
let elementId, sessionId;
let appId = '';
if (PROJECT_ENV === 'pro' || PROJECT_ENV === 'rc') {
	appId = '1479905';
} else {
	appId = '7811333';
}
let hasReport = false; //是否上报后台标识
function getTongFuDun() {
	const element = document.createElement('script');
	const ts = new Date().getTime();
	elementId = 'tonfudunScript';
	sessionId = guid();
	element.id = elementId;
	element.src = `https://pws.tongfudun.com/did/js/dp.js?appId=${appId}&sessionId=${sessionId}&ts=${ts}&callback=OnngFuDunCallBack`;
	document.body.appendChild(element);
}

// 通付盾验证成功后向后端报备下
function requestBackReport() {
	hasReport = true;
	fetch
		.get(`${TONFUDUN_BAOBEI}/${sessionId}`, null, {
			hideLoading: true
		})
		.then(() => {})
		.catch(() => {})
		.finally(() => {
			hasReport = false;
		});
}

// 请求通付盾接口 执行的回调
function jspCallBack(res) {
	window.showTongLoading = true;
	if (res.success) {
		if (!hasReport) {
			requestBackReport();
		}
	} else {
		Toast.info(res.message);
	}
}

const TFDInit = (flag) => {
	window.OnngFuDunCallBack = jspCallBack;
	if (flag) {
		document.getElementById('tonfudunScript') &&
			document.body.removeChild(document.getElementById('tonfudunScript'));
		document.getElementById('payegisIfm') && document.body.removeChild(document.getElementById('payegisIfm'));
		getTongFuDun();
		return;
	}
	if (!document.getElementById(elementId)) {
		getTongFuDun();
	}
};

export default TFDInit;
