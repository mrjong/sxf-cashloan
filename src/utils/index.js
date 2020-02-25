/*
 * @Author: shawn
 * @LastEditTime: 2020-02-25 10:52:14
 */
/*eslint-disable */
import React from 'react';
import { buriedPointEvent, sxfDataLogin } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { Modal, Toast } from 'antd-mobile';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import { isMPOS } from 'utils/common';
import { getAppsList, getContactsList } from 'utils/publicApi';
import { signup_log, abt_mpos } from 'fetch/api';
import storeRedux from '../reduxes';
// 退出的api
const API = {
	LOGOUT: '/signup/logout', // 用户退出登陆
	GETSTSW: '/my/getStsw', // 获取首页进度
	getOperator: '/auth/operatorAuth', // 运营商的跳转URL
	qryPerdRate: '/bill/qryperdrate', // 0105-确认代还信息查询接口
	submitState: '/bill/apply', // 提交代还金申请
	idChkPhoto: '/auth/idChkPhoto',
	getFace: '/auth/getTencentFaceidData', // 人脸识别认证跳转URL
	CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
	checkEngaged: '/activeConfig/checkEngaged',
	saveUserInfoEngaged: '/activeConfig/saveUserInfoEngaged',
	checkIsEngagedUser: '/activeConfig/checkIsEngagedUser',
	mxoieCardList: '/moxie/mxoieCardList/C',
	activeConfigSts: '/activeConfig/ab/sts',
	contractLog: '/contract/log', // 协议预览留痕记录
	queryUsrSCOpenId: '/my/queryUsrSCOpenId', // 用户标识
	MX_CRED_SWITCH: '/my/switchFlag/MX_CRED_SWITCH',
	cardAuth: '/auth/cardAuth', // 信用卡授信
	operatorAuth: '/auth/operatorAuth', // 运营商授信
	chkCredCard: '/my/chkCredCard' // 查询信用卡列表中是否有授权卡
};
// 处理输入框失焦页面不回弹
export const handleInputBlur = () => {
	setTimeout(() => {
		const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		window.scrollTo(0, scrollTop);
	}, 100);
};

// 判断是否是微信打开
export const isWXOpen = () => {
	var ua = navigator.userAgent.toLowerCase();
	return /micromessenger/.test(ua) ? true : false;
};

// 判断是否是手机打开
export const isPhone = () => {
	var userAgentInfo = navigator.userAgent;
	var Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
	var flag = false;
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = true;
			break;
		}
	}
	return flag;
};

