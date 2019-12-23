/*
 * @Author: shawn
 * @LastEditTime: 2019-09-05 10:15:29
 */
import React, { PureComponent } from 'react';
import Lists from 'components/Lists';
import Panel from 'components/Panel';
import fetch from 'sx-fetch';
import SXFButton from 'components/ButtonCustom';
import { store } from 'utils/store';
import { Modal } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import styles from './index.scss';
import { isMPOS } from 'utils/common';
import qs from 'qs';
import { isWXOpen, isPhone } from 'utils';
const API = {
	qryDtl: '/bill/qryDtl',
	fundPlain: '/fund/plain', // 费率接口
	procedure_user_sts: '/procedure/user/sts' // 判断是否提交授信
};
let entryFrom = '';
@fetch.inject()
export default class order_detail_page extends PureComponent {
	constructor(props) {
		super(props);
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		entryFrom = queryData.entryFrom;
		this.state = {
			billDesc: {},
			orderList: [],
			isPayAll: false, // 是否一键结清
			overDueModalFlag: '', // 信用施压弹框标识
			openIdFlag: '',
			thisPerdNum: '',
			insureInfo: '',
			insureFeeInfo: '',
			isInsureValid: false, // 是否有保费并且为待支付状态
			totalAmtForShow: '',
			canUseCoupon: false, //优惠券是否可用
			repayPerds: []
		};
	}

