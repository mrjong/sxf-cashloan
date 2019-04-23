import React from 'react';
import { buriedPointEvent } from 'utils/analytins';
import { bugLog, home } from 'utils/analytinsType';
import { Modal, Toast } from 'antd-mobile';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { SXFToast } from 'utils/SXFToast';

import { store } from 'utils/store';
import { isMPOS } from 'utils/common';
import { getAppsList, getContactsList } from 'utils/publicApi';
import linkConf from 'config/link.conf';

// 退出的api
const API = {
	LOGOUT: '/signup/logout', // 用户退出登陆
	GETSTSW: '/my/getStsw', // 获取首页进度
	getOperator: '/auth/operatorAuth', // 运营商的跳转URL
	qryPerdRate: '/bill/qryperdrate', // 0105-确认代还信息查询接口
	submitState: '/bill/apply', // 提交代还金申请
	idChkPhoto: '/auth/idChkPhoto'
};
// 处理输入框失焦页面不回弹
export const handleInputBlur = () => {
	setTimeout(() => {
		const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		window.scrollTo(0, scrollTop);
	}, 100);
};

// 处理接口错误上报
export const handleErrorLog = (status, statusText) => {
	const logInfo = {
		DC_errorStatus: status,
		DC_errorStatusText: statusText,
		DC_errorUrl: document.URL,
		DC_errorTime: new Date(),
		DC_errorTitle: document.title
	};
	buriedPointEvent(bugLog.apiErrorLog, logInfo);
};

export const handleWindowError = () => {
	window.onerror = function(errorMessage, scriptURI, lineNo, columnNo, error) {
		console.log('errorMessage: ' + errorMessage); // 异常信息
		console.log('scriptURI: ' + scriptURI); // 异常文件路径
		console.log('lineNo: ' + lineNo); // 异常行号
		console.log('columnNo: ' + columnNo); // 异常列号
		console.log('error: ' + error); // 异常堆栈信息

		// 构建错误对象
		var errorObj = {
			errorMessage: errorMessage || null,
			scriptURI: scriptURI || null,
			lineNo: lineNo || null,
			columnNo: columnNo || null,
			stack: error && error.stack ? error.stack : null
		};

		buriedPointEvent(bugLog.pageErrorLog, errorObj);

		// if (XMLHttpRequest) {
		// 	var xhr = new XMLHttpRequest();

		// 	xhr.open('post', 'http://localhost:3031/middleware/errorReport', true); // 上报给node中间层处理
		// 	xhr.setRequestHeader('Content-Type', 'application/json'); // 设置请求头
		// 	xhr.send(JSON.stringify(errorObj)); // 发送参数
		// }
	};
};

// 判断是否是微信打开
export const isWXOpen = () => {
	var ua = navigator.userAgent.toLowerCase();
	return /micromessenger/.test(ua) ? true : false;
};

export const pagesIgnore = (pathname = window.location.pathname) => {
	if (pathname) {
		let pageList = [ '/protocol/', '/activity/', '/others/', '/landing/landing_page', '/common/auth_page', '/mpos/mpos_ioscontrol_page' ];
		if (isWXOpen()) {
			let pageListWx = [ '/home/home', '/common/wx_middle_page', '/mpos/mpos_ioscontrol_page' ];
			// h5的banner也会跳到/mpos/mpos_ioscontrol_page这个落地页，因此放开
			pageList = pageList.concat(pageListWx);
		} else if (isMPOS()) {
			let pageListMpos = [ '/mpos/' ];
			pageList = pageList.concat(pageListMpos);
		} else {
			let pageListCommon = [];
			pageList = pageList.concat(pageListCommon);
		}
		return pageList.some((item) => item && pathname.indexOf(item) > -1);
	}
};

