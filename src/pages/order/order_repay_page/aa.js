import React, { PureComponent } from 'react';
import Lists from 'components/Lists';
import Panel from 'components/Panel';
import fetch from 'sx-fetch';
import SXFButton from 'components/ButtonCustom';
import { store } from 'utils/store';
import { Modal, Icon } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import styles from './index.scss';
import { getH5Channel, isMPOS } from 'utils/common';
import qs from 'qs';

const API = {
	qryDtl: '/bill/qryDtl',
	payback: '/bill/paySubmit',
	couponCount: '/bill/doCouponCount', // 后台处理优惠劵抵扣金额
	protocolSms: '/withhold/protocolSms', // 校验协议绑卡
	protocolBind: '/withhold/protocolBink', //协议绑卡接口
	fundPlain: '/fund/plain', // 费率接口
	procedure_user_sts: '/procedure/user/sts', // 判断是否提交授信
	queryExtendedPayType: '/bill/queryExtendedPayType' //其他支付方式查询
};

@fetch.inject()
export default class order_repay_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			billDesc: {},
			showModal: false,
			orderList: [],
			money: '',
			sendMoney: '',
			bankInfo: {},
			couponInfo: {},
			hideBtn: false,
			isPayAll: false, // 是否一键结清
			// showItrtAmt: false, // 优惠劵金额小于利息金额 true为大于
			// ItrtAmt: 0, // 每期利息金额
			deratePrice: '',
			isShowSmsModal: false, //是否显示短信验证码弹窗
			smsCode: '',
			protocolBindCardCount: 0, // 协议绑卡接口调用次数统计
			toggleBtn: false, // 是否切换短信验证码弹窗底部按钮
			detailArr: [], // 还款详情数据
			isShowDetail: true, // 是否展示弹框中的明细详情
			isAdvance: false, // 是否提前还款
			totalAmt: '', // 一键结清传给后台的总金额
			billOverDue: '', //逾期弹窗标志
			overDueModalFlag: '', // 信用施压弹框标识
			payType: '',
			payTypes: ['BankPay'],
			openIdFlag: '',
			thisPerdNum: '',
			insureInfo: '',
			insureFeeInfo: '',
			isInsureValid: false, // 是否有保费并且为待支付状态
			totalAmtForShow: '',
			couponPrice: '', // 优惠劵计算过的金额
			cashierVisible: false,

			disDisRepayAmt: 0, // 优惠金额
			penaltyInfo: {
				// 罚息数据
				label: {
					name: '罚息',
					brief: '逾期管理费'
				},
				extra: [
					{
						name: '10.00',
						color: '#333'
					},
					{
						name: '32.00',
						color: '#333'
					}
				]
			},
			totalMoney: 0,
			showTipModal: false
		};
	}

	componentDidMount() {
		store.removeInsuranceFlag();
		if (!store.getBillNo()) {
			this.props.toast.info('订单号不能为空');
			setTimeout(() => {
				this.props.history.goBack();
			}, 3000);
			return;
		}
		this.setState(
			{
				billNo: store.getBillNo()
			},
			() => {
				this.getLoanInfo();
				// 因为会有直接进到账单的公众号入口，所以在此在调一遍接口
				// this.getOverdueInfo();
				this.queryExtendedPayType();
			}
		);
		// const { insureInfo, orderList, penaltyInfo } = store.getOrderRepayInfo();
		// console.log(store.getOrderRepayInfo());
		// this.setState({
		// 	insureInfo,
		// 	orderList,
		// 	penaltyInfo
		// });
	}

	componentWillUnmount() {
		store.removeOrderRepayInfo();
	}

	// 获取还款信息
	getLoanInfo = () => {
		this.props.$fetch
			.post(API.qryDtl, {
				billNo: this.state.billNo
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					res.data.perdNum !== 999 &&
						this.setState({ money: res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt });
					res.data.perdNum !== 999 &&
						this.setState({ sendMoney: res.data.perdList[res.data.perdNum - 1].perdWaitRepAmt });

					if (Number(res.data.insuranceAmt)) {
						let insuranceStsText = '';
						let insuranceStsColor = '';
						if (res.data.insuranceSts === '1') {
							insuranceStsText = '待支付';
							insuranceStsColor = '#4CA6FF';
						} else if (res.data.insuranceSts === '2') {
							insuranceStsText = '处理中';
							insuranceStsColor = '#FBB947';
						} else if (res.data.insuranceSts === '3') {
							insuranceStsText = '已支付';
							insuranceStsColor = '#C7C7CC';
						}
						this.setState({
							isInsureValid: Number(res.data.insuranceAmt) && res.data.insuranceSts === '1',
							insureFeeInfo: res.data.insuranceAmt,
							insureInfo: {
								label: {
									name: '保费'
								},
								extra: [
									{
										name: parseFloat(res.data.insuranceAmt).toFixed(2),
										color: '#333',
										fontSize: '0.3rem'
									},
									{
										name: insuranceStsText,
										color: insuranceStsColor
									}
								]
							}
						});
					}
					this.setState(
						{
							thisPerdNum: res.data.perdNum,
							billDesc: res.data, //账单全部详情
							perdList: res.data.perdList //账单期数列表
						},
						() => {
							// 选择银行卡回来
							let bankInfo = store.getCardData();
							let orderDtlData = store.getOrderDetailData();
							store.removeOrderDetailData();
							// let couponInfo = store.getCouponData();
							if (bankInfo && JSON.stringify(bankInfo) !== '{}') {
								this.setState(
									{
										showModal: true,
										isPayAll: orderDtlData && orderDtlData.isPayAll,
										detailArr: orderDtlData && orderDtlData.detailArr,
										isShowDetail: orderDtlData && orderDtlData.isShowDetail,
										isAdvance: orderDtlData && orderDtlData.isAdvance,
										totalAmt: orderDtlData && orderDtlData.totalAmt,
										totalAmtForShow: orderDtlData && orderDtlData.totalAmtForShow
									},
									() => {
										this.setState({
											bankInfo: bankInfo
											// couponInfo: couponInfo,
										});
										store.removeCardData();
										if (res.data && res.data.data && res.data.perdNum !== 999) {
											this.dealMoney(res.data);
										}
									}
								);
							} else {
								if (res.data && res.data.data && res.data.perdNum !== 999) {
									this.dealMoney(res.data);
								}
								// this.setState({ couponInfo: null });
							}
							this.showPerdList(res.data.perdNum);
						}
					);
				} else {
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// 获取弹框明细信息
	getModalDtlInfo = (cb, isPayAll) => {
		const { billNo, billDesc } = this.state;
		this.props.$fetch
			.post(API.fundPlain, {
				ordNo: billNo,
				isSettle: isPayAll ? '1' : '0', // 一键结清isSettle为1， 否则为0
				prodType: billDesc.prodType
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					if (res.data) {
						// 现在统一取totalList里的明细，仅适用于按期还，不适用于跳跃还的
						// 如果还当期totalList就等于当期数据，如果还全部，totalList就为全部
						let isAdvance = false;
						const buChangJinList = res.data[0].totalList.find((item2) => item2.feeNm === '补偿金');
						if (buChangJinList.feeAmt !== 0) {
							isAdvance = true;
						} else {
							isAdvance = false;
						}
						this.setState(
							{
								disDisRepayAmt: res.data[0].disDisRepayAmt,
								detailArr: res.data[0].totalList,
								isAdvance,
								totalAmt: res.data[0].totalAmt,
								totalAmtForShow: res.data[0].totalAmtForShow
							},
							() => {
								cb && cb(isPayAll);
							}
						);
					} else {
						this.setState(
							{
								isAdvance: false
							},
							() => {
								cb && cb(isPayAll);
							}
						);
					}
				} else {
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	checkClickCb = (item) => {
		console.log(item);
		let totalMoney = 0;
		if (item.isChecked) {
			item = {
				...item,
				isChecked: false
			};
		} else {
			item = {
				...item,
				isChecked: true
			};
		}

		for (let i = 0; i < this.state.orderList.length; i++) {
			if (i <= item.key) {
				this.state.orderList[i].isChecked = true;

				for (let j = 0; j < this.state.orderList[i].feeInfos.length; j++) {
					let itm = this.state.orderList[i].feeInfos[j];
					if (itm.feeNm === '剩余应还') {
						totalMoney += itm.feeAmt;
						console.log(totalMoney);
					}
				}
				this.setState({
					totalMoney: Number(totalMoney).toFixed(2)
				});
			} else {
				this.state.orderList[i].isChecked = false;
			}
		}
		this.state.orderList[item.key] = item;
		this.setState({
			orderList: [...this.state.orderList]
		});
	};

	// 展开隐藏
	clickCb = (item) => {
		switch (item.arrowHide) {
			case 'empty':
				break;
			case 'up':
				item = {
					...item,
					arrowHide: 'down',
					showDesc: false
				};
				break;
			case 'down':
				item = {
					...item,
					arrowHide: 'up',
					showDesc: true
				};

				break;
			default:
				break;
		}
		for (let i = 0; i < this.state.orderList.length; i++) {
			if (i !== item.key) {
				this.state.orderList[i].showDesc = false;
				this.state.orderList[i].arrowHide = 'down';
			}
		}
		this.state.orderList[item.key] = item;
		this.setState({
			orderList: [...this.state.orderList]
		});
	};

	handleCloseTipModal = () => {
		this.setState({
			showTipModal: !this.state.showTipModal
		});
	};

	render() {
		const { insureInfo, orderList, penaltyInfo, totalMoney, showTipModal } = this.state;

		return (
			<div className={styles.order_repay_page}>
				<Panel title="其他费用">
					<Lists insureFee={insureInfo} className={styles.order_list} isCheckbox={true} />
				</Panel>
				<Panel
					title="账单"
					extra={{
						style: {
							color: '#FE6666',
							fontSize: '0.34rem',
							float: 'right',
							position: 'relative',
							paddingRight: '0.3rem'
						},
						text: '已逾期(45天)',
						clickCb: () => {
							this.handleCloseTipModal();
						},
						icon: <i className={styles.extra_icon} />
					}}
				>
					<Lists
						listsInf={orderList}
						clickCb={this.clickCb}
						className={styles.order_list}
						isCheckbox={true}
						checkClickCb={this.checkClickCb}
						penaltyInfo={penaltyInfo}
					/>
				</Panel>
				<div className={styles.fixed_button}>
					<span className={styles.money_show}>
						共计<em>{totalMoney}</em>元
					</span>
					<SXFButton onClick={this.handleClickConfirm} className={styles.sxf_btn}>
						立即还款
					</SXFButton>
					<Modal
						wrapClassName="order_repay_page"
						visible={showTipModal}
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
							<h3 className={styles.modal_title}>逾期天数说明</h3>
							<p className={styles.modal_desc}>
								任意一期未按时足额还款，视为逾期，计算逾期天数。直至还清全部应还未还款项为止。
							</p>
							<p className={styles.modal_desc}>
								您的逾期开始日期：<em>2019年05月22日</em>
							</p>
						</div>
					</Modal>
				</div>
			</div>
		);
	}
}
