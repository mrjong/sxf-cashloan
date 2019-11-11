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
import { Modal, Icon } from 'antd-mobile';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import styles from './index.scss';
import { getH5Channel, isMPOS } from 'utils/common';
import qs from 'qs';
import SmsModal from './components/SmsModal';
import { isWXOpen, isPhone } from 'utils';
import Cashier from './components/Cashier';
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
let entryFrom = '';
@fetch.inject()
export default class order_detail_page extends PureComponent {
	constructor(props) {
		super(props);
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		entryFrom = queryData.entryFrom;
		this.state = {
			billDesc: {},
			showModal: false,
			orderList: [],
			bankInfo: {},
			couponInfo: {},
			isPayAll: false, // 是否一键结清
			deratePrice: '',
			isShowSmsModal: false, //是否显示短信验证码弹窗
			smsCode: '',
			protocolBindCardCount: 0, // 协议绑卡接口调用次数统计
			toggleBtn: false, // 是否切换短信验证码弹窗底部按钮
			detailArr: [], // 还款详情数据
			isShowDetail: false, // 是否展示弹框中的明细详情
			totalAmt: '', // 一键结清传给后台的总金额
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
			penaltyInfo: '',
			canUseCoupon: false, //优惠券是否可用
			repayPerds: []
		};
	}

