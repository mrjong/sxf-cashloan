/*
 * @Author: shawn
 * @LastEditTime: 2020-04-13 09:45:10
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
					Toast.info(JSON.stringify(jsonRsp.appVersion));
					status = compare(jsonRsp.appVersion, '4.0.1') > 0;
				},
				{}
			);
	} else {
		Toast.info('旧的');
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
					Toast.info('新的' + JSON.stringify(jsonRsp));
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
						Toast.info('旧的' + JSON.stringify(jsonRsp));
						const location = jsonRsp.longitude + ',' + jsonRsp.latitude;
						store.setPosition(location);
					}
				});
		});
	}
};
/**
 * @description: 二维码分享-跳转一个新页面
 * @param {type}
 * @return:
 */
const openNewNativeQRWebView = (type, shareData, callBack) => {
	window.JSBridge &&
		window.JSBridge.invoke(
			'openNewNativeQRWebView',
			() => {
				callBack();
			},
			{
				content: shareData.link,
				url: shareData.qrCodeUrl // 新开二维码页面
			}
		);
};
/**
 * @description: 将页面保存为图片
 * @param {type} 0001 保存成功  0000 保存失败
 * @return:
 */
const nativeSaveWebView2Png = (callBack) => {
	if (status && window.JSBridge) {
		window.JSBridge &&
			window.JSBridge.invoke(
				'nativeSaveWebView2Png',
				(res) => {
					if (res.result === '0001') {
						callBack(true);
					} else {
						callBack(false);
					}
				},
				{} // 这个空也不能去掉
			);
	}
};
/**
 * @description: 获取二维码跳转链接
 * @param {type}
 * @return:
 */
const nativeGetQRCodeContent = (callBack) => {
	if (status && window.JSBridge) {
		window.JSBridge &&
			window.JSBridge.invoke(
				'nativeGetQRCodeContent',
				(res) => {
					callBack(res.content);
				},
				{} // 这个空也不能去掉
			);
	}
};
/**
 * @description: 分享
 * @param {type} 0001代表微信、0002代表朋友圈、0003代表QQ、0004代表QQ空间,0005 二维码分享,0006 复制链接
 * @return: 可传多个 entry: '0001,0002,0003,0004',
 * 我们需要参数：{"title":"","description":"","url":"","iconUrl":"",}
 */
const mposShare = ({ shareData, callBack }) => {
	if (status && window.JSBridge) {
		Toast.info('新的');
		window.JSBridge &&
			window.JSBridge.invoke(
				'nativeWebShare',
				(res) => {
					if (res && res.type && res.type === 'QR_CODE') {
						openNewNativeQRWebView(res.type, shareData, callBack);
					} else {
						callBack();
					}
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
		Toast.info('旧的');
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
		Toast.info('新的');
		setTimeout(() => {
			window.JSBridge &&
				window.JSBridge.invoke(
					'closeCurrentWebview',
					() => {
						console.log('mpos关闭成功');
					},
					{}
				);
		}, 2000);
	} else {
		Toast.info('旧的');
		setTimeout(() => {
			window.setupWebViewJavascriptBridge((bridge) => {
				bridge.callHandler('closeCurrentWebView', '', function(response) {
					console.log(response);
				});
			});
		}, 2000);
	}
};
export {
	getAppVersion,
	getLocation,
	mposShare,
	closeCurrentWebView,
	nativeSaveWebView2Png,
	nativeGetQRCodeContent
};
