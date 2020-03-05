import { setNextStepStatus } from 'reduxes/actions/commonActions';
import { store } from 'utils/store';
import { Toast, Modal } from 'antd-mobile';
import qs from 'qs';
import { index_getNextStep, bank_card_check, auth_getTencentFaceData } from 'fetch/api';
// import { getFaceDetect, goToStageLoan } from '@/utils/CommonUtil';
import storeRedux from 'reduxes';
import { activeConfigSts } from 'utils';

import { goToStageLoan } from './commonFunc';

/**
 * @description: 是否绑定了一张信用卡一张储蓄卡，且是否为授信信用卡
 * @param {type}
 * @return:
 */
export const bank_card_check_func = ({ $props, autId, hideToast }) => {
	return new Promise((resolve) => {
		$props.$fetch.get(`${bank_card_check}/${autId}`).then((result) => {
			if (result && result.code === '000000') {
				Toast.hide();
				resolve('1');
			} else if (result && result.code === '999974') {
				!hideToast && Toast.info(result.message);
				setTimeout(() => {
					$props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
				}, (!hideToast && 3000) || 0);
				resolve('0');
			} else if (result && result.code === '000012') {
				!hideToast && Toast.info(result.message);
				setTimeout(() => {
					$props.history.push({
						pathname: '/mine/bind_credit_page',
						search: `?noBankInfo=true&autId=${autId}`
					});
				}, (!hideToast && 3000) || 0);
				resolve('0');
			} else {
				Toast.info(result.message);
				resolve('0');
			}
		});
	});
};
/**
 * @description: 信用卡前置
 * @param {type}
 * @return:
 */
export const getBindCardStatus = async ({ $props }) => {
	let storeData = storeRedux.getState();
	const { staticState = {} } = storeData;
	const { authId } = staticState;
	return new Promise((resolve, reject) => {
		$props.$fetch
			.get(`${bank_card_check}/${authId}`)
			.then((result) => {
				// 跳转至储蓄卡
				if (result && (result.code === '999974' || result.code === '000000')) {
					Toast.hide();
					activeConfigSts({
						$props,
						type: 'B'
					});
				} else if (result && result.code === '000012') {
					Toast.info(result.message);
					setTimeout(() => {
						$props.history.replace({
							pathname: '/mine/bind_credit_page',
							search: `?noBankInfo=true&autId=${authId}&action=handleClickConfirm`
						});
					}, 3000);

					resolve('0');
				} else {
					Toast.hide();
					$props.history.push({
						pathname: '/home/home'
					});
				}
			})
			.catch(() => {
				Toast.hide();
				reject();
			});
	});
};

// 点击退出
let state = false;
const showTip = ({ $props, actionType, supTag, actionMsg = '审核' }) => {
	let ele = null;
	if (state) {
		return;
	}
	state = true;
	if (supTag === '1') {
		ele = `身份证有效期不足30天或已过期!\n重新补充极速${actionMsg}!`;
	} else {
		ele = `身份证照片找不到了!\n补充照片极速${actionMsg}!`;
	}

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
					search: `?newTitle=实名照片补充&type=${actionType}`
				});
			}
		}
	]);
};
// AUTH001 实名认证项目编号
// AUTH002 活体识别项目编号
// AUTH003 基本信息项目编号
// AUTH004 运营商项目编号
// AUTH005 信用卡项目编号
// AUTH006 芝麻分目编号
// AUTH007 app列表项目编号
// AUTH008 通讯录项目编号
// AUTH009 位置信息项目编号
// AUTH010 京东项目编号
// AUTH011 淘宝项目编号
// AUTH015 补充信息项目编号

// APPL 授信申请页
// REPAY 还款
// LOAN 借款
// LOANING 放款中或者审核中

/**
 * @param $props 传递过来的 props 包含 $fetch 等方法
 * @param needReturn 需要返回值，不需要自动处理
 * @param hideLoading 是否需要隐藏 loading
 * @param callBack 回调
 */
