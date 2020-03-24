/*
 * @Author: shawn
 * @LastEditTime: 2020-03-24 10:41:52
 */
import React, { PureComponent } from 'react';
import { InputItem, Icon } from 'antd-mobile';
import { store } from 'utils/store';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home, DC_PAYCARD } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import linkConf from 'config/link.conf';
import { createForm } from 'rc-form';
import { getFirstError, handleInputBlur, getDeviceType } from 'utils';
import TabList from './components/TagList';
import style from './index.scss';
import { domListen } from 'utils/domListen';
import { RepayPlanModal, CheckRadio, ButtonCustom, ProtocolSmsModal } from 'components';
import CouponAlert from './components/CouponAlert';
import WarningModal from './components/WarningModal';

import {
	loan_queryLoanApplInfo,
	loan_loanPlan,
	loan_queryContractInfo,
	bank_card_check,
	loan_contractPreview,
	bank_card_protocol_sms,
	bank_card_protocol_bind,
	coup_sendLoanCoup
} from 'fetch/api.js';
import { showModalPlanOutRiskBury, showModalPlanRiskBury } from './riskBuryConfig';
import { connect } from 'react-redux';
import {
	setCardTypeAction,
	setConfirmAgencyInfoAction,
	setCouponDataAction
} from 'reduxes/actions/commonActions';
import { setCacheContactAction } from 'reduxes/actions/staticActions';
import { base64Decode } from 'utils/CommonUtil/toolUtil';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { cardBillAmtRiskBury } from './riskBuryConfig';
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
	moneyKeyboardWrapProps = {
		onTouchStart: (e) => e.preventDefault()
	};
}
let closeBtn = true;

