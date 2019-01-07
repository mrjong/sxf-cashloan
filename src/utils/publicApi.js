import { store } from 'utils/store';
const API = {
	saveAppOrContactInfo: '/auth/saveAppOrContactInfo'
};
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
					.post(API.saveAppOrContactInfo, {
						type: '1',
						appList: responseData.appsList
					})
					.then((res) => {}, (error) => {});
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
					.post(API.saveAppOrContactInfo, {
						type: '2',
						contactList: responseData.contactsList
					})
					.then((res) => {}, (error) => {});
			}
		});
	});
};
export { getLocation, getAppsList, getContactsList };
