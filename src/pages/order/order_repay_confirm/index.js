/*
 * @Author: shawn
 * @LastEditTime : 2020-02-18 17:20:27
 */
import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import { LoadingView, ButtonCustom, ProtocolSmsModal, TipConfirmModal } from 'components';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import { connect } from 'react-redux';
import styles from './index.scss';
import {
	coup_queryUsrRepayUsbCoup,
	repay_queryCashRegisterDetail,
	repay_paySubmit,
	bank_card_protocol_sms,
	bank_card_protocol_bind
} from 'fetch/api';
import { setCardTypeAction } from 'reduxes/actions/commonActions';
import Image from 'assets/image';
import qs from 'qs';
import { NoticeBar, List, Badge } from 'antd-mobile';
import { isWXOpen } from 'utils';
import { setBackGround } from 'utils/background';

let entryFrom = '';
@fetch.inject()
@setBackGround('#F0F3F9')
@connect(
	(state) => ({
		withholdCardData: state.commonState.withholdCardData,
		couponData: state.commonState.couponData
	}),
	{
		setCardTypeAction
	}
)
export default class order_repay_confirm extends PureComponent {
	constructor(props) {
		super(props);
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		entryFrom = queryData.entryFrom;
		this.state = {
			couponInfo: {},
			deratePrice: '',
			isShowSmsModal: false, //是否显示短信验证码弹窗
			smsCode: '',
			protocolBindCardCount: 0, // 协议绑卡接口调用次数统计
			toggleBtn: false, // 是否切换短信验证码弹窗底部按钮
			totalAmt: '', // 一键结清传给后台的总金额
			payType: 'CardPay',
			payTypes: ['CardPay'],
			disDisRepayAmt: '', // 优惠金额
			showCouponAlert: false,
			bnkTelNoHid: ''
		};
	}

	componentDidMount() {
		this.dataInit();
	}

	onReloadData = () => {
		this.dataInit();
	};

	dataInit = () => {
		const { withholdCardData = {}, couponData = {} } = this.props;
		const { billDesc = {} } = this.props.history.location.state;
		this.setState(
			{
				bankName: withholdCardData.bankName || billDesc.wthdCrdCorpOrgNm,
				bankNo: withholdCardData.lastCardNo || billDesc.wthdCrdNoLast,
				cardAgrNo: withholdCardData.agrNo || billDesc.wthCrdAgrNo,
				couponInfo: couponData
			},
			() => {
				this.queryCouponCount();
				this.getRepayConfirmInfo();
			}
		);
	};

	//获取可使用优惠券条数
	queryCouponCount = () => {
		const {
			billNo,
			billDesc = {},
			repayPerds,
			repayPerdsTypes,
			riskFlsg
		} = this.props.history.location.state;
		let params = {
			billNo,
			repayPerd: Number(repayPerds[0]),
			prodType: billDesc.prodType,
			coupSts: '00',
			startPage: 1,
			pageRow: 1
		};
		if (riskFlsg) {
			params.repayPerdsTypes = repayPerdsTypes;
		}
		this.props.$fetch.post(coup_queryUsrRepayUsbCoup, params).then((res) => {
			if (res.code === '000000' && res.data) {
				this.setState({
					availableCoupNum: res.data.totalRow
				});
			}
		});
	};

	// 获取弹框明细信息
	getRepayConfirmInfo = () => {
		const {
			billNo,
			repayPerds,
			repayPerdsTypes,
			billDesc,
			isPayAll,
			riskFlsg
		} = this.props.history.location.state;
		const { couponInfo } = this.state;

		let submitParams = {
			billNo,
			isSettle: isPayAll ? '1' : '0', // 一键结清isSettle为1， 否则为0
			prodType: billDesc.prodType,
			repayPerds: isPayAll ? [] : repayPerds
		};
		if (couponInfo.coupId) {
			submitParams.coupId = couponInfo.coupId;
		}
		if (riskFlsg) {
			submitParams.repayPerdsTypes = repayPerdsTypes;
		}
		this.props.$fetch
			.post(repay_queryCashRegisterDetail, submitParams)
			.then((res) => {
				if (!this.viewRef) return;
				this.viewRef.showDataView();
				if (res.code === '000000' && res.data) {
					const { disDisRepayAmt, exceedingAmt, totalAmt, totalList = [], payTypes } = res.data;
					this.setState({
						disDisRepayAmt,
						exceedingAmt,
						totalAmt,
						payTypes: this.convertPayTypes(payTypes)
					});
					this.getDiscountMoney(totalList);
				} else {
					this.props.toast.info(res.message);
				}
			})
			.catch((err) => {
				console.log(err);
				this.viewRef && this.viewRef.setError();
			});
	};

