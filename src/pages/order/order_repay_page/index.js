import React, { PureComponent } from 'react';
import styles from './index.scss';
import { LoadingView, Lists } from 'components';
import { Modal, Card } from 'antd-mobile';
import { bill_queryBillDetail, repay_queryCashRegisterDetail } from 'fetch/api';
import PerdList from './PerdList';
import fetch from 'sx-fetch';

// @setBackGround('#F0F3F9')
@fetch.inject()
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
			buttonDisabled: true
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
				// this.props.setCouponDataAction({});
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
					// buriedPointEvent(DC_ORDER_DETAILS_REPAYMENT, {
					// 	is_success: true,
					// 	entry: params && params.entry === '账单' ? '账单' : '首页-查看代偿账单'
					// });
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
					// buriedPointEvent(DC_ORDER_DETAILS_REPAYMENT, {
					// 	fail_cause: res.message,
					// 	is_success: false,
					// 	entry: params.entry === '账单' ? '账单' : '首页-查看代偿账单'
					// });
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
		// item = {
		// 	...item,
		// 	isChecked: !item.isChecked
		// };
		// this.orderListCheckClick(item);
	};

	render() {
		const {
			totalAmt,
			isShowBottomBtn,
			overdueDays,
			billOvduStartDt,
			panelList,
			perdLth,
			buttonDisabled
		} = this.state;

		return (
			<LoadingView
				ref={(view) => (this.viewRef = view)}
				// noData={{}}
				// errorData={{}}
				// onReloadData={() => {
				// 	this.onReloadData();
				// }}
			>
				<div className={styles.orderDetailCard}>
					<Card className={styles.antCard}>
						<Card.Header title="账单" />
						<Card.Body>
							<PerdList
								perdList={panelList}
								perdLth={perdLth}
								onCheckboxClick={this.handleCheckboxClick}
								onPerdDetailShow={(list) => {
									this.setState({
										panelList: list
									});
								}}
							/>
							{/* <Lists
								listsInf={orderList}
								clickCb={this.clickCb}
								className={styles.order_list}
								isCheckbox={true}
								checkClickCb={this.checkClickCb}
							/> */}
						</Card.Body>
					</Card>
					{/* {!isBillClean && (
						<div className={styles.fixed_button}>
							<span className={styles.money_show}>
								共计<em>{totalAmtForShow}</em>元
							</span>
							<SXFButton
								onClick={this.goOrderRepayConfirmPage}
								className={[styles.sxf_btn, !totalAmtForShow && styles.sxf_btn_disabled].join(' ')}
							>
								立即还款
							</SXFButton>
						</div>
					)} */}
				</div>
				{/* <Modal
					wrapClassName="order_repay_page"
					visible={this.state.showTipModal}
					transparent
					footer={[
						{
							text: '我知道了',
							onPress: () => {
								this.handleCloseTipModal();
							}
						}
					]}
				>
					<div className={styles.modal_tip_content}>
						<h3 className={styles.modal_tip_title}>逾期天数说明</h3>
						<p className={styles.modal_tip_desc}>
							您的逾期开始日期：<em>{billOvduStartDt}</em>
						</p>
						<p className={styles.modal_tip_desc}>
							任意一期未按时足额还款，视为逾期，计算逾期天数。直至还清全部应还未还款项为止。
						</p>
						<p className={styles.modal_tip_desc}>罚息由出借方收取，逾期管理费由平台方收取。</p>
					</div>
				</Modal> */}
			</LoadingView>
		);
	}
}
