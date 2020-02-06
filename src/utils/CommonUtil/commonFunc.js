/*
 * @Author: shawn
 * @LastEditTime : 2020-02-06 17:44:36
 */
import { Toast } from 'antd-mobile';
import { loan_queryCashLoanApplInfo } from 'fetch/api';
import { base64Decode } from './toolUtil';
import { TFDLogin } from 'utils/getTongFuDun';
/**
 * @description: 账单需要更新等跳转逻辑
 * @param {type}
 * @return:
 */
export const updateBillInf = ({ $props, type = '', usrIndexInfo }) => {
	const { cardBillSts, cardBinSupport, persionCheck, cardBillAmt, minApplAmt, credCardCount } = usrIndexInfo;
	if (persionCheck === '00') {
		Toast.info('非本人信用卡，请代偿其他信用卡', 2, () => {
			$props.navigation.navigate(credCardCount > 1 ? 'SelectAuthCard' : 'CreditAuth');
		});
		return true;
	} else if (cardBinSupport === '00') {
		Toast.info('暂不支持当前信用卡，请代偿其他信用卡', 2, () => {
			$props.navigation.navigate(credCardCount > 1 ? 'SelectAuthCard' : 'CreditAuth');
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
			$props.navigation.navigate('CreditAuth', {
				RouterType: 'selectAuthCard',
				...param
			});
		});
		return true;
	} else if (cardBillSts === '02') {
		Toast.info('已产生新账单，请更新账单或代偿其他信用卡', 2, () => {
			if (credCardCount > 1 && type !== 'LoanRepayConfirm') {
				$props.navigation.navigate(credCardCount > 1 ? 'SelectAuthCard' : 'CreditAuth');
			} else {
				let param = {};
				if (usrIndexInfo.buidSts === '01') {
					param.autId = usrIndexInfo.autId;
					param.cardNoHid = usrIndexInfo.cardNoHid;
				}
				// 跳银行登录页面
				$props.navigation.navigate('CreditAuth', {
					RouterType: 'selectAuthCard',
					...param
				});
			}
		});
		return true;
	} else if (cardBillAmt < minApplAmt) {
		Toast.info(`账单低于最低可借金额：${minApplAmt}元，请代偿其他信用卡`, 2, () => {
			$props.navigation.navigate(credCardCount > 1 ? 'SelectAuthCard' : 'CreditAuth');
		});
		return true;
	}
	return false;
};

/**
 * @description: 跳转现金分期页面
 * @param {type}
 * @return:
 */
export const goToStageLoan = ({ $props }) => {
	//传设备指纹，不需接口成功即跳转现金分期
	// store.getUserPhone().then(phoneNo => {
	const { $fetch } = $props;
	TFDLogin();
	// const params = { channelType: 'app' };

	// Toast.loading('', 10);
	$fetch
		.post(loan_queryCashLoanApplInfo)
		.then((res) => {
			Toast.hide();
			if (res.code === '000000') {
				if (!(res.data && res.data.prods && res.data.prods.length)) {
					Toast.info('无借款产品，请联系客服');
					return;
				}
				if (res.data && res.data.contacts && res.data.contacts.length) {
					res.data.contacts.map((item, index) => {
						item.name = base64Decode(item.name);
						item.number = base64Decode(item.number);
						if (index < 5) {
							item.isMarked = true;
						} else {
							item.isMarked = false;
						}
						item.uniqMark = 'uniq' + index;
						return item;
					});
				}
				if (res.data && res.data.excludedContacts && res.data.excludedContacts.length) {
					for (let i = 0; i < res.data.excludedContacts.length; i++) {
						res.data.excludedContacts[i] = base64Decode(res.data.excludedContacts[i]);
					}
				}
				this.props.history.push('/home/loan_fenqi');
				// TODONEW
				// $props.navigation.navigate('StageLoan', {
				// 	pageInfo: res.data
				// 	// usageList: usageList.data,
				// });
			} else {
				Toast.info(res.message);
				setTimeout(() => {
					$props.history.push('/home/home');
				}, 2000);
			}
		})
		.catch(() => {
			Toast.info('系统开小差,请稍后重试');
			setTimeout(() => {
				$props.history.push('/home/home');
			}, 2000);
		});
	// });
};
