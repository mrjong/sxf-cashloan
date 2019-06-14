import React, { PureComponent } from 'react';
import { Modal, Progress, InputItem, Icon, Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import qs from 'qs';
import { store } from 'utils/store';
import { isMPOS, getH5Channel } from 'utils/common';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import linkConf from 'config/link.conf';
import SXFButton from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { getFirstError, getDeviceType, handleInputBlur, idChkPhoto } from 'utils';
import TabList from './components/TagList';
import style from './index.scss';
import SmsModal from '../../order/order_detail_page/components/SmsModal';
import InsuranceModal from './components/InsuranceModal';
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
	moneyKeyboardWrapProps = {
		onTouchStart: (e) => e.preventDefault()
	};
}
let inputRef = '';
let closeBtn = true;
const API = {
	REPAY_INFO: '/bill/prebill', // 代还确认页面
	CONFIRM_REPAYMENT: '/bill/agentRepay', // 代还申请接口
	QUERY_REPAY_INFO: '/bill/queryRepayInfo', // 确认代还信息查询接口
	CHECK_WITH_HOLD_CARD: '/bill/checkWithHoldCard', // 储蓄卡是否支持代扣校验接口
	CHECK_CARD: '/my/chkCard', // 是否绑定了银行卡
	checkApplyProdMemSts: '/bill/checkApplyProdMemSts', // 校验借款产品是否需要会员卡
	queryUsrMemSts: '/my/queryUsrMemSts', // 查询用户会员卡状态
	queryFundInfo: '/fund/info', // 获取资金code,合同code
	chkCredCard: '/my/chkCredCard', // 查询信用卡列表中是否有授权卡
	COUPON_COUNT: '/bill/doCouponCount', // 后台处理优惠劵抵扣金额
	creditSts: '/bill/credit/sts', // 用户是否过人审接口
	qryContractInfo: '/fund/qryContractInfo', // 合同数据流获取
	protocolSms: '/withhold/protocolSms', // 校验协议绑卡
	protocolBind: '/withhold/protocolBink', //协议绑卡接口
};

let indexData = null; // 首页带过来的信息
let pageData = null;
let isSaveAmt = false;
let timer;
let timerOut;
@setBackGround('#F7F8FA')
@fetch.inject()
@createForm()
export default class confirm_agency_page extends PureComponent {
	constructor(props) {
		super(props);
		const queryData = store.getHomeConfirmAgency();
		// qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		indexData = queryData;
		this.state = {
			inputClear: false,
			usageModal: false,
			planModal: false,
			tipModal: false,
			prdId: '',
			loanDate: '',
			loanMoney: '',
			usageList: [],
			couponInfo: {},
			resaveBankCardAgrNo: '',
			resaveBankCardLastNo: '',
			resaveBankCardName: '',
			payBankCardAgrNo: '',
			payBankCardLastNo: '',
			payBankCardName: '',
			perdRateList: [],
			contractData: [],
			repayPlanInfo: {
				perd: []
			},
			disabledBtn: true,
			deratePrice: '',
			isShowTipModal: false,
			cardBillAmt: 0,
			percent: 0,
			dateDiff: 0,
			isShowModal: false,
			progressLoading: false,
			repayInfo: {},
			repayInfo2: {},
			repaymentDate: '',
			repaymentIndex: 0, // mpos取1（最后一个），只限返回两种期限的情况
			lendersDate: '',
			lendersIndex: 0,
			goData: {},
			defaultIndex: 0,
			isNeedExamine: false,
			repaymentDateList: [],
			lendersDateList: [
				{
					name: '还款日前一天',
					value: '1'
				},
				{
					name: '立即放款',
					value: '0',
					style: {
						width: '2.07rem'
					}
				}
			],
			isShowVIPModal: false,
			isVIP: false, // 是否有会员卡
			contractData: [], // 合同和产品id数据
			isShowSmsModal: false, //是否显示短信验证码弹窗
			smsCode: '',
			isShowInsureModal: false, // 是否显示保险说明弹框
			isCheckInsure: false, // 是否选择了保费
		};
	}

	componentWillMount() {
		isSaveAmt = store.getSaveAmt();
		store.removeSaveAmt();
		store.removeInsuranceFlag();
		let bankInfo = store.getCardData();
		pageData = store.getRepaymentModalData();
		store.removeRepaymentModalData();
		if (pageData) {
			if (bankInfo && JSON.stringify(bankInfo) !== '{}') {
				// 如果存在 bankInfo 并且弹框缓存数据崔仔 则更新弹框缓存的数据
				pageData.repayInfo.bankName = bankInfo.bankName;
				pageData.repayInfo.cardNoHid = bankInfo.lastCardNo;
				pageData.repayInfo.withHoldAgrNo = bankInfo.agrNo;
				pageData.repayInfo.bankCode = bankInfo.bankCode;
			}
			this.recoveryPageData();
		} else {
			this.requestGetRepaymentDateList();
		}
		if (isMPOS()) {
			this.checkUsrMemSts();
		}
		this.getExamineSts(); // 检查是否需要人审
	}