// 逻辑有待优化
export const headerIgnore = (type) => {
	const ua = window.navigator.userAgent;
	if (type === 'false') {
		if (
			!/MicroMessenger/i.test(ua) &&
			!/QQ/i.test(ua) &&
			!/AlipayClient/i.test(ua) &&
			!/SuiXingPay-Mpos/i.test(ua) &&
			!/SuiXingPay-Cashier/i.test(ua)
		) {
			return true;
		} else {
			return false;
		}
	} else {
		if (
			/MicroMessenger/i.test(ua) ||
			/QQ/i.test(ua) ||
			/AlipayClient/i.test(ua) ||
			/SuiXingPay-Mpos/i.test(ua) ||
			/SuiXingPay-Cashier/i.test(ua)
		) {
			return true;
		} else {
			return false;
		}
	}
};

export const setTitle = (getTitle) => {
	var i = document.createElement('iframe');
	const { PROJECT_ENV } = process.env;
	if (PROJECT_ENV === 'pro') {
		// 生产环境配置
		i.src = 'https://lns-wap.vbillbank.com/favicon.ico';
	} else if (PROJECT_ENV === 'test') {
		i.src = 'https://lns-wap-test.vbillbank.com/favicon.ico';
	}
	i.style.display = 'none';
	i.onload = function() {
		setTimeout(function() {
			i.remove();
		}, 9);
	};
	document.title = getTitle;
	document.body.appendChild(i);
};

// 获取设备类型，返回字符串
export const getDeviceType = () => {
	const u = navigator.userAgent;
	const osType =
		u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
			? 'ANDRIOD'
			: u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) ? 'IOS' : 'PC';
	return osType;
};

/*rc-form 获取第一个错误 */
export const getFirstError = (error) => {
	if (error) {
		const firstErr = error[Object.keys(error)[0]].errors;

		return firstErr[0].message;
	}
	return '';
};

// 检测是否是某种浏览器
export const isSomeBrowser = (type) => {
	const u = navigator.userAgent.toLowerCase();
	return u.indexOf(type) > -1 && u.indexOf('micromessenger') <= -1;
};
//关闭view
export const closeCurrentWebView = () => {
	window.setupWebViewJavascriptBridge((bridge) => {
		bridge.callHandler('closeCurrentWebView', '', function(response) {
			console.log(response);
		});
	});
};
// 点击退出
let state = false;

export const logoutAppHandler = (that) => {
	if (isMPOS()) {
		closeCurrentWebView();
		return;
	}
	if (!state) {
		state = true;
		const ele = <div style={{ lineHeight: 3 }}>确认退出登录？</div>;
		Modal.alert('', ele, [
			{
				text: '取消',
				onPress: () => {
					state = false;
				}
			},
			{
				text: '确定',
				onPress: () => {
					state = false;
					logoutApp(that);
				}
			}
		]);
	}
};

// 定义需要拦截的路由
const interceptRouteArr = [
	'/login',
	'/home/home',
	'/order/order_page',
	'/mine/mine_page',
	'/mine/credit_extension_page',
	'/order/repayment_succ_page',
	'/mine/credit_list_page',
	'/home/essential_information',
	'/home/real_name',
	'/home/confirm_agency',
	'/home/moxie_bank_list_page',
	'/home/loan_repay_confirm_page',
	'/home/credit_apply_succ_page',
	'/home/loan_apply_succ_page',
];

// 在需要路由拦截的页面 pushState
export const changeHistoryState = () => {
	if (interceptRouteArr.includes(window.location.pathname)) {
		if (store.getGoMoxie()) {
			history.go(-1);
			store.removeGoMoxie();
		} else {
			window.history.pushState(null, null, document.URL); //在IE中必须得有这两行
		}
	}
};

function S4() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// 生成UUID,返回字符串
export const guid = () => {
	return `${S4() + S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}`;
};