	convertPayTypes = (payTypes) => payTypes.map((item) => item.split('_')[0]);

	//获取使用优惠券试算金额
	getDiscountMoney = (arr = []) => {
		const { totalList, isPayAll } = this.props.history.location.state;
		if (isPayAll) {
			this.setState({
				detailList: arr
			});
			return;
		}

		arr.forEach((item) => {
			if (item.feeNm === '优惠金额') {
				totalList.push(item);
				this.setState({
					deratePrice: item.feeAmt,
					detailList: totalList
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
		const { smsCode } = this.state;
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
		this.props.$fetch.get(`${bank_card_protocol_bind}/${smsCode}`).then((res) => {
			if (res.code === '000000' || res.code === '999999') {
				this.closeSmsModal();
			} else if (this.state.protocolBindCardCount === 2 && res.code !== '000000') {
				this.closeSmsModal();
			} else {
				// 切换短信弹窗底部按钮
				this.setState({
					toggleBtn: true,
					smsCode: ''
				});
				this.props.toast.info(res.data || res.message);
			}
		});
	};

	// 协议绑卡校验接口
	checkProtocolBindCard = () => {
		const { cardAgrNo } = this.state;
		const { billDesc = {} } = this.props.history.location.state;

		const params = {
			agrNo: cardAgrNo,
			bankCode: billDesc.wthdCrdCorpOrg,
			channelFlag: '0', // 0 可以重复 1 不可以重复
			supportType: '',
			merType: ''
		};
		this.props.$fetch.post(bank_card_protocol_sms, params).then((res) => {
			switch (res.code) {
				case '000000':
					//协议绑卡校验成功提示（走协议绑卡逻辑）
					this.setState({
						isShowSmsModal: true,
						bnkTelNoHid: (res.data && res.data.bnkTelNoHid) || ''
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
		const { overdueDays, repayPerds, canUseCoupon } = this.props.history.location.state; //逾期的期数
		const { availableCoupNum, couponInfo } = this.state;
		buriedPointEvent(order.repayConfirmSubmitBtn, {
			isOverdue: !!overdueDays,
			repayPerds: repayPerds.join(','),
			isWXOpen: isWXOpen()
		});
		if (canUseCoupon && availableCoupNum && !couponInfo.coupId) {
			this.setState({
				showCouponAlert: true
			});
		} else {
			this.repayConfirmSubmit();
		}
	};

	//还款确认提交
	repayConfirmSubmit = () => {
		const { isPayAll } = this.props.history.location.state;
		const { payType } = this.state;
		if (isPayAll || payType === 'WXPay') {
			this.repay();
		} else {
			//调用协议绑卡接口
			this.checkProtocolBindCard();
		}
	};

	//调用还款接口逻辑
	repay = () => {
		const {
			billDesc = {},
			isPayAll,
			repayPerds,
			repayPerdsTypes,
			thisPerdNum,
			billNo,
			overdueDays,
			canUseCoupon,
			riskFlsg
		} = this.props.history.location.state;

		const { totalAmt, payType, cardAgrNo, bankNo, bankName, couponInfo, exceedingAmt } = this.state;

		let couponId = '';
		if (couponInfo && couponInfo.coupId && couponInfo.coupId !== 'null') {
			couponId = couponInfo.coupId;
		}
		let sendParams = {
			billNo,
			thisRepTotAmt: totalAmt,
			cardAgrNo,
			prodType: billDesc.prodType,
			isPayOff: isPayAll ? '1' : '0',
			repayPerds: isPayAll ? [] : repayPerds
		};

		//如果勾选多期,则不支持优惠券
		if (canUseCoupon) {
			sendParams = {
				...sendParams,
				coupId: couponId
			};
		}
		if (riskFlsg) {
			sendParams.repayPerdsTypes = repayPerdsTypes;
		}
		// 添加微信新增参数
		switch (payType) {
			case 'WXPay': {
				// 微信外 02  微信内  03
				const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
				queryData.backType = 'wxPay';
				queryData.billNo = billNo;
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
			case 'CardPay':
			default:
				break;
		}
		this.props.$fetch
			.post(repay_paySubmit, sendParams)
			.then((res) => {
				if (res.code === '000000' && res.data) {
					const { repayOrdNo, rspOtherDate } = res.data;

					buriedPointEvent(order.repaymentFirst, {
						entry: entryFrom && entryFrom === 'home' ? '首页-查看代偿账单' : '账单',
						is_success: true,
						isWXOpen: isWXOpen()
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
							let wxData = rspOtherDate && JSON.parse(res.data.rspOtherDate);
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
											this.goBackForWeixin();
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
						case 'CardPay':
							if (repayOrdNo) {
								this.props.history.replace({
									pathname: '/order/order_repay_result',
									state: {
										repayOrdNo,
										billNo,
										isSettle: isPayAll ? '1' : '0', // 一键结清isSettle为1， 否则为0
										prodType: billDesc.prodType,
										repayPerds: isPayAll ? [] : repayPerds,
										overdueDays,
										billDesc,
										bankName,
										bankNo,
										exceedingAmt
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
						fail_cause: res.message,
						isWXOpen: isWXOpen()
					});
					this.props.toast.info(res.message);
				}
			})
			.catch(() => {});
	};

	//获取还款结果
	getpayResult = (message) => {
		const { actPanelListDatas, billDesc, isPayAll } = this.props.history.location.state;
		const lastPerd = actPanelListDatas[actPanelListDatas.length - 1];
		let isClear = lastPerd.isChecked;
		if (billDesc.perdUnit === 'D' || isClear || isPayAll) {
			this.props.history.replace(`/order/repayment_succ_page?prodType=${billDesc.prodType}`);
		} else {
			message && this.props.toast.info(message);
			this.goBackForWeixin();
		}
	};

	//针对微信支付返回上一级页面
	goBackForWeixin = () => {
		this.props.history.goBack();
	};

	// 选择银行卡
	selectBank = () => {
		const { cardAgrNo } = this.state;
		this.props.setCardTypeAction('withhold');
		this.props.history.push(`/mine/select_save_page?agrNo=${cardAgrNo}&insuranceFlag=0`);
	};

	// 选择优惠劵
	selectCoupon = () => {
		const { availableCoupNum } = this.state;
		const { billNo, billDesc, repayPerds, repayPerdsTypes, riskFlsg } = this.props.history.location.state;
		let params = {};
		if (!availableCoupNum) {
			params.nouseCoupon = true;
		}
		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?billNo=${billNo}&perCont=${repayPerds[0]}&repayPerdsTypes=${JSON.stringify(
				repayPerdsTypes
			)}&riskFlsg=${riskFlsg}&prodType=${billDesc.prodType}`,
			state: params
		});
	};

	selectPayType = (type) => {
		this.setState({
			payType: type
		});
	};

	handleAlertShow = (type) => {
		this.setState({
			showCouponAlert: false
		});
		if (type === 'submit') {
			buriedPointEvent(order.couponUseAlert_yes);
			this.repayConfirmSubmit();
		} else {
			buriedPointEvent(order.couponUseAlert_no);
		}
	};

	/**
	 * @description 展示还款明细面板详情
	 */
	renderFeeDetail = (list, totalAmt) => (
		<div className={styles.feeDetail}>
			{list &&
				list.map((item, index) => {
					return item.feeAmt ? (
						<div className={styles.detailItem} key={index}>
							<span className={styles.detailLabel}>{item.feeNm}</span>
							{item.feeNm === '优惠金额' ? (
								<div className={styles.red_box}>
									<span>-优惠{item.feeAmt.toFixed(2)}</span>
								</div>
							) : (
								<span className={styles.detailValue}>
									{item.feeAmt && parseFloat(item.feeAmt).toFixed(2)}
								</span>
							)}
						</div>
					) : null;
				})}
			<div className={[styles.detailItem, styles.detailItemTotal].join(' ')}>
				<span className={styles.detailLabel}>剩余应还金额</span>
				<span className={styles.detailValue}>{totalAmt && parseFloat(totalAmt).toFixed(2)}</span>
			</div>
		</div>
	);

	renderCouponIcon = () => {
		if (this.state.availableCoupNum) {
			return (
				<span
					onClick={() => {
						this.selectCoupon();
					}}
				>
					{this.renderCoupon()}
				</span>
			);
		}
		return (
			<span
				onClick={() => {
					this.selectCoupon();
				}}
				className={styles.value}
			>
				无可用优惠券
			</span>
		);
	};

	// 判断优惠劵显示
	renderCoupon = () => {
		const { deratePrice, availableCoupNum } = this.state;
		if (deratePrice > 0) {
			return <span>-{deratePrice}元</span>;
		}
		//  可用优惠券数量
		return (
			<span className={styles.couNumBox}>
				<i />
				{availableCoupNum}个可用
			</span>
		);
	};

	render() {
		const {
			isShowSmsModal,
			smsCode,
			toggleBtn,
			detailList,
			totalAmt,
			payType,
			payTypes,
			showCouponAlert,
			disDisRepayAmt,
			bankName,
			bankNo,
			cardAgrNo,
			bnkTelNoHid
		} = this.state;

		const { canUseCoupon, totalAmt: billTotalAmt } = this.props.history.location.state;

		return (
			<LoadingView ref={(view) => (this.viewRef = view)} onReloadData={this.onReloadData}>
				<div className={styles.top_notice}>
					<NoticeBar
						marqueeProps={{
							loop: true,
							leading: 1000,
							trailing: 1000,
							style: { color: '#868f9e', fontSize: '0.24rem' }
						}}
						icon={null}
					>
						因银行通道原因，可能出现部分还款成功情况，请留意账单详情
					</NoticeBar>
				</div>

				<div className={styles.cardWrap}>
					<p className={styles.title}>应还金额</p>
					<p>
						<span className={styles.unit}>¥</span>
						<span className={styles.billTotalAmt}>{billTotalAmt && parseFloat(billTotalAmt).toFixed(2)}</span>
					</p>
					{/* 账单明细展示 */}
					{this.renderFeeDetail(detailList, totalAmt)}
				</div>

				<div className={[styles.cardWrap, styles.cardWrap1].join(' ')}>
					<List className={styles.antListItem}>
						{(!payType || payType === 'CardPay') && bankName && bankNo && (
							<List.Item arrow={'horizontal'} onClick={this.selectBank} extra={`${bankName}(${bankNo})`}>
								还款银行卡
							</List.Item>
						)}
						{disDisRepayAmt > 0 && (
							<List.Item extra={<span style={{ color: '#f66' }}>-{disDisRepayAmt}元</span>}>
								提前结清优惠
							</List.Item>
						)}
						{canUseCoupon && (
							<List.Item arrow={'horizontal'} extra={this.renderCouponIcon()}>
								优惠券
							</List.Item>
						)}
					</List>
					{payTypes.length > 1 ? (
						<div className={styles.modal_weixin}>
							<h3>还款方式</h3>
							<div className={styles.flex_div}>
								<div
									className={payType === 'WXPay' ? [styles.item, styles.active].join(' ') : styles.item}
									onClick={() => {
										this.selectPayType('WXPay');
									}}
								>
									<Badge className={styles.jian} text="荐" />
									微信快捷支付
									{payType === 'WXPay' && <img src={Image.adorn.card_select_yellow} alt="" />}
								</div>
								<div
									onClick={() => {
										this.selectPayType('CardPay');
									}}
									className={payType === 'CardPay' ? [styles.item, styles.active].join(' ') : styles.item}
								>
									{payType === 'CardPay' && <img src={Image.adorn.card_select_yellow} alt="" />}
									银行卡支付
								</div>
							</div>
						</div>
					) : null}
				</div>

				<ButtonCustom onClick={this.handleClickConfirm} className={styles.submit_btn}>
					立即还款
				</ButtonCustom>

				<TipConfirmModal
					visible={showCouponAlert}
					onButtonClick={(type) => {
						this.handleAlertShow(type);
					}}
					title=""
					desc="还有优惠券未使用确定提交吗？"
					cancelButtonText="再等等"
					okButtonText="提交"
				/>

				{isShowSmsModal && (
					<ProtocolSmsModal
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
						bnkTelNoHid={bnkTelNoHid}
					/>
				)}
			</LoadingView>
		);
	}
}
