/*
 * @Author: sunjiankun
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2020-02-18 17:23:13
 */
// TODO: 添加一个返回监听需要改动三个地方
// 1、在此文件中加一个 case；
// 2、在对应的 page 页面中引入 noRouterBack.js；
import React from 'react';
import { changeHistoryState, isWXOpen } from 'utils';
import { logoutAppHandler } from 'utils/CommonUtil/commonFunc';
import { isMPOS } from 'utils/common';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import storeRedux from '../reduxes';
import { closeCurrentWebView } from 'utils/CommonUtil/commonFunc';
import PopUp from 'components/PopUp';
import Dialog from 'components/Dialogs';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
let initDialog = () => {
	let obj = new PopUp(
		(
			<Dialog
				open
				onRequestClose={(res, questionName) => {
					switch (location.pathname) {
						case '/home/loan_repay_confirm_page':
							switch (questionName) {
								case '再等等':
									buriedPointEvent(home.dialogLoanRepay_wait);
									break;
								case '关闭':
									buriedPointEvent(home.dialogLoanRepay_close);
									break;
								default:
									buriedPointEvent(home.dialogLoanRepay, {
										questionName
									});
									break;
							}
							break;
						case '/home/essential_information':
							switch (questionName) {
								case '再等等':
									buriedPointEvent(home.dialogInformation_wait, {
										questionName
									});
									break;
								case '关闭':
									buriedPointEvent(home.dialogInformation_close, {
										questionName
									});
									break;
								default:
									buriedPointEvent(home.dialogInformation, {
										questionName
									});
									break;
							}
							break;
						default:
							break;
					}
					if (!res) {
						let storeData = storeRedux.getState();
						const { commonState = {} } = storeData;
						const { nextStepStatus } = commonState;
						if (nextStepStatus && !store.getToggleMoxieCard()) {
							obj.close();
							window.ReactRouterHistory.push('/home/home');
						} else {
							if (location.pathname === '/home/loan_repay_confirm_page') {
								// 借钱还信用卡页面物理返回到首页
								obj.close();
								window.ReactRouterHistory.push('/home/home');
							} else {
								history.go(-2);
								obj.close();
							}
						}
					} else {
						obj.close();
					}
				}}
			/>
		)
	);
	return obj;
};
let obj = initDialog();

