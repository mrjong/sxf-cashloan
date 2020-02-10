/*
 * @Author: shawn
 * @LastEditTime : 2020-02-10 14:14:08
 */
import React, { PureComponent } from 'react';
import { Card } from 'antd-mobile';
import styles from './index.scss';
import fetch from 'sx-fetch';
import qs from 'qs';
import { bill_queryBillDetail } from 'fetch/api';
import { setBackGround } from 'utils/background';
import { LoadingView, ButtonCustom } from 'components';
import OverdueEntry from '../components/OverdueEntry';
import { connect } from 'react-redux';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';

// const noData = {
// 	img: Image.bg.no_order,
// 	text: '暂无账单',
// 	width: '100%',
// 	height: '100%'
// };
// const errorData = {
// 	img: Image.bg.no_network,
// 	text: '网络错误,点击重试',
// 	width: '100%',
// 	height: '100%'
// };
let entryFrom = '';

@setBackGround('#F0F3F9')
@fetch.inject()
@connect((state) => ({
	overdueModalInfo: state.commonState.overdueModalInfo
}))
export default class order_detail_page extends PureComponent {
	constructor(props) {
		super(props);
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		entryFrom = queryData.entryFrom;
		this.state = {
			panelCardList: []
		};
	}
	componentWillMount() {
		const { billNo } = this.props.history.location.state;
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
			}
		);
	}

	onReloadData = () => {
		this.queryBillDetails();
	};

	// 获取还款信息
	queryBillDetails = () => {
		this.props.$fetch
			.post(bill_queryBillDetail, {
				billNo: this.state.billNo
			})
			.then((res) => {
				if (!this.viewRef) return;
				if (res.code === '000000' && res.data) {
					const { overdueDays, billSts, discRedRepay, waitRepAmt, preds, perdNum } = res.data;
					this.setState(
						{
							panelCardList: this.generatePannelCard(res.data),
							billDesc: res.data, // 详情返回的数据
							isBillClean: !(billSts === '1' || billSts === '-1'), //总账单是否结清
							thisPerdNum: perdNum,
							overdueDays,
							discRedRepay,
							waitRepAmt,
							preds
						},
						() => {
							this.viewRef.showDataView();
						}
					);
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
		const { billNo, billDesc, preds, thisPerdNum, waitRepAmt } = this.state;
		let repayPerds = [];
		for (let i = 0; i < preds.length; i++) {
			const item = preds[i];
			if (item.perdSts === '0') {
				repayPerds.push(item.perdNum);
			}
		}
		buriedPointEvent(order.payAllOrderBtnClick, {
			isOverdue: false,
			repayPerds: repayPerds.join(',')
		});
		this.props.history.push({
			pathname: '/order/order_repay_confirm',
			state: {
				billNo,
				billDesc,
				repayPerds,
				canUseCoupon: false,
				isPayAll: true,
				thisPerdNum,
				overdueDays: '',
				totalList: [],
				totalAmt: waitRepAmt
			}
		});
	};

	goOrderRepayPage = () => {
		const { overdueDays, repayPerds = [], billNo } = this.state;
		buriedPointEvent(order.viewRepayInfoBtn, {
			entry: entryFrom && entryFrom === 'home' ? '首页-查看代还账单' : '账单',
			isOverdue: !!overdueDays,
			repayPerds: repayPerds.join(',')
		});
		this.props.history.push({
			pathname: '/order/order_repay_page',
			state: {
				billNo
			}
		});
	};
	render() {
		const { panelCardList, isBillClean, overdueDays } = this.state;
		const isEntryShow = this.props.overdueModalInfo && this.props.overdueModalInfo.olpSts === '1';
		return (
			<LoadingView
				ref={(view) => (this.viewRef = view)}
				nodata={{}}
				errordata={{}}
				onReloadData={() => {
					this.onReloadData();
				}}
			>
				<OverdueEntry isOverdue={isEntryShow} history={this.props.history} overdueDays={overdueDays} />
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
						<ButtonCustom onClick={this.goOrderRepayPage}>
							{isBillClean ? '查看还款信息' : '查看还款计划'}
						</ButtonCustom>
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
