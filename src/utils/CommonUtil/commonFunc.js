/*
 * @Author: shawn
 * @LastEditTime: 2020-03-24 18:32:22
 */
import React from 'react';
import { Toast, Modal } from 'antd-mobile';
import fetch from 'sx-fetch';
import { signup_logout, bank_card_contract_info, loan_loanSubPreAppr } from 'fetch/api';
import { commonClearState } from 'reduxes/actions/commonActions';
import { specialClearState } from 'reduxes/actions/specialActions';
import { setUserInfoAction, staticClearState } from 'reduxes/actions/staticActions';
import { base64Decode } from './toolUtil';
import storeRedux from 'reduxes';
import { isMPOS, getH5Channel, setH5Channel } from 'utils/common';
import Cookie from 'js-cookie';
import { isWXOpen } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { preLoan } from 'utils/analytinsType';

/**
 * @description: 退出清除数据的方法
 * @param {type}
 * @return:
 */
export const logoutClearData = () => {
	storeRedux.dispatch(commonClearState());
	storeRedux.dispatch(staticClearState());
	storeRedux.dispatch(specialClearState());
	storeRedux.dispatch(setUserInfoAction({}));
	Cookie.remove('FIN-HD-AUTH-TOKEN');
	let h5Channel = getH5Channel();
	localStorage.clear();
	sessionStorage.clear();
	setH5Channel(h5Channel);
};

/**
 * @description: 处理后台返回的时间
 * @param {type}
 * @return:
 */
export const getTimeStr = (time) => {
	if (!time) {
		return '';
	}
	const y = time.substring(0, 4);
	const m = time.substring(4, 6);
	const d = time.substring(6, 8);
	const h = time.substring(8, 10);
	const m1 = time.substring(10, 12);
	const s = time.substring(12, 14);
	return `${y}/${m}/${d} ${h}:${m1}:${s}`;
};
/**
 * @description: 账单需要更新等跳转逻辑
 * @param {type}
 * @return:
 */
export const updateBillInf = ({ $props, type = '', usrIndexInfo }) => {
	const { cardBillSts, cardBinSupport, persionCheck, cardBillAmt, minApplAmt, credCardCount } = usrIndexInfo;
	if (persionCheck === '00') {
		Toast.info('非本人信用卡，请代偿其他信用卡', 2, () => {
			$props.history.push(credCardCount > 1 ? '/mine/credit_list_page' : '/others/mpos_testB_download_page');
		});
		return true;
	} else if (cardBinSupport === '00') {
		Toast.info('暂不支持当前信用卡，请代偿其他信用卡', 2, () => {
			$props.history.push(credCardCount > 1 ? '/mine/credit_list_page' : '/others/mpos_testB_download_page');
		});
		return true;
	} else if (cardBillSts === '00') {
		Toast.info('还款日已到期，请更新账单获取最新账单信息', 2, () => {
			// 跳银行登录页面
			let param = {};
			if (usrIndexInfo.buidSts === '01') {
				param.autId = usrIndexInfo.autId;
				param.cardNoHid = usrIndexInfo.cardNoHid;
			}
			$props.history.push(credCardCount > 1 ? '/mine/credit_list_page' : '/others/mpos_testB_download_page', {
				RouterType: 'selectAuthCard',
				...param
			});
		});
		return true;
	} else if (cardBillSts === '02') {
		Toast.info('已产生新账单，请更新账单或代偿其他信用卡', 2, () => {
			if (credCardCount > 1 && type !== 'LoanRepayConfirm') {
				$props.history.push(
					credCardCount > 1 ? '/mine/credit_list_page' : '/others/mpos_testB_download_page'
				);
			} else {
				let param = {};
				if (usrIndexInfo.buidSts === '01') {
					param.autId = usrIndexInfo.autId;
					param.cardNoHid = usrIndexInfo.cardNoHid;
				}
				// 跳银行登录页面
				$props.history.push(
					credCardCount > 1 ? '/mine/credit_list_page' : '/others/mpos_testB_download_page',
					{
						RouterType: 'selectAuthCard',
						...param
					}
				);
			}
		});
		return true;
	} else if (cardBillAmt < minApplAmt) {
		Toast.info(`账单低于最低可借金额：${minApplAmt}元，请代偿其他信用卡`, 2, () => {
			$props.history.push(credCardCount > 1 ? '/mine/credit_list_page' : '/others/mpos_testB_download_page');
		});
		return true;
	}
	return false;
};

