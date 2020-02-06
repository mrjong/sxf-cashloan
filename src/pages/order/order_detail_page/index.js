/*
 * @Author: shawn
 * @LastEditTime: 2019-09-05 10:09:21
 */
import React, { PureComponent } from 'react';
import { Card, Button } from 'antd-mobile';
import styles from './index.scss';
import fetch from 'sx-fetch';
import { store } from 'utils/store';
import { bill_queryBillDetail } from 'fetch/api';
import { setBackGround } from 'utils/background';
import { LoadingView } from 'components';
import { buriedPointEvent } from 'utils/analytins';

const API = {
	qryDtl: '/bill/qryDtl',
	fundPlain: '/fund/plain', // 费率接口
	procedure_user_sts: '/procedure/user/sts' // 判断是否提交授信
};

@setBackGround('#F0F3F9')
@fetch.inject()
export default class order_detail_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			panelCardList: []
		};
	}
	componentWillMount() {
		const { billNo } = this.props.history.location.state;
		// store.removeCardData();
		// store.removeCouponData();
		if (!billNo) {
			this.props.toast.info('订单号不能为空');
			setTimeout(() => {
				this.props.history.goBack();
			}, 3000);
			return;
		}
		this.setState(
			{
				billNo
			},
			() => {
				this.queryBillDetails();
				// 因为会有直接进到账单的公众号入口，所以在此在调一遍接口
				// this.getOverdueInfo();
			}
		);
	}

	onReloadData = () => {
		this.queryBillDetails();
	};

	// getOverdueInfo = () => {
	// 	this.props.$fetch
	// 		.post(API.procedure_user_sts)
	// 		.then((res) => {
	// 			if (res && res.msgCode === 'PTM0000') {
	// 				// overduePopupFlag信用施压弹框，1为显示，0为隐藏
	// 				this.setState({
	// 					overDueModalFlag: res.data.overduePopupFlag
	// 				});
	// 				res.data && res.data.processInfo && store.setOverdueInf(res.data.processInfo);
	// 			} else {
	// 				this.props.toast.info(res.msgInfo);
	// 			}
	// 		})
	// 		.catch(() => {
	// 			this.setState({
	// 				firstUserInfo: 'error'
	// 			});
	// 		});
	// };

	// 获取还款信息
	queryBillDetails = () => {
		this.props.$fetch
			.post(bill_queryBillDetail, {
				billNo: this.state.billNo
			})
			.then((res) => {
				if (!this.viewRef) return;
				this.viewRef.showDataView();
				if (res.code === '000000' && res.data) {
					const { overdueDays, billSts, discRedRepay, waitRepAmt, preds, perdNum } = res.data;
					this.setState({
						panelCardList: this.generatePannelCard(res.data),
						billDesc: res.data, // 详情返回的数据
						isBillClean: !(billSts === '1' || billSts === '-1'), //总账单是否结清
						thisPerdNum: perdNum,
						overdueDays,
						discRedRepay,
						waitRepAmt,
						preds
					});
				} else {
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch((err) => {
				console.log(err);
				this.viewRef && this.viewRef.setError();
			});
	};

	generatePannelCard = (data) => {
		const {
			billPrcpAmt,
			perdLth,
			repayTypNm,
			loanDt,
			payCrdCorpOrgNm,
			payCrdNoLast,
			wthdCrdCorpOrgNm,
			wthdCrdNoLast
		} = data;
		let pannelCard = [
			{
				label: '借款本金(元)',
				value: billPrcpAmt
			},
			{
				label: '借款期限',
				value: perdLth === '30' ? perdLth + '天' : perdLth + '个月'
			},
			{
				label: '还款方式',
				value: repayTypNm && repayTypNm.replace(/(^\s*)|(\s*$)/g, '')
			},
			{
				label: '放款时间',
				value: loanDt
			},
			{
				label: '收款银行卡',
				value: payCrdCorpOrgNm + '(' + payCrdNoLast + ')'
			},
			{
				label: '还款银行卡',
				value: wthdCrdCorpOrgNm + '(' + wthdCrdNoLast + ')'
			}
		];
		return pannelCard;
	};

	//一键结清
	payAllOrder = () => {
		const { billNo, billDesc, actOrderList, thisPerdNum, waitRepAmt } = this.state;

		let repayPerds = [];
		for (let i = 0; i < actOrderList.length; i++) {
			const item = actOrderList[i];
			if (item.perdSts === '0') {
				repayPerds.push(item.perdNum);
			}
		}
		// buriedPointEvent(order.payAllOrderBtnClick, {
		// 	isOverdue: false,
		// 	repayPerds: repayPerds.join(',')
		// });
		this.props.history.push({
			pathname: '/order/order_repay_confirm',
			state: {
				billNo,
				billDesc,
				repayPerds,
				canUseCoupon: false,
				actOrderList,
				isPayAll: true,
				thisPerdNum,
				overdueDays: '',
				totalList: [],
				totalAmtForShow: waitRepAmt
			}
		});
	};

	goOrderRepayPage = () => {
		const { overdueDays, repayPerds, billNo } = this.state;
		// buriedPointEvent(order.viewRepayInfoBtn, {
		// 	entry: entryFrom && entryFrom === 'home' ? '首页-查看代还账单' : '账单',
		// 	isOverdue: !!overdueDays,
		// 	repayPerds: repayPerds.join(',')
		// });
		if (billNo) {
			this.props.history.push({
				pathname: '/order/order_repay_page',
				state: {
					billNo
				}
			});
		} else {
			this.props.toast.info('未获取账单数据');
		}
	};
	render() {
		const { panelCardList, isBillClean, overdueDays } = this.state;
		return (
			<LoadingView
				ref={(view) => (this.viewRef = view)}
				nodata={{}}
				errordata={{}}
				onReloadData={() => {
					this.onReloadData();
				}}
			>
				<div className={styles.orderDetailCard}>
					<Card className={styles.antCard}>
						<Card.Header title="借款信息" />
						<Card.Body>
							{panelCardList &&
								panelCardList.map((item, index) => {
									return (
										<div key={index} className={styles.cardItem}>
											<span>{item.label}</span>
											<span>{item.value}</span>
										</div>
									);
								})}
						</Card.Body>
					</Card>
					<div className={styles.submit_btn}>
						<Button onClick={this.goOrderRepayPage}>{isBillClean ? '查看还款信息' : '查看还款计划'}</Button>
					</div>
					{!overdueDays && !isBillClean ? (
						<span onClick={this.payAllOrder} className={styles.payAllButton}>
							一键结清
						</span>
					) : null}
				</div>
			</LoadingView>
		);
	}
}
