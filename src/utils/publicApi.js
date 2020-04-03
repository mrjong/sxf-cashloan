/*
 * @Author: shawn
 * @LastEditTime: 2020-04-03 18:37:34
 */
import { store } from 'utils/store';
import { Toast } from 'antd-mobile';
// import { getDeviceType } from 'utils';
/**
 * @description: 比较版本
 * @param {type}
 * @return:
 */
let status = false;

function compare(a, b) {
	if (a === b) {
		return 0;
	}
	var a_components = a.split('.');
	var b_components = b.split('.');
	var len = Math.min(a_components.length, b_components.length);
	for (var i = 0; i < len; i++) {
		if (parseInt(a_components[i]) > parseInt(b_components[i])) {
			return 1;
		}

		if (parseInt(a_components[i]) < parseInt(b_components[i])) {
			return -1;
		}
	}

	if (a_components.length > b_components.length) {
		return 1;
	}

	if (a_components.length < b_components.length) {
		return -1;
	}
	return 0;
}
/**
 * @description: 获取mposapp的版本号
 * @param {type}
 * @return:
 */
const getAppVersion = () => {
	if (window.JSBridge) {
		window.JSBridge &&
			window.JSBridge.invoke(
				'getAppVersion',
				(jsonRsp) => {
					Toast.info(JSON.stringify(compare(jsonRsp.appVersion, '4.0.1') > 0));
					status = compare(jsonRsp.appVersion, '4.0.1') > 0;
				},
				{}
			);
	} else {
		status = false;
	}
};

/**
 * @description: 获取MPOS地理位置
 * @param {type}
 * @return:
 */
const getLocation = () => {
	if (status && window.JSBridge) {
		window.JSBridge &&
			window.JSBridge.invoke(
				'GetLocationHandler',
				(jsonRsp) => {
					//   data : {
					//     cityCode = 010;
					//     cityName = "北京市";
					//      country = "中国";
					//      countyCode = 110107;
					//      countyName = "石景山区";
					//      detailAddress = "实兴大街";
					//     latiTude = "39.937574";
					//     longAddress = "北京市石景山区实兴大街靠近西山汇";
					//     longiTude = "116.192053";
					//     province = "北京市";
					// }
					const location = jsonRsp.longiTude + ',' + jsonRsp.latiTude;
					store.setPosition(location);
				},
				{}
			);
	} else {
		// 老方法
		window.setupWebViewJavascriptBridge((bridge) => {
			bridge &&
				bridge.callHandler('getLocation', '', function(response) {
					var jsonRsp = null;
					if (typeof response === 'string') {
						jsonRsp = JSON.parse(response);
					} else {
						jsonRsp = response;
					}
					if (jsonRsp.STATUS === '01') {
						const location = jsonRsp.longitude + ',' + jsonRsp.latitude;
						store.setPosition(location);
					}
				});
		});
	}
};

/**
 * @description: 分享
 * @param {type} 0001代表微信、0002代表朋友圈、0003代表QQ、0004代表QQ空间
 * @return: 可传多个 entry: '0001,0002,0003,0004',
 * 我们需要参数：{"title":"","description":"","url":"","iconUrl":""}
 */
const mposShare = ({ shareData }) => {
	if (status && window.JSBridge) {
		window.JSBridge &&
			window.JSBridge.invoke(
				'customShare',
				() => {
					Toast.info('分享成功');
				},
				{
					entry: shareData.entry,
					title: shareData.title,
					hint: shareData.desc,
					shareUrl: shareData.link,
					shareImgUrl: shareData.imgUrl
				}
			);
	} else {
		window.setupWebViewJavascriptBridge((bridge) => {
			bridge.callHandler(
				'mposShare',
				{
					title: shareData.title,
					description: shareData.desc,
					url: shareData.link,
					iconUrl: shareData.imgUrl
				},
				function() {
					Toast.info('分享成功');
				}
			);
		});
	}
};
//关闭view
const closeCurrentWebView = () => {
	if (status && window.JSBridge) {
		window.JSBridge &&
			window.JSBridge.invoke(
				'closeCurrentWebview',
				() => {
					console.log('mpos关闭成功');
				},
				{}
			);
	} else {
		window.setupWebViewJavascriptBridge((bridge) => {
			bridge.callHandler('closeCurrentWebView', '', function(response) {
				console.log(response);
			});
		});
	}
};
export { getAppVersion, getLocation, mposShare, closeCurrentWebView };
