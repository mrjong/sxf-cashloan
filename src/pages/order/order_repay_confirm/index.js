/*
 * @Author: shawn
 * @LastEditTime: 2019-09-05 10:15:29
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import SXFButton from 'components/ButtonCustom';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import styles from './index.scss';
import { getH5Channel, isMPOS } from 'utils/common';
import qs from 'qs';
import { NoticeBar } from 'antd-mobile';
import SmsModal from '../order_common_page/components/SmsModal';
import { isWXOpen, isPhone } from 'utils';
import { setBackGround } from 'utils/background';

const API = {
	payback: '/bill/paySubmit',
	protocolSms: '/withhold/protocolSms', // 校验协议绑卡
	protocolBind: '/withhold/protocolBink', //协议绑卡接口
	fundPlain: '/fund/plain', // 费率接口
	queryExtendedPayType: '/bill/queryExtendedPayType', //其他支付方式查询
	couponList: '/coupon/list'
};
let entryFrom = '';
@fetch.inject()
@setBackGround('#F7F8FA')
export default class order_repay_confirm extends PureComponent {
	constructor(props) {
		super(props);
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		entryFrom = queryData.entryFrom;
		this.state = {
			bankInfo: {},
			couponInfo: {},
			deratePrice: '',
			isShowSmsModal: false, //是否显示短信验证码弹窗
			smsCode: '',
			protocolBindCardCount: 0, // 协议绑卡接口调用次数统计
			toggleBtn: false, // 是否切换短信验证码弹窗底部按钮
			detailArr: [], // 还款详情数据
			totalAmt: '', // 一键结清传给后台的总金额
			payType: '',
			payTypes: ['BankPay'],
			insureInfo: '',
			insureFeeInfo: '',
			isInsureValid: false, // 是否有保费并且为待支付状态
			totalAmtForShow: '',
			couponPrice: '', // 优惠劵计算过的金额
			disDisRepayAmt: 0, // 优惠金额
			showAlert: false
		};
	}

	componentDidMount() {
		this.dataInit();
	}

	componentWillUnmount() {
		store.removeCardData();
	}

	dataInit = () => {
		//数据填充
		const { billDesc = {} } = this.props.history.location.state;
		let bankInfo = store.getCardData() || {};
		store.removeOrderDetailData();
		this.setState(
			{
				bankName: bankInfo.bankName || billDesc.wthdCrdCorpOrgNm,
				bankNo: bankInfo.lastCardNo || billDesc.wthdCrdNoLast,
				bankInfo,
				cardAgrNo: bankInfo.agrNo || billDesc.wthCrdAgrNo
			},
			() => {
				this.queryCouponCount();
				this.getRepayConfirmInfo();
				this.queryExtendedPayType();
			}
		);
	};

	//查询支付方式
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

	//获取可使用优惠券条数
	queryCouponCount = () => {
		const { billNo, billDesc } = this.props.history.location.state;

		this.props.$fetch
			.get(
				API.couponList,
				{
					type: '00',
					pageNo: 1,
					billNo,
					prodType: billDesc.prodType
				},
				{ hideLoading: true }
			)
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					this.setState({
						availableCoupNum: res.data.totalSize
					});
				}
			});
	};

	// 获取还款确认信息
	getRepayConfirmInfo = (isPayAll) => {
		const { billNo, repayPerds, billDesc } = this.props.history.location.state;
		let couponInfo = store.getCouponData() || {};
		let params = {
			ordNo: billNo,
			isSettle: isPayAll ? '1' : '0', // 一键结清isSettle为1， 否则为0
			prodType: billDesc.prodType,
			repayPerds: isPayAll ? [] : repayPerds
		};
		if (couponInfo.coupId) {
			params.coupId = couponInfo.coupId;
		}
		this.props.$fetch
			.post(API.fundPlain, params)
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					if (res.data) {
						this.setState({
							disDisRepayAmt: res.data[0].disDisRepayAmt,
							detailArr: res.data[0].totalList,
							totalAmt: res.data[0].totalAmt,
							totalAmtForShow: res.data[0].totalAmtForShow //展示的金额
						});
						this.getDiscountMoney(res.data[0].totalList);
					}
				} else {
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	//获取使用优惠券试算金额
	getDiscountMoney = (arr = []) => {
		arr.forEach((item) => {
			if (item.feeNm === '优惠金额') {
				this.setState({
					deratePrice: item.feeAmt
				});
			}
		});
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
		const { cardAgrNo, smsCode } = this.state;
		if (!smsCode) {
			this.props.toast.info('请输入验证码');
			return;
		}
		if (smsCode.length !== 6) {
			this.props.toast.info('请输入正确的验证码');
			return;
		}
		this.setState({
			protocolBindCardCount: this.state.protocolBindCardCount + 1
		});
		this.props.$fetch
			.post(API.protocolBind, {
				cardNo: cardAgrNo,
				smsCd: smsCode,
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
		const { cardAgrNo } = this.state;
		const { billDesc = {} } = this.props.history.location.state;

		const params = {
			cardNo: cardAgrNo,
			bankCd: billDesc.wthdCrdCorpOrg,
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
		const { billOvduDays, repayPerds } = this.props.history.location.state; //逾期的期数
		buriedPointEvent(order.repayConfirmSubmitBtn, {
			isOverdue: !!billOvduDays,
			repayPerds: repayPerds.join(',')
		});
		const { availableCoupNum } = this.state;
		let couponInfo = store.getCouponData() || {};

		if (availableCoupNum && !couponInfo.coupId) {
			this.setState({
				showAlert: true
			});
		} else {
			this.repayConfirmSubmit();
		}
	};

	//还款确认提交
	repayConfirmSubmit = () => {
		const { isPayAll, payType, cardAgrNo } = this.state;
		let couponInfo = store.getCouponData() || {};

		const { billDesc = {}, billNo, canUseCoupon } = this.props.history.location.state;

		let couponId = '';
		if (couponInfo && couponInfo.usrCoupNo) {
			if (couponInfo.usrCoupNo !== 'null') {
				couponId = couponInfo.usrCoupNo;
			} else {
				couponId = '';
			}
		}
		let sendParams = {
			billNo,
			cardAgrNo,
			usrBusCnl: 'WEB',
			prodType: billDesc.prodType
		};

		//如果勾选多期,则不支持优惠券(罚息也不支持优惠券)
		if (canUseCoupon) {
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
		const { billDesc = {}, isPayAll, repayPerds, thisPerdNum } = this.props.history.location.state;
		const { repayParams, totalAmt, payType } = this.state;
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
						couponInfo: {}
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
								const { billNo, repayPerds, billDesc, billOvduDays } = this.props.history.location.state;
								const { bankNo, bankName } = this.state;

								this.props.history.replace({
									pathname: '/order/order_repay_result',
									state: {
										repayOrdNo: res.data.repayOrdNo,
										ordNo: billNo,
										isSettle: isPayAll ? '1' : '0', // 一键结清isSettle为1， 否则为0
										prodType: billDesc.prodType,
										repayPerds: isPayAll ? [] : repayPerds,
										bankNo,
										bankName,
										billDesc,
										isLastPerd: this.isLastPerd(),
										billOvduDays
									}
								});
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
						couponInfo: {}
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
					couponInfo: {}
				});
			});
	};

	//获取还款结果
	getpayResult = (message) => {
		const { actOrderList, billDesc, isPayAll } = this.props.history.location.state;
		const lastPerd = actOrderList[actOrderList.length - 1];
		let isClear = lastPerd.isChecked;

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

	//判断该账单是否最后一期
	isLastPerd = () => {
		const { actOrderList, billDesc, isPayAll } = this.props.history.location.state;
		const lastPerd = actOrderList[actOrderList.length - 1];
		let isClear = lastPerd.isChecked;

		return billDesc.perdUnit === 'D' || isClear || isPayAll;
	};

	// 选择银行卡
	selectBank = () => {
		const { isInsureValid, cardAgrNo } = this.state;

		store.setBackUrl('/order/order_detail_page');
		isInsureValid && store.setInsuranceFlag(true);
		this.props.history.push(
			`/mine/select_save_page?agrNo=${cardAgrNo}&insuranceFlag=${isInsureValid ? '1' : '0'}`
		);
	};

	// 选择优惠劵
	selectCoupon = (useFlag) => {
		const { bankInfo } = this.state;
		let couponInfo = store.getCouponData() || {};

		const { billNo, billDesc, billOvduDays } = this.props.history.location.state;
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
			store.setCouponData({ coupVal: -1, usrCoupNo: 'null' });
		}
		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?transactionType=${billDesc.prodType === '11' ? 'fenqi' : 'DC'}&billNo=${billNo}`,
			state: { cardData: bankInfo && bankInfo.bankName ? bankInfo : billDesc, isOverdue: !!billOvduDays }
		});
	};

	// 判断优惠劵显示
	renderCoupon = () => {
		const { deratePrice, availableCoupNum } = this.state;
		let couponInfo = store.getCouponData() || {};

		if (couponInfo.coupId) {
			return <span>{deratePrice === 0 ? deratePrice : -deratePrice}元</span>;
		}
		// if (deratePrice !== '') {
		// 	return <span>{deratePrice === 0 ? deratePrice : -deratePrice}元</span>;
		// }
		//  可用优惠券数量
		return (
			<span className={styles.couNumBox}>
				<i />
				{availableCoupNum}个可用
			</span>
		);
	};

	selectPayType = (type) => {
		this.setState({
			payType: type
		});
		store.setPayType(type);
	};

	handleAlertShow = (type) => {
		this.setState({
			showAlert: false
		});
		if (type === 'submit') {
			buriedPointEvent(order.couponUseAlert_yes);
			this.repayConfirmSubmit();
		} else {
			buriedPointEvent(order.couponUseAlert_no);
		}
	};

	render() {
		const {
			isShowSmsModal,
			smsCode,
			toggleBtn,
			detailArr,
			totalAmtForShow,
			payType,
			payTypes,
			insureFeeInfo,
			isInsureValid,
			couponPrice,
			showAlert,
			disDisRepayAmt = 0,
			bankName,
			bankNo,
			cardAgrNo,
			availableCoupNum
		} = this.state;

		const { canUseCoupon } = this.props.history.location.state;

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
				<div className={styles.top_notice}>
					<NoticeBar
						marqueeProps={{
							loop: true,
							leading: 1000,
							trailing: 1000,
							style: { color: '#f66', fontSize: '0.3rem' }
						}}
						icon={null}
					>
						因银行通道原因，可能出现部分还款成功情况，请留意账单详情
					</NoticeBar>
				</div>
				<div className={styles.repayInfo_box}>
					<div className={styles.title}>
						<span>账单金额</span>
						<span>{moneyWithCoupon || (totalAmtForShow && parseFloat(totalAmtForShow).toFixed(2))}元</span>
					</div>
					{/* 账单明细展示 */}
					<div className={styles.feeDetail}>
						{detailArr.map((item, index) =>
							item.feeAmt ? (
								<div className={styles.item} key={index}>
									<span>{item.feeNm}</span>
									{item.feeNm === '优惠金额' || item.feeNm === '减免金额' ? (
										<span className={styles.red_box}>-优惠{parseFloat(item.feeAmt)}</span>
									) : (
										<span>{parseFloat(item.feeAmt).toFixed(2)}</span>
									)}
								</div>
							) : null
						)}
						<div className={`${styles.item} ${styles.sum_total}`}>
							<span>剩余应还金额</span>
							<span>{moneyWithCoupon || (totalAmtForShow && parseFloat(totalAmtForShow).toFixed(2))}元</span>
						</div>
					</div>

					{!payType || payType === 'BankPay' ? (
						<div className={styles.info_item}>
							<span>还款银行卡</span>
							<span onClick={this.selectBank} className={styles.value}>
								{bankName}({bankNo})
							</span>
						</div>
					) : null}

					{disDisRepayAmt ? (
						<div className={styles.info_item}>
							<span>提前结清优惠</span>
							<span className={`${styles.modal_value_red}`}>-{disDisRepayAmt}元</span>
						</div>
					) : null}

					{canUseCoupon && (
						<div className={styles.info_item}>
							<span>优惠券</span>
							{availableCoupNum ? (
								<span
									onClick={() => {
										this.selectCoupon(false);
									}}
									className={styles.value}
								>
									{this.renderCoupon()}
								</span>
							) : (
								<span
									onClick={() => {
										this.selectCoupon(true);
									}}
									className={styles.value}
								>
									无可用优惠券
								</span>
							)}
						</div>
					)}
					{payTypes.length !== 1 ? (
						<div className={styles.modal_weixin}>
							<div>还款方式</div>
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
				</div>

				<SXFButton onClick={this.handleClickConfirm} className={styles.submit_btn}>
					立即还款
				</SXFButton>

				{showAlert ? (
					<div className={styles.alert_wrap}>
						<div className={styles.alert_body}>
							<div className={styles.alert_body_box}>
								<p>还有优惠券未使用确定提交吗？</p>
							</div>
							<div className={styles.button_box}>
								<div className={styles.button_wrap}>
									<span
										className={[styles.button, styles.exit].join(' ')}
										onClick={() => {
											this.handleAlertShow('exit');
										}}
									>
										再等等
									</span>
									<span
										className={styles.button}
										onClick={() => {
											this.handleAlertShow('submit');
										}}
									>
										提交
									</span>
								</div>
							</div>
						</div>
					</div>
				) : null}

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
						bankNo={cardAgrNo}
					/>
				)}
			</div>
		);
	}
}
