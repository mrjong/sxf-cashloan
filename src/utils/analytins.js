import qs from 'qs';
import { store } from 'utils/store';
import { setH5Channel, getH5Channel } from 'utils/common';
import SxfData from '../assets/lib/sxfData';
const { PROJECT_ENV, RELEASE_VERSION } = process.env;
import SxfDataConfig from '../assets/lib/SxfDataConfig';
//初始化神策埋点 及 渠道信息
export const initAnalytics = () => {
	window.version = 'v1.1';
	sa.init({
		server_url: saUrl,
		sdk_url: 'https://static.sensorsdata.cn/sdk/1.7.1.1/sensorsdata.min.js',
		show_log: PROJECT_ENV !== 'pro', //是否打印上报日志
		is_single_page: true
	});
	const query = qs.parse(window.location.search, {
		ignoreQueryPrefix: true
	});
	const ua = window.navigator.userAgent;
	// if (!store.getH5Channel()) {
	//   /SuiXingPay-Mpos/i.test(ua)
	//     ? query.h5Channel
	//       ? store.setH5Channel(query.h5Channel)
	//       : store.setH5Channel('MPOS')
	//     : store.setH5Channel(query.h5Channel ? query.h5Channel : 'other');
	// }
	// 解决banner等通过location href在mpos中跳转返回后h5Channel丢失的问题
	const storeH5Channel = getH5Channel();
	setH5Channel(storeH5Channel);
	if (!store.getVersion()) {
		store.setVersion(window.version);
	}
	if (/MicroMessenger/i.test(window.navigator.userAgent) && store.getVersion() !== window.version) {
		store.setVersion(window.version);
		window.location.reload();
	}
};

// 初始化随行付埋点 及渠道信息
export const initSxfData = () => {
	if (SxfDataConfig && SxfDataConfig.closed) {
		return;
	}
	SxfData.init({
		track_url: 'http://172.18.40.90:8080/buried',
		local_storage: {
			type: 'localStorage'
		},
		SPA: {
			is: true,
			mode: 'history'
		},
		pageview: false,
		debug: PROJECT_ENV !== 'pro',
		loaded: function(sdk) {
			// 公用属性
			sdk.registerEventSuperProperties({ cType: getH5Channel(), pLine: 'HD' });
		}
	});
};

// 定义固定参数
function getStaticParams() {
	return {
		product_line: '还到-余额代偿',
		project_name: document.title,
		forward_module: document.referrer,
		page_category: document.title,
		channelType: getH5Channel()
	};
}
/*
 * 随行付绑定用户
 *
 * */
export const sxfDataLogin = (userId) => {
	if (SxfDataConfig && SxfDataConfig.closed) {
		return;
	}
	SxfData.login(userId);
};
/*
 * 随行付PV统计
 *
 * */
export const sxfDataPv = (obj) => {
	if (SxfDataConfig && SxfDataConfig.closed) {
		return;
	}
	SxfData.trackPv(obj);
};
/*
 * 设置通用属性，会覆盖其他属性
 *
 * */
export const SxfDataRegisterEventSuperProperties = (obj) => {
	if (SxfDataConfig && SxfDataConfig.closed) {
		return;
	}
	SxfData.SxfDataRegisterEventSuperProperties(obj);
};
/*
 * 设置通用属性，不会覆盖其他属性
 *
 * */
export const SxfDataRegisterEventSuperPropertiesOnce = (obj) => {
	if (SxfDataConfig && SxfDataConfig.closed) {
		return;
	}
	SxfData.registerEventSuperPropertiesOnce(obj);
};
/*
 * 随行付监听
 *
 * */
export const _addlisten = () => {
	if (SxfDataConfig && SxfDataConfig.closed) {
		return;
	}
	SxfData._addlisten();
};
/*
 * 随行付埋点事件
 *
 * */
export const sxfburiedPointEvent = (buriedKey, params) => {
	if (SxfDataConfig && SxfDataConfig.closed) {
		return;
	}
	SxfData.trackEvent(buriedKey, params);
};
/*
 * 随行付埋点事件
 *
 * */
export const SxfDataObj = () => {
	if (SxfDataConfig && SxfDataConfig.closed) {
		return {};
	}
	return SxfData;
};
/*
 * PV统计
 *
 * */
export const pageView = () => {
	const params = getStaticParams();
	sa.quick('autoTrackSinglePage', params);
};

/*
 * 埋点事件
 *
 * */
export const buriedPointEvent = (buriedKey, params) => {
	const staticParams = getStaticParams();
	const sendParams = Object.assign({}, staticParams, params);
	sa.track(buriedKey, sendParams);
};
