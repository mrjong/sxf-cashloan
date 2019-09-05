/*
 * @Author: shawn
 * @LastEditTime: 2019-09-05 16:49:39
 */
import { store } from 'utils/store';
import { setH5Channel, getH5Channel } from 'utils/common';
const { PROJECT_ENV } = process.env;

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