export const getNextStatus = ({
	$props,
	needReturn = false,
	hideLoading,
	callBack,
	actionType = '',
	actionMsg
}) =>
	new Promise(async (resolve) => {
		const nextStatusResponse = await $props.$fetch
			.post(index_getNextStep, {}, { hideToast: !!hideLoading })
			.catch(() => {
				Toast.hide();
			});

		// 如果需要返回下一步状态
		if (needReturn) {
			Toast.hide();
			return nextStatusResponse.data || nextStatusResponse;
		}
		if (nextStatusResponse.code === '000000') {
			storeRedux.dispatch(setNextStepStatus(true));
			const { data: nextData = {} } = nextStatusResponse;
			let routeName = ''; // 路由名字
			let resBackMsg = ''; // 额外参数 在回调的时候使用
			let param = null; // 可能需要的路由参数
			let stateObj = null;
			// 处理mpos直接跳转到基本信息的特殊情况
			if (actionType === 'mpos') {
				// if (nextData.nextStepGramCode === 'AUTH003') {
				// 	Toast.hide();
				// 	$props.history.replace({
				// 		pathname: '/home/essential_information',
				// 		search: '?jumpToBase=true&entry=authorize'
				// 	});
				// }
				if (nextData.nextStepGramCode === 'AUTH015') {
					Toast.hide();
					$props.history.replace({
						pathname: '/home/addInfo',
						search: '?jumpToBase=true&entry=authorize'
					});
				} else {
					Toast.hide();
					$props.history.replace('/home/home');
				}
				return;
			}
			switch (nextData.nextStepGramCode) {
				case 'AUTH001':
					if (nextData.supTag === '1' || nextData.supTag === '2') {
						Toast.hide();
						showTip({
							$props,
							supTag: nextData.supTag,
							actionType,
							actionMsg
						});
					} else {
						param = { newTitle: '实名认证' };
						routeName = '/home/real_name';
					}
					break;
				case 'AUTH002':
					$props.$fetch.get(`${auth_getTencentFaceData}`, {}).then((result) => {
						if (result.code === '000000' && result.data && result.data.h5Url) {
							Toast.loading('加载中...', 10);
							window.location.href = result.data.h5Url;
						} else {
							Toast.info(result.message);
						}
					});
					break;
				case 'AUTH003':
					resBackMsg = '基本信息认证';
					routeName = '/home/essential_information';
					break;
				case 'AUTH005':
					resBackMsg = '银行列表';
					activeConfigSts({
						$props,
						type: 'B'
					});
					return;
				// routeName = 'CreditAuth';
				case 'APPL':
					{
						let storeData = storeRedux.getState();
						const { commonState = {} } = storeData;
						const { applyCreditData } = commonState;
						if (applyCreditData) {
							activeConfigSts({
								$props,
								type: 'B'
							});
							return;
						} else if (nextData.credCardCount > 1) {
							routeName = '/mine/credit_list_page';
						} else {
							routeName = '/home/loan_repay_confirm_page';
						}
					}
					break;
				case 'REPAY':
					storeRedux.dispatch(setNextStepStatus(false));
					stateObj = {
						billNo: nextData.billNo
					};
					routeName = '/order/order_detail_page';
					break;
				case 'LOAN':
					storeRedux.dispatch(setNextStepStatus(false));
					// 代偿
					if (nextData.prodType === '01') {
						let bank_card_check_res = await bank_card_check_func({ $props, autId: nextData.autId });
						if (bank_card_check_res === '1') {
							routeName = '/home/confirm_agency';
							if (actionType === 'agencyPage') {
								resolve(nextData.nextStepGramCode);
							}
						} else {
							return;
						}
					}
					// 现金分期
					if (nextData.prodType === '11') {
						goToStageLoan({ $props });
						return;
					}
					break;
				case 'LOANING':
					routeName = '/home/home';
					break;
				// case 'AUTH04':
				// case 'AUTH06':
				// case 'AUTH07':
				// case 'AUTH08':
				// case 'AUTH09':
				// case 'AUTH010':
				// case 'AUTH011':
				//   break;
				case 'AUTH015':
					routeName = `/home/addInfo`;
					break;
				default:
					routeName = '/home/home';
					break;
			}
			if (callBack) {
				callBack({
					...nextData,
					resBackMsg
				});
			}
			if (routeName) {
				Toast.hide();
				let objRouter = {
					pathname: routeName
				};
				if (param) {
					objRouter.search = '?' + qs.stringify(param);
				}
				if (stateObj) {
					objRouter.state = stateObj;
				}
				Toast.hide();
				$props.history.push(objRouter);
			}
		} else {
			// 处理mpos直接跳转到基本信息的特殊情况
			if (actionType === 'mpos') {
				$props.history.replace('/home/home');
			} else {
				Toast.info(nextStatusResponse.message);
			}
		}
	});
