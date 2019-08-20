// TODO: 添加一个返回监听需要改动三个地方
// 1、在此文件中加一个 case；
// 2、在对应的 page 页面中引入 noRouterBack.js；
import React from 'react';
import { logoutAppHandler, changeHistoryState, isWXOpen } from 'utils';
import { isMPOS } from 'utils/common';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import { closeCurrentWebView } from 'utils';
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
						case '/home/moxie_bank_list_page':
							switch (questionName) {
								case '再等等':
									buriedPointEvent(home.dialogMoxieBank_wait, {
										questionName
									});
									break;
								case '关闭':
									buriedPointEvent(home.dialogMoxieBank_close, {
										questionName
									});
									break;
								default:
									buriedPointEvent(home.dialogMoxieBank, {
										questionName
									});
									break;
							}
							break;
						default:
							break;
					}
					if (!res) {
						if (store.getNeedNextUrl() && !store.getToggleMoxieCard()) {
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
			let token = Cookie.get('fin-v-card-token');
			let tokenFromStorage = '';
			tokenFromStorage = store.getToken();
			// 返回拦截弹窗
			let userInfo = store.getUserInfo();
			let backFlag = store.getBackFlag();
			/* 实名上传图片时 不允许返回 */
			if (store.getDisableBack()) {
				return;
			}
			/* 实名上传图片时 不允许返回 */
			// 如果当前是从首页到绑卡页面，返回直接回到首页
			if (
				store.getCheckCardRouter() &&
				(store.getHistoryRouter() === '/mine/bind_credit_page' ||
					store.getHistoryRouter() === '/mine/bind_save_page')
			) {
				window.ReactRouterHistory.push('/home/home');
				return;
			}
			// 人脸中间页物理返回
			const tencentBackUrl = store.getTencentBackUrl();
			// if (!window.tencent_face_middle_page && store.getIdChkPhotoBack()) {
			if (!window.tencent_face_middle_page && tencentBackUrl) {
				// history.go(Number(store.getIdChkPhotoBack()));
				store.removeTencentBackUrl();
				window.ReactRouterHistory.replace(tencentBackUrl);
				// store.removeIdChkPhotoBack();
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
				if (store.getBankMoxie()) {
					// 针对魔蝎银行登录页返回，连点直接返回到基本信息页的问题
					// 银行卡直接返回的问题
					store.removeBankMoxie();
					window.ReactRouterHistory.push('/home/home');
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
				if (!store.getGotoMoxieFlag()) {
					obj.show();
				}
				return;
			}

			/* 新版流程物理返回  借钱还信用卡 切换卡*/

			/* 魔蝎银行卡列表 */

			/* 魔蝎银行卡列表 */
			if (window.location.pathname === '/home/moxie_bank_list_page') {
				if (store.getBankMoxie()) {
					// 银行卡直接返回的问题
					store.removeBankMoxie();
					return;
				}
				document.activeElement.blur();
				if (!store.getGotoMoxieFlag()) {
					obj.show();
				}
				return;
			}

			/* 新版流程物理返回  借钱还信用卡 切换卡*/
			if (store.getNeedNextUrl() && !store.getToggleMoxieCard()) {
				window.ReactRouterHistory.push('/home/home');
				return;
			}

			// 进度页面物理返回
			if (window.location.pathname === '/home/crawl_progress_page') {
				let mainAutId = store.getAutId();
				store.setAutId2(mainAutId);
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
						if (!store.getLoginDownloadBtn()) {
							window.close();
							window.WeixinJSBridge.call('closeWindow');
						}
					}
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
			// 如果跳第三方 然后立马返回，则判断 MoxieBackUrl 有没有值
			if (store.getMoxieBackUrl()) {
				store.removeMoxieBackUrl();
				return; // 当时为什么去掉？
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
					if (store.getGotoMoxieFlag()) return; // 如何页面弹出反馈窗则拦截
					if (store.getToggleMoxieCard()) {
						window.ReactRouterHistory.push('/home/loan_repay_confirm_page');
						return;
					}
					window.ReactRouterHistory.push('/home/home');
					break;
				case '/home/credit_apply_succ_page':
					window.ReactRouterHistory.push('/home/home');
					break;
				case '/home/loan_person_succ_page':
					window.ReactRouterHistory.push('/home/home');
					break;
				default:
					break;
			}
		},
		false
	);
}