	// 查询用户会员卡状态
	checkUsrMemSts = () => {
		this.props.$fetch.get(API.queryUsrMemSts).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					isVIP: result.data.memSts === '1' ? true : false
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	// 检查是否需要人审
	getExamineSts = () => {
		this.props.$fetch.post(`${API.creditSts}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState({
					isNeedExamine: res.data && res.data.flag === '01'
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	// 数据回显
	recoveryPageData = () => {
		this.setState({ ...pageData });
	};

	// 代扣 Tag 点击事件
	handleRepaymentTagClick = (data, type) => {
		console.log(data);
		this.props.form.setFieldsValue({
			cardBillAmt: isSaveAmt && type && type === 'first' ? this.state.cardBillAmt : data.value.maxAmt + ''
		});
		this.setState({
			repaymentDate: data.value,
			repaymentIndex: data.index
			// cardBillAmt: data.value.cardBillAmt,
		});
		this.handleClickConfirm();
	};

	// 还款 Tag 点击事件
	handleLendersTagClick = (data, type) => {
		this.setState({
			lendersDate: data.value,
			lendersIndex: data.index
		});
	};

	// 按钮点击事件
	_handleClick = (callback, e) => {
		e && e.preventDefault && e.preventDefault();
		callback && callback();
	};

	// 选择银行卡
	handleClickChoiseBank = () => {
		this.setState(
			{
				cardBillAmt: this.state.cardBillAmt
			},
			() => {
				const { repayInfo, repayInfo2 } = this.state;
				store.setSaveAmt(true);
				store.setRepaymentModalData(this.state);
				store.setBackUrl('/home/confirm_agency?showModal=true');
				repayInfo2 && repayInfo2.insurance && store.setInsuranceFlag(true);
				this.props.history.push({
					pathname: '/mine/select_save_page',
					search: `?agrNo=${repayInfo.withHoldAgrNo}`
				});
			}
		);
	};

	// 确认按钮点击事件
	handleClickConfirm = () => {
		this.props.form.validateFields((err, values) => {
			if (!err) {
				console.log(values);
				this.setState(
					{
						cardBillAmt: values.cardBillAmt
					},
					() => {
						this.getFundInfo();
					}
				);
			} else {
				this.props.toast.info(getFirstError(err));
				this.props.form.setFieldsValue({
					cardBillAmt: ''
				});
			}
		});
	};

	// 储蓄卡是否支持代扣校验接口
	requestCheckWithHoldCard = () => {
		const { repayInfo } = this.state;
		const agrNo = repayInfo.withHoldAgrNo;
		this.props.$fetch.get(`${API.CHECK_WITH_HOLD_CARD}/${agrNo}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.checkMemSts();
			} else {
				// 确认代换信息返回结果失败埋点
				buriedPointEvent(home.borrowingSubmitResult, {
					is_success: false,
					fail_cause: res.msgInfo
				});
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	// 获取合同列表和产品id
	getFundInfo = () => {
		const { lendersDate, repaymentDate, cardBillAmt, repayInfo } = this.state;

		this.props.$fetch
			.post(`${API.queryFundInfo}`, {
				loanAmount: cardBillAmt,
				periodCount: repaymentDate.periodCount,
				periodLth: repaymentDate.periodLth && parseInt(repaymentDate.periodLth),
				periodUnit: repaymentDate.periodUnit,
				agrNo: repayInfo.withDrawAgrNo,
				wtdwTyp: lendersDate.value,
				autId: indexData && indexData.autId
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					this.setState(
						{
							contractData: result.data,
							disabledBtn: false
						},
						() => {
							this.requestGetRepayInfo();
						}
					);
				} else {
					this.props.toast.info(result.msgInfo);
				}
			});
	};

	// 获取代还期限列表 还款日期列表
	requestGetRepaymentDateList = () => {
		this.props.$fetch.get(`${API.QUERY_REPAY_INFO}/${indexData && indexData.autId}`).then((result) => {
			if (result && result.msgCode === 'PTM0000') {
				if (result.data && result.data.prdList && result.data.prdList.length === 0) {
					this.props.toast.info('当前渠道暂不支持提现申请，请进入MPOS代偿');
					return;
				}
				// const diff = dayjs(result.data.cardBillDt).diff(dayjs(), 'day');
				const diff = result.data.overDt;
				let lendersDateListFormat = this.state.lendersDateList;
				if (!result.data.cardBillDt || diff <= 4) {
					lendersDateListFormat[0].disable = true;
				}
				this.setState({
					repayInfo: result.data,
					repaymentDateList: result.data.prdList.map((item) => ({
						name: item.prdName,
						value: item.prdId,
						minAmt: item.minAmt,
						maxAmt: item.maxAmt,
						periodUnit: item.periodUnit,
						periodCount: item.periodCount,
						periodLth: item.periodLth
					})),
					dateDiff: diff,
					lendersIndex: 1,
					defaultIndex: 1,
					lendersDateList: lendersDateListFormat
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	// 校验代还金额
	verifyBillAmt = (rule, value, callback) => {
		const { repaymentDate } = this.state;
		if (
			!(
				/\d/.test(value) &&
				value % 100 == 0 &&
				parseInt(value) >= repaymentDate.minAmt &&
				repaymentDate.maxAmt >= parseInt(value)
			)
		) {
			callback(`可代偿金额为${repaymentDate.minAmt}~${repaymentDate.maxAmt}，且要为100整数倍`);
		} else {
			callback();
		}
	};
	// 关闭弹框
	handleCloseTipModal = (type) => {
		const { isNeedExamine } = this.state;
		this.setState(
			{
				[type]: false
			},
			() => {
				if (type === 'isShowTipModal' && isNeedExamine) {
					this.props.history.push('/home/loan_person_succ_page');
				} else if (type === 'isShowTipModal') {
					const { goData } = this.state;
					let title =
						goData.withdrawType === '3'
							? `${dayjs(goData.reserveDate).format('YYYY年MM月DD日')}完成放款`
							: `预计60秒完成放款`;
					let desc = goData.withdrawType === '3' ? '如有疑问，可' : `超过2个工作日没有放款成功，可`;
					this.props.history.push({
						pathname: '/home/loan_apply_succ_page',
						search: `?title=${title}&desc=${desc}`
					});
				}
			}
		);
	};

	// 跳转到会员卡
	goVIP = () => {
		this.setState(
			{
				cardBillAmt: this.props.form.getFieldValue('cardBillAmt'),
				isShowVIPModal: false
			},
			() => {
				store.setSaveAmt(true);
				store.setVipBackUrl('/home/confirm_agency');
				store.setRepaymentModalData(this.state);
				this.handleCloseTipModal('isShowVIPModal');
				this.props.history.push('/mine/membership_card_page');
			}
		);
	};

	// 校验借款产品是否需要会员卡
	checkMemSts = () => {
		const { contractData } = this.state;
		this.props.$fetch
			.get(`${API.checkApplyProdMemSts}/${contractData[0] && contractData[0].productId}`)
			.then((result) => {
				if (result && result.msgCode === 'PTM3014') {
					this.setState({
						isShowVIPModal: true
					});
				} else if (result && result.msgCode === 'PTM0000') {
					idChkPhoto({
						$props: this.props,
						type: 'agency_page',
						msg: '放款'
					}).then((res) => {
						switch (res) {
							case '1':
								this.requestConfirmRepaymentInfo();
								break;
							case '3':
								store.setIdChkPhotoBack(-2); //从人脸中间页回退2层到此页面
								break;
							default:
								break;
						}
					});
				} else {
					// 确认代换信息返回结果失败埋点
					buriedPointEvent(home.borrowingSubmitResult, {
						is_success: false,
						fail_cause: result.msgInfo
					});
					this.props.toast.info(result.msgInfo);
				}
			});
	};
	//计算该显示的还款金额
	calcLoanMoney = (money) => {
		const { repaymentDate } = this.state;
		if (repaymentDate && repaymentDate.maxAmt && money >= repaymentDate.maxAmt) {
			this.props.form.setFieldsValue({
				cardBillAmt: repaymentDate.maxAmt + ''
			});
		} else if (repaymentDate && repaymentDate.minAmt && money <= repaymentDate.minAmt) {
			this.props.form.setFieldsValue({
				cardBillAmt: repaymentDate.minAmt + ''
			});
		} else {
			if (money) {
				console.log(repaymentDate);

				this.props.form.setFieldsValue({
					cardBillAmt: Math.ceil(money / 100) * 100 + ''
				});
			}
		}
		this.handleClickConfirm();
	};
	// 埋点方法-根据代还期限埋不同的点
	buriedDucationPoint(type, duration) {
		if (type === 'M') {
			buriedPointEvent(home[`durationMonth${duration}`]);
		} else if (type === 'D') {
			buriedPointEvent(home[`durationDay${duration}`]);
		}
	}

	// 处理优惠券金额显示
	dealMoney = (result) => {
		const { contractData, repayInfo, cardBillAmt } = this.state;
		let couponInfo = store.getCouponData();
		// store.removeCouponData();
		let params = {};
		// 如果没有coupId直接不调用接口
		if (couponInfo && (couponInfo.usrCoupNo === 'null' || couponInfo.coupVal === -1)) {
			// 不使用优惠劵的情况
			this.setState({
				couponInfo,
				deratePrice: 0
			});
			return;
		}
		if (couponInfo && JSON.stringify(couponInfo) !== '{}') {
			params = {
				prodId: contractData[0].productId,
				couponId: couponInfo.usrCoupNo, // 优惠劵id
				type: '00', // 00为借款 01为还款
				price: cardBillAmt
			};
		} else {
			params = {
				prodId: contractData[0].productId,
				couponId: result.data.usrCoupNo, // 优惠劵id
				type: '00', // 00为借款 01为还款
				price: cardBillAmt
			};
		}
		this.props.$fetch.get(API.COUPON_COUNT, params).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					couponInfo,
					deratePrice: result.data.deratePrice
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};
	// 获取确认代还信息
	requestGetRepayInfo = () => {
		const { contractData, lendersDate, cardBillAmt } = this.state;
		this.props.$fetch
			.post(API.REPAY_INFO, {
				prdId: contractData[0].productId,
				cardId: indexData.autId,
				billPrcpAmt: cardBillAmt,
				wtdwTyp: lendersDate.value
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					this.setState({
						repayInfo2: result.data
					});
					if (result.data.data && result.data.data.usrCoupNo) {
						this.dealMoney(result.data);
					}
					this.buriedDucationPoint(result.data.perdUnit, result.data.perdLth);
				} else {
					this.props.toast.info(result.msgInfo);
				}
			});
	};
	// 渲染优惠劵
	renderCoupon = () => {
		const { deratePrice } = this.state;
		if (deratePrice) {
			return <span>-{deratePrice}元</span>;
		} else {
			return <span>不使用</span>;
		}
	};
	// 选择优惠劵
	selectCoupon = (useFlag) => {
		if (!this.state.repayInfo2 || !this.state.repayInfo2.perdLth) {
			this.props.toast.info('请输入借款金额');
			return;
		}
		store.setSaveAmt(true);
		store.setRepaymentModalData(this.state);
		if (useFlag) {
			this.props.history.push({
				pathname: '/mine/coupon_page',
				search: `?transactionType=DC&price=${this.state.cardBillAmt}&perCont=${this.state.repayInfo2.perdUnit === 'M'
					? this.state.repayInfo2.perdLth
					: 1}`,
				state: { nouseCoupon: true }
			});
			return;
		}
		if (this.state.couponInfo && this.state.couponInfo.usrCoupNo) {
			console.log(this.state.repayInfo2, '=====11======');
			store.setCouponData(this.state.couponInfo);
		} else {
			console.log(this.state.repayInfo2, '===========');
			store.setCouponData(this.state.repayInfo2.data);
		}
		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?transactionType=DC&price=${this.state.cardBillAmt}&perCont=${this.state.repayInfo2.perdUnit === 'M'
				? this.state.repayInfo2.perdLth
				: 1}`
		});
	};
	// 查看借款合同
	readContract = (item) => {
		const { repayInfo, contractData } = this.state;
		const billPrcpAmt = this.props.form.getFieldValue('cardBillAmt');
		store.setSaveAmt(true);
		store.setRepaymentModalData(this.state);
		console.log(
			`${linkConf.PDF_URL}${API.qryContractInfo}?contractTyep=${item.contractTyep}&contractNo=${item.contractNo}&loanAmount=${billPrcpAmt}&productId=${contractData[0]
				.productId}&agreementNo=${repayInfo.withDrawAgrNo}&withholdAgrNo=${repayInfo.withHoldAgrNo}&fin-v-card-token=${Cookie.get(
				'fin-v-card-token'
			) || store.getToken()}`
		);
		this.props.history.push({
			pathname: '/protocol/pdf_page',
			state: {
				url: `${linkConf.PDF_URL}${API.qryContractInfo}?contractTyep=${item.contractTyep}&contractNo=${item.contractNo}&loanAmount=${billPrcpAmt}&productId=${contractData[0]
					.productId}&agreementNo=${repayInfo.withDrawAgrNo}&withholdAgrNo=${repayInfo.withHoldAgrNo}&fin-v-card-token=${Cookie.get(
					'fin-v-card-token'
				) || store.getToken()}`,
				name: item.contractMdlName
			}
		});
	};
	handleShowModal = () => {
		if (!this.state.repayInfo2 || !this.state.repayInfo2.perdLth) {
			this.props.toast.info('请输入借款金额');
			return;
		}
		const { repayInfo2 } = this.state;
		if (repayInfo2 && repayInfo2.perdUnit === 'D') {
			return;
		}
		this.setState({
			isShowModal: true
		});
	};

	handleCloseModal = () => {
		this.setState({
			isShowModal: false
		});
	};
	handleShowTipModal = () => {
		this.setState({
			isShowTipModal: true
		});
	};
	// 确认代还信息
	requestConfirmRepaymentInfo = () => {
		const { lendersDate, repayInfo, contractData, couponInfo, cardBillAmt } = this.state;
		let couponId = '';
		if (couponInfo && couponInfo.usrCoupNo) {
			if (couponInfo.usrCoupNo !== 'null') {
				couponId = couponInfo.usrCoupNo;
			} else {
				couponId = '';
			}
		} else {
			if (this.state.repayInfo2.data && this.state.repayInfo2.data.usrCoupNo) {
				couponId = this.state.repayInfo2.data.usrCoupNo;
			}
		}
		const params = {
			withDrawAgrNo: repayInfo.withDrawAgrNo, // 代还信用卡主键
			withHoldAgrNo: repayInfo.withHoldAgrNo, // 还款卡号主键
			prdId: contractData[0].productId, // 产品ID
			autId: indexData.autId, // 信用卡账单ID
			repayType: lendersDate.value, // 还款方式
			usrBusCnl: '', // 操作渠道
			coupId: couponId, // 优惠劵id
			price: cardBillAmt, // 签约金额
			osType: getDeviceType() // 操作系统
		};
		timerOut = setTimeout(() => {
			this.setState(
				{
					percent: 0,
					progressLoading: true
				},
				() => {
					timer = setInterval(() => {
						this.setPercent();
						++this.state.time;
					}, 1000);
				}
			);
		}, 300);
		// 代还确认-确认借款
		buriedPointEvent(home.borrowingSubmit, {
			lenders_date: this.state.repayInfo2.perdCnt
		});
		this.props.$fetch
			.post(API.CONFIRM_REPAYMENT, params, {
				timeout: 100000,
				hideLoading: true
			})
			.then((result) => {
				this.setState(
					{
						goData: result.data,
						percent: 100
					},
					() => {
						clearInterval(timer);
						clearTimeout(timerOut);
						this.setState({
							progressLoading: false
						});
						if (result && result.msgCode === 'PTM0000') {
							this.handleShowTipModal();
							buriedPointEvent(home.borrowingSubmitResult, {
								is_success: true
							});
							// 清除卡信息
							store.removeCardData();
							// 清除上个页面中的弹框数据
							store.removeRepaymentModalData();
							store.removeSaveAmt();
						} else if (result && result.msgCode === 'PTM9958') {
							this.checkProtocolBindCard();
						} else if (result && result.msgCode === 'PTM7001') {

						} else {
							buriedPointEvent(home.borrowingSubmitResult, {
								is_success: false,
								fail_cause: result.msgInfo
							});
							this.props.toast.info(result.msgInfo);
						}
					}
				);
			})
			.catch((err) => {
				clearInterval(timer);
				clearTimeout(timerOut);
				this.setState({ percent: 100 }, () => {
					this.setState({
						progressLoading: false
					});
				});
			});
	};
	handleButtonClick = () => {
		const { isCheckInsure, repayInfo2 } = this.state;
		if (repayInfo2 && repayInfo2.insurance && !isCheckInsure) {
			this.props.toast.info('请先购买保险');
			return;
		};
		this.checkProtocolBindCard();
		// this.requestBindCardState();
	};
	// 请求用户绑卡状态
	// 请求用户绑卡状态
	requestBindCardState = () => {
		const api = indexData.autId ? `${API.chkCredCard}/${indexData.autId}` : API.CHECK_CARD;
		this.props.$fetch.get(api).then((result) => {
			if (result && result.msgCode === 'PTM0000') {
				// 有风控且绑信用卡储蓄卡
				this.requestCheckWithHoldCard();
			} else if (result && result.msgCode === 'PTM2003') {
				// 有风控没绑储蓄卡 跳绑储蓄卡页面
				store.setBackUrl('/home/agency');
				this.props.toast.info(result.msgInfo);
				setTimeout(() => {
					this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
				}, 3000);
			} else if (result && result.msgCode === 'PTM2002') {
				// 有风控没绑信用卡 跳绑信用卡页面
				store.setBackUrl('/home/agency');
				this.props.toast.info(result.msgInfo);
				setTimeout(() => {
					this.props.history.push({
						pathname: '/mine/bind_credit_page',
						search: `?noBankInfo=true&autId=${indexData.autId}`
					});
				}, 3000);
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};
	// 设置百分比
	setPercent = () => {
		if (this.state.percent < 90 && this.state.percent >= 0) {
			this.setState({
				percent: this.state.percent + parseInt(Math.random() * 10 + 1)
			});
		} else {
			clearInterval(timer);
		}
	};
	// 关闭短信弹窗并还款
	closeSmsModal = () => {
		this.setState({
		  isShowSmsModal: false,
		  smsCode: '',
		});
		this.requestBindCardState();
	}
	
	// 确认协议绑卡
	confirmProtocolBindCard = () => {
		const { repayInfo } = this.state;
		if (!this.state.smsCode) {
		  this.props.toast.info('请输入验证码');
		  return;
		}
		if (this.state.smsCode.length !== 6) {
		  this.props.toast.info('请输入正确的验证码');
		  return;
		}
		buriedPointEvent(home.protocolBindBtnClick);
		this.props.$fetch.post(API.protocolBind, {
			cardNo: repayInfo && repayInfo.withHoldAgrNo,
			smsCd: this.state.smsCode,
			isEntry: "01",
		}).then((res) => {
		  if (res.msgCode === 'PTM0000') {
			this.closeSmsModal()
		  } else if (res.msgCode === 'PTM9901') {
			this.props.toast.info(res.data);
			this.setState({ smsCode: '' });
			buriedPointEvent(home.protocolBindFail, {reason: `${res.msgCode}-${res.msgInfo}`});
		  } else {
			this.props.toast.info('绑卡失败，请换卡或重试');
			this.setState({
			  smsCode: '',
			  isShowSmsModal: false,
			})
			buriedPointEvent(home.protocolBindFail, {reason: `${res.msgCode}-${res.msgInfo}`});
		  }
		})
	}
	// 协议绑卡校验接口
	checkProtocolBindCard = () => {
		const { repayInfo, repayInfo2 } = this.state;
		const params = repayInfo2 && repayInfo2.insurance ? {
			cardNo: repayInfo && repayInfo.withHoldAgrNo,
		  	bankCd: repayInfo && repayInfo.bankCode,
		  	usrSignCnl: getH5Channel(),
		  	cardTyp: 'D',
			isEntry: '01',
			type: '1', // 0 可以重复 1 不可以重复
			forInsurance: '1', // 标识该次绑卡是否要求绑定支持收取保费的卡 1:是  其他情况:否
		} : {
			cardNo: repayInfo && repayInfo.withHoldAgrNo,
		  	bankCd: repayInfo && repayInfo.bankCode,
		  	usrSignCnl: getH5Channel(),
		  	cardTyp: 'D',
			isEntry: '01',
			type: '1', // 0 可以重复 1 不可以重复
		}
		this.props.$fetch.post(API.protocolSms, params).then((res) => {
		  switch (res.msgCode) {
			case 'PTM0000':
			  	//协议绑卡校验成功提示（走协议绑卡逻辑）
				this.setState({
					isShowSmsModal: true
				})
			break;
			case 'PTM9901':
				this.props.toast.info(res.data);
				buriedPointEvent(home.protocolSmsFail, {reason: `${res.msgCode}-${res.msgInfo}`});
		  	break;
			case '1010': // 银行卡已经绑定 直接继续往下走
			  	this.requestBindCardState();
			break;
			case 'PBM1010':
				this.props.toast.info(res.msgInfo);	
				buriedPointEvent(home.protocolSmsFail, {reason: `${res.msgCode}-${res.msgInfo}`});
			break;
			default:
				this.props.toast.info('暂不支持该银行卡，请换卡重试');
				buriedPointEvent(home.protocolSmsFail, {reason: `${res.msgCode}-${res.msgInfo}`});
			break;
		  }
		})
	}
	// 处理输入的验证码
	handleSmsCodeChange = (smsCode) => {
		this.setState({
		  smsCode,
		})
	}
	// 关闭保险说明弹框
	closeInsureModal = () => {
		this.setState({
			isShowInsureModal: false,
		})
	}
	// 选择保费
	chooseInsure = () => {
		this.setState({
			isCheckInsure: !this.state.isCheckInsure
		})
	}
	// 打开保险说明弹框
	openInsureModal = () => {
		this.setState({
			isShowInsureModal: true,
		})
	}
	render() {
		const { getFieldProps } = this.props.form;
		const {
			contractData,
			repayInfo,
			progressLoading,
			isShowVIPModal,
			disabledBtn,
			isShowTipModal,
			repayInfo2,
			repaymentIndex,
			repaymentDate,
			repaymentDateList,
			lendersDateList,
			defaultIndex,
			lendersIndex,
			percent,
			isShowModal,
			isShowSmsModal,
			smsCode,
			isShowInsureModal,
			isCheckInsure,
		} = this.state;
		return (
			<div>
				<div className={[ style.confirm_agency, 'confirm_agency' ].join(' ')}>
					<div className={style.scrollWrap}>
						<div className={style.inputWrap}>
							<div className={style.billInpBox}>
								<i className={style.moneyUnit}>¥</i>

								<InputItem
									className={style.billInput}
									placeholder=""
									clear={() => {
										console.log('cl99999999');
									}}
									disabled={
										repaymentDate.minAmt &&
										repaymentDate.maxAmt &&
										Number(repaymentDate.minAmt) == Number(repaymentDate.maxAmt)
									}
									type="number"
									ref={(el) => (inputRef = el)}
									{...getFieldProps('cardBillAmt', {
										onChange: (v) => {
											if (!v) {
												closeBtn = false;
												this.setState({
													cardBillAmt: '',
													repayInfo2: '',
													contractData: ''
												});
												this.props.form.setFieldsValue({
													cardBillAmt: ''
												});
											} else {
												closeBtn = true;
											}
											console.log(v, '------');
										},
										rules: [
											{ required: true, message: '请输入代偿金额' }
											// { validator: this.verifyBillAmt }
										]
									})}
									placeholder={
										repaymentDate.maxAmt ? `${repaymentDate.minAmt}-${repaymentDate.maxAmt}可借` : ''
									}
									onBlur={(v) => {
										setTimeout(() => {
											if (!closeBtn) {
												return;
											}
											handleInputBlur();
											if (v !== this.state.cardBillAmt) {
												store.removeCouponData();
											}
											this.calcLoanMoney(v);
										}, 10);
									}}
									onFocus={() => {
										this.setState({
											disabledBtn: true
										});
									}}
									moneykeyboardwrapprops={moneyKeyboardWrapProps}
								/>
							</div>
						</div>
						<div>
							<ul className={style.pannel}>
								<li style={{ display: 'none' }}>
									<TabList
										tagList={repaymentDateList}
										defaultindex={repaymentIndex}
										activeindex={repaymentIndex}
										onClick={this.handleRepaymentTagClick}
									/>
								</li>
								<li className={style.listItem}>
									<label>借多久</label>
									<span className={style.listValue}>
										{repayInfo &&
											repayInfo.prdList &&
											repayInfo.prdList[0] &&
											repayInfo.prdList[0].periodLth}
										{repayInfo &&
										repayInfo.prdList &&
										repayInfo.prdList[0] &&
										repayInfo.prdList[0].periodUnit === 'M' ? (
											'个月'
										) : (
											'天'
										)}
									</span>
								</li>
							</ul>
							<ul className={style.pannel}>
								<li className={style.listItem}>
									<label>放款日期</label>
									<span className={style.tagList}>
										<TabList
											burientype="lenders"
											tagType="lenders"
											tagList={lendersDateList}
											defaultindex={defaultIndex}
											activeindex={lendersIndex}
											onClick={this.handleLendersTagClick}
										/>
									</span>
								</li>
								<li
									className={style.listItem}
									onClick={() => {
										this.selectCoupon(!(repayInfo2.data && repayInfo2.data.coupVal));
									}}
								>
									<label>优惠券</label>
									{repayInfo2.data && repayInfo2.data.coupVal ? (
										<span className={style.listValue}>
											{this.renderCoupon()}
											<Icon type="right" className={style.icon} />
											{/* <i className={style.list_item_arrow} style={{ marginLeft: '.1rem' }} /> */}
										</span>
									) : (
										(repayInfo2 && (
											<span className={style.redText}>
												无可用优惠券
												<Icon type="right" className={style.icon} />
												<i className={style.list_item_arrow} style={{ marginLeft: '.1rem' }} />
											</span>
										)) || (
											<span className={style.redText}>
												请选择
												<Icon type="right" className={style.icon} />
												<i className={style.list_item_arrow} style={{ marginLeft: '.1rem' }} />
											</span>
										)
									)}
								</li>
								<li className={style.listItem} onClick={this.handleShowModal}>
									<label>{repayInfo2 && repayInfo2.perdUnit === 'D' ? '应还金额(元)' : '还款计划'}</label>
									<span>
										{repayInfo2 && repayInfo2.perdUnit === 'D' ? (
											<span className={style.listValue}>{repayInfo2.perdTotAmt}</span>
										) : (
											(repayInfo2 && (
												<span className={style.listValue}>
													点击查看
													<Icon type="right" className={style.icon} />
												</span>
											)) || <span className={style.listValue2}>暂无</span>
										)}
									</span>
								</li>
							</ul>
							<ul className={style.pannel}>
								<li className={style.listItem}>
									<label>收款信用卡</label>
									<span className={style.listValue}>
										{indexData.bankName}({indexData.cardNoHid.slice(-4)})
									</span>
								</li>
								<li className={style.listItem} onClick={this.handleClickChoiseBank}>
									<label>还款银行卡</label>
									<span className={style.listValue}>
										{repayInfo.bankName}({repayInfo.cardNoHid})
										<Icon type="right" className={style.icon} />
									</span>
								</li>
							</ul>
							{ repayInfo2 && repayInfo2.insurance ?
								<ul className={style.pannel}>
									<li className={style.listItem}>
										<div className={style.insureLeft}>
											<i className={style.insureIco} />
											<div className={style.insureTipsCont}>
												<p className={style.insureTipsTit} onClick={this.openInsureModal}>
													借款人意外险
													<i className={style.insureTips} />
												</p>
												<p>保费将在您首期还款时扣除</p>
											</div>
										</div>
										<div className={style.insureRight} onClick={this.chooseInsure}>
											<span>¥{repayInfo2.insurance}</span>
											<i className={ isCheckInsure ? `${style.unCheckIco} ${style.checkIco}` : style.unCheckIco} />
										</div>
									</li>
								</ul>
								: null
							}
							<div className={style.protocolBox}>
								{
									repayInfo2 && repayInfo2.insurance ? <p className={style.insureDesc}>本保险由中元保险经纪有限公司提供服务，最终结果以保险公司为准</p> : null
								}
								{contractData.length > 0 && (
									<p className={style.protocolLink}>
										点击“签约借款”，表示同意{' '}
										{contractData.map((item, idx) => (
											<em
												onClick={() => {
													this.readContract(item);
												}}
												key={idx}
											>
												《{item.contractMdlName}》
											</em>
										))}
									</p>
								)}
							</div>
						</div>
					</div>
					<div className={style.buttonWrap}>
						<SXFButton
							onClick={
								this.props.form.getFieldProps('cardBillAmt') && !disabledBtn ? (
									this.handleButtonClick
								) : (
									() => {}
								)
							}
							className={
								this.props.form.getFieldProps('cardBillAmt') && !disabledBtn ? repayInfo2 && repayInfo2.insurance && !isCheckInsure ?
								(
									style.submitBtnDisabled
								) : (
									style.submitBtn
								) : (
									style.submitBtnDisabled
								)
							}
						>
							确定签约
						</SXFButton>
					</div>
					<Modal
						wrapClassName={style.modalLoading}
						visible={progressLoading}
						transparent
						maskClosable={false}
					>
						<div className="show-info">
							<div className={style.modalLoading}>借款处理中...</div>
							<div className="confirm_agency_progress">
								<Progress percent={percent} position="normal" />
							</div>
						</div>
					</Modal>
					<Modal
						wrapClassName="confirm_agency_warp"
						visible={isShowTipModal}
						transparent
						onClose={() => {
							this.handleCloseTipModal('isShowTipModal');
						}}
						footer={[
							{
								text: '我知道了',
								onPress: () => {
									this.handleCloseTipModal('isShowTipModal');
								}
							}
						]}
					>
						<div className={style.modal_tip_content}>
							<h3 className={style.modl_tip_title}>"还到"已接入央行平台，逾期将影响您的个人信用！</h3>
							<p className={style.modl_tip_text}>
								若您在使用"还到"过程中出现逾期，信息将被披露到中国互联网金融协会"信用信息共享平台"。 这将对您的个人征信产生不利影响。请按时还款，避免出现逾期。
							</p>
						</div>
					</Modal>
					<Modal
						wrapClassName="modal_VIPTip_warp"
						visible={isShowVIPModal}
						closable
						transparent
						onClose={() => {
							this.handleCloseTipModal('isShowVIPModal');
						}}
						footer={[ { text: '立即开通', onPress: this.goVIP } ]}
					>
						<h2 className={style.modalTitle}>仅限VIP使用</h2>
						<ul className={style.modalUl}>
							<li>
								<i className={style.vipIco1} />极速放款通道
							</li>
							<li>
								<i className={style.vipIco2} />精彩活动优先通知
							</li>
							<li>
								<i className={style.vipIco3} />30天明星产品专享
							</li>
							<li>
								<i className={style.vipIco4} />刷卡优惠超值套餐
							</li>
						</ul>
					</Modal>
					<Modal visible={isShowModal} transparent onClose={this.handleCloseModal}>
						<div className={style.modal_content}>
							<Icon
								type="cross"
								className={style.modal_close_btn}
								onClick={this.handleCloseModal}
								color="#333"
							/>
							<h2 className={style.modal_title}>还款计划</h2>
							<ul className={style.bill_list}>
								{repayInfo2 &&
									repayInfo2.perd &&
									repayInfo2.perd.map((item) => (
										<li className={style.list_item} key={item.perdNum}>
											<label
												className={style.item_name}
											>{`${item.perdNum}/${repayInfo2.perdCnt}期`}</label>
											<span className={style.item_value}>{item.perdTotAmt}</span>
										</li>
									))}
							</ul>
						</div>
					</Modal>
					{
						isShowSmsModal && <SmsModal
							onCancel={() => {}}
							onConfirm={this.confirmProtocolBindCard}
							onSmsCodeChange={this.handleSmsCodeChange}
							smsCodeAgain={this.checkProtocolBindCard}
							smsCode={smsCode}
							toggleBtn={false}
							ref={(ele) => { this.smsModal = ele; }}
						/>
					}
					{
						// 保险弹框
						isShowInsureModal && <InsuranceModal onConfirmCb={ this.closeInsureModal } />
					}
				</div>
			</div>
		);
	}
}
