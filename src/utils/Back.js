// TODO: 添加一个返回监听需要改动三个地方
// 1、在此文件中加一个 case；
// 2、在对应的 page 页面中引入 noRouterBack.js；
import React from 'react';
import { logoutAppHandler, changeHistoryState, isWXOpen, getDeviceType } from 'utils';
import qs from 'qs';
import Cookie from 'js-cookie';
import { store } from 'utils/store';
import PopUp from 'components/PopUp';
import Dialog from 'components/Dialogs';
// const queryData = qs.parse(window.location.search, { ignoreQueryPrefix: true });
let initDialog = (errMsg) => {
	let obj = new PopUp(
		(
			<Dialog
				open
				content={errMsg || '连接服务器失败，请稍后重试'}
				actions={[
					{
						label: '确定',
						className: 'rob-btn rob-btn-danger rob-btn-circle'
					}
				]}
				onRequestClose={(res) => {
					if (!res) {
						const queryData = qs.parse(window.location.search, { ignoreQueryPrefix: true });

						if (store.getNeedNextUrl() && !store.getToggleMoxieCard()) {
							obj.close();
							window.ReactRouterHistory.push('/home/home');
						} else {
							history.go(-2);
							obj.close();
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
let obj = initDialog('22222');

if (window.history && window.history.pushState) {
	window.addEventListener(
		'popstate',
		() => {
			const queryData = qs.parse(window.location.search, { ignoreQueryPrefix: true });
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

			/* 基本信息  需要实名 物理返回弹出弹窗 */
			if (window.location.pathname === '/home/real_name') {
				if (!store.getToggleMoxieCard()&&((userInfo && userInfo.nameHid) || backFlag)) {
					history.go(-2);
				} else {
					document.activeElement.blur();
					obj.show();
				}
				return;
			}

			/* 基本信息  需要实名 物理返回弹出弹窗 */

			if (window.location.pathname === '/home/essential_information') {
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
				obj.show();
				return;
			}
			/* 新版流程物理返回  借钱还信用卡 切换卡*/
			if (store.getNeedNextUrl() && !store.getToggleMoxieCard()) {
				window.ReactRouterHistory.push('/home/home');
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
						WeixinJSBridge.call('closeWindow');
					}
				} else {
					window.history.pushState(null, null, document.URL);
				}
				return;
			}
			/**登录页拦截 */

			changeHistoryState();
			let historyRouter = store.getHistoryRouter();
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
					return;
				case '/home/home':
					if (tokenFromStorage && token) {
						if (window.handleCloseHomeModal) {
							window.handleCloseHomeModal();
							return;
						}
						// alert(store.getCarrierMoxie())
						if (store.getCarrierMoxie()) {
							// 运营商直接返回的问题
							store.removeCarrierMoxie();
							return;
						} else {
							logoutAppHandler();
						}
					} else if (isWXOpen() && !tokenFromStorage && !token) {
						window.close();
						WeixinJSBridge.call('closeWindow');
					}
					break;
				case '/order/order_page':
					if (tokenFromStorage && token) {
						logoutAppHandler();
					} else if (isWXOpen() && !tokenFromStorage && !token) {
						window.close();
						WeixinJSBridge.call('closeWindow');
					}
					break;
				case '/mine/mine_page':
					logoutAppHandler();
					break;
				case '/order/repayment_succ_page':
				case '/home/confirm_agency': // 确认信息页物理返回到首页
					window.ReactRouterHistory.push('/home/home');
					break;
				case '/mine/credit_extension_page':
					window.ReactRouterHistory.push('/mine/mine_page');
					break;
				case '/mine/credit_list_page':
					if (store.getToggleMoxieCard()) {
						window.ReactRouterHistory.push('/home/loan_repay_confirm_page');
						return;
					} else {
						window.ReactRouterHistory.push('/home/home');
					}
					break;
				default:
					// window.ReactRouterHistory.goBack()
					break;
			}
		},
		false
	);
}
