/*
 * @Author: shawn
 * @LastEditTime: 2019-09-23 11:05:22
 */
import { store } from 'utils/store';
import { setH5Channel, getH5Channel } from 'utils/common';
const { PROJECT_ENV } = process.env;
const SxfData = window.globalConfig && window.globalConfig.MDopen ? require('../assets/lib/sxfData') : '';
import linkConf from 'config/link.conf';
//初始化神策埋点 及 渠道信息
export const initAnalytics = () => {
	window.version = 'v1.1';
	window.sa.init({
		server_url: saUrl, // eslint-disable-line
		sdk_url: 'https://static.sensorsdata.cn/sdk/1.7.1.1/sensorsdata.min.js',
		show_log: PROJECT_ENV !== 'pro', //是否打印上报日志
		is_single_page: true
	});

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
	SxfData &&
		SxfData.init({
			track_url: `${linkConf.MD_URL}/buried`,
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
	SxfData && SxfData.login(userId);
};
/*
 * 随行付PV统计
 *
 * */
export const sxfDataPv = (obj) => {
	SxfData && SxfData.trackPv(obj);
};
/*
 * 设置通用属性，会覆盖其他属性
 *
 * */
export const SxfDataRegisterEventSuperProperties = (obj) => {
	SxfData && SxfData.SxfDataRegisterEventSuperProperties(obj);
};
/*
 * 设置通用属性，不会覆盖其他属性
 *
 * */
export const SxfDataRegisterEventSuperPropertiesOnce = (obj) => {
	SxfData && SxfData.registerEventSuperPropertiesOnce(obj);
};
/*
 * 随行付监听
 *
 * */
export const _addlisten = () => {
	SxfData && SxfData._addlisten();
};
/*
 * 随行付埋点事件
 *
 * */
export const sxfburiedPointEvent = (buriedKey, params) => {
	SxfData && SxfData.trackEvent(buriedKey, params);
};
/*
 * 随行付埋点事件
 *
 * */
export const SxfDataObj = () => {
	return SxfData && SxfData;
};
/*
 * PV统计
 *
 * */
export const pageView = () => {
	const params = getStaticParams();
	window.sa.quick('autoTrackSinglePage', params);
};

/*
 * 埋点事件
 *
 * */
export const buriedPointEvent = (buriedKey, params) => {
	const staticParams = getStaticParams();
	const sendParams = Object.assign({}, staticParams, params);
	window.sa.track(buriedKey, sendParams);
};