// 安卓关闭页面方法
export const closePage = () => {
	if (window.Sxp) {
		return window.Sxp.closePage();
	}
	if (window.passValue) {
		return window.passValue();
	}
};
export const idChkPhoto = ({ $props, type, msg = '审核' }) => {
	return new Promise((resolve, reject) => {
		$props.$fetch.get(API.idChkPhoto).then((res) => {
			// let res = {
			// 	msgCode: 'PTM0008',
			// 	msgInfo: '用户已实名，未上传身份证照片',
			// 	data: {}
			// };

			switch (res.msgCode) {
				case 'PTM0000':
					resolve('1');
					break;
				case 'PTM0006':
					store.setToggleMoxieCard(true);
					$props.history.push({
						pathname: '/home/real_name'
					});
					resolve('2');
					break;
				case 'PTM0008':
					if (!state) {
						state = true;
						const ele = (
							<div>
								身份证照片找不到了!<br />补充照片极速{msg}!
							</div>
						);
						Modal.alert('', ele, [
							{
								text: '关闭',
								onPress: () => {
									state = false;
								}
							},
							{
								text: '前往添加',
								onPress: () => {
									store.setToggleMoxieCard(true);
									state = false;
									$props.history.push({
										pathname: '/home/real_name',
										search: `?newTitle=实名照片补充&type=${type}`
									});
								}
							}
						]);
					}
					resolve('2');
					break;

				case 'PTM0009':
					if (!state) {
						state = true;
						const ele = (
							<div>
								身份证有效期不足30天或已过期!<br />重新补充极速{msg}!
							</div>
						);
						Modal.alert('', ele, [
							{
								text: '关闭',
								onPress: () => {
									state = false;
								}
							},
							{
								text: '前往添加',
								onPress: () => {
									state = false;
									store.setToggleMoxieCard(true);
									$props.history.push({
										pathname: '/home/real_name',
										search: `?newTitle=实名照片补充&type=${type}`
									});
								}
							}
						]);
					}
					resolve('2');
					break;

				default:
					$props.toast.info(res.msgInfo);
					reject();
					break;
			}
		});
	});
};
// 确认按钮点击事件 提交到风控
export const handleClickConfirm = ($props, repaymentDate, type) => {
	$props.SXFToast.loading('数据加载中...', 0);
	const address = store.getPosition();
	const params = {
		location: address,
		prdId: repaymentDate.prdId,
		perdLth: repaymentDate.perdLth,
		perdUnit: repaymentDate.perdUnit,
		perdCnt: repaymentDate.perdCnt,
		rpyAmt: Number(repaymentDate.rpyAmt),
		autId: repaymentDate && repaymentDate.autId
	};
	if (isMPOS()) {
		getAppsList();
		getContactsList();
	}
	$props.$fetch
		.post(`${API.submitState}`, params, { hideLoading: true })
		.then((res) => {
			$props.SXFToast.hide();
			// 提交风控返回成功
			if (res && res.msgCode === 'PTM0000') {
				buriedPointEvent(home.moneyCreditCardConfirm, {
					is_success: true,
					fail_cause: '提交成功',
					perdLth: repaymentDate.perdLth,
					rpyAmt: Number(repaymentDate.rpyAmt),
					activeName: repaymentDate.activeName
				});
				$props.toast.info(res.msgInfo);
				store.removeLoanAspirationHome();
				store.removeToggleMoxieCard();
				setTimeout(() => {
					$props.history.push({
						pathname: '/home/credit_apply_succ_page',
						search: `?noBankInfo=true&autId=${repaymentDate && repaymentDate.autId}`
					});
				}, 3000);
			} else {
				buriedPointEvent(home.moneyCreditCardConfirm, {
					is_success: false,
					fail_cause: res.msgInfo,
					perdLth: repaymentDate.perdLth,
					rpyAmt: Number(repaymentDate.rpyAmt),
					activeName: repaymentDate.activeName
				});
				$props.toast.info(res.msgInfo);
			}
		})
		.catch((err) => {
			buriedPointEvent(home.moneyCreditCardConfirm, {
				is_success: false,
				fail_cause: '未知错误',
				perdLth: repaymentDate.perdLth,
				rpyAmt: Number(repaymentDate.rpyAmt),
				activeName: repaymentDate.activeName
			});
			$props.SXFToast.hide();
			if (type) {
				$props.history.goBack();
			} else {
				$props.history.push('/home/home');
			}
		});
};