	componentWillMount() {
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
				this.getOverdueInfo();
				this.queryExtendedPayType();
			}
		);
	}

	componentWillUnmount() {
		store.removeCardData();
	}

	queryExtendedPayType = () => {
		this.props.$fetch.get(API.queryExtendedPayType).then((res) => {
			if (res.msgCode === 'PTM0000') {
				let params = {
					openIdFlag: (res.data && res.data.openIdFlag) || '0'
				};
				if (isWXOpen()) {
					if (res.data && res.data.openIdFlag === '0') {
						params.payType = 'BankPay';
					} else if (res.data && res.data.openIdFlag === '1') {
						if (res.data && res.data.routeCodes && res.data.routeCodes.includes('WXPay')) {
							params.payType = store.getPayType() || 'BankPay';
							params.payTypes = [...this.state.payTypes, ...res.data.routeCodes];
						} else {
							params.payType = 'BankPay';
							params.payTypes = ['BankPay'];
						}
					} else {
						params.payType = 'BankPay';
						params.payTypes = ['BankPay'];
					}
				} else {
					if (
						isPhone() &&
						res.data &&
						res.data.routeCodes &&
						res.data.routeCodes.includes('WXPay') &&
						!isMPOS()
					) {
						params.payType = store.getPayType() || 'BankPay';
						params.payTypes = [...this.state.payTypes, ...res.data.routeCodes];
					} else {
						params.payType = 'BankPay';
						params.payTypes = ['BankPay'];
					}
				}
				this.setState(params);
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};
	// 获取弹框明细信息
	getModalDtlInfo = (cb, isPayAll) => {
		const { billNo, billDesc, repayPerds } = this.state;
		this.props.$fetch
			.post(API.fundPlain, {
				ordNo: billNo,
				isSettle: isPayAll ? '1' : '0', // 一键结清isSettle为1， 否则为0
				prodType: billDesc.prodType,
				repayPerds: isPayAll ? [] : repayPerds
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					if (res.data) {
						this.setState(
							{
								disDisRepayAmt: res.data[0].disDisRepayAmt,
								detailArr: res.data[0].totalList,
								totalAmt: res.data[0].totalAmt,
								totalAmtForShow: res.data[0].totalAmtForShow
							},
							() => {
								cb && cb(isPayAll);
							}
						);
					} else {
						cb && cb(isPayAll);
					}
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
						billOvduSts,
						billFineAmt,
						billOvduAmt,
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
							perdList //账单期数列表
						},
						() => {
							// 选择银行卡回来
							let bankInfo = store.getCardData();
							let orderDtlData = store.getOrderDetailData() || {};
							let {
								isPayAll,
								detailArr,
								isShowDetail,
								totalAmt,
								totalAmtForShow,
								orderList,
								penaltyInfo
							} = orderDtlData;
							store.removeOrderDetailData();
							if (bankInfo && JSON.stringify(bankInfo) !== '{}') {
								this.setState(
									{
										showModal: true,
										isPayAll,
										detailArr,
										isShowDetail,
										totalAmt,
										totalAmtForShow
									},
									() => {
										this.setState({
											bankInfo
										});
										store.removeCardData();
										if (res.data && res.data.data && !this.state.isBillClean) {
											this.dealMoney(res.data);
										}
									}
								);
							} else if (res.data && res.data.data && !this.state.isBillClean) {
								this.dealMoney(res.data);
							}
							if (penaltyInfo && JSON.stringify(penaltyInfo) !== '{}') {
								//有缓存则取缓存
								this.setState({
									penaltyInfo
								});
							} else if (!(billOvduSts === null || billOvduSts === '4' || billOvduSts === '2')) {
								//有罚息或滞纳金
								this.handlePenaltyInfo(billFineAmt, billOvduAmt, billOvduDays, billOvduStartDt);
							} else {
								this.setState({
									penaltyInfo: {}
								});
							}
							this.showPerdList(orderList);
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

	//处理罚息数据展示
	handlePenaltyInfo = (billFineAmt, billOvduAmt, billOvduDays, billOvduStartDt) => {
		this.setState({
			penaltyInfo: {
				label: {
					name: '罚息',
					brief: '逾期管理费'
				},
				extra: [
					{
						name: Number(billFineAmt).toFixed(2),
						color: '#121C32',
						fontSize: '0.3rem'
					},
					{
						name: Number(billOvduAmt).toFixed(2),
						color: '#121C32',
						fontSize: '0.3rem'
					}
				],
				show: true,
				isChecked: true,
				billOvduDays,
				billOvduStartDt
			}
		});
	};

	// 后台计算优惠券减免金额以及本次还款金额
	dealMoney = (result) => {
		let couponInfo = store.getCouponData();
		store.removeCouponData();
		let params = {
			billNo: this.state.billNo,
			type: '01', // 00为借款 01为还款
			currentStage: result.perdNum,
			price: result.perdList[result.perdNum - 1].perdWaitRepAmt,
			totalStage: result.perdUnit === 'M' ? result.perdLth : '1',
			prodType: this.state.billDesc.prodType
		};
		// 如果没有coupId直接不调用接口
		if (couponInfo && (couponInfo.usrCoupNo === 'null' || couponInfo.coupVal === -1)) {
			// 不使用优惠劵的情况
			this.setState({
				couponInfo
			});
			return;
		}
		if (couponInfo && JSON.stringify(couponInfo) !== '{}') {
			params.couponId = couponInfo.usrCoupNo; // 优惠劵id
		} else {
			params.couponId = result.data.usrCoupNo;
		}
		this.props.$fetch.get(API.couponCount, params).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					couponInfo,
					deratePrice: result.data.deratePrice,
					couponPrice: result.data.resultPrice
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	// 显示还款计划
	showPerdList = (orderList = []) => {
		const { thisPerdNum } = this.state;
		let perdListArray = [];
		let perdList = this.state.perdList;
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
				perdStsNm: perdList[i].perdStsNm
			};
			// 总账单的状态是否有逾期
			if (perdList[i].perdSts === '1') {
				item.isChecked = true;
			} else if (thisPerdNum === i + 1) {
				item.isChecked = true;
			}

			// 已还清、已支付的状态的栏位不显示勾选框
			// perdSts 0：未到期;1：已逾期;2：处理中;3：已撤销;4：已还清
			if (perdList[i].perdSts === '4' || perdList[i].perdSts === '2') {
				item.isShowCheck = false;
			}

			// if (!this.state.isBillClean && perdList[i].perdNum === perdNum) {
			// 	item.showDesc = true;
			// 	item.arrowHide = 'up';
			// } else {
			// 	item.showDesc = false;
			// }

			item.feeInfos.push({
				feeNm: '优惠劵',
				feeAmt: '-' + perdList[i].deductionAmt
			});
			// 判断是否结清
			if (perdList[i].perdSts === '4') {
				item.isClear = true;
			} else {
				item.isClear = false;
				item.feeInfos.push({
					feeNm: '已还金额',
					feeAmt: perdList[i].perdTotRepAmt
				});
				item.feeInfos.push({
					feeNm: '合计',
					feeAmt: Number(perdList[i].perdWaitRepAmt)
				});
			}
			perdListArray.push(item);
		}
		if (this.state.penaltyInfo.show) {
			//如果账单逾期
			orderList = orderList.filter((item) => item.perdSts === '1');
			perdListArray = perdListArray.filter((item) => item.perdSts === '1');
		}
		this.setState(
			{
				orderList: orderList.length > 0 ? orderList : perdListArray
			},
			() => {
				if (window.location.pathname === '/order/order_repay_page') {
					this.calcPayTotalMoney();
				}
			}
		);
	};

	// 处理输入的验证码
	handleSmsCodeChange = (smsCode) => {
		this.setState({
			smsCode
		});
	};

	// 跳过验证直接执行代扣逻辑
	skipProtocolBindCard = () => {
		this.closeSmsModal();
	};

	// 关闭短信弹窗并还款
	closeSmsModal = () => {
		this.setState({
			isShowSmsModal: false,
			smsCode: '',
			protocolBindCardCount: 0,
			toggleBtn: false
		});
		this.repay();
	};

	// 确认协议绑卡
	confirmProtocolBindCard = () => {
		if (!this.state.smsCode) {
			this.props.toast.info('请输入验证码');
			return;
		}
		if (this.state.smsCode.length !== 6) {
			this.props.toast.info('请输入正确的验证码');
			return;
		}
		this.setState({
			protocolBindCardCount: this.state.protocolBindCardCount + 1
		});
		this.props.$fetch
			.post(API.protocolBind, {
				cardNo:
					this.state.bankInfo && this.state.bankInfo.agrNo
						? this.state.bankInfo.agrNo
						: this.state.billDesc.wthCrdAgrNo,
				smsCd: this.state.smsCode,
				isEntry: '01'
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					this.closeSmsModal();
				} else if (this.state.protocolBindCardCount === 2 && res.msgCode !== 'PTM0000') {
					this.closeSmsModal();
				} else {
					// 切换短信弹窗底部按钮
					this.setState({
						toggleBtn: true,
						smsCode: ''
					});
					this.props.toast.info(res.data || res.msgInfo);
				}
			});
	};

	// 协议绑卡校验接口
	checkProtocolBindCard = () => {
		const params = {
			cardNo:
				this.state.bankInfo && this.state.bankInfo.agrNo
					? this.state.bankInfo.agrNo
					: this.state.billDesc.wthCrdAgrNo,
			bankCd: this.state.billDesc.wthdCrdCorpOrg,
			usrSignCnl: getH5Channel(),
			cardTyp: 'D',
			isEntry: '01',
			type: '0' // 0 可以重复 1 不可以重复
		};
		this.props.$fetch.post(API.protocolSms, params).then((res) => {
			switch (res.msgCode) {
				case 'PTM0000':
					//协议绑卡校验成功提示（走协议绑卡逻辑）
					this.setState({
						isShowSmsModal: true
					});
					break;
				default:
					this.repay();
					break;
			}
		});
	};

	// 立即还款
	handleClickConfirm = () => {
		const { billDesc = {}, billNo, isPayAll, payType } = this.state;
		const cardAgrNo =
			this.state.bankInfo && this.state.bankInfo.agrNo ? this.state.bankInfo.agrNo : billDesc.wthCrdAgrNo;
		let couponId = '';
		if (this.state.couponInfo && this.state.couponInfo.usrCoupNo) {
			if (this.state.couponInfo.usrCoupNo !== 'null') {
				couponId = this.state.couponInfo.usrCoupNo;
			} else {
				couponId = '';
			}
		} else {
			if (this.state.billDesc.data && this.state.billDesc.data.usrCoupNo) {
				couponId = this.state.billDesc.data.usrCoupNo;
			}
		}
		let sendParams = {
			billNo,
			cardAgrNo,
			usrBusCnl: 'WEB',
			prodType: billDesc.prodType
		};

		//如果勾选多期,则不支持优惠券(罚息也不支持优惠券)
		if (this.state.canUseCoupon) {
			sendParams = {
				...sendParams,
				coupId: couponId
			};
		}
		//全局设置还款传递后台的参数
		this.setState(
			{
				repayParams: sendParams
			},
			() => {
				if (isPayAll || payType === 'WXPay') {
					this.repay();
				} else {
					//调用协议绑卡接口
					this.checkProtocolBindCard();
				}
			}
		);
	};

	//调用还款接口逻辑
	repay = () => {
		const { billDesc, isPayAll, repayParams, totalAmt, payType, thisPerdNum, repayPerds } = this.state;
		let sendParams = {
			...repayParams,
			isPayOff: isPayAll ? '1' : '0',
			thisRepTotAmt: totalAmt,
			adapter: '01',
			repayPerds: isPayAll ? [] : repayPerds
		};
		// 添加微信新增参数
		switch (payType) {
			case 'WXPay': {
				// 微信外 02  微信内  03
				const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
				queryData.backType = 'wxPay';
				const callbackUrl = location.origin + '/order/wx_pay_success_page?' + qs.stringify(queryData);
				sendParams = {
					...sendParams,
					routeCode: payType,
					wxPayReqVo: {
						tradeType: isWXOpen() ? '03' : '02',
						osNm: '还到',
						callbackUrl,
						wapUrl: '33',
						wapNm: '44'
					}
				};
				break;
			}

			case 'BankPay':
			default:
				break;
		}
		this.props.$fetch
			.post(API.payback, sendParams)
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					buriedPointEvent(order.repaymentFirst, {
						entry: entryFrom && entryFrom === 'home' ? '首页-查看代偿账单' : '账单',
						is_success: true
					});
					this.setState({
						showModal: false,
						couponInfo: {},
						isShowDetail: false
					});
					store.setOrderSuccess({
						isPayAll,
						thisPerdNum,
						thisRepTotAmt: parseFloat(totalAmt).toFixed(2),
						perdLth: billDesc.perdLth,
						perdUnit: billDesc.perdUnit,
						billPrcpAmt: billDesc.billPrcpAmt,
						billRegDt: billDesc.billRegDt
					});

					switch (payType) {
						case 'WXPay': {
							let wxData = res.data && res.data.rspOtherDate && JSON.parse(res.data.rspOtherDate);
							if (isWXOpen()) {
								window.WeixinJSBridge.invoke(
									'getBrandWCPayRequest',
									{
										appId: wxData.appId,
										timeStamp: wxData.timeStamp,
										nonceStr: wxData.nonceStr,
										package: wxData.package,
										signType: wxData.signType,
										paySign: wxData.paySign
									},
									(result) => {
										if (result.err_msg == 'get_brand_wcpay_request:ok') {
											setTimeout(() => {
												this.getpayResult('支付成功');
											}, 2000);
										} else {
											this.getLoanInfo();
											this.queryExtendedPayType();
										}
									}
								);
								// h5 支付方式
							} else {
								let url = wxData.mweb_url && wxData.mweb_url.replace('&amp;', '&');
								location.href = url;
							}
							break;
						}
						case 'BankPay':
							if (res.data && res.data.repayOrdNo) {
								this.setState(
									{
										repayOrdNo: res.data.repayOrdNo
									},
									() => {
										this.setState({
											cashierVisible: true
										});
									}
								);
							}
							break;
						default:
							break;
					}
				} else {
					buriedPointEvent(order.repaymentFirst, {
						entry: entryFrom && entryFrom === 'home' ? '首页-查看代偿账单' : '账单',
						is_success: false,
						fail_cause: res.msgInfo
					});
					this.setState({
						showModal: false,
						couponInfo: {},
						isShowDetail: false
					});
					this.props.toast.info(res.msgInfo);
					store.removeCouponData();
					// 刷新当前list
					setTimeout(() => {
						this.queryExtendedPayType();
						this.getLoanInfo();
					}, 3000);
				}
			})
			.catch(() => {
				store.removeCouponData();
				this.setState({
					showModal: false,
					couponInfo: {},
					isShowDetail: false
				});
			});
	};

	getpayResult = (message) => {
		const { billDesc, isPayAll, orderList, penaltyInfo } = this.state;
		const lastPerd = orderList[orderList.length - 1];
		//判断是否有罚息来决定是否结清
		let isClear = false;
		if (penaltyInfo.show) {
			if (lastPerd.perdStsNm === '已结清') {
				isClear = penaltyInfo.isChecked;
			} else {
				isClear = lastPerd.isChecked && penaltyInfo.isChecked;
			}
		} else {
			isClear = lastPerd.isChecked;
		}

		if (billDesc.perdUnit === 'D' || isClear || isPayAll) {
			store.removeBackData();
			store.removeCouponData();
			this.props.history.replace(`/order/repayment_succ_page?prodType=${billDesc.prodType}`);
		} else {
			message && this.props.toast.info(message);
			store.removeCouponData();
			// 刷新当前list
			setTimeout(() => {
				this.queryExtendedPayType();
				this.getLoanInfo();
			}, 3000);
		}
	};

	// 选择银行卡
	selectBank = () => {
		const {
			bankInfo: { agrNo = '' },
			billDesc: { wthCrdAgrNo = '' },
			isPayAll,
			detailArr,
			isShowDetail,
			totalAmt,
			isInsureValid,
			totalAmtForShow,
			orderList,
			penaltyInfo
		} = this.state;
		let orderDtData = {
			isPayAll,
			detailArr,
			isShowDetail,
			totalAmt,
			totalAmtForShow,
			orderList,
			penaltyInfo
		};
		store.setBackUrl('/order/order_detail_page');
		store.setOrderDetailData(orderDtData);
		isInsureValid && store.setInsuranceFlag(true);
		this.props.history.push(
			`/mine/select_save_page?agrNo=${agrNo || wthCrdAgrNo}&insuranceFlag=${isInsureValid ? '1' : '0'}`
		);
	};

	// 选择优惠劵
	selectCoupon = (useFlag) => {
		const {
			billNo,
			billDesc,
			couponInfo,
			bankInfo,
			detailArr,
			isShowDetail,
			totalAmt,
			totalAmtForShow,
			orderList,
			penaltyInfo
		} = this.state;

		let orderDtData = {
			detailArr,
			isShowDetail,
			totalAmt,
			totalAmtForShow,
			orderList,
			penaltyInfo
		};
		store.setOrderDetailData(orderDtData);
		if (useFlag) {
			store.removeCouponData(); // 如果是从不可使用进入则清除缓存中的优惠劵数据
			this.props.history.push({
				pathname: '/mine/coupon_page',
				search: `?transactionType=${billDesc.prodType === '11' ? 'fenqi' : 'DC'}&billNo=${billNo}`,
				state: { nouseCoupon: true, cardData: bankInfo && bankInfo.bankName ? bankInfo : billDesc }
			});
			return;
		}
		store.setBackUrl('/order/order_detail_page');
		if (couponInfo && couponInfo.usrCoupNo) {
			store.setCouponData(couponInfo);
		} else {
			store.setCouponData(billDesc.data);
		}
		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?transactionType=${billDesc.prodType === '11' ? 'fenqi' : 'DC'}&billNo=${billNo}`,
			state: { cardData: bankInfo && bankInfo.bankName ? bankInfo : billDesc }
		});
	};

	// 判断优惠劵显示
	renderCoupon = () => {
		const { deratePrice } = this.state;
		if (deratePrice !== '') {
			return <span>{deratePrice === 0 ? deratePrice : -deratePrice}元</span>;
		}
		return <span>不使用</span>;
	};

	// 一键结清
	payAllOrder = () => {
		this.getModalDtlInfo(this.showPayModal, true);
	};

	// 主动还款
	activePay = () => {
		if (!this.state.totalAmtForShow) return;
		this.getModalDtlInfo(this.showPayModal, false);
	};

	// 去还款
	gotoPay = () => {
		buriedPointEvent(order.repayment, {
			entry: entryFrom && entryFrom === 'home' ? '首页-查看代还账单' : '账单'
		});
		this.props.history.push('/order/order_repay_page');
	};

	showPayModal = (boolen) => {
		this.setState({
			showModal: true,
			isPayAll: boolen
		});
	};

	// 展示详情
	showDetail = () => {
		this.setState({
			isShowDetail: !this.state.isShowDetail
		});
	};

	// 查看逾期进度
	goOverdue = () => {
		this.props.history.push({
			pathname: '/order/overdue_progress_page'
		});
	};

	selectPayType = (type) => {
		this.setState({
			payType: type
		});
		store.setPayType(type);
	};

	//关闭收银台状态弹窗
	closeCashierModal = (paySuccess) => {
		this.setState({
			cashierVisible: false
		});
		if (paySuccess) {
			this.getpayResult();
		}
		this.getLoanInfo();
		this.queryExtendedPayType();
	};

	//勾选款点击回调
	checkClickCb = (item, checkboxType) => {
		const { orderList } = this.state;
		// let arr = orderList.filter((v) => v.isShowCheck);
		// let flag1 = arr.every((v) => v.isChecked === true);
		let flag2 = orderList.some((v) => v.isChecked && v.perdStsNm === '待还款');

		if (checkboxType && flag2) return;
		item = {
			...item,
			isChecked: !item.isChecked
		};

		if (checkboxType) {
			this.penaltyInfoCheckClick(item);
		} else {
			this.orderListCheckClick(item);
		}
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
				this.handlePenaltyInfoCheckSts();
			}
		);
	};

	penaltyInfoCheckClick = (item) => {
		this.setState(
			{
				penaltyInfo: { ...item }
			},
			() => {
				if (item.isChecked) {
					//勾选所有逾期账单
					for (let i = 0; i < this.state.orderList.length; i++) {
						if (this.state.orderList[i].perdStsNm === '已逾期') {
							this.state.orderList[i].isChecked = true;
						}
					}
					this.setState(
						{
							orderList: [...this.state.orderList]
						},
						() => {
							this.calcPayTotalMoney();
						}
					);
				} else {
					this.calcPayTotalMoney();
				}
			}
		);
	};

	//罚息复选框与订单列表联动逻辑
	handlePenaltyInfoCheckSts = () => {
		let checkedArr = this.state.orderList.filter((v) => v.isChecked);
		let overdueArr = this.state.orderList.filter((v) => v.perdStsNm === '已逾期');
		this.setState(
			{
				penaltyInfo: {
					...this.state.penaltyInfo,
					isChecked: this.state.penaltyInfo.show && checkedArr.length >= overdueArr.length
				}
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
			repayPerds.push(checkedArr[i].key + 1);
		}
		if (this.state.penaltyInfo.isChecked) {
			repayPerds.unshift(0);
		}

		this.setState(
			{
				insureInfo: { ...this.state.insureInfo, isChecked: checkedArr.length > 0 },
				repayPerds,
				canUseCoupon: repayPerds.length === 1 && !this.state.penaltyInfo.isChecked //设置优惠券是否可用
			},
			() => {
				if (repayPerds.length > 0) {
					this.getModalDtlInfo();
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
		const {
			billDesc = {},
			isPayAll,
			isShowSmsModal,
			smsCode,
			toggleBtn,
			detailArr,
			isShowDetail,
			totalAmtForShow,
			overDueModalFlag,
			payType,
			payTypes,
			openIdFlag,
			insureFeeInfo,
			isInsureValid,
			couponPrice,
			cashierVisible,
			repayOrdNo,
			disDisRepayAmt = 0,
			orderList,
			penaltyInfo,
			insureInfo,
			isBillClean,
			canUseCoupon
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
			perdList
			// discRedRepay = false
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
		const isOverdue =
			perdList &&
			perdList.filter((item) => {
				return item.perdSts === '1';
			});
		const isEntryShow = overDueModalFlag === '1' && isOverdue && isOverdue.length > 0;
		let moneyWithCoupon = '';

		if (!canUseCoupon) {
			moneyWithCoupon = '';
		} else if (isInsureValid) {
			moneyWithCoupon = couponPrice ? (parseFloat(couponPrice) + parseFloat(insureFeeInfo)).toFixed(2) : '';
		} else {
			moneyWithCoupon = couponPrice ? parseFloat(couponPrice).toFixed(2) : '';
		}

		return (
			<div>
				<Modal
					popup
					visible={this.state.showModal}
					onClose={() => {
						this.setState({ showModal: false, isShowDetail: false });
					}}
					animationType="slide-up"
				>
					<div className={styles.modal_box}>
						<div className={styles.modal_title}>
							还款详情
							<Icon
								type="cross"
								className={styles.modal_close_btn}
								onClick={() => {
									this.setState({ showModal: false, isShowDetail: false });
								}}
							/>
						</div>
						<div className={styles.modal_notice}>
							<span className={styles.text}>因银行通道原因，可能出现部分还款成功情况，请留意账单详情</span>
						</div>
						<div className={styles.modal_flex} onClick={isPayAll ? this.showDetail : () => {}}>
							<span className={styles.modal_label}>本次还款金额</span>
							<span className={styles.modal_value}>
								{moneyWithCoupon || (totalAmtForShow && parseFloat(totalAmtForShow).toFixed(2))}元
								{isPayAll && <i className={isShowDetail ? styles.arrow_up : styles.arrow_down} />}
							</span>
						</div>
						{/* 账单明细展示 */}
						{isShowDetail ? (
							<div className={styles.feeDetail}>
								{detailArr.map((item, index) =>
									item.feeAmt ? (
										<div className={styles.modal_flex} key={index}>
											<span className={styles.modal_label}>{item.feeNm}</span>
											<span className={styles.modal_value_desc}>
												{item.feeAmt && parseFloat(item.feeAmt).toFixed(2)}元
											</span>
										</div>
									) : null
								)}
								<div className={`${styles.modal_flex} ${styles.sum_total}`}>
									<span className={styles.modal_label_last}>本次应还总金额</span>
									<span className={styles.modal_value_last}>
										{moneyWithCoupon || (totalAmtForShow && parseFloat(totalAmtForShow).toFixed(2))}元
									</span>
								</div>
							</div>
						) : null}
						{!payType || payType === 'BankPay' ? (
							<div className={styles.modal_flex}>
								<span className={styles.modal_label}>还款银行卡</span>
								<span onClick={this.selectBank} className={`${styles.modal_value}`}>
									{this.state.bankInfo && this.state.bankInfo.bankName ? (
										<span>
											{this.state.bankInfo.bankName}({this.state.bankInfo.lastCardNo})
										</span>
									) : (
										<span>
											{wthdCrdCorpOrgNm}({wthdCrdNoLast})
										</span>
									)}
									&nbsp;
									<i style={{ position: 'relative', top: '-2px' }} />
								</span>
							</div>
						) : null}

						{disDisRepayAmt ? (
							<div className={styles.modal_flex}>
								<span className={styles.modal_label}>提前结清优惠</span>
								<span className={`${styles.modal_value_red}`}>-{disDisRepayAmt}元</span>
							</div>
						) : null}

						{canUseCoupon && (
							<div className={`${styles.modal_flex} ${styles.modal_flex2}`}>
								<span className={styles.modal_label}>优惠券</span>
								{this.state.billDesc.data && this.state.billDesc.data.coupVal ? (
									<span
										onClick={() => {
											this.selectCoupon(false);
										}}
										className={`${styles.modal_value}`}
									>
										{this.renderCoupon()}
									</span>
								) : (
									<span
										onClick={() => {
											this.selectCoupon(true);
										}}
										className={`${styles.modal_value}`}
									>
										无可用优惠券
									</span>
								)}
								&nbsp;
								<i />
							</div>
						)}
						{payTypes.length !== 1 ? (
							<div className={styles.modal_weixin}>
								<div className={styles.modal_label}>还款方式</div>
								<div className={styles.flex_div}>
									{payTypes.includes('WXPay') && !isInsureValid ? (
										<div
											className={payType === 'WXPay' ? [styles.item, styles.active].join(' ') : styles.item}
											onClick={() => {
												this.selectPayType('WXPay');
											}}
										>
											<span className={styles.jian} />
											<i className={styles.wx} />微 信
										</div>
									) : null}
									{payTypes.includes('BankPay') ? (
										<div
											onClick={() => {
												this.selectPayType('BankPay');
											}}
											className={payType === 'BankPay' ? [styles.item, styles.active].join(' ') : styles.item}
										>
											<i className={styles.bank} />
											银行卡
										</div>
									) : null}
								</div>
							</div>
						) : null}

						<SXFButton onClick={this.handleClickConfirm} className={styles.modal_btn}>
							立即还款
						</SXFButton>
					</div>
				</Modal>
				{cashierVisible && (
					<Cashier
						onClose={this.closeCashierModal}
						repayOrdNo={repayOrdNo}
						bankName={wthdCrdCorpOrgNm}
						bankNo={wthdCrdNoLast}
					/>
				)}
				{isShowSmsModal && (
					<SmsModal
						onCancel={this.skipProtocolBindCard}
						onConfirm={this.confirmProtocolBindCard}
						onSmsCodeChange={this.handleSmsCodeChange}
						smsCodeAgain={this.checkProtocolBindCard}
						smsCode={smsCode}
						toggleBtn={toggleBtn}
						history={this.props.history}
						fetch={this.props.$fetch}
						toast={this.props.toast}
						bankNo={
							this.state.bankInfo && this.state.bankInfo.agrNo
								? this.state.bankInfo.agrNo
								: this.state.billDesc.wthCrdAgrNo
						}
					/>
				)}
				{isOverdue && isOverdue.length > 0 && (isMPOS() || !isPhone() || (isWXOpen() && openIdFlag === '0')) && (
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
							{/* {!isBillClean && (
								<div className={styles.payAll} onClick={this.payAllOrder}>
									{discRedRepay && <i />}
									一键结清
								</div>
							)} */}
						</Panel>

						<div className={styles.submit_btn}>
							<SXFButton onClick={this.gotoPay}>{isBillClean ? '查看还款信息' : '查看还款计划'}</SXFButton>
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
							title="账单"
							extra={
								penaltyInfo.billOvduDays && {
									style: {
										color: '#FE6666',
										fontSize: '0.3rem',
										float: 'right',
										position: 'relative',
										paddingRight: '0.3rem'
									},
									text: `已逾期(${penaltyInfo.billOvduDays}天)`,
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
								penaltyInfo={penaltyInfo}
							/>
						</Panel>
						{!isBillClean && (
							<div className={styles.fixed_button}>
								<span className={styles.money_show}>
									共计<em>{totalAmtForShow}</em>元
								</span>
								<SXFButton
									onClick={this.activePay}
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
											您的逾期开始日期：<em>{penaltyInfo.billOvduStartDt}</em>
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
