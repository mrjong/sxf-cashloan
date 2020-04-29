/*
 * @Author: shawn
 * @LastEditTime: 2020-04-29 14:37:22
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
import style from './index.scss';
import { domListen } from 'utils/domListen';
import { RepayPlanModal, ButtonCustom, ProtocolSmsModal, ProtocolRead, InsuranceModal } from 'components';
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
	coup_sendLoanCoup,
	coup_queyUsrLoanUsbCoup
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
import { isMPOS } from 'utils/common';
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
	moneyKeyboardWrapProps = {
		onTouchStart: (e) => e.preventDefault()
	};
}
let closeBtn = true;
let lendAllBtn = true;

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
		authId: state.staticState.authId,
		routerType: state.commonState.routerType
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
			isShowModal: false,

			repayInfo: {},
			repayInfo2: {},
			repaymentDate: '',
			repaymentIndex: 0, // mpos取1（最后一个），只限返回两种期限的情况
			lendersDate: {
				value: '0'
			},
			goData: {},
			isNeedExamine: false,
			repaymentDateList: [],
			isShowVIPModal: false,
			contractData: [], // 合同和产品id数据
			isShowSmsModal: false, //是否显示短信验证码弹窗
			smsCode: '',
			isShowInsureModal: false, // 是否显示保险说明弹框
			isCheckInsure: false, // 是否选择了保费
			showCouponAlert: false, // 是否显示优惠券拦截弹窗
			contactList: null,
			checkBox1: false,
			isJoinInsurancePlan: false, // 是否加入风险保障计划
			insurancePlanText: '',
			showInsuranceModal: false, // 是否展示保险弹窗
			isRiskGuaranteeProd: false // 产品是否配置了风险保障金
		};
	}

	componentWillMount() {
		this.props.toast.loading('加载中...', 10);
		const { withholdCardData, confirmAgencyInfo, routerType } = this.props;
		this.checkBtnAble();
		if (confirmAgencyInfo && !(routerType && routerType === 'lendConfirm')) {
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
		store.removeRiskGuaranteeModalShow();
		lendAllBtn = true;
	}

	// 拦截发放优惠券
	sendCoupon = () => {
		const { isShowModal, availableCoupNum } = this.state;
		if (isShowModal) {
			this.setState({
				isShowModal: false
			});
		} else if (availableCoupNum) {
			this.jumpRouter();
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
						this.jumpRouter();
					}
				})
				.catch(() => {
					this.jumpRouter();
				});
		}
	};

	jumpRouter = () => {
		// 返回到首页还是放款确认页面
		let { routerType } = this.props;
		if (routerType && routerType === 'lendConfirm') {
			// this.props.history.goBack();
			this.props.history.push('/home/lend_confirm_page');
		} else {
			this.props.history.push('/home/home');
		}
	};

	// 数据回显
	recoveryPageData = (confirmAgencyInfo) => {
		this.setState({ ...confirmAgencyInfo }, () => {
			// 初始化数据渲染
			this.calcLoanMoney(this.state.cardBillAmt);
			if (store.getRiskGuaranteeModalShow()) {
				this.openInsuranceModal(1500);
			}
		});
	};

	// 按钮点击事件
	_handleClick = (callback, e) => {
		e && e.preventDefault && e.preventDefault();
		callback && callback();
	};

	// 选择银行卡
	handleClickChoiseBank = () => {
		const {
			repayInfo,
			cardBillAmt,
			repaymentDate,
			lendersDate,
			checkBox1,
			insuranceModalChecked,
			isJoinInsurancePlan,
			insurancePlanText
		} = this.state;
		// 将页面信息存储到redux中
		this.props.setConfirmAgencyInfoAction({
			cardBillAmt,
			repayInfo,
			repaymentDate,
			lendersDate,
			checkBox1,
			insuranceModalChecked,
			isJoinInsurancePlan,
			insurancePlanText
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
					let { contracts = [], riskGuarantee } = result.data;
					let FXBZ_contract = {};
					let isRiskGuaranteeProd = riskGuarantee === '1'; //是否是风险保障金产品
					contracts.forEach((v, i) => {
						if (v.contractType === 'FXBZ') {
							FXBZ_contract = contracts.splice(i, 1);
						}
					});
					if (!isRiskGuaranteeProd) {
						//切换为未配置风险计划产品需清空之前授权逻辑
						this.setState({
							insurancePlanText: '',
							isJoinInsurancePlan: false
						});
					}
					this.setState(
						{
							contractData: contracts,
							disabledBtn: false,
							isRiskGuaranteeProd,
							FXBZ_contract
						},
						() => {
							this.queryCouponCount();
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
				this.setState(
					{
						repayInfo: result.data,
						repaymentDateList: result.data.prods.map((item) => ({
							name: item.prdName,
							value: item.prdId,
							minAmt: item.minAmt,
							maxAmt: item.maxAmt,
							periodUnit: item.periodUnit,
							periodCount: item.periodCount,
							periodLth: item.periodLth
						}))
					},
					() => {
						this.handleClickConfirm();
					}
				);
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
	requestGetRepayInfo = (riskGuaranteeFlag) => {
		let { contractData, lendersDate, cardBillAmt, isJoinInsurancePlan, isRiskGuaranteeProd } = this.state;
		const { couponData, authId } = this.props;
		let params = {
			prodId: contractData[0] && contractData[0].prodId,
			autId: authId || '',
			repayType: lendersDate.value,
			loanAmt: cardBillAmt,
			prodType: '01',
			riskGuarantee:
				riskGuaranteeFlag || (isRiskGuaranteeProd && isJoinInsurancePlan) || store.getRiskGuaranteeModalShow()
					? '1'
					: '0'
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

		return new Promise((resolve) => {
			this.props.$fetch
				.post(loan_loanPlan, params)
				.then((result) => {
					if (result && result.code === '000000' && result.data !== null) {
						this.props.toast.hide();
						// 从风险评估结果页点击您可以尝试参加风险保障计划返回或者点击风险保障计划,更新弹框里的数据,但是不更新还款计划以及息费合计
						if (riskGuaranteeFlag || store.getRiskGuaranteeModalShow()) {
							//只更新风险计划
							this.setState({
								riskGuaranteePlans: result.data.perds
							});
						} else {
							this.setState({
								repayInfo2: result.data,
								deratePrice: result.data.deductAmount || result.data.deductRiskAmt,
								showInterestTotal: result.data.showFlag === '1'
							});
						}

						this.buriedDucationPoint(result.data.perdUnit, result.data.perdLth);
						resolve();
					} else {
						this.props.toast.info(result.message);
					}
				})
				.catch(() => {
					this.setState({
						deratePrice: ''
					});
				});
		});
	};
	// 渲染优惠劵
	renderCoupon = () => {
		const { deratePrice, availableCoupNum } = this.state;
		if (deratePrice) {
			return <span className={style.redText}>-{deratePrice}元</span>;
		}
		//  可用优惠券数量
		return (
			<div className={style.couNumBox}>
				<i />
				{availableCoupNum}个可用
			</div>
		);
	};
	//获取可使用优惠券条数
	queryCouponCount = () => {
		const { cardBillAmt, contractData = [], isJoinInsurancePlan, isRiskGuaranteeProd } = this.state;
		let params = {
			loanAmt: cardBillAmt,
			prodId: contractData[0].prodId,
			prodType: '01',
			coupSts: '00',
			startPage: 1,
			pageRow: 1,
			riskGuarantee: isRiskGuaranteeProd && isJoinInsurancePlan ? '1' : '0' //参与风险保障计划
		};
		this.props.$fetch.post(coup_queyUsrLoanUsbCoup, params).then((res) => {
			if (res.code === '000000' && res.data) {
				this.setState(
					{
						availableCoupNum: res.data.totalRow
					},
					() => {
						this.requestGetRepayInfo();
					}
				);
			}
		});
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
			checkBox1,
			insuranceModalChecked,
			isJoinInsurancePlan,
			insurancePlanText
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
			checkBox1,
			isJoinInsurancePlan,
			insuranceModalChecked,
			insurancePlanText
		});
		if (useFlag) {
			this.props.history.push({
				pathname: '/mine/coupon_page',
				search: `?prodType=01&price=${this.state.cardBillAmt}&prodId=${contractData[0].prodId}&isJoinInsurancePlan=${isJoinInsurancePlan}`,
				state: { nouseCoupon: true }
			});
			return;
		}
		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?prodType=01&price=${this.state.cardBillAmt}&prodId=${contractData[0].prodId}&isJoinInsurancePlan=${isJoinInsurancePlan}`
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
			checkBox1,
			insuranceModalChecked,
			isJoinInsurancePlan,
			insurancePlanText
		} = this.state;
		const billPrcpAmt = this.props.form.getFieldValue('cardBillAmt');
		this.props.setConfirmAgencyInfoAction({
			cardBillAmt,
			repayInfo,
			repaymentDate,
			lendersDate,
			checkBox1,
			insuranceModalChecked,
			isJoinInsurancePlan,
			insurancePlanText
		});
		const tokenId = Cookie.get('FIN-HD-AUTH-TOKEN') || store.getToken();
		const osType = getDeviceType();
		let pathUrl = `${linkConf.PDF_URL}${loan_contractPreview}?contractType=${item.contractType}&contractNo=${item.contractNo}&loanAmount=${billPrcpAmt}&prodId=${contractData[0].prodId}&withholdBankAgrNo=${repayInfo.withholdBankAgrNo}&withdrawBankAgrNo=${repayInfo.withdrawBankAgrNo}&tokenId=${tokenId}`;
		if (item.contractType === 'FXBZ') {
			//风险保障金合同
			pathUrl = pathUrl + '&riskGuarantee=1';
		}
		if (item.contractType === 'WT' && isJoinInsurancePlan) {
			pathUrl = pathUrl + '&riskGuarantee=1';
		}
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
		this.requestGetRepayInfo().then(() => {
			this.openRepayPlanModal();
		});
	};

	//打开还款计划弹窗
	openRepayPlanModal = () => {
		this.setState(
			{
				isShowModal: true
			},
			() => {
				buriedPointEvent(home.repayPlanClick, {
					isJoinInsurancePlan: this.state.isJoinInsurancePlan
				});
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
		const { checkBox1, repayInfo, insurancePlanText, isRiskGuaranteeProd } = this.state;
		if (isRiskGuaranteeProd && !insurancePlanText) {
			this.props.toast.info('请选择是否参与风险保障计划');
			return;
		}
		if (!(repayInfo && repayInfo.withholdBankLastNo && repayInfo.withholdBankLastNo.length > 0)) {
			this.props.toast.info('请先绑定还款储蓄卡');
			return;
		}
		if (!checkBox1) {
			this.props.toast.info('请先阅读并勾选相关协议，继续签约借款');
			return;
		}
		if (insurancePlanText === '暂不考虑') {
			this.handleShowTipModal();
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
		const { isBtnAble, repayInfo, isJoinInsurancePlan, isRiskGuaranteeProd } = this.state;
		this.cacheDataHandler();
		buriedPointEvent(home.selectContactClick, {
			operation: isBtnAble ? 'edit' : 'select'
		});
		this.calculationNum();
		// 未参加风险保障计划
		if (isRiskGuaranteeProd && !isJoinInsurancePlan) {
			this.setState(
				{
					isShowTipModal: false
				},
				() => {
					this.cacheDataHandler();
				}
			);
			this.props.history.push('/home/insurance_result_page');
			return;
		}
		this.props.history.push(
			`/home/add_contact_page?contactsLength=${(repayInfo.contacts && repayInfo.contacts.length) ||
				0}&isRiskGuaranteeProd=${isRiskGuaranteeProd ? '1' : '0'}`
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
		if (!cacheContact || cacheContact.length === 0 || isMPOS()) {
			this.props.setCacheContactAction((repayInfo.contacts && repayInfo.contacts.slice(0, 5)) || []);
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
			this.props.setCacheContactAction((repayInfo.contacts && repayInfo.contacts.slice(0, 5)) || []);
		} else {
			this.props.setCacheContactAction((cacheContact && cacheContact.slice(0, 5)) || []);
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
			checkBox1,
			isShowTipModal,
			repayInfo2,
			contractData,
			insurancePlanText,
			isJoinInsurancePlan,
			insuranceModalChecked,
			showInsuranceModal,
			riskGuaranteePlans
		} = this.state;
		this.props.setConfirmAgencyInfoAction({
			cardBillAmt,
			repayInfo,
			repaymentDate,
			lendersDate,
			checkBox1,
			isShowTipModal,
			repayInfo2,
			contractData,
			insurancePlanText,
			isJoinInsurancePlan,
			insuranceModalChecked,
			showInsuranceModal,
			riskGuaranteePlans
		});
	};

	//打开风险保证金弹窗
	openInsuranceModal = (delay = 0) => {
		let timer = setTimeout(() => {
			this.setState({
				showInsuranceModal: true
			});
			clearTimeout(timer);
		}, delay);
	};

	closeInsuranceModal = () => {
		store.removeRiskGuaranteeModalShow();
		this.setState({
			showInsuranceModal: false
		});
	};

	//风险保障计划弹窗
	handleInsuranceModal = () => {
		buriedPointEvent(home.riskGuaranteePlanClick);
		const { repayInfo2 } = this.state;
		if (!repayInfo2 || !repayInfo2.perdLth) {
			this.props.toast.info('请输入借款金额');
			return;
		}
		if (repayInfo2 && repayInfo2.perdUnit === 'D') {
			return;
		}
		this.requestGetRepayInfo(true).then(() => {
			this.openInsuranceModal();
		});
	};

	handleInsuranceModalClick = (type) => {
		if (type === 'submit') {
			buriedPointEvent(home.riskGuaranteeModalOk);
		} else {
			buriedPointEvent(home.riskGuaranteeModalCancel);
		}
		this.setState(
			{
				insurancePlanText: type === 'submit' ? '已授权并参与' : '暂不考虑',
				isJoinInsurancePlan: type === 'submit' ? true : false
			},
			() => {
				buriedPointEvent(home.riskGuaranteeChangePlanText, {
					planText: type === 'submit' ? '已授权并参与' : '暂不考虑'
				});
				// 清空优惠劵数据
				this.props.setCouponDataAction({});
				this.queryCouponCount();
				this.closeInsuranceModal();
			}
		);
	};

	// 全部取出
	lendAllHandler = () => {
		if (!lendAllBtn) {
			return;
		}
		const { repaymentDate, cardBillAmt } = this.state;
		if (repaymentDate && repaymentDate.maxAmt && Number(cardBillAmt) === Number(repaymentDate.maxAmt)) {
			return;
		}
		// 每次改变金额需要重新选择优惠劵, 清空优惠劵数据
		this.props.setCouponDataAction({});
		this.props.form.setFieldsValue({
			cardBillAmt: `${repaymentDate.maxAmt}`
		});
		this.setState(
			{
				cardBillAmt: `${repaymentDate.maxAmt}`
			},
			() => {
				this.handleClickConfirm();
			}
		);
	};

	getTerm = () => {
		const { repayInfo } = this.state;
		const prodLth = (repayInfo && repayInfo.prods && repayInfo.prods[0] && repayInfo.prods[0].prodLth) || '';
		const prodTerm =
			repayInfo && repayInfo.prods && repayInfo.prods[0] && repayInfo.prods[0].prodUnit === 'D'
				? '1'
				: prodLth;
		return prodTerm;
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
			isShowModal,
			isShowSmsModal,
			smsCode,
			showCouponAlert,
			couponAlertData,
			showInterestTotal,
			checkBox1,
			cardBillAmt,
			lendersDate,
			isJoinInsurancePlan,
			insurancePlanText,
			showInsuranceModal,
			FXBZ_contract = [],
			insuranceModalChecked,
			availableCoupNum,
			isRiskGuaranteeProd,
			riskGuaranteePlans
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
										repaymentDate.maxAmt ? `可申请${repaymentDate.minAmt}-${repaymentDate.maxAmt}` : ''
									}
									onBlur={(v) => {
										setTimeout(() => {
											lendAllBtn = true;
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
										lendAllBtn = false;
										this.setState({
											disabledBtn: true
										});
									}}
									moneykeyboardwrapprops={moneyKeyboardWrapProps}
								/>
								<span className={style.lendAllStyle} onClick={this.lendAllHandler}>
									全部取出
								</span>
							</div>
						</div>
						<div>
							<ul className={style.pannel}>
								{isRiskGuaranteeProd && (
									<li onClick={this.handleInsuranceModal}>
										<div className={style.listItem}>
											<label>风险保障计划</label>
											<span
												className={[
													style.listValue,
													style.hasArrow,
													store.getRiskGuaranteeModalShow() && style.shakeAnimatedText,
													!isJoinInsurancePlan && style.greyText
												].join(' ')}
											>
												{insurancePlanText || '请选择'}
											</span>
											<Icon type="right" className={style.icon} />
										</div>
										<p className={style.labelSub}>风险保障计划由第三方担保公司提供服务</p>
									</li>
								)}
							</ul>
							<ul className={style.pannel}>
								<li
									className={style.listItem}
									onClick={() => {
										this.selectCoupon(!availableCoupNum);
									}}
								>
									<label>优惠券</label>
									{availableCoupNum ? (
										<div className={[style.listValue, style.hasArrow].join(' ')}>
											{this.renderCoupon()}
											<Icon type="right" className={style.icon} />
										</div>
									) : (
										(repayInfo2 && (
											<span className={[style.listValue, style.greyText, style.hasArrow].join(' ')}>
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
							</ul>

							<ul className={style.pannel}>
								<li
									className={
										repayInfo2 && showInterestTotal ? `${style.listItem} ${style.listItem3}` : style.listItem
									}
									onClick={this.handleShowModal}
								>
									<label>{repayInfo2 && repayInfo2.perdUnit === 'D' ? '应还金额(元)' : '还款计划'}</label>
									<div>
										{(this.getTerm() && repayInfo2 && (
											<span
												className={
													repayInfo2 && repayInfo2.perdUnit === 'D'
														? [style.listValue, style.listValue3].join(' ')
														: [style.listValue, style.listValue3, style.hasArrow].join(' ')
												}
											>
												合计<span className={style.numberFont}>{this.getTerm()}</span>期
												{repayInfo2 && repayInfo2.perdUnit !== 'D' && (
													<Icon type="right" className={style.icon} />
												)}
											</span>
										)) || <span className={style.listValue2}>暂无</span>}
										{repayInfo2 && showInterestTotal && (
											<div>
												<div className={style.listDesc}>
													<span className={style.moneyTit}>优惠后应还</span>
													<span className={style.derateMoney}>
														¥
														<span className={style.numberFont}>
															{repayInfo2 && repayInfo2.intrFeeTotAmtAfterDeduce}
														</span>
													</span>
												</div>
												<div
													className={
														repayInfo2 && repayInfo2.perdUnit === 'D'
															? style.allMoneyBox
															: [style.allMoneyBox, style.hasArrow].join(' ')
													}
												>
													<span className={style.moneyTit}>息费合计</span>
													<span className={style.allMoney}>
														¥
														<span className={style.numberFont}>{repayInfo2 && repayInfo2.intrFeeTotAmt}</span>
													</span>
												</div>
											</div>
										)}
									</div>
								</li>
							</ul>
							<ul className={style.pannel}>
								<li className={style.listItem} onClick={this.handleClickChoiseBank}>
									<label>还款银行卡</label>

									{repayInfo && repayInfo.withholdBankLastNo && repayInfo.withholdBankLastNo.length > 0 ? (
										<span className={[style.listValue, style.hasArrow].join(' ')}>
											{repayInfo && repayInfo.withholdBankName ? repayInfo.withholdBankName : ''}(
											<span className={style.numberFont}>
												{repayInfo && repayInfo.withholdBankLastNo ? repayInfo.withholdBankLastNo : ''}
											</span>
											)
											<Icon type="right" className={style.icon} />
										</span>
									) : (
										<span className={style.highlightText}>
											绑定储蓄卡
											<Icon type="right" className={style.icon} />
										</span>
									)}
								</li>
								<li className={style.listItem}>
									<label>收款信用卡</label>
									<span className={style.listValue}>
										{repayInfo && repayInfo.withdrawBankName ? repayInfo.withdrawBankName : ''}(
										<span className={style.numberFont}>
											{repayInfo && repayInfo.withdrawBankLastNo ? repayInfo.withdrawBankLastNo : ''}
										</span>
										)
									</span>
								</li>
							</ul>

							{contractData.length > 0 ? (
								<ProtocolRead
									tip="点击“确定签约”，表示同意"
									isSelect={checkBox1}
									protocolList={contractData}
									clickRadio={this.checkAgreement}
									clickProtocol={this.readContract}
								/>
							) : null}
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
								this.props.form.getFieldProps('cardBillAmt') &&
								!disabledBtn &&
								checkBox1 &&
								(isRiskGuaranteeProd ? insurancePlanText : true)
									? 'yellow'
									: 'default'
							}
						>
							申请借款
						</ButtonCustom>
						<span className={style.bottomTip}>当借款由持牌机构放款，年化综合息费率不超36%</span>
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
						isJoinInsurancePlan={isJoinInsurancePlan}
						goPage={() => {
							this.props.setConfirmAgencyInfoAction({
								cardBillAmt,
								repayInfo,
								repaymentDate,
								lendersDate,
								checkBox1,
								isJoinInsurancePlan,
								insurancePlanText
							});
							this.props.history.push('/home/payment_notes');
						}}
					/>

					<InsuranceModal
						visible={showInsuranceModal}
						onButtonClick={(type) => {
							this.handleInsuranceModalClick(type);
						}}
						onClose={() => {
							this.closeInsuranceModal();
						}}
						data={riskGuaranteePlans}
						toast={this.props.toast}
						guaranteeCompany={repayInfo2.guaranteeCompany}
						isChecked={insuranceModalChecked}
						contact={FXBZ_contract[0]}
						handlePlanClick={() => {
							this.cacheDataHandler();
							buriedPointEvent(home.riskGuaranteeModalPlanClick);
							this.props.history.push('/home/insurance_introduce_page');
						}}
						handleContractClick={() => {
							this.readContract(FXBZ_contract[0]);
						}}
						toggleCheckbox={() => {
							buriedPointEvent(home.riskGuaranteeModalChecked);
							this.setState({
								insuranceModalChecked: !this.state.insuranceModalChecked
							});
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
							this.queryCouponCount();
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