if (window.history && window.history.pushState) {
	window.addEventListener(
		'popstate',
		() => {
			// 获取token
			let token = Cookie.get('FIN-HD-AUTH-TOKEN');
			let tokenFromStorage = '';
			tokenFromStorage = store.getToken();
			// 返回拦截弹窗
			let storeData = storeRedux.getState();
			const { staticState = {} } = storeData;
			const { userInfo } = staticState;
			let backFlag = store.getBackFlag();

			if (window.location.pathname === '/home/addInfo') {
				document.activeElement.blur();
				obj.show();
				return;
			}

			/* 实名上传图片时 不允许返回 */
			if (store.getDisableBack()) {
				return;
			}
			if (window.location.pathname === '/others/mpos_testB_download_page') {
				window.ReactRouterHistory.push('/home/home');
				return;
			}
			/* 基本信息  需要实名 物理返回弹出弹窗 */
			if (window.location.pathname === '/home/real_name') {
				if (!store.getToggleMoxieCard() && ((userInfo && userInfo.nameHid) || backFlag)) {
					history.go(-2);
				} else {
					document.activeElement.blur();
					obj.show();
				}
				return;
			}

			/* 基本信息  需要实名 物理返回弹出弹窗 */

			if (window.location.pathname === '/home/essential_information') {
				if (store.getProtocolPersonalData()) {
					return;
				}
				document.activeElement.blur();
				obj.show();
				return;
			}

			if (window.location.pathname === '/home/loan_repay_confirm_page') {
				if (store.getToggleMoxieCard()) {
					// 提交授信切换信用卡问题
					store.removeToggleMoxieCard();
					return;
				}
				document.activeElement.blur();
				obj.show();
				return;
			}
			const { commonState = {} } = storeData;
			const { nextStepStatus } = commonState;
			/* 新版流程物理返回  借钱还信用卡 切换卡*/
			if (nextStepStatus && !store.getToggleMoxieCard()) {
				window.ReactRouterHistory.push('/home/home');
				return;
			}

			// 进度失败页面物理返回
			if (window.location.pathname === '/home/crawl_fail_page') {
				window.ReactRouterHistory.push('/home/home');
				return;
			}
			if (window.location.pathname === '/protocol/pdf_page') {
				if (store.getCashFenQiStoreData()) {
					window.ReactRouterHistory.replace('/home/loan_fenqi');
				} else {
					window.ReactRouterHistory.replace('/home/confirm_agency');
				}
				return;
			}

			/**首页拦截 */
			if (window.location.pathname === '/') {
				window.history.pushState(null, null, document.URL);
				return;
			}
			/**首页拦截 */

			/**登录页拦截 */
			if (window.location.pathname === '/login') {
				let isAllowBack =
					window.ReactRouterHistory &&
					window.ReactRouterHistory.location.state &&
					window.ReactRouterHistory.location.state.isAllowBack;
				let protocolBack = store.getLoginBack();
				store.removeLoginBack();
				if (isWXOpen() && isAllowBack) {
					window.ReactRouterHistory.goBack();
				} else if (isWXOpen() && protocolBack) {
					return;
				} else if (isWXOpen()) {
					// 微信中点击登陆按钮也触发这个方法，根据token区分
					if (tokenFromStorage && token) {
						window.ReactRouterHistory.goBack();
					} else {
						window.close();
						window.WeixinJSBridge.call('closeWindow');
					}
				} else if (isMPOS() && protocolBack) {
					return;
				} else if (isMPOS()) {
					closeCurrentWebView();
				} else {
					window.history.pushState(null, null, document.URL);
				}
				return;
			}
			/**登录页拦截 */

			changeHistoryState();
			let historyRouter = store.getHistoryRouter();
			if (historyRouter === '/order/wx_pay_success_page') {
				window.ReactRouterHistory.replace('/order/order_page');
				return;
			}

			// 如果从banner跳到外链 则不处理
			if (store.getOutLinkUrl()) {
				store.removeOutLinkUrl();
				return;
			}
			if (window.location.pathname === '/') {
				return;
			}
			switch (historyRouter) {
				case '/login':
					obj.show();
					return;
				case '/home/home':
					if (tokenFromStorage && token) {
						if (store.getCarrierMoxie()) {
							// 运营商直接返回的问题
							store.removeCarrierMoxie();
							return;
						}
						logoutAppHandler();
					} else if (isWXOpen() && !tokenFromStorage && !token) {
						window.close();
						window.WeixinJSBridge.call('closeWindow');
					}
					break;
				case '/order/order_page':
					if (tokenFromStorage && token) {
						logoutAppHandler();
					} else if (isWXOpen() && !tokenFromStorage && !token) {
						window.close();
						window.WeixinJSBridge.call('closeWindow');
					}
					break;
				case '/mine/mine_page':
					logoutAppHandler();
					break;
				case '/home/confirm_agency':
					store.setConfirmAgencyBackHome(true);
					break;
				case '/order/repayment_succ_page':
				case '/home/loan_apply_succ_page':
				case '/home/loan_fenqi':
					window.ReactRouterHistory.push('/home/home');
					break;
				case '/mine/credit_list_page':
					window.ReactRouterHistory.push('/home/loan_repay_confirm_page');
					break;
				case '/home/credit_apply_succ_page':
					window.ReactRouterHistory.push('/home/home');
					break;
				case '/home/loan_person_succ_page':
				case '/home/loan_robot_succ_page':
					window.ReactRouterHistory.push('/home/home');
					break;
				default:
					break;
			}
		},
		false
	);
}
