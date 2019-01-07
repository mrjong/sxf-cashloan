import store from '../redux/store';
import actions from '../redux/actions';
import fetch from 'sx-fetch';
import { Toast } from 'antd-mobile';

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
					sessionStorage.setItem('location', location);
					store.dispatch(actions.setVars('location', location));
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
					.post('/auth/saveAppOrContactInfo', {
						userId: sessionStorage.getItem('userId'), // 用户ID
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
					.post('/auth/saveAppOrContactInfo', {
						userId: sessionStorage.getItem('userId'), // 用户ID
						type: '2',
						contactList: responseData.contactsList
					})
					.then((res) => {}, (error) => {});
			}
		});
	});
};

const getAuthInfoMPOS = () => {
	const rzlt = new Promise((res, rej) => {
		try {
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler('getAuthInfo', '', function(response) {
					var responseData = null;
					if (typeof response === 'string') {
						responseData = JSON.parse(response);
					} else {
						responseData = response;
					}
					res(responseData);
				});
			});
		} catch (e) {
			rej(e);
		}
	});

	return rzlt;
};
//获取MPOs用户信息
const getAuthInfo = () => {
	setupWebViewJavascriptBridge(function(bridge) {
		bridge.callHandler('getAuthInfo', '', function(response) {
			var responseData = null;
			if (typeof response === 'string') {
				responseData = JSON.parse(response);
			} else {
				responseData = response;
			}
			if (responseData.STATUS === '01') {
				if (!responseData.name) {
					Toast.info('系统异常(MPOS)');
					return;
				}
				const token = sessionStorage.getItem('tokenId');
				const u = navigator.userAgent;
				const osType =
					u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
						? 'ANDRIOD'
						: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ? 'IOS' : 'PC';
				const params = {
					userId: sessionStorage.getItem('userId'), // 用户ID
					idTyp: '01',
					imgDownloadUrl: responseData.imgDownloadUrl,
					idNo: responseData.idCardNo,
					usrNm: responseData.name,
					platform: responseData.platform,
					imei: responseData.IMEI,
					idEffDt: responseData.validStart,
					idExpDt: responseData.validEnd,
					idAddr: responseData.address,
					idCardFrontUrl: '', //正面URL
					idCardBackUrl: '', //反面URL
					handCardImgUrl: '', //手持正面URL
					usrGender: '', //性别
					usrNation: '', //民族
					usrBirthDt: '', //出生年月日
					issuAuth: '', //签发机关
					usrIp: '', //IP地址
					tokenId: token, //TokenId
					osType: osType, //操作系统类型
					usrBusCnl: sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel') : '', //用户授信渠道
					usrBrowInfo: '' //授信浏览器信息
				};
				//登记实名信息
				fetch.post(`/auth/idChk`, params).then(
					(result) => {},
					(error) => {
						error.msgInfo && this.props.toast.info(error.msgInfo);
					}
				);
			}
		});
	});
};

//授信的接口
const getShowxin = (history) => {
	const h5ChannelStr = sessionStorage.getItem('h5Channel') ? sessionStorage.getItem('h5Channel').toUpperCase() : '';

	getAppsList();
	getContactsList();
	fetch
		.post('/bill/apply', {
			...store.getState().vars.saveApplyInfoParmas
		})
		.then((result) => {
			if (result.msgCode !== 'PTM0000') {
				Toast.info(result.msgInfo, 1);
				h5ChannelStr.indexOf('MPOS') === 0 ? history.replace('/home') : history.replace('/homeOutside');
			} else {
				store.dispatch(
					actions.setVars('applyInfo', {
						nameHid: result.name,
						perdPageNm: result.perdPageNm,
						rpyAmt: result.rpyAmt,
						rpyDt: result.rpyDt
					})
				);
				h5ChannelStr.indexOf('MPOS') === 0
					? history.replace('/submitSuccess')
					: history.replace('/submitSuccessOutside');
			}
		})
		.catch((err) => {
			h5ChannelStr.indexOf('MPOS') === 0 ? history.replace('/home') : history.replace('/homeOutside');
		});
};
export { getLocation, getAppsList, getContactsList, getAuthInfo, getShowxin, getAuthInfoMPOS };