/**
 * @description: 跳转预授信签约借款页面
 * @param {type}
 * @return:
 */
export const goToPreLoan = ({ $props }) => {
	$props.history.push('/home/pre_loan');
};

// 预授信借款提交接口
export const handleClickPreLoanSubmit = ($props, repaymentData, goBack) =>
	new Promise((resolve, reject) => {
		const { sendParams = {}, selProduct = {} } = repaymentData;
		const params = {
			...sendParams
		};
		console.log(repaymentData, 'ssss');
		$props.$fetch
			.post(loan_loanSubPreAppr, params)
			.then((res1) => {
				Toast.hide();
				resolve('success');
				// 提交签约信息返回成功
				if (res1 && res1.code === '000000') {
					Toast.info('签约成功，请留意放款通知！', 2, () => {
						let title = `预计60秒完成放款`;
						let desc = `超过2个工作日没有放款成功，可`;
						$props.history.push({
							pathname: '/home/loan_apply_succ_page',
							search: `?title=${title}&desc=${desc}&prodType=21`
						});
					});
					buriedPointEvent(preLoan.loanSignResult, {
						is_success: true,
						amount_value: sendParams.loanAmt,
						perd_length: selProduct.prodLth
					});
				} else {
					buriedPointEvent(preLoan.loanSignResult, {
						is_success: false,
						fail_reason: res1.message,
						amount_value: sendParams.loanAmt,
						perd_length: selProduct.prodLth
					});
					Toast.info(res1.message);
					if (goBack) {
						setTimeout(() => {
							$props.history.push('/home/pre_loan');
						}, 2000);
					}
				}
			})
			.catch(() => {
				Toast.hide();
				reject('error');
				if (goBack) {
					setTimeout(() => {
						$props.history.push('/home/pre_loan');
					}, 2000);
				}
			});
	});
// 退出功能
export const logoutApp = () => {
	fetch.get(signup_logout).then(
		(result) => {
			if (result && result.code !== '000000') {
				result.message && Toast.info(result.message);
				return;
			}
			if (
				window.ReactRouterHistory.location &&
				window.ReactRouterHistory.location.pathname === '/order/order_page' &&
				isWXOpen()
			) {
				//兼容微信公众号里退出再登录不能到目标页面的问题
				window.ReactRouterHistory.push('/login?jumpUrl=/order/order_page&wxTestFrom=wx_middle_page');
			} else {
				window.ReactRouterHistory.push('/login');
			}
			//退出时,删除通付盾script
			document.getElementById('tonfudunScript') &&
				document.body.removeChild(document.getElementById('tonfudunScript'));
			document.getElementById('payegisIfm') &&
				document.body.removeChild(document.getElementById('payegisIfm'));
		},
		(err) => {
			err.msgInfo && Toast.info(err.msgInfo);
		}
	);
};

//关闭view
export const closeCurrentWebView = () => {
	window.setupWebViewJavascriptBridge((bridge) => {
		bridge.callHandler('closeCurrentWebView', '', function(response) {
			console.log(response);
		});
	});
};
let state = false;

export const logoutAppHandler = (that) => {
	if (isMPOS()) {
		closeCurrentWebView();
		return;
	}
	if (state) {
		return;
	}
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
};

/**
 * @description: 查询协议预览相关数据
 */
export const queryProtocolPreviewInfo = ({ $props }) => {
	return new Promise((resolve, reject) => {
		$props.$fetch
			.get(bank_card_contract_info, null, { hideToast: true })
			.then((result) => {
				if (result && result.code === '000000' && result.data) {
					const { name, idNo } = result.data;

					resolve({
						name: base64Decode(name),
						idNo: base64Decode(idNo)
					});
				} else {
					Toast.info(result.message);
					reject();
				}
			})
			.catch(() => {
				reject();
			});
	});
};