const needDisplayOptions = [ 'idCheck', 'basicInf', 'operator', 'card' ];
export const getNextStr = async ({ $props, needReturn = false, callBack }) => {
	let codes = '';
	let codesArray = [];
	let res = await $props.$fetch.post(API.GETSTSW);
	let resBackMsg = '';
	if (res && res.msgCode === 'PTM0000') {
		res.data.forEach((item) => {
			if (needDisplayOptions.includes(item.code)) {
				codes += item.stsw.dicDetailCd;
				codesArray.push(item.stsw.dicDetailCd);
			}
		});
		if (!needReturn) {
			store.setNeedNextUrl(true);
			// 实名
			if (codesArray[0] !== '2' && codesArray[0] !== '1') {
				$props.SXFToast.hide();
				let msg = '请先实名认证';
				$props.toast.info(msg);
				setTimeout(() => {
					$props.history.push({
						pathname: '/home/real_name'
						// search: urlQuery
					});
				}, 3000);
				return;
			}
			// 基本信息
			if (codesArray[1] !== '2' && codesArray[1] !== '1') {
				$props.SXFToast.hide();
				let msg = '请进行基本信息认证';
				$props.toast.info(msg);
				resBackMsg = '基本信息认证';
				setTimeout(() => {
					$props.history.replace({
						pathname: '/home/essential_information'
						// search: urlQuery
					});
				}, 3000);
				if (callBack) {
					callBack(resBackMsg);
				}
				return;
			}

			// 运营商前一步是成功或者审核中,可直接返回url链接
			if (codesArray[2] !== '1' && codesArray[2] !== '2') {
				$props.$fetch
					.post(`${API.getOperator}`, {
						clientCode: '04'
					})
					.then((result) => {
						if (result.msgCode === 'PTM0000' && result.data.url) {
							$props.SXFToast.hide();
							let msg = '请进行运营商认证';
							$props.toast.info(msg);
							resBackMsg = '运营商认证';
							setTimeout(() => {
								// 运营商直接返回的问题
								store.setCarrierMoxie(true);
								SXFToast.loading('加载中...', 0);
								window.location.href =
									result.data.url +
									`&localUrl=${window.location.origin}&routeType=${window.location.pathname}${window
										.location.search}&showTitleBar=NO&agreementEntryText=《个人信息授权书》&agreementUrl=${encodeURIComponent(`${linkConf.BASE_URL}/disting/#/carrier_auth_page`)}`;
							}, 3000);
							if (callBack) {
								callBack(resBackMsg);
							}
						}
					});

				return;
			}

			// 信用卡
			if (codesArray[3] !== '1' && codesArray[3] !== '2') {
				$props.SXFToast.hide();
				let msg = '请进行信用卡认证';
				$props.toast.info(msg);
				resBackMsg = '银行列表';
				store.setCreditSuccessBack(true);
				setTimeout(() => {
					$props.history.push({ pathname: '/home/moxie_bank_list_page' });
				}, 3000);
				if (callBack) {
					callBack(resBackMsg);
				}
				return;
			}
			// 如果是历史用户 直接提交风控  或者跳转到 账单确认页
			if (!store.getCreditExtensionNot() && store.getLoanAspirationHome()) {
				$props.SXFToast.hide();
				handleClickConfirm($props, {
					...store.getLoanAspirationHome()
				});
				return;
			} else if (store.getCreditExtensionNot()) {
				if (store.getCreditSuccessBack()) {
					$props.SXFToast.hide();
					$props.toast.info('恭喜您距离您获取额度就差最后一步了，赶紧申请吧');
					setTimeout(() => {
						$props.history.push('/home/loan_repay_confirm_page');
					}, 2000);
				} else {
					$props.history.push('/home/loan_repay_confirm_page');
				}
				return;
			}
		}
	} else {
		Toast.info(res.msgInfo);
	}
	return {
		data: res.data,
		codes,
		codesArray,
		resBackMsg
	};
};

