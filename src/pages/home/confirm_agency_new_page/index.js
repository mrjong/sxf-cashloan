import React, { PureComponent } from 'react';
import { Modal, Progress, InputItem, Icon } from 'antd-mobile';
import dayjs from 'dayjs';
import qs from 'qs';
import { store } from 'utils/store';
import { isMPOS } from 'utils/common';
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
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
	moneyKeyboardWrapProps = {
		onTouchStart: (e) => e.preventDefault()
	};
}
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
	creditSts: '/bill/credit/sts' // 用户是否过人审接口
};

let indexData = null; // 首页带过来的信息
let pageData = null;
let isSaveAmt = false;
let timer;
let timerOut;
@setBackGround('#fff')
@fetch.inject()
@createForm()
export default class confirm_agency_page extends PureComponent {
	constructor(props) {
		super(props);
		const queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
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
			contractData: [] // 合同和产品id数据
		};
	}

	componentWillMount() {
		isSaveAmt = store.getSaveAmt();
		store.removeSaveAmt();
		let bankInfo = store.getCardData();
		pageData = store.getRepaymentModalData();
		store.removeRepaymentModalData();
		if (pageData) {
			if (bankInfo && JSON.stringify(bankInfo) !== '{}') {
				// 如果存在 bankInfo 并且弹框缓存数据崔仔 则更新弹框缓存的数据
				pageData.repayInfo.bankName = bankInfo.bankName;
				pageData.repayInfo.cardNoHid = bankInfo.lastCardNo;
				pageData.repayInfo.withHoldAgrNo = bankInfo.agrNo;
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
				const { repayInfo } = this.state;
				store.setSaveAmt(true);
				store.setRepaymentModalData(this.state);
				store.setBackUrl('/home/confirm_agency?showModal=true');
				this.props.history.push({
					pathname: '/mine/select_save_page',
					search: `?agrNo=${repayInfo.withHoldAgrNo}`
				});
			}
		);
	};

	// 确认按钮点击事件
	handleClickConfirm = () => {
		// 确认代还信息按钮点击埋点
		buriedPointEvent(home.borrowingPreSubmit);
		this.props.form.validateFields((err, values) => {
			if (!err) {
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
				buriedPointEvent(home.borrowingPreSubmitResult, {
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
		console.log('------------', cardBillAmt);

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
					this.props.history.push('/home/loan_apply_succ_page');
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
					buriedPointEvent(home.borrowingPreSubmitResult, {
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
				this.props.form.setFieldsValue({
					cardBillAmt: Math.ceil(money / 100) * 100 + ''
				});
			} else if (repaymentDate.minAmt) {
				this.props.form.setFieldsValue({
					cardBillAmt: repaymentDate.minAmt + ''
				});
			} else {
				this.props.form.setFieldsValue({
					cardBillAmt: ''
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
		console.log(couponInfo, '----------------------');
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
		console.log(useFlag, '=-----');
		store.setSaveAmt(true);
		store.setRepaymentModalData(this.state);
		if (useFlag) {
			this.props.history.push({
				pathname: '/mine/coupon_page',
				search: `?price=${this.state.cardBillAmt}&perCont=${this.state.repayInfo2.perdUnit === 'M'
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
			search: `?price=${this.state.cardBillAmt}&perCont=${this.state.repayInfo2.perdUnit === 'M'
				? this.state.repayInfo2.perdLth
				: 1}`
		});
	};
	// 查看借款合同
	readContract = (item) => {
		const { repayInfo, prdId } = this.state;
		const billPrcpAmt = this.props.form.getFieldValue('cardBillAmt');
		store.setSaveAmt(true);
		store.setRepaymentModalData(this.state);
		console.log(
			`${linkConf.PDF_URL}${API.qryContractInfo}?contractTyep=${item.contractTyep}&contractNo=${item.contractNo}&loanAmount=${billPrcpAmt}&productId=${prdId}&agreementNo=${repayInfo.withDrawAgrNo}&withholdAgrNo=${repayInfo.withHoldAgrNo}&fin-v-card-token=${Cookie.get(
				'fin-v-card-token'
			) || store.getToken()}`
		);
		this.props.history.push({
			pathname: '/protocol/pdf_page',
			state: {
				url: `${linkConf.PDF_URL}${API.qryContractInfo}?contractTyep=${item.contractTyep}&contractNo=${item.contractNo}&loanAmount=${billPrcpAmt}&productId=${prdId}&agreementNo=${repayInfo.withDrawAgrNo}&withholdAgrNo=${repayInfo.withHoldAgrNo}&fin-v-card-token=${Cookie.get(
					'fin-v-card-token'
				) || store.getToken()}`,
				name: item.contractMdlName
			}
		});
	};
	handleShowModal = () => {
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
		this.props.$fetch
			.post(API.CONFIRM_REPAYMENT, params, {
				timeout: 100000,
				hideLoading: true
			})
			.then((result) => {
				this.setState(
					{
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
							buriedPointEvent(home.borrowingSubmit, {
								is_success: true
							});
							// 清除卡信息
							store.removeCardData();
							// 清除上个页面中的弹框数据
							store.removeRepaymentModalData();
							store.removeSaveAmt();
						} else if (result && result.msgCode === 'PTM7001') {
							this.props.toast.info(result.msgInfo);
							setTimeout(() => {
								this.props.history.push('/home/home');
							}, 3000);
						} else {
							buriedPointEvent(home.borrowingSubmit, {
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
		this.requestBindCardState();
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
			isShowModal
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
									disabled={
										repaymentDate.minAmt &&
										repaymentDate.maxAmt &&
										Number(repaymentDate.minAmt) == Number(repaymentDate.maxAmt)
									}
									type="number"
									ref={(el) => (this.inputRef = el)}
									{...getFieldProps('cardBillAmt', {
										rules: [
											{ required: true, message: '请输入代偿金额' }
											// { validator: this.verifyBillAmt }
										]
									})}
									placeholder={
										repaymentDate.maxAmt ? `${repaymentDate.minAmt}～${repaymentDate.maxAmt}` : ''
									}
									onBlur={(v) => {
										handleInputBlur();
										if (v !== this.state.cardBillAmt) {
											store.removeCouponData();
										}
										this.calcLoanMoney(v);
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
						<div className={style.pannel}>
							<ul>
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
										<span className={style.redText}>
											无可用优惠券
											<Icon type="right" className={style.icon} />
											<i className={style.list_item_arrow} style={{ marginLeft: '.1rem' }} />
										</span>
									)}
								</li>
								<li className={style.listItem} onClick={this.handleShowModal}>
									<label>还款计划</label>
									<span>
										{repayInfo2 && repayInfo2.perdUnit === 'D' ? (
											<span className={style.listValue}>{repayInfo2.perdTotAmt}</span>
										) : (
											<span className={style.listValue}>
												<Icon type="right" className={style.icon} />
											</span>
										)}
									</span>
								</li>
							</ul>
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
					<div className={style.buttonWrap}>
						<SXFButton
							onClick={this.handleButtonClick}
							className={
								this.props.form.getFieldProps('cardBillAmt') && !disabledBtn ? (
									style.submitBtn
								) : (
									style.submitBtnDisabled
								)
							}
						>
							签约借款
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
				</div>
			</div>
		);
	}
}