@setBackGround('#f0f4f9')
@fetch.inject()
@createForm()
@domListen()
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		withholdCardData: state.commonState.withholdCardData,
		confirmAgencyInfo: state.commonState.confirmAgencyInfo,
		couponData: state.commonState.couponData,
		cacheContact: state.staticState.cacheContact,
		saveContact: state.commonState.saveContact,
		authId: state.staticState.authId
	}),
	{
		setCardTypeAction,
		setCacheContactAction,
		setConfirmAgencyInfoAction,
		setCouponDataAction
	}
)
export default class confirm_agency_page extends PureComponent {
	constructor(props) {
		super(props);
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
			repayPlanInfo: {
				perd: []
			},
			disabledBtn: true,
			deratePrice: '',
			isShowTipModal: false,
			cardBillAmt: 0,
			dateDiff: 0,
			isShowModal: false,

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
						width: '1.9rem'
					}
				}
			],
			isShowVIPModal: false,
			contractData: [], // 合同和产品id数据
			isShowSmsModal: false, //是否显示短信验证码弹窗
			smsCode: '',
			isShowInsureModal: false, // 是否显示保险说明弹框
			isCheckInsure: false, // 是否选择了保费
			showCouponAlert: false, // 是否显示优惠券拦截弹窗
			contactList: null,
			checkBox1: false
		};
	}

	componentWillMount() {
		this.props.toast.loading('加载中...', 10);
		const { withholdCardData, confirmAgencyInfo } = this.props;
		this.checkBtnAble();
		if (confirmAgencyInfo) {
			if (withholdCardData && JSON.stringify(withholdCardData) !== '{}') {
				// 如果存在 bankInfo 并且弹框缓存数据存在 则更新弹框缓存的数据
				confirmAgencyInfo.repayInfo.withholdBankName = withholdCardData.bankName;
				confirmAgencyInfo.repayInfo.withholdBankLastNo = withholdCardData.lastCardNo;
				confirmAgencyInfo.repayInfo.withholdBankAgrNo = withholdCardData.agrNo;
				confirmAgencyInfo.repayInfo.withholdBankCode = withholdCardData.bankCode || withholdCardData.bankCd;
			}
			this.recoveryPageData(confirmAgencyInfo);
		} else {
			this.requestGetRepaymentDateList();
		}
	}

	componentDidUpdate() {
		let flag = store.getConfirmAgencyBackHome();
		store.removeConfirmAgencyBackHome();
		flag && this.sendCoupon();
	}

	componentWillUnmount() {
		store.removeConfirmAgencyBackHome();
	}

	// 拦截发放优惠券
	sendCoupon = () => {
		const { isShowModal, repayInfo2 } = this.state;
		if (isShowModal) {
			this.setState({
				isShowModal: false
			});
		} else if (repayInfo2 && Number(repayInfo2.availableCoupCount)) {
			this.props.history.push('/home/home');
		} else {
			this.props.$fetch
				.post(coup_sendLoanCoup)
				.then((result) => {
					if (result && result.code === '000000' && result.data !== null) {
						this.setState({
							showCouponAlert: true,
							couponAlertData: {
								coupVal: result.data.coupVal,
								validEndTm: result.data.validEndTm
							}
						});
					} else {
						this.props.history.push('/home/home');
					}
				})
				.catch(() => {
					this.props.history.push('/home/home');
				});
		}
	};

	// 数据回显
	recoveryPageData = (confirmAgencyInfo) => {
		this.setState({ ...confirmAgencyInfo }, () => {
			// 初始化数据渲染
			this.calcLoanMoney(this.state.cardBillAmt);
		});
	};

	// 还款 Tag 点击事件
	handleLendersTagClick = (data, type) => {
		const cardBillAmt = this.props.form.getFieldValue('cardBillAmt');
		this.setState(
			{
				lendersDate: data.value,
				lendersIndex: data.index
			},
			() => {
				type && cardBillAmt && this.handleClickConfirm();
			}
		);
	};

	// 按钮点击事件
	_handleClick = (callback, e) => {
		e && e.preventDefault && e.preventDefault();
		callback && callback();
	};

	// 选择银行卡
	handleClickChoiseBank = () => {
		const { repayInfo, cardBillAmt, repaymentDate, lendersDate, lendersIndex, checkBox1 } = this.state;
		// 将页面信息存储到redux中
		this.props.setConfirmAgencyInfoAction({
			cardBillAmt,
			repayInfo,
			repaymentDate,
			lendersDate,
			checkBox1,
			lendersIndex
		});
		// 将选择的卡类型存储到redux中
		this.props.setCardTypeAction('withhold');
		if (repayInfo && repayInfo.withholdBankLastNo && repayInfo.withholdBankLastNo.length > 0) {
			buriedPointEvent(DC_PAYCARD, {
				paycard_type: 'select'
			});
			this.props.history.push({
				pathname: '/mine/select_save_page',
				search: `?agrNo=${repayInfo.withholdBankAgrNo}`
			});
		} else {
			buriedPointEvent(DC_PAYCARD, {
				paycard_type: 'add'
			});
			this.props.history.push({
				pathname: '/mine/bind_save_page',
				search: `?cardType=withhold`
			});
		}
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

	// 获取合同列表和产品id
	getFundInfo = () => {
		const { lendersDate, repaymentDate, cardBillAmt, repayInfo } = this.state;
		const { authId } = this.props;
		this.props.$fetch
			.post(loan_queryContractInfo, {
				autId: authId || '',
				loanAmt: cardBillAmt,
				prodCount: repaymentDate.prodCount,
				prodLth: repaymentDate.prodLth,
				prodUnit: repaymentDate.prodUnit,
				withholdBankAgrNo: repayInfo.withholdBankAgrNo || '',
				withdrawBankAgrNo: repayInfo.withdrawBankAgrNo || '',
				wtdwTyp: lendersDate.value,
				prodType: '01'
			})
			.then((result) => {
				if (result && result.code === '000000' && result.data !== null) {
					this.setState(
						{
							contractData: result.data && result.data.contracts,
							disabledBtn: false
						},
						() => {
							this.requestGetRepayInfo();
						}
					);
				} else {
					this.props.toast.info(result.message);
				}
			});
	};

	// 获取代还期限列表 还款日期列表
	requestGetRepaymentDateList = () => {
		const { authId } = this.props;
		this.props.$fetch.post(loan_queryLoanApplInfo, { autId: authId || '' }).then((result) => {
			if (result && result.code === '000000' && result.data !== null) {
				if (result.data && result.data.prods && result.data.prods.length === 0) {
					this.props.toast.info('当前渠道暂不支持提现申请，请进入MPOS代偿');
					return;
				}
				// const diff = dayjs(result.data.cardBillDt).diff(dayjs(), 'day');
				const diff = result.data.lastReapyDt;
				let lendersDateListFormat = this.state.lendersDateList;
				if (diff <= 4) {
					lendersDateListFormat[0].disable = true;
				}
				// base64解密
				if (result.data.contacts && result.data.contacts.length) {
					// map 改变引用型数组,值类型数组不改变
					result.data.contacts.map((item, index) => {
						item.name = base64Decode(item.name);
						item.number = base64Decode(item.number);
						if (index < 5) {
							item.isMarked = true;
						} else {
							item.isMarked = false;
						}
						item.uniqMark = 'uniq' + index;
						return item;
					});
				}
				if (result.data.excludedContacts && result.data.excludedContacts.length) {
					for (let i = 0; i < result.data.excludedContacts.length; i++) {
						result.data.excludedContacts[i] = base64Decode(result.data.excludedContacts[i]);
					}
				}
				// 初始化数据渲染
				if (result.data.prods && result.data.prods.length) {
					// 适用于只有一个产品情况
					this.setState({
						cardBillAmt: `${result.data.prods[0].maxAmt}`,
						repaymentDate: result.data.prods[0]
					});
					this.props.form.setFieldsValue({
						cardBillAmt: `${result.data.prods[0].maxAmt}`
					});
				}
				this.setState({
					repayInfo: result.data,
					repaymentDateList: result.data.prods.map((item) => ({
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
				this.props.toast.info(result.message);
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
		this.setState({
			[type]: false
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

	// 获取确认代还信息
	requestGetRepayInfo = () => {
		let { contractData, lendersDate, cardBillAmt } = this.state;
		const { couponData, authId } = this.props;
		let params = {
			prodId: contractData[0] && contractData[0].prodId,
			autId: authId || '',
			repayType: lendersDate.value,
			loanAmt: cardBillAmt,
			prodType: '01'
		};
		// 第一次加载(包括无可用的情况),coupId传'0',查最优的优惠券
		// 不使用优惠券,不传coupId,
		// 使用优惠券,coupId传优惠券ID
		if (couponData && (couponData.coupId === 'null' || couponData.coupVal === -1)) {
			// 不使用优惠劵的情况
			params = {
				...params
			};
		} else if (couponData && JSON.stringify(couponData) !== '{}') {
			params = {
				...params,
				coupId: couponData.coupId
			};
		}
		this.props.$fetch
			.post(loan_loanPlan, params)
			.then((result) => {
				if (result && result.code === '000000' && result.data !== null) {
					this.props.toast.hide();
					this.setState({
						repayInfo2: result.data,
						deratePrice: result.data.deductAmount,
						showInterestTotal: result.data.showFlag === '1'
					});
					this.buriedDucationPoint(result.data.perdUnit, result.data.perdLth);
				} else {
					this.props.toast.info(result.message);
				}
			})
			.catch(() => {
				this.setState({
					deratePrice: ''
				});
			});
	};
	// 渲染优惠劵
	renderCoupon = () => {
		const { deratePrice, repayInfo2 } = this.state;
		if (deratePrice) {
			return <span className={style.redText}>-{deratePrice}元</span>;
		}
		//  可用优惠券数量
		return (
			<div className={style.couNumBox}>
				<i />
				{repayInfo2 && repayInfo2.availableCoupCount}个可用
			</div>
		);
	};
	// 选择优惠劵
	selectCoupon = (useFlag) => {
		const {
			repayInfo2,
			contractData,
			cardBillAmt,
			repayInfo,
			repaymentDate,
			lendersDate,
			lendersIndex,
			checkBox1
		} = this.state;
		if (!repayInfo2 || !repayInfo2.perdLth) {
			this.props.toast.info('请输入借款金额');
			return;
		}
		this.props.setConfirmAgencyInfoAction({
			cardBillAmt,
			repayInfo,
			repaymentDate,
			lendersDate,
			lendersIndex,
			checkBox1
		});
		if (useFlag) {
			this.props.history.push({
				pathname: '/mine/coupon_page',
				search: `?prodType=01&price=${this.state.cardBillAmt}&prodId=${contractData[0].prodId}`,
				state: { nouseCoupon: true }
			});
			return;
		}
		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?prodType=01&price=${this.state.cardBillAmt}&prodId=${contractData[0].prodId}`
		});
	};
	// 查看借款合同
	readContract = (item) => {
		const {
			contractData,
			repayInfo,
			cardBillAmt,
			repaymentDate,
			lendersDate,
			lendersIndex,
			checkBox1
		} = this.state;
		// const { userInfo = {} } = this.props;
		const billPrcpAmt = this.props.form.getFieldValue('cardBillAmt');
		this.props.setConfirmAgencyInfoAction({
			cardBillAmt,
			repayInfo,
			repaymentDate,
			lendersDate,
			lendersIndex,
			checkBox1
		});
		const tokenId = Cookie.get('FIN-HD-AUTH-TOKEN') || store.getToken();
		const osType = getDeviceType();
		let pathUrl = `${linkConf.PDF_URL}${loan_contractPreview}?contractType=${item.contractType}&contractNo=${item.contractNo}&loanAmount=${billPrcpAmt}&prodId=${contractData[0].prodId}&withholdBankAgrNo=${repayInfo.withholdBankAgrNo}&withdrawBankAgrNo=${repayInfo.withdrawBankAgrNo}&tokenId=${tokenId}`;
		if (osType === 'IOS') {
			store.setHrefFlag(true);
			window.location.href = pathUrl;
		} else {
			this.props.history.push({
				pathname: '/protocol/pdf_page',
				state: {
					url: pathUrl,
					name: item.contractMdlName
				}
			});
		}
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
		this.setState(
			{
				isShowModal: true
			},
			() => {
				sxfburiedPointEvent(showModalPlanRiskBury.key);
			}
		);
	};

	handleCloseModal = () => {
		this.setState(
			{
				isShowModal: false
			},
			() => {
				sxfburiedPointEvent(showModalPlanOutRiskBury.key);
			}
		);
	};
	handleShowTipModal = () => {
		this.props.toast.hide();
		this.setState({
			isShowTipModal: true
		});
	};

	handleButtonClick = () => {
		const { checkBox1, repayInfo } = this.state;
		if (!(repayInfo && repayInfo.withholdBankLastNo && repayInfo.withholdBankLastNo.length > 0)) {
			this.props.toast.info('请先绑定还款储蓄卡');
			return;
		}
		if (!checkBox1) {
			this.props.toast.info('请先阅读并勾选相关协议，继续签约借款');
			return;
		}
		// 埋点
		buriedPointEvent(home.loanBtnClick);
		this.checkProtocolBindCard();
	};

	// 请求用户绑卡状态
	requestBindCardState = () => {
		const { authId } = this.props;
		this.props.$fetch.get(`${bank_card_check}/${authId || ''}`).then((result) => {
			if (result && result.code === '000000') {
				// 有风控且绑信用卡储蓄卡
				getNextStatus({
					$props: this.props,
					actionType: 'agencyPage',
					actionMsg: '放款'
				}).then((res) => {
					if (res === 'LOAN') {
						this.handleShowTipModal();
					}
				});
			} else if (result && result.code === '999974') {
				// 有风控没绑储蓄卡 跳绑储蓄卡页面
				this.props.toast.info(result.message);
				setTimeout(() => {
					this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
				}, 3000);
			} else if (result && result.code === '000012') {
				// 有风控没绑信用卡 跳绑信用卡页面
				this.props.toast.info(result.message);
				setTimeout(() => {
					this.props.history.push({
						pathname: '/mine/bind_credit_page',
						search: `?noBankInfo=true&autId=${authId}`
					});
				}, 3000);
			} else {
				this.props.toast.info(result.message);
			}
		});
	};

	// 关闭短信弹窗并还款
	closeSmsModal = () => {
		this.setState({
			isShowSmsModal: false,
			smsCode: ''
		});
		this.requestBindCardState();
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
		buriedPointEvent(home.protocolBindBtnClick);
		this.props.$fetch.get(`${bank_card_protocol_bind}/${smsCode}`).then((res) => {
			if (res.code === '000000') {
				this.closeSmsModal();
			} else if (res.code === '0000010') {
				this.props.toast.info(res.message);
				this.setState({ smsCode: '' });
				buriedPointEvent(home.protocolBindFail, { reason: `${res.code}-${res.message}` });
			} else if (res.code === '999999') {
				//该卡完全绑不上
				this.setState({
					protocolSmsFailInfo: res.data,
					protocolSmsFailFlag: true,
					isShowSmsModal: true
				});
				buriedPointEvent(home.protocolBindFail, { reason: `${res.code}-${res.message}` });
			} else {
				this.props.toast.info(res.message);
				this.setState({
					smsCode: '',
					isShowSmsModal: false
				});
				buriedPointEvent(home.protocolBindFail, { reason: `${res.code}-${res.message}` });
			}
		});
	};
	// 协议绑卡校验接口
	checkProtocolBindCard = () => {
		this.props.toast.loading('加载中...', 20);
		const { repayInfo, repayInfo2 } = this.state;
		const params = {
			agrNo: repayInfo && repayInfo.withholdBankAgrNo,
			bankCode: repayInfo && repayInfo.bankCode,
			channelFlag: '1', // 0 可以重复 1 不可以重复
			supportType: repayInfo2 && Number(repayInfo2.insurance) ? '01' : '',
			merType: repayInfo2 && Number(repayInfo2.insurance) ? 'ZY' : '' // * 优先绑定标识 * 标识该次绑卡是否要求优先绑定某类型卡, * JR随行付金融 XD随行付小贷 ZY中元保险  其他情况:无优先级
		};
		this.props.$fetch.post(bank_card_protocol_sms, params).then((res) => {
			switch (res.code) {
				case '000000':
					this.props.toast.hide();
					//协议绑卡校验成功提示（走协议绑卡逻辑）
					this.setState({
						isShowSmsModal: true,
						bnkTelNoHid: res.data && res.data.bnkTelNoHid
					});
					break;
				// case '0000010':
				// 	this.props.toast.info(res.message);
				// 	buriedPointEvent(home.protocolSmsFail, { reason: `${res.code}-${res.message}` });
				// 	break;
				case '999999':
					//该卡完全绑不上
					this.props.toast.hide();
					this.setState({
						protocolSmsFailInfo: res.data,
						protocolSmsFailFlag: true,
						isShowSmsModal: true
					});
					buriedPointEvent(home.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
				case '999973': // 银行卡已经绑定 直接继续往下走
					this.requestBindCardState();
					break;
				// case '999968':
				// 	this.props.toast.info(res.message);
				// 	buriedPointEvent(home.protocolSmsFail, { reason: `${res.code}-${res.message}` });
				// 	break;
				default:
					this.props.toast.info(res.message);
					buriedPointEvent(home.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
			}
		});
	};
	// 处理输入的验证码
	handleSmsCodeChange = (smsCode) => {
		this.setState({
			smsCode
		});
	};
	// 选择指定联系人
	handleClickChooseContact = () => {
		const { isBtnAble, repayInfo } = this.state;
		this.cacheDataHandler();
		buriedPointEvent(home.selectContactClick, {
			operation: isBtnAble ? 'edit' : 'select'
		});
		this.calculationNum();
		this.props.history.push(
			`/home/add_contact_page?contactsLength=${(repayInfo.contacts && repayInfo.contacts.length) || 0}`
		);
	};
	/**
	 * @description: 将后端联系人数据缓存起来  优先取本地 再去后端
	 * @param {type}
	 * @return:
	 */

	calculationNum = () => {
		const { repayInfo } = this.state;
		const { cacheContact } = this.props;
		if (!cacheContact || cacheContact.length === 0) {
			this.props.setCacheContactAction(repayInfo.contacts.slice(0, 5));
			return;
		}
		let isNull = true;
		for (let index = 0; index < cacheContact.length; index++) {
			const element = cacheContact[index];
			if (element.name) {
				isNull = false;
				break;
			}
		}
		if (isNull) {
			this.props.setCacheContactAction(repayInfo.contacts.slice(0, 5));
		} else {
			this.props.setCacheContactAction(cacheContact);
		}
	};
	// 点击勾选协议
	checkAgreement = () => {
		this.setState({ checkBox1: !this.state.checkBox1 });
	};

	// 判断按钮是否可以
	checkBtnAble = () => {
		const { saveContact } = this.props;
		if (saveContact) {
			this.setState({
				isBtnAble: true
			});
		} else {
			this.setState({
				isBtnAble: false
			});
		}
	};
	// 缓存页面信息
	cacheDataHandler = () => {
		const {
			repayInfo,
			cardBillAmt,
			repaymentDate,
			lendersDate,
			lendersIndex,
			checkBox1,
			isShowTipModal,
			repayInfo2,
			contractData
		} = this.state;
		this.props.setConfirmAgencyInfoAction({
			cardBillAmt,
			repayInfo,
			repaymentDate,
			lendersDate,
			lendersIndex,
			checkBox1,
			isShowTipModal,
			repayInfo2,
			contractData
		});
	};
	render() {
		const { history, toast, userInfo } = this.props;
		const { getFieldProps } = this.props.form;
		const {
			contractData,
			repayInfo,
			disabledBtn,
			isShowTipModal,
			repayInfo2,
			repaymentDate,
			lendersDateList,
			defaultIndex,
			lendersIndex,
			isShowModal,
			isShowSmsModal,
			smsCode,
			showCouponAlert,
			couponAlertData,
			showInterestTotal,
			checkBox1,
			cardBillAmt,
			lendersDate
		} = this.state;
		return (
			<div>
				<div className={[style.confirm_agency, 'confirm_agency_wrap'].join(' ')}>
					<div className={style.scrollWrap}>
						<div className={style.inputWrap}>
							<div className={style.billInpBox}>
								<i className={style.moneyUnit}>¥</i>
								<InputItem
									data-sxf-props={JSON.stringify({
										type: cardBillAmtRiskBury.type,
										name: cardBillAmtRiskBury.name,
										actContain: cardBillAmtRiskBury.actContain
									})}
									className={style.billInput}
									disabled={
										repaymentDate.minAmt &&
										repaymentDate.maxAmt &&
										Number(repaymentDate.minAmt) == Number(repaymentDate.maxAmt)
									}
									type="number"
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
											// 每次改变金额需要重新选择优惠劵, 清空优惠劵数据
											this.props.setCouponDataAction({});
											if (!closeBtn) {
												return;
											}
											handleInputBlur();
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
							<p className={style.billInpBoxTip}>建议全部借出，借款后剩余额度将不可用</p>
						</div>
						<div>
							<ul className={style.pannel}>
								{/* <li style={{ display: 'none' }}>
									<TabList
										tagList={repaymentDateList}
										defaultindex={repaymentIndex}
										activeindex={repaymentIndex}
										onClick={this.handleRepaymentTagClick}
									/>
								</li> */}
								<li className={style.listItem}>
									<label>借多久</label>
									<span className={style.listValue}>
										{repayInfo && repayInfo.prods && repayInfo.prods[0] && repayInfo.prods[0].prodLth}
										{repayInfo && repayInfo.prods && repayInfo.prods[0] && repayInfo.prods[0].prodUnit === 'M'
											? '个月'
											: '天'}
									</span>
								</li>
							</ul>
							<ul className={style.pannel}>
								<li className={style.listItem}>
									<div>
										<label>放款日期</label>
									</div>
									<div className={style.TabListWrap}>
										<TabList
											burientype="lenders"
											tagType="lenders"
											tagList={lendersDateList}
											defaultindex={defaultIndex}
											activeindex={lendersIndex}
											onClick={this.handleLendersTagClick}
										/>
									</div>
								</li>
								<li
									className={style.listItem}
									onClick={() => {
										this.selectCoupon(!(repayInfo2 && Number(repayInfo2.availableCoupCount)));
									}}
								>
									<label>优惠券</label>
									{repayInfo2 && Number(repayInfo2.availableCoupCount) ? (
										<div className={[style.listValue, style.hasArrow].join(' ')}>
											{this.renderCoupon()}
											<Icon type="right" className={style.icon} />
										</div>
									) : (
										(repayInfo2 && (
											<span className={[style.listValue, style.grayText2, style.hasArrow].join(' ')}>
												无可用优惠券
												<Icon type="right" className={style.icon} />
											</span>
										)) || (
											<span className={[style.listValue, style.redText, style.hasArrow].join(' ')}>
												请选择
												<Icon type="right" className={style.icon} />
											</span>
										)
									)}
								</li>
								<li
									className={
										repayInfo2 && showInterestTotal ? `${style.listItem} ${style.listItem3}` : style.listItem
									}
									onClick={this.handleShowModal}
								>
									<label>{repayInfo2 && repayInfo2.perdUnit === 'D' ? '应还金额(元)' : '还款计划'}</label>
									<div>
										{(repayInfo2 && (
											<span
												className={
													repayInfo2 && repayInfo2.perdUnit === 'D'
														? [style.listValue, style.listValue3].join(' ')
														: [style.listValue, style.listValue3, style.hasArrow].join(' ')
												}
											>
												{showInterestTotal && (
													<span>
														<span className={style.moneyTit}>优惠后合计</span>
														<span className={style.derateMoney}>
															{repayInfo2 && repayInfo2.intrFeeTotAmtAfterDeduce}
														</span>
														元
													</span>
												)}
												{repayInfo2 && repayInfo2.perdUnit !== 'D' && (
													<Icon type="right" className={style.icon} />
												)}
											</span>
										)) || <span className={style.listValue2}>暂无</span>}
										{repayInfo2 && showInterestTotal && (
											<div
												className={
													repayInfo2 && repayInfo2.perdUnit === 'D'
														? style.allMoneyBox
														: [style.allMoneyBox, style.hasArrow].join(' ')
												}
											>
												<span className={style.moneyTit}>息费合计</span>
												<span className={style.allMoney}>{repayInfo2 && repayInfo2.intrFeeTotAmt}元</span>
											</div>
										)}
									</div>
								</li>
							</ul>
							<ul className={style.pannel}>
								<li className={style.listItem}>
									<label>收款信用卡</label>
									<span className={style.listValue}>
										{repayInfo && repayInfo.withdrawBankName ? repayInfo.withdrawBankName : ''}(
										{repayInfo && repayInfo.withdrawBankLastNo ? repayInfo.withdrawBankLastNo : ''})
									</span>
								</li>
								<li className={style.listItem} onClick={this.handleClickChoiseBank}>
									<label>还款银行卡</label>

									{repayInfo && repayInfo.withholdBankLastNo && repayInfo.withholdBankLastNo.length > 0 ? (
										<span className={[style.listValue, style.hasArrow].join(' ')}>
											{repayInfo && repayInfo.withholdBankName ? repayInfo.withholdBankName : ''}(
											{repayInfo && repayInfo.withholdBankLastNo ? repayInfo.withholdBankLastNo : ''})
											<Icon type="right" className={style.icon} />
										</span>
									) : (
										<span className={style.highlightText}>
											绑定储蓄卡
											<Icon type="right" className={style.icon} />
										</span>
									)}
								</li>
							</ul>
							<div className={style.protocolBox}>
								{contractData.length > 0 && (
									<p className={style.protocolLink} onClick={this.checkAgreement}>
										<CheckRadio isSelect={checkBox1} />
										点击“确定签约”，表示同意
										{contractData.map((item, idx) => (
											<em
												onClick={(e) => {
													e.stopPropagation();
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
						<ButtonCustom
							onClick={
								this.props.form.getFieldProps('cardBillAmt') && !disabledBtn
									? this.handleButtonClick
									: () => {}
							}
							type={
								this.props.form.getFieldProps('cardBillAmt') && !disabledBtn && checkBox1
									? 'yellow'
									: 'default'
							}
						>
							确定签约
						</ButtonCustom>
					</div>

					{isShowTipModal ? (
						<WarningModal
							history={history}
							handleConfirm={this.handleClickChooseContact}
							closeWarningModal={() => {
								this.handleCloseTipModal('isShowTipModal');
							}}
							prodType="代偿"
							toast={toast}
							cacheData={this.cacheDataHandler}
						/>
					) : null}

					<RepayPlanModal
						visible={isShowModal}
						onClose={this.handleCloseModal}
						data={repayInfo2.perds}
						loanMoney={this.state.cardBillAmt}
						history={this.props.history}
						goPage={() => {
							this.props.setConfirmAgencyInfoAction({
								cardBillAmt,
								repayInfo,
								repaymentDate,
								lendersDate,
								lendersIndex,
								checkBox1
							});
							this.props.history.push('/home/payment_notes');
						}}
					/>

					<CouponAlert
						visible={showCouponAlert}
						data={couponAlertData}
						history={this.props.history}
						onConfirm={() => {
							this.setState({
								showCouponAlert: false
							});
							this.requestGetRepayInfo();
						}}
					/>

					{isShowSmsModal && (
						<ProtocolSmsModal
							onCancel={() => {
								buriedPointEvent(home.protocolAlertClose);
								this.setState({
									isShowSmsModal: false,
									protocolSmsFailFlag: false
								});
							}}
							onConfirm={this.confirmProtocolBindCard}
							onSmsCodeChange={this.handleSmsCodeChange}
							smsCodeAgain={this.checkProtocolBindCard}
							protocolSmsFailFlag={this.state.protocolSmsFailFlag}
							protocolSmsFailInfo={this.state.protocolSmsFailInfo}
							smsCode={smsCode}
							toggleBtn={false}
							selectBankCard={() => {
								buriedPointEvent(home.protocolAlertChange);
								this.handleClickChoiseBank();
								this.setState({
									isShowSmsModal: false,
									protocolSmsFailFlag: false
								});
							}}
							ref={(ele) => {
								this.smsModal = ele;
							}}
							history={this.props.history}
							fetch={this.props.$fetch}
							toast={this.props.toast}
							bankNo={repayInfo && repayInfo.withHoldAgrNo}
							bnkTelNoHid={userInfo && userInfo.telNoHid ? userInfo.telNoHid : ''}
						/>
					)}
				</div>
			</div>
		);
	}
}