// 退出功能
export const logoutApp = (that) => {
	fetch.get(API.LOGOUT).then(
		(result) => {
			if (result && result.msgCode !== 'PTM0000') {
				result.msgInfo && Toast.info(result.msgInfo);
				return;
			}
			window.ReactRouterHistory.push('/login');
			// sessionStorage.clear();
			// localStorage.clear();
			// Cookie.remove('fin-v-card-token');
			Cookie.remove('authFlag');
			Cookie.remove('VIPFlag');
		},
		(err) => {
			err.msgInfo && Toast.info(err.msgInfo);
		}
	);
};

export const getNowDate = () => {
	var now = new Date();
	var year = now.getFullYear(); //得到年份
	var month = now.getMonth(); //得到月份
	var date = now.getDate(); //得到日期
	return `${year}${month}${date}`;
};

// 正则校验表达式
export const verifyReg = {
	phoneReg: /^[1][3,4,5,7,8][0-9]{9}$/,
	bankCardSimple: /^\d{14,25}$/
};

// 正则校验工厂函数
const verfifyFactory = (val, testReg) => {
	// 一些其他判断 。。。。
	return val !== '' && testReg.test(val);
};

// 正则校验基本类型
export const isAvailableFun = {
	phone(val, testReg = verifyReg.phoneReg) {
		return verfifyFactory(val, testReg);
	},
	bankCardSimple(val, testReg = verifyReg.bankCardSimple) {
		return verfifyFactory(val, testReg);
	}
};

export const validators = {
	number: (val) => /^[0-9]*$/.test(val),
	bankCardNumber: (val) => /^\d{16}|\d{24}$/.test(val), // 银行卡号 val.replace(/\s+/g, "")
	phone: (val) => /^1\d{10}$/.test(val), // 手机为以1开头的11位数字
	iDCardNumber: (val) => /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(val), // 身份证 中国的身份证号，一代身份证号是15位的数字，二代身份证都是18位的，最后一位校验位除了可能是数字还可能是‘X‘或‘x‘，所以有四种可能性：a.15位数字 b.18位数字 c.17位数字，第十八位是‘X‘ d.17位数字，第十八位是‘x‘
	enLength: (val, min, max) => {
		// 英文字符长度校验
		if (val.replace(/(^\s*)|(\s*$)/g, '') === '') {
			// /^(?!(\s+$))/
			return false;
		} else if (min) {
			if (val.length < min) {
				return false;
			} else if (max) {
				if (val.length > max) {
					return false;
				}
				return true;
			}
			return true;
		}
	},
	name: (val) => /^([\u4e00-\u9fa5]){2,20}$/.test(val),
	chLength: (val, min, max) => {
		// 中文字符长度校验121
		let minNum = min || 1;
		let maxNum = max || 100000;
		let chReg = new RegExp(`^(([\u4e00-\u9fa5])|(\\.)|(\\·)){${minNum},${maxNum}}$`);
		return chReg.test(val);
	}
};

function clearAllCookie() {
	var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
	if (keys) {
		for (var i = keys.length; i--; ) document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
	}
}
export const vconsole = (i, consoleshow) => {
	if ((i && i.length === 10 && i === '0110001111') || consoleshow || sessionStorage.getItem('consoleshow')) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://cdn.bootcss.com/vConsole/2.0.1/vconsole.min.js';
		head.appendChild(script);
		store.setConsoleshow(true);
	} else if ((i && i.length === 10 && i === '1111000110') || consoleshow || sessionStorage.getItem('consoleshow')) {
		localStorage.clear();
		sessionStorage.clear();
		clearAllCookie();
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = 'https://cdn.bootcss.com/vConsole/2.0.1/vconsole.min.js';
		head.appendChild(script);
		store.setConsoleshow(true);
	}
};
