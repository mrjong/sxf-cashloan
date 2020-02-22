import React, { PureComponent } from 'react';
import styles from './index.scss';
import { LoadingView } from 'components';
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
			panelListUpdate: false
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
					this.setState(
						{
							perdLth, //分期期数
							panelList: this.generatePerdList(preds, perdNum, overdueDays, isShowBottomBtn), //被截取逾期的子账单列表
							billDesc: res.data, // 详情返回的数据
							isShowBottomBtn,
							overdueDays,
							billOvduStartDt
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
		const { billDesc, repayPerds, billNo } = this.state;
		this.props.$fetch
			.post(repay_queryCashRegisterDetail, {
				billNo,
				isSettle: isPayAll ? '1' : '0', // 一键结清isSettle为1， 否则为0
				prodType: billDesc.prodType,
				repayPerds: isPayAll ? [] : repayPerds
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
		let checkedArr = panelList.filter((v) => v.isChecked);
		for (let i = 0; i < checkedArr.length; i++) {
			repayPerds.push(checkedArr[i].perdNum);
		}

		this.setState(
			{
				repayPerds,
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
			isChecked: !item.isChecked
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
			} else {
				item.isChecked = false;
				actPanelListDatas[i].isChecked = false;
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

	render() {
		const {
			totalAmt,
			isShowBottomBtn,
			overdueDays,
			billOvduStartDt,
			panelList,
			perdLth,
			buttonDisabled,
			showOverdueTipModal
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