	componentWillMount() {
		store.removeInsuranceFlag();
		store.removeCardData();
		store.removeCouponData();
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
				this.getOverdueInfo();
			}
		);
	}

	// 获取弹框明细信息
	getFundPlainInfo = (isPayAll) => {
		const { billNo, billDesc, repayPerds } = this.state;
		this.props.$fetch
			.post(API.fundPlain, {
				ordNo: billNo,
				isSettle: isPayAll ? '1' : '0', // 一键结清isSettle为1， 否则为0
				prodType: billDesc.prodType,
				repayPerds: isPayAll ? [] : repayPerds
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000' && res.data) {
					const { totalAmtForShow, totalList = [] } = res.data[0] || {};
					this.setState({
						totalAmtForShow,
						totalList
					});
				} else {
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	getOverdueInfo = () => {
		this.props.$fetch
			.post(API.procedure_user_sts)
			.then((res) => {
				if (res && res.msgCode === 'PTM0000') {
					// overduePopupFlag信用施压弹框，1为显示，0为隐藏
					this.setState({
						overDueModalFlag: res.data.overduePopupFlag
					});
					res.data && res.data.processInfo && store.setOverdueInf(res.data.processInfo);
				} else {
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch(() => {
				this.setState({
					firstUserInfo: 'error'
				});
			});
	};

	// 获取还款信息
	getLoanInfo = () => {
		this.props.$fetch
			.post(API.qryDtl, {
				billNo: this.state.billNo
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					const {
						insuranceAmt,
						insuranceSts,
						perdNum,
						perdList,
						billOvduDays,
						billOvduStartDt,
						billSts
					} = res.data;
					Number(insuranceAmt) && this.handleInsureFeeInfo(insuranceAmt, insuranceSts);

					this.setState(
						{
							thisPerdNum: perdNum,
							billDesc: res.data, //账单全部详情
							isBillClean: billSts === '4' || billSts === '2', //总账单是否结清或处理中
							perdList, //账单期数列表
							billOvduDays,
							billOvduStartDt
						},
						() => {
							this.showPerdList();
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

	//处理保费展示数据
	handleInsureFeeInfo = (insuranceAmt, insuranceSts) => {
		let insuranceStsText = '';
		let insuranceStsColor = '';
		if (insuranceSts === '1') {
			insuranceStsText = '待支付';
			insuranceStsColor = '#4CA6FF';
		} else if (insuranceSts === '2') {
			insuranceStsText = '处理中';
			insuranceStsColor = '#FBB947';
		} else if (insuranceSts === '3') {
			insuranceStsText = '已支付';
			insuranceStsColor = '#C7C7CC';
		}
		this.setState({
			isInsureValid: Number(insuranceAmt) && insuranceSts === '1',
			insureFeeInfo: insuranceAmt,
			insureInfo: {
				label: {
					name: '保费',
					brief: '应支付日：2019年05月21日'
				},
				extra: [
					{
						name: parseFloat(insuranceAmt).toFixed(2),
						color: '#333',
						fontSize: '0.3rem'
					},
					{
						name: insuranceStsText,
						color: insuranceStsColor
					}
				],
				show: true,
				isChecked: true
			}
		});
	};

	// 显示还款计划
	showPerdList = () => {
		const { thisPerdNum, billOvduDays, perdList } = this.state;
		let perdListArray = [];
		for (let i = 0; i < perdList.length; i++) {
			let item = {
				key: i,
				label: {
					name: `${i + 1}/${perdList.length}期`,
					brief: '应还款日: ' + perdList[i].perdDueDt
				},
				extra: [
					{
						name: perdList[i].perdTotAmt,
						color: '#333'
					},
					{
						name: perdList[i].perdStsNm,
						color: perdList[i].color
					}
				],
				arrowHide: 'down',
				feeInfos: perdList[i].feeInfos,
				isShowCheck: true,
				isChecked: false,
				perdTotAmt: perdList[i].perdTotAmt,
				perdStsNm: perdList[i].perdStsNm,
				perdSts: perdList[i].perdSts,
				perdNum: perdList[i].perdNum
			};
			// 总账单的状态是否有逾期
			item.isChecked = perdList[i].perdSts === '1' || thisPerdNum === i + 1;

			// 已还清、已支付的状态的栏位不显示勾选框
			// perdSts 0：未到期;1：已逾期;2：处理中;3：已撤销;4：已还清
			if (perdList[i].perdSts === '4' || perdList[i].perdSts === '2') {
				item.isShowCheck = false;
			}
			// 判断是否结清
			item.isClear = perdList[i].perdSts === '4';
			perdListArray.push(item);
		}
		this.setState({
			actOrderList: perdListArray //实际的子账单列表
		});

		if (billOvduDays) {
			//如果账单逾期
			perdListArray = perdListArray
				.filter((item) => item.perdSts === '1' || item.perdSts === '2')
				.slice(0, 1);
		}
		this.setState(
			{
				orderList: perdListArray
			},
			() => {
				if (window.location.pathname === '/order/order_repay_page') {
					this.calcPayTotalMoney();
				}
			}
		);
	};

	// 立即还款
	goOrderRepayConfirmPage = () => {
		const {
			billNo,
			billDesc,
			repayPerds,
			canUseCoupon,
			actOrderList,
			thisPerdNum,
			billOvduDays,
			totalList,
			totalAmtForShow
		} = this.state;
		buriedPointEvent(order.gotoRepayConfirmPage, {
			isOverdue: !!billOvduDays,
			repayPerds: repayPerds.join(',')
		});
		if (!totalAmtForShow) return;
		this.props.history.push({
			pathname: '/order/order_repay_confirm',
			state: {
				billNo,
				billDesc,
				repayPerds,
				canUseCoupon,
				actOrderList,
				isPayAll: false,
				thisPerdNum,
				billOvduDays,
				totalList,
				totalAmtForShow
			}
		});
	};

	//一键结清
	payAllOrder = () => {
		const { billNo, billDesc, actOrderList, thisPerdNum } = this.state;

		let repayPerds = [];
		for (let i = 0; i < actOrderList.length; i++) {
			const item = actOrderList[i];
			if (item.perdSts === '0') {
				repayPerds.push(item.perdNum);
			}
		}
		buriedPointEvent(order.payAllOrderBtnClick, {
			isOverdue: false,
			repayPerds: repayPerds.join(',')
		});
		this.props.$fetch
			.post(API.fundPlain, {
				ordNo: billNo,
				isSettle: '1', // 一键结清isSettle为1， 否则为0
				prodType: billDesc.prodType,
				repayPerds
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000' && res.data) {
					const { totalAmtForShow } = res.data[0] || {};
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
							billOvduDays: '',
							totalList: [],
							totalAmtForShow
						}
					});
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	// 查看还款信息
	goOrderRepayPage = () => {
		const { billOvduDays, repayPerds } = this.state;
		buriedPointEvent(order.viewRepayInfoBtn, {
			entry: entryFrom && entryFrom === 'home' ? '首页-查看代还账单' : '账单',
			isOverdue: !!billOvduDays,
			repayPerds: repayPerds.join(',')
		});
		this.props.history.push('/order/order_repay_page');
	};

	// 查看逾期进度
	goOverdue = () => {
		this.props.history.push({
			pathname: '/order/overdue_progress_page'
		});
	};

	//勾选款点击回调
	checkClickCb = (item) => {
		item = {
			...item,
			isChecked: !item.isChecked
		};

		this.orderListCheckClick(item);
	};

	orderListCheckClick = (item) => {
		for (let i = 0; i < this.state.orderList.length; i++) {
			if (this.state.orderList[i].perdNum <= item.perdNum && this.state.orderList[i].isShowCheck) {
				this.state.orderList[i].isChecked = true;
			} else {
				this.state.orderList[i].isChecked = false;
			}
		}
		let arr = this.state.orderList.map((v) => (v.perdNum === item.perdNum ? item : v));
		this.setState(
			{
				orderList: arr
			},
			() => {
				this.calcPayTotalMoney();
			}
		);
	};

	//实时计算还款总金额
	calcPayTotalMoney = () => {
		let repayPerds = [];
		let checkedArr = this.state.orderList.filter((v) => v.isChecked);
		for (let i = 0; i < checkedArr.length; i++) {
			repayPerds.push(checkedArr[i].perdNum);
		}

		this.setState(
			{
				insureInfo: { ...this.state.insureInfo, isChecked: checkedArr.length > 0 },
				repayPerds,
				canUseCoupon: repayPerds.length === 1
			},
			() => {
				if (repayPerds.length > 0) {
					this.getFundPlainInfo();
				} else {
					this.setState({
						totalAmtForShow: 0
					});
				}
			}
		);
	};

	// 展开隐藏每期明细
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
			if (this.state.orderList[i].perdNum !== item.perdNum) {
				this.state.orderList[i].showDesc = false;
				this.state.orderList[i].arrowHide = 'down';
			}
		}
		let arr = this.state.orderList.map((v) => (v.perdNum === item.perdNum ? item : v));

		this.setState({
			orderList: arr
		});
	};

	handleCloseTipModal = () => {
		this.setState({
			showTipModal: !this.state.showTipModal
		});
	};

	render() {
		const {
			billDesc = {},
			totalAmtForShow,
			overDueModalFlag,
			openIdFlag,
			orderList,
			insureInfo,
			isBillClean,
			billOvduDays,
			billOvduStartDt
		} = this.state;

		const {
			billPrcpAmt = '',
			perdLth = '',
			perdUnit = '',
			repayTypNm = '',
			loanDt = '',
			payCrdCorpOrgNm = '',
			payCrdNoLast = '',
			wthdCrdCorpOrgNm = '',
			wthdCrdNoLast = '',
			discRedRepay
		} = billDesc;
		const itemList = [
			{
				name: '借款本金(元)',
				value: billPrcpAmt
			},
			{
				name: '借款期限',
				value: `${perdLth}${perdUnit === 'M' ? '个月' : '天'}`
			},
			{
				name: '还款方式',
				value: repayTypNm
			},
			{
				name: '放款时间',
				value: loanDt
			},
			{
				name: '收款银行卡',
				value: `${payCrdCorpOrgNm}(${payCrdNoLast})`
			},
			{
				name: '还款银行卡',
				value: `${wthdCrdCorpOrgNm}(${wthdCrdNoLast})`
			}
		];
		const isEntryShow = overDueModalFlag === '1' && billOvduDays;

		return (
			<div>
				{billOvduDays && (isMPOS() || !isPhone() || (isWXOpen() && openIdFlag === '0')) && (
					<div className={styles.overdueEntryTip}>
						关注“还到”公众号，使用<span>微信支付</span>还款
					</div>
				)}
				{isEntryShow && (
					<div className={styles.overdueEntry} onClick={this.goOverdue}>
						<span className={styles.overdueItem}>
							<i className={styles.warningIco} />
							您的账单已逾期!
						</span>
						<span className={styles.overdueItem}>
							查看逾期信用进度
							<i className={styles.entryIco} />
						</span>
					</div>
				)}
				{window.location.pathname === '/order/order_detail_page' ? (
					<div className={styles.order_detail_page}>
						<Panel title="借款信息" className={styles.loadInfBox}>
							<ul className={styles.panel_conten}>
								{itemList.map((item) => (
									<li className={styles.list_item} key={item.name}>
										<label className={styles.item_name}>{item.name}</label>
										<span className={styles.item_value}>{item.value}</span>
									</li>
								))}
							</ul>
							{!isEntryShow && !isBillClean && (
								<div className={styles.payAll} onClick={this.payAllOrder}>
									{discRedRepay && <i />}
									一键结清
								</div>
							)}
						</Panel>

						<div className={styles.submit_btn}>
							<SXFButton onClick={this.goOrderRepayPage}>
								{isBillClean ? '查看还款信息' : '查看还款计划'}
							</SXFButton>
						</div>
					</div>
				) : (
					<div className={styles.order_repay_page}>
						{insureInfo.show && (
							<Panel title="其他费用">
								<Lists insureFee={insureInfo} className={styles.order_list} isCheckbox={true} />
							</Panel>
						)}

						<Panel
							title="我的账单"
							extra={
								billOvduDays && {
									style: {
										color: '#FE6666',
										fontSize: '0.3rem',
										float: 'right',
										position: 'relative',
										paddingRight: '0.3rem'
									},
									text: `已逾期(${billOvduDays}天)`,
									clickCb: () => {
										this.handleCloseTipModal();
									},
									icon: <i className={styles.extra_icon} />
								}
							}
						>
							<Lists
								listsInf={orderList}
								clickCb={this.clickCb}
								className={styles.order_list}
								isCheckbox={true}
								checkClickCb={this.checkClickCb}
							/>
						</Panel>
						{!isBillClean && (
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
								<Modal
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
								</Modal>
							</div>
						)}
					</div>
				)}
			</div>
		);
	}
}
