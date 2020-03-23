import React, { PureComponent } from 'react';
import styles from './index.scss';
import { LoadingView, TipConfirmModal } from 'components';
import { Card } from 'antd-mobile';
import { bill_queryBillDetail, repay_queryCashRegisterDetail } from 'fetch/api';
import { setCouponDataAction } from 'reduxes/actions/commonActions';
import OverdueEntry from '../components/OverdueEntry';
import PerdList from './PerdList';
import OverdueTipModal from './OverdueTipModal';
import BottomButton from './BottomButton';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import Image from 'assets/image';
import { connect } from 'react-redux';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import { isWXOpen } from 'utils';

@setBackGround('#F0F3F9')
@fetch.inject()
@connect(
	(state) => ({
		overdueModalInfo: state.commonState.overdueModalInfo
	}),
	{ setCouponDataAction }
)
export default class order_repay_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			perdLth: '', //分期期数
			panelList: [], //被截取逾期的子账单列表
			billDesc: {}, // 详情返回的数据
			isShowBottomBtn: false,
			overdueDays: '',
			billOvduStartDt: '',
			buttonDisabled: true,
			panelListUpdate: false,
			isShowSplitOrderTip: false
		};
	}
	componentDidMount = () => {
		const { billNo } = this.props.history.location.state;

		this.setState(
			{
				buttonDisabled: true,
				billNo
			},
			() => {
				this.queryBillDetails();
				this.props.setCouponDataAction({});
			}
		);
	};

	onReloadData = () => {
		this.queryBillDetails();
	};

	/**
	 * @description 查询账单详情
	 */
	queryBillDetails = () => {
		this.props.$fetch
			.post(bill_queryBillDetail, { billNo: this.state.billNo })
			.then((res) => {
				if (!this.viewRef) return;
				this.viewRef.showDataView();
				if (res.code === '000000' && res.data) {
					const { billOvduStartDt, billSts, preds, perdNum, overdueDays, perdLth } = res.data;
					const isShowBottomBtn = billSts === '1' || billSts === '-1'; // 主状态
					// const test = [
					// 	{
					// 		perdNum: 1,
					// 		perdTotAmt: 2126.37,
					// 		perdPrcpAmt: 1617.37,
					// 		perdMngAmt: 389,
					// 		perdAprAmt: 0,
					// 		perdItrtAmt: 120,
					// 		perdWtdwAmt: 0,
					// 		perdFineAmt: 0,
					// 		perdOvduAmt: 0,
					// 		perdTotRepAmt: 2126.37,
					// 		perdWaitRepAmt: 0,
					// 		derateFineAmt: 0,
					// 		deductionAmt: 0,
					// 		discRedRepayAmt: null,
					// 		perdActualRepAmt: 2126.37,
					// 		perdDueDt: '2020年04月18日',
					// 		perdSts: '4',
					// 		perdStsNm: '已结清',
					// 		color: '#868F9E',
					// 		clearState: '03',
					// 		fees: [
					// 			{ feeNm: '本金', feeAmt: 1636.77 },
					// 			{ feeNm: '利息', feeAmt: 100.59 },
					// 			{ feeNm: '服务费', feeAmt: 326.08 },

					// 			{ feeNm: '罚息', feeAmt: 0 },
					// 			{ feeNm: '提现手续费', feeAmt: 0 },
					// 			{ feeNm: '其他', feeAmt: 0 },
					// 			{ feeNm: '剩余应还金额', feeAmt: 2063.44 }
					// 		]
					// 	},
					// 	{
					// 		perdNum: 2,
					// 		perdTotAmt: 2126.37,
					// 		perdPrcpAmt: 1617.37,
					// 		perdMngAmt: 389,
					// 		perdAprAmt: 0,
					// 		perdItrtAmt: 120,
					// 		perdWtdwAmt: 0,
					// 		perdFineAmt: 0,
					// 		perdOvduAmt: 0,
					// 		perdTotRepAmt: 2126.37,
					// 		perdWaitRepAmt: 0,
					// 		derateFineAmt: 0,
					// 		deductionAmt: 0,
					// 		discRedRepayAmt: null,
					// 		perdActualRepAmt: 2126.37,
					// 		perdDueDt: '2020年04月18日',
					// 		perdSts: '0',
					// 		perdStsNm: '待还款',
					// 		color: '#3A7AE5',
					// 		clearState: '00',
					// 		fees: [
					// 			{ feeNm: '本金', feeAmt: 1636.77 },
					// 			{ feeNm: '利息', feeAmt: 100.59 },
					// 			{ feeNm: '服务费', feeAmt: 326.08 },

					// 			{ feeNm: '罚息', feeAmt: 0 },
					// 			{ feeNm: '提现手续费', feeAmt: 0 },
					// 			{ feeNm: '其他', feeAmt: 0 },
					// 			{ feeNm: '剩余应还金额', feeAmt: 2063.44 }
					// 		]
					// 	},
					// 	{
					// 		perdNum: 3,
					// 		perdTotAmt: 2126.37,
					// 		perdPrcpAmt: 1617.37,
					// 		perdMngAmt: 389,
					// 		perdAprAmt: 0,
					// 		perdItrtAmt: 120,
					// 		perdWtdwAmt: 0,
					// 		perdFineAmt: 0,
					// 		perdOvduAmt: 0,
					// 		perdTotRepAmt: 2126.37,
					// 		perdWaitRepAmt: 0,
					// 		derateFineAmt: 0,
					// 		deductionAmt: 0,
					// 		discRedRepayAmt: null,
					// 		perdActualRepAmt: 2126.37,
					// 		perdDueDt: '2020年04月18日',
					// 		perdSts: '0',
					// 		perdStsNm: '待还款',
					// 		color: '#3A7AE5',
					// 		clearState: '01',
					// 		fees: [
					// 			{ feeNm: '本金', feeAmt: 1636.77 },
					// 			{ feeNm: '利息', feeAmt: 100.59 },
					// 			{ feeNm: '服务费', feeAmt: 326.08 },

					// 			{ feeNm: '罚息', feeAmt: 0 },
					// 			{ feeNm: '提现手续费', feeAmt: 0 },
					// 			{ feeNm: '其他', feeAmt: 0 },
					// 			{ feeNm: '剩余应还金额', feeAmt: 2063.44 }
					// 		]
					// 	}
					// ];
					this.setState(
						{
							perdLth, //分期期数
							panelList: this.generatePerdList(preds, perdNum, overdueDays, isShowBottomBtn), //被截取逾期的子账单列表
							billDesc: res.data, // 详情返回的数据
							isShowBottomBtn,
							overdueDays,
							billOvduStartDt
							// test
						},
						() => {
							this.calcPayTotalMoney();
						}
					);
				} else {
					this.props.toast.info(res.message);
				}
			})
			.catch(() => {
				this.viewRef && this.viewRef.setError();
			});
	};

	/**
	 * @description 生成账单列表数据
	 */
	generatePerdList = (perdList, perdNum, overdueDays, isShowBottomBtn) => {
		// 在还款计划中添加优惠劵和应还金额字段
		if (perdList.length) {
			for (let i = 0; i < perdList.length; i++) {
				// 总账单的状态是否有逾期
				perdList[i].isChecked = perdList[i].perdSts === '1' || perdNum === i + 1;
				if (perdList[i].isChecked) {
					perdList[i].feesStatus = this.handleFeesCheckedStatus(perdList[i].clearState);
				}
				// 已还清、已支付的状态的栏位不显示勾选框
				// perdSts 0：未到期;1：已逾期;2：处理中;3：已撤销;4：已还清
				if (!isShowBottomBtn) {
					perdList[i].isShowCheck = false;
				} else if (perdList[i].perdSts === '4' || perdList[i].perdSts === '2') {
					perdList[i].isShowCheck = false;
				} else {
					perdList[i].isShowCheck = true;
				}
			}
		}

		this.setState({
			actPanelListDatas: perdList //未经逾期过滤的子账单
		});

		if (overdueDays) {
			//如果账单逾期
			perdList = perdList.filter((item) => item.perdSts === '1' || item.perdSts === '2').slice(0, 1);
		}

		return perdList;
	};

	/**
	 * @description 还款金额试算
	 */
	getFundPlainInfo = (isPayAll) => {
		const { billDesc, repayPerds, billNo, repayPerdsTypes } = this.state;
		this.props.$fetch
			.post(repay_queryCashRegisterDetail, {
				billNo,
				isSettle: isPayAll ? '1' : '0', // 一键结清isSettle为1， 否则为0
				prodType: billDesc.prodType,
				repayPerds: isPayAll ? [] : repayPerds,
				repayPerdsTypes
			})
			.then((res) => {
				if (res.code === '000000' && res.data) {
					const { totalAmt, totalList = [] } = res.data;
					this.setState({
						totalAmt,
						totalList,
						buttonDisabled: false
					});
				} else {
					this.props.toast.info(res.message);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	/**
	 * @description 实时计算还款总金额
	 */
	calcPayTotalMoney = () => {
		const { panelList } = this.state;
		let repayPerds = [];
		let repayPerdsTypes = [];
		let checkedArr = panelList.filter((v) => v.isChecked);
		for (let i = 0; i < checkedArr.length; i++) {
			repayPerds.push(checkedArr[i].perdNum);
			repayPerdsTypes.push({
				perdNum: checkedArr[i].perdNum,
				perdType: this.handleValueByFeesStatus(checkedArr[i].feesStatus)
			});
		}

		this.setState(
			{
				repayPerds,
				repayPerdsTypes,
				canUseCoupon: repayPerds.length === 1,
				buttonDisabled: true
			},
			() => {
				if (repayPerds.length > 0) {
					//实时后台计算还款金额
					this.getFundPlainInfo();
				} else {
					this.setState({
						totalAmt: 0
					});
				}
			}
		);
	};

	/**
	 * @description 勾选点击
	 */
	handleCheckboxClick = (item) => {
		item = {
			...item,
			isChecked: !item.isChecked,
			feesStatus: this.handleFeesCheckedStatus(item.isChecked ? '03' : item.clearState)
		};

		this.orderListCheckClick(item);
	};

	/**
	 * @description 账单勾选实时计算
	 */
	orderListCheckClick = (clickedItem) => {
		const { panelList, actPanelListDatas } = this.state;
		for (let i = 0; i < panelList.length; i++) {
			let item = panelList[i];
			if (item.perdNum <= clickedItem.perdNum && item.isShowCheck) {
				item.isChecked = true;
				actPanelListDatas[i].isChecked = true;
				item.feesStatus = this.handleFeesCheckedStatus(item.clearState);
			} else {
				item.isChecked = false;
				actPanelListDatas[i].isChecked = false;
				item.feesStatus = this.handleFeesCheckedStatus('03');
			}
		}
		let arr = panelList.map((v) => (v.perdNum === clickedItem.perdNum ? clickedItem : v));

		this.setState(
			{
				actPanelListDatas: [...actPanelListDatas],
				panelList: arr
			},
			() => {
				this.calcPayTotalMoney();
				console.log(this.state.panelList, '--------');
			}
		);
	};

	/**
	 * @description 跳转还款确认页
	 */
	goOrderRepayConfirmPage = () => {
		const {
			billDesc,
			repayPerds,
			repayPerdsTypes,
			canUseCoupon,
			actPanelListDatas,
			overdueDays,
			totalAmt,
			totalList,
			billNo
		} = this.state;
		buriedPointEvent(order.gotoRepayConfirmPage, {
			isOverdue: !!overdueDays,
			repayPerds: repayPerds.join(','),
			isWXOpen: isWXOpen()
		});
		this.props.history.push({
			pathname: '/order/order_repay_confirm',
			state: {
				billNo,
				billDesc,
				repayPerds,
				repayPerdsTypes,
				canUseCoupon,
				actPanelListDatas,
				isPayAll: false,
				overdueDays,
				totalList,
				totalAmt
			}
		});
	};

	handleCloseTipModal = () => {
		this.setState({
			showOverdueTipModal: !this.state.showOverdueTipModal
		});
	};

	handleFeesCheckedStatus = (clearState) => {
		let arr = [];
		switch (clearState) {
			case '00':
				arr = [true, true];
				break;
			case '01':
				arr = [true, false];
				break;
			case '02':
				arr = [false, true];
				break;
			default:
				arr = [false, false];
				break;
		}
		return arr;
	};

	handleValueByFeesStatus = (feesStatus) => {
		let str = '';
		if (feesStatus[0] && feesStatus[1]) {
			str = '00';
		} else if (feesStatus[0]) {
			str = '01';
		} else if (feesStatus[1]) {
			str = '02';
		} else {
			str = '03';
		}
		return str;
	};

	//处理每期账单明细部分勾选事件回调
	handleFeesClick = (item, type) => {
		if (!item.isShowCheck || (item.isShowCheck && !item.isChecked)) {
			return;
		}
		if (this.state.repayPerds.length > 1) {
			this.props.toast.info('多期还款不支持分单还款');
			return;
		}
		if (type === 'fees') {
			buriedPointEvent(order.feesClick, {
				isOverdue: !!this.state.overdueDays
			});
		} else {
			buriedPointEvent(order.riskFeesClick, {
				isOverdue: !!this.state.overdueDays
			});
		}
		const allChecked = item.feesStatus.every((v) => v);
		if (allChecked) {
			this.handleShowSplitOrderTip(item, type);
		} else if (type === 'fees') {
			if (item.clearState === '02') return;

			this.updateFeesCheckedStatus({
				...item,
				feesStatus: [!item.feesStatus[0], item.feesStatus[1]]
			});
		} else if (type === 'riskFees') {
			if (item.clearState === '01') return;

			this.updateFeesCheckedStatus({
				...item,
				feesStatus: [item.feesStatus[0], !item.feesStatus[1]]
			});
		}
	};

	// 显示分单还款温馨提示弹窗
	handleShowSplitOrderTip = (item, type) => {
		this.setState({
			isShowSplitOrderTip: true,
			clickedPerdItem: item,
			clickedPerdFeesType: type
		});
	};

	// 更新账单明细勾选态,并动态计算金额
	updateFeesCheckedStatus = (item) => {
		const { panelList, actPanelListDatas } = this.state;
		for (let i = 0; i < panelList.length; i++) {
			if (item.perdNum === panelList[i].perdNum) {
				panelList[i] = item;
			}
		}
		this.setState(
			{
				actPanelListDatas: [...actPanelListDatas],
				panelList: [...panelList]
			},
			() => {
				this.calcPayTotalMoney();
			}
		);
	};

	// 处理温馨提示弹窗按钮点击事件
	handleSplitOrderTipButtonClick = (type) => {
		if (type === 'exit') {
			buriedPointEvent(order.splitOrderTipCancel);
			const { clickedPerdItem, clickedPerdFeesType } = this.state;
			let arr = [];
			if (clickedPerdFeesType === 'fees') {
				arr = [false, true];
			} else {
				arr = [true, false];
			}
			this.updateFeesCheckedStatus({
				...clickedPerdItem,
				feesStatus: arr
			});
		} else {
			buriedPointEvent(order.splitOrderTipOk);
		}
		this.setState({
			isShowSplitOrderTip: false
		});
	};

	render() {
		const {
			totalAmt,
			isShowBottomBtn,
			overdueDays,
			billOvduStartDt,
			panelList,
			perdLth,
			buttonDisabled,
			showOverdueTipModal,
			isShowSplitOrderTip
		} = this.state;
		const isEntryShow = this.props.overdueModalInfo && this.props.overdueModalInfo.olpSts === '1';

		const overdueTip = (
			<span
				onClick={() => {
					this.handleCloseTipModal();
				}}
				className={styles.headerExtra}
			>
				已逾期({overdueDays}天)
				<img src={Image.adorn.mark_question} alt="" className={styles.headerExtraIcon} />
			</span>
		);
		return (
			<LoadingView ref={(view) => (this.viewRef = view)} onReloadData={this.onReloadData}>
				<OverdueEntry isOverdue={isEntryShow} history={this.props.history} overdueDays={overdueDays} />

				<div className={styles.orderListWrap}>
					<Card className={styles.antCard}>
						<Card.Header title="账单" extra={overdueDays ? overdueTip : ''} />
						<Card.Body>
							<PerdList
								perdList={panelList}
								perdLth={perdLth}
								onCheckboxClick={this.handleCheckboxClick}
								onPerdDetailShow={(list) => {
									this.setState({
										panelList: list,
										panelListUpdate: !this.state.panelListUpdate
									});
								}}
								onFeesClick={this.handleFeesClick}
							/>
						</Card.Body>
					</Card>
					{isShowBottomBtn && (
						<BottomButton
							totalAmt={totalAmt}
							disabled={buttonDisabled}
							handleClick={this.goOrderRepayConfirmPage}
						/>
					)}
					<TipConfirmModal
						visible={isShowSplitOrderTip}
						onButtonClick={(type) => {
							this.handleSplitOrderTipButtonClick(type);
						}}
						title="温馨提示"
						desc="分单还款不慎容易造成逾期，建议您合并还款！"
						cancelButtonText="分单还款"
						okButtonText="合并还款"
					/>
					<OverdueTipModal
						visible={showOverdueTipModal}
						billOvduStartDt={billOvduStartDt}
						handleClick={this.handleCloseTipModal}
					/>
				</div>
			</LoadingView>
		);
	}
}