export const pagesIgnore = (pathname = window.location.pathname) => {
	if (pathname) {
		let pageList = [
			'/protocol/',
			'/activity/',
			'/others/',
			'/landing/landing_page',
			'/common/auth_page',
			'/common/postmessage_app',
			'/mpos/mpos_ioscontrol_page',
			'/home/credit_apply_succ_page', // 因为app直接跳转到h5的webview，所以放开
			'/home/loan_apply_succ_page', // 因为app直接跳转到h5的webview，所以放开
			'/mine/qiyu', // 因为app直接跳转到h5的webview，所以放开
			'/home/loan_person_succ_page', // 因为app直接跳转到h5的webview，所以放开
			'/home/loan_robot_succ_page', // 因为app直接跳转到h5的webview，所以放开
			'/common/middle_page',
			'/mine/help_center_page',
			'/mine/question_category_page'
		];
		if (isWXOpen()) {
			let pageListWx = ['/home/home', '/common/wx_middle_page', '/mpos/mpos_ioscontrol_page'];
			// h5的banner也会跳到/mpos/mpos_ioscontrol_page这个落地页，因此放开
			pageList = pageList.concat(pageListWx);
		} else if (isMPOS()) {
			let pageListMpos = ['/mpos/'];
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
		}
		return false;
	}
	if (
		/MicroMessenger/i.test(ua) ||
		/QQ/i.test(ua) ||
		/AlipayClient/i.test(ua) ||
		/SuiXingPay-Mpos/i.test(ua) ||
		/SuiXingPay-Cashier/i.test(ua)
	) {
		return true;
	}
	return false;
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
			? 'ANDROID'
			: u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
			? 'IOS'
			: 'PC';
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
// 点击退出
let state = false;
// 定义需要拦截的路由
const interceptRouteArr = [
	'/login',
	'/home/home',
	'/order/order_page',
	'/mine/mine_page',
	'/order/repayment_succ_page',
	'/mine/credit_list_page',
	'/home/essential_information',
	'/home/real_name',
	'/home/confirm_agency',
	'/home/loan_repay_confirm_page',
	'/home/credit_apply_succ_page',
	'/home/loan_apply_succ_page',
	'/order/wx_pay_success_page',
	// '/protocol/pdf_page',
	'/home/loan_fenqi',
	'/home/addInfo',
	'/common/crash_page',
	'/others/mpos_testB_download_page'
];

// 在需要路由拦截的页面 pushState
export const changeHistoryState = () => {
	if (interceptRouteArr.includes(window.location.pathname)) {
		window.history.pushState(null, null, document.URL); //在IE中必须得有这两行
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
	bankCreditCardNumber: (val) => /^\d{14,20}$/.test(val), // 银行卡号 val.replace(/\s+/g, "")
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

export const generateRandomPhone = () => {
	const chars = ['3', '5', '7', '8'];
	return `1${chars[Math.ceil(Math.random() * 3)]}${Math.ceil(Math.random() * 9)}****${Math.ceil(
		Math.random() * 9
	)}${Math.ceil(Math.random() * 9)}${Math.ceil(Math.random() * 9)}${Math.ceil(Math.random() * 9)}`;
};

// 判断活动是否过期
export const checkEngaged = ({ $props, AcCode }) => {
	return new Promise((resolve, reject) => {
		$props.$fetch
			.get(`${API.checkEngaged}/${AcCode}`)
			.then((result) => {
				resolve(result);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

// 判断活动是否参与

export const checkIsEngagedUser = ({ $props, AcCode }) => {
	return new Promise((resolve, reject) => {
		$props.$fetch
			.get(`${API.checkIsEngagedUser}/${AcCode}`)
			.then((result) => {
				resolve(result);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

// 参与活动

export const saveUserInfoEngaged = ({ $props, AcCode }) => {
	return new Promise((resolve, reject) => {
		$props.$fetch
			.get(`${API.saveUserInfoEngaged}/${AcCode}`)
			.then((result) => {
				resolve(result);
			})
			.catch((err) => {
				reject(err);
			});
	});
};

// 查询两个日期相差的天数
export const dateDiffer = (sDate1, sDate2) => {
	//sDate1和sDate2是2006/12/18格式
	var dateSpan, iDays;
	sDate1 = Date.parse(sDate1);
	sDate2 = Date.parse(sDate2);
	dateSpan = sDate2 - sDate1;
	dateSpan = Math.abs(dateSpan);
	iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
	return iDays;
};
export const getMoxieData = async ({ $props, bankCode, goMoxieBankList }) => {
	activeConfigSts({
		$props,
		type: 'B'
	});
	return;
};

/**
 * @description: 协议预览记录功能
 * @param {string} cardNo 为银行卡号，只在协议支付的时候传递
 * @param {string} contractType 为协议类型 01为用户注册协议 02为用户隐私协议 03为用户协议绑卡,用户扣款委托书
 * @return:
 */
export const recordContract = (params) => fetch.post(signup_log, params, { hideToast: true });

/**
 * @description: AB测试
 * @param {$props} this.props
 * @param {callback} 回调函数
 * @param {type} 类型 A/B
 * @return:
 */
export const activeConfigSts = ({ $props, callback, type }) => {
	if (type === 'B') {
		Toast.hide();
		$props.history.push('/others/mpos_testB_download_page');
		return;
	}
	$props.$fetch
		.get(abt_mpos)
		.then((res) => {
			if (res && res.code === '000000' && res.data && res.data.sts) {
				switch (res.data.sts) {
					case '00':
						callback();
						break;
					case '01':
						Toast.hide();

						store.setTestABTag('A');
						//下载页面
						$props.history.replace('/others/mpos_testA_download_page');
						break;
					case '02':
						if (type === 'A') {
							callback();
						}
						store.setTestABTag('B');

						break;

					default:
						break;
				}
			} else {
				$props.toast.info('系统开小差，请稍后重试');
			}
		})
		.catch(() => {
			$props.toast.info('系统开小差，请稍后重试');
		});
};

// 引用类型数组校验是否存在重复项
/**判断数组中 某个key是否重复
 *param arr 判断的数组
 *param key 判断的key
 *return 重复返回false 不重复返回true
 */
export const arrCheckDup = (arr, key) => {
	var obj = {};
	for (var i = 0; i < arr.length; i++) {
		if (obj[arr[i][key]]) {
			return false;
		} else {
			obj[arr[i][key]] = arr[i];
		}
	}
	return true;
};

// 神策用户绑定
export const queryUsrSCOpenId = () => {
	let storeData = storeRedux.getState();
	const { staticState = {} } = storeData;
	const { userInfo } = staticState;
	return new Promise((resolve) => {
		if (!store.getQueryUsrSCOpenId()) {
			if (userInfo && userInfo.tokenId) {
				window.sa.login(userInfo.scOpenId);
				sxfDataLogin(userInfo.scOpenId);
				store.setQueryUsrSCOpenId(userInfo.scOpenId);
				resolve(true);
			} else {
				resolve(true);
			}
		} else {
			resolve(true);
		}
	});
};
