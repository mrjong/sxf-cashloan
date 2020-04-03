/*
 * @Author: shawn
 * @LastEditTime: 2020-04-03 14:09:59
 */
import { store } from 'utils/store';
import fetch from 'sx-fetch';
import { Toast } from 'antd-mobile';
import { auth_saveAppOrContactInfo } from 'fetch/api';
/**
 * @description: 比较版本
 * @param {type}
 * @return:
 */
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
//获取MPOS地理位置
const getLocation = () => {
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
};
//获取用户app列表
const getAppsList = () => {
	window.setupWebViewJavascriptBridge((bridge) => {
		bridge.callHandler('getAppsList', '', function(response) {
			var responseData = null;
			if (typeof response === 'string') {
				responseData = JSON.parse(response);
			} else {
				responseData = response;
			}
			if (responseData.STATUS === '01') {
				console.log(responseData.appsList);
				fetch
					.post(auth_saveAppOrContactInfo, {
						type: '1',
						appList: responseData.appsList
					})
					.then(() => {}, () => {});
			}
		});
	});
};

//获取用户MPOS列表
const getContactsList = () => {
	window.setupWebViewJavascriptBridge((bridge) => {
		bridge.callHandler('getContactsList', '', function(response) {
			var responseData = null;
			if (typeof response === 'string') {
				responseData = JSON.parse(response);
			} else {
				responseData = response;
			}
			if (responseData.STATUS === '01') {
				fetch
					.post(auth_saveAppOrContactInfo, {
						type: '2',
						contactList: responseData.contactsList
					})
					.then(() => {}, () => {});
			}
		});
	});
};

// 我们需要参数：{"title":"","description":"","url":"","iconUrl":""}
const mposShare = ({ $props, shareData }) => {
	window.setupWebViewJavascriptBridge((bridge) => {
		bridge.callHandler(
			'mposShare',
			{ title: shareData.title, description: shareData.desc, url: shareData.link, iconUrl: shareData.imgUrl },
			function() {
				$props.toast.info('分享成功');
			}
		);
	});
};
//关闭view
const closeCurrentWebView = () => {
	window.setupWebViewJavascriptBridge((bridge) => {
		bridge.callHandler('closeCurrentWebView', '', function(response) {
			console.log(response);
		});
	});
};
const getAppVersion = () => {
	let status = false;
	Toast.info('getAppVersion调用');
	// mpos IOS
	if (window.webkit && window.webkit.messageHandlers && window.webkit.getAppVersion) {
		window.webkit.messageHandlers.getAppVersion.postMessage(
			JSON.stringify({
				callbakcId: (data) => {
					Toast.info(JSON.stringify(data));
					status = compare(data.appVersion, '4.0.1') > 0;
				}
			})
		);
	} else {
		Toast.info('小于版本');
		status = false;
	}
	return status;
};
getAppVersion();

export { getLocation, getAppsList, getContactsList, mposShare, closeCurrentWebView };
