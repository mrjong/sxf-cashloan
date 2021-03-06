/*
 * @Author: shawn
 * @LastEditTime: 2020-05-11 14:07:33
 */
import React, { PureComponent } from 'react';
import { InputItem, Icon, NoticeBar } from 'antd-mobile';
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
import {
	RepayPlanModal,
	ButtonCustom,
	ProtocolSmsModal,
	ProtocolRead,
	InsuranceModal,
	Popover
} from 'components';
import CouponAlert from './components/CouponAlert';
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
			cardBillAmt: 0,
			isShowModal: false,
			repayInfo: {},
			repayInfo2: {},
			repaymentDate: '',
			repaymentIndex: 0, // mpos???1??????????????????????????????????????????????????????
			lendersDate: {
				value: '0'
			},
			goData: {},
			isNeedExamine: false,
			repaymentDateList: [],
			isShowVIPModal: false,
			contractData: [], // ???????????????id??????
			isShowSmsModal: false, //?????????????????????????????????
			smsCode: '',
			isShowInsureModal: false, // ??????????????????????????????
			isCheckInsure: false, // ?????????????????????
			showCouponAlert: false, // ?????????????????????????????????
			contactList: null,
			checkBox1: false,
			isJoinInsurancePlan: false, // ??????????????????????????????
			insurancePlanText: '',
			showInsuranceModal: false, // ????????????????????????
			isRiskGuaranteeProd: false // ????????????????????????????????????
		};
	}

	componentWillMount() {
		this.props.toast.loading('?????????...', 10);
		const { withholdCardData, confirmAgencyInfo, routerType } = this.props;
		this.checkBtnAble();
		if (confirmAgencyInfo && !(routerType && routerType === 'lendConfirm')) {
			if (withholdCardData && JSON.stringify(withholdCardData) !== '{}') {
				// ???????????? bankInfo ?????????????????????????????? ??????????????????????????????
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

	// ?????????????????????
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
		// ???????????????????????????????????????
		let { routerType } = this.props;
		if (routerType && routerType === 'lendConfirm') {
			// this.props.history.goBack();
			this.props.history.push('/home/lend_confirm_page');
		} else {
			this.props.history.push('/home/home');
		}
	};

	// ????????????
	recoveryPageData = (confirmAgencyInfo) => {
		this.setState({ ...confirmAgencyInfo }, () => {
			// ?????????????????????
			this.calcLoanMoney(this.state.cardBillAmt);
			if (store.getRiskGuaranteeModalShow()) {
				this.openInsuranceModal(1500);
			}
		});
	};

	// ??????????????????
	_handleClick = (callback, e) => {
		e && e.preventDefault && e.preventDefault();
		callback && callback();
	};

	// ???????????????
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
		// ????????????????????????redux???
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
		// ??????????????????????????????redux???
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

	// ????????????????????????
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

	// ???????????????????????????id
	getFundInfo = () => {
		this.props.toast.loading('', 10);
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
					let isRiskGuaranteeProd = riskGuarantee === '1'; //??????????????????????????????
					contracts.forEach((v, i) => {
						if (v.contractType === 'FXBZ') {
							FXBZ_contract = contracts.splice(i, 1);
						}
					});
					if (!isRiskGuaranteeProd) {
						//???????????????????????????????????????????????????????????????
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

	// ???????????????????????? ??????????????????
	requestGetRepaymentDateList = () => {
		const { authId } = this.props;
		this.props.$fetch.post(loan_queryLoanApplInfo, { autId: authId || '' }).then((result) => {
			if (result && result.code === '000000' && result.data !== null) {
				if (result.data && result.data.prods && result.data.prods.length === 0) {
					this.props.toast.info('????????????????????????????????????????????????MPOS??????');
					return;
				}

				// ?????????????????????
				if (result.data.prods && result.data.prods.length) {
					// ?????????????????????????????????
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

	// ??????????????????
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
			callback(`??????????????????${repaymentDate.minAmt}~${repaymentDate.maxAmt}????????????100?????????`);
		} else {
			callback();
		}
	};

	//??????????????????????????????
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
	// ????????????-?????????????????????????????????
	buriedDucationPoint(type, duration) {
		if (type === 'M') {
			buriedPointEvent(home[`durationMonth${duration}`]);
		} else if (type === 'D') {
			buriedPointEvent(home[`durationDay${duration}`]);
		}
	}

	// ????????????????????????
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
		// ??????????????????,??????coupId,
		// ???????????????,coupId????????????ID
		if (couponData && (couponData.coupId === 'null' || couponData.coupVal === -1)) {
			// ???????????????????????????
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
						// ?????????????????????????????????????????????????????????????????????????????????????????????????????????,????????????????????????,?????????????????????????????????????????????
						if (riskGuaranteeFlag || store.getRiskGuaranteeModalShow()) {
							//?????????????????????
							this.setState({
								riskGuaranteePlans: result.data.perds
							});
						} else {
							this.setState({
								repayInfo2: result.data,
								deratePrice: result.data.deductAmount || result.data.deductRiskAmt
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

	/**
	 * ???????????????????????????
	 */
	renderCoupon = () => {
		const { deratePrice, availableCoupNum } = this.state;
		if (availableCoupNum) {
			if (deratePrice) {
				return <span className={style.redText}>-{deratePrice}???</span>;
			}
			//  ?????????????????????
			return (
				<div className={style.couNumBox}>
					<i />
					{availableCoupNum}?????????
				</div>
			);
		}

		return <span className={[style.listValue, style.greyText].join(' ')}>??????????????????</span>;
	};

	/**
	 * ??????????????????????????????
	 */
	queryCouponCount = () => {
		const { cardBillAmt, contractData = [], isJoinInsurancePlan, isRiskGuaranteeProd } = this.state;
		if (!parseFloat(cardBillAmt) > 0) {
			return;
		}
		let params = {
			loanAmt: cardBillAmt,
			prodId: contractData[0].prodId,
			prodType: '01',
			coupSts: '00',
			startPage: 1,
			pageRow: 1,
			riskGuarantee: isRiskGuaranteeProd && isJoinInsurancePlan ? '1' : '0' //????????????????????????
		};
		this.props.$fetch.post(coup_queyUsrLoanUsbCoup, params).then((res) => {
			if (res.code === '000000' && res.data) {
				if ((!this.props.couponData || JSON.stringify(this.props.couponData) === '{}') && res.data.coups) {
					this.setRecommendCoupon(res.data.coups);
				}
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

	/**
	 * ????????????????????????????????????(??????/??????)
	 */
	setRecommendCoupon = (couponList = []) => {
		const forceCoupons = couponList.filter((coupon) => coupon.forceFlag === 'Y');
		const defaultCoupons = couponList.filter((coupon) => coupon.dfltFlag === 'Y');

		if (forceCoupons.length > 0) {
			this.props.setCouponDataAction(forceCoupons[0]);
		} else if (defaultCoupons.length > 0) {
			this.props.setCouponDataAction(defaultCoupons[0]);
		}
	};

	// ???????????????
	selectCoupon = () => {
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
			insurancePlanText,
			availableCoupNum
		} = this.state;
		const { couponData = {} } = this.props;
		//?????????????????????????????????
		if (couponData.forceFlag === 'Y') return;
		if (!repayInfo2 || !repayInfo2.perdLth) {
			this.props.toast.info('?????????????????????');
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
		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?prodType=01&price=${this.state.cardBillAmt}&prodId=${contractData[0].prodId}&isJoinInsurancePlan=${isJoinInsurancePlan}`,
			state: { nouseCoupon: !availableCoupNum }
		});
	};
	// ??????????????????
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
		const { couponData = {} } = this.props;
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
		let pathUrl = `${linkConf.PDF_URL}${loan_contractPreview}?contractType=${item.contractType}&contractNo=${
			item.contractNo
		}&loanAmount=${billPrcpAmt}&prodId=${contractData[0].prodId}&withholdBankAgrNo=${
			repayInfo.withholdBankAgrNo
		}&withdrawBankAgrNo=${repayInfo.withdrawBankAgrNo}&tokenId=${tokenId}&coupId=${couponData.coupId || ''}`;
		if (item.contractType === 'FXBZ') {
			//?????????????????????
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
			this.props.toast.info('?????????????????????');
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

	//????????????????????????
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

	handleButtonClick = () => {
		const { checkBox1, repayInfo, insurancePlanText, isRiskGuaranteeProd } = this.state;
		if (isRiskGuaranteeProd && !insurancePlanText) {
			this.props.toast.info('???????????????????????????????????????');
			return;
		}
		if (!(repayInfo && repayInfo.withholdBankLastNo && repayInfo.withholdBankLastNo.length > 0)) {
			this.props.toast.info('???????????????????????????');
			return;
		}
		if (!checkBox1) {
			this.props.toast.info('??????????????????????????????????????????????????????');
			return;
		}
		if (insurancePlanText === '????????????') {
			this.handleClickChooseContact();
			return;
		}
		// ??????
		buriedPointEvent(home.loanBtnClick);
		this.checkProtocolBindCard();
	};

	// ????????????????????????
	requestBindCardState = () => {
		const { authId } = this.props;
		this.props.$fetch.get(`${bank_card_check}/${authId || ''}`).then((result) => {
			if (result && result.code === '000000') {
				// ?????????????????????????????????
				getNextStatus({
					$props: this.props,
					actionType: 'agencyPage',
					actionMsg: '??????'
				}).then((res) => {
					if (res === 'LOAN') {
						this.handleClickChooseContact();
					}
				});
			} else if (result && result.code === '999974') {
				// ???????????????????????? ?????????????????????
				this.props.toast.info(result.message);
				setTimeout(() => {
					this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
				}, 3000);
			} else if (result && result.code === '000012') {
				// ???????????????????????? ?????????????????????
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

	// ???????????????????????????
	closeSmsModal = () => {
		this.setState({
			isShowSmsModal: false,
			smsCode: ''
		});
		this.requestBindCardState();
	};

	// ??????????????????
	confirmProtocolBindCard = () => {
		const { smsCode } = this.state;
		if (!smsCode) {
			this.props.toast.info('??????????????????');
			return;
		}
		if (smsCode.length !== 6) {
			this.props.toast.info('???????????????????????????');
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
				//?????????????????????
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
	// ????????????????????????
	checkProtocolBindCard = () => {
		this.props.toast.loading('?????????...', 20);
		const { repayInfo, repayInfo2 } = this.state;
		const params = {
			agrNo: repayInfo && repayInfo.withholdBankAgrNo,
			bankCode: repayInfo && repayInfo.bankCode,
			channelFlag: '1', // 0 ???????????? 1 ???????????????
			supportType: repayInfo2 && Number(repayInfo2.insurance) ? '01' : '',
			merType: repayInfo2 && Number(repayInfo2.insurance) ? 'ZY' : '' // * ?????????????????? * ??????????????????????????????????????????????????????, * JR??????????????? XD??????????????? ZY????????????  ????????????:????????????
		};
		this.props.$fetch.post(bank_card_protocol_sms, params).then((res) => {
			switch (res.code) {
				case '000000':
					this.props.toast.hide();
					//?????????????????????????????????????????????????????????
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
					//?????????????????????
					this.props.toast.hide();
					this.setState({
						protocolSmsFailInfo: res.data,
						protocolSmsFailFlag: true,
						isShowSmsModal: true
					});
					buriedPointEvent(home.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
				case '999973': // ????????????????????? ?????????????????????
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
	// ????????????????????????
	handleSmsCodeChange = (smsCode) => {
		this.setState({
			smsCode
		});
	};
	// ?????????????????????
	handleClickChooseContact = () => {
		const { isBtnAble, isJoinInsurancePlan, isRiskGuaranteeProd } = this.state;
		this.cacheDataHandler();
		buriedPointEvent(home.selectContactClick, {
			operation: isBtnAble ? 'edit' : 'select'
		});
		// ???????????????????????????
		if (isRiskGuaranteeProd && !isJoinInsurancePlan) {
			this.cacheDataHandler();
			this.props.history.push('/home/insurance_result_page');
			return;
		}
		this.props.history.push(`/home/add_contact_page?isRiskGuaranteeProd=${isRiskGuaranteeProd ? '1' : '0'}`);
	};

	// ??????????????????
	checkAgreement = () => {
		this.setState({ checkBox1: !this.state.checkBox1 });
	};

	// ????????????????????????
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
	// ??????????????????
	cacheDataHandler = () => {
		const {
			repayInfo,
			cardBillAmt,
			repaymentDate,
			lendersDate,
			checkBox1,
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
			repayInfo2,
			contractData,
			insurancePlanText,
			isJoinInsurancePlan,
			insuranceModalChecked,
			showInsuranceModal,
			riskGuaranteePlans
		});
	};

	//???????????????????????????
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

	//????????????????????????
	handleInsuranceModal = () => {
		buriedPointEvent(home.riskGuaranteePlanClick);
		const { repayInfo2 } = this.state;
		if (!repayInfo2 || !repayInfo2.perdLth) {
			this.props.toast.info('?????????????????????');
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
				insurancePlanText: type === 'submit' ? '??????????????????' : '????????????',
				isJoinInsurancePlan: type === 'submit' ? true : false
			},
			() => {
				buriedPointEvent(home.riskGuaranteeChangePlanText, {
					planText: type === 'submit' ? '??????????????????' : '????????????'
				});
				// ?????????????????????
				this.props.setCouponDataAction({});
				this.queryCouponCount();
				this.closeInsuranceModal();
			}
		);
	};

	// ????????????
	lendAllHandler = () => {
		if (!lendAllBtn) {
			return;
		}
		const { repaymentDate, cardBillAmt } = this.state;
		if (repaymentDate && repaymentDate.maxAmt && Number(cardBillAmt) === Number(repaymentDate.maxAmt)) {
			return;
		}
		// ?????????????????????????????????????????????, ?????????????????????
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
		const { userInfo, couponData = {} } = this.props;
		const { getFieldProps } = this.props.form;
		const {
			contractData,
			repayInfo,
			disabledBtn,
			repayInfo2,
			repaymentDate,
			isShowModal,
			isShowSmsModal,
			smsCode,
			showCouponAlert,
			couponAlertData,
			checkBox1,
			cardBillAmt,
			lendersDate,
			isJoinInsurancePlan,
			insurancePlanText,
			showInsuranceModal,
			FXBZ_contract = [],
			insuranceModalChecked,
			isRiskGuaranteeProd,
			riskGuaranteePlans
		} = this.state;

		return (
			<div>
				<div className={[style.confirm_agency, 'confirm_agency_wrap'].join(' ')}>
					<div className={style.scrollWrap}>
						<div className={style.inputWrap}>
							<div className={style.billInpBox}>
								<i className={style.moneyUnit}>??</i>
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
											{ required: true, message: '?????????????????????' }
											// { validator: this.verifyBillAmt }
										]
									})}
									placeholder={
										repaymentDate.maxAmt ? `?????????${repaymentDate.minAmt}-${repaymentDate.maxAmt}` : ''
									}
									onBlur={(v) => {
										setTimeout(() => {
											lendAllBtn = true;
											// ?????????????????????????????????????????????, ?????????????????????
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
									????????????
								</span>
							</div>
						</div>
						<div>
							<ul className={style.pannel}>
								{isRiskGuaranteeProd && (
									<li onClick={this.handleInsuranceModal}>
										<div className={style.listItem}>
											<label>??????????????????</label>
											<span
												className={[
													style.listValue,
													style.hasArrow,
													store.getRiskGuaranteeModalShow() && style.shakeAnimatedText,
													!isJoinInsurancePlan && style.greyText
												].join(' ')}
											>
												{insurancePlanText || '?????????'}
											</span>
											<Icon type="right" className={style.icon} />
										</div>
										<p className={style.labelSub}>??????????????????????????????????????????????????????</p>
									</li>
								)}
							</ul>
							<ul className={style.pannel}>
								{couponData.forceFlag === 'Y' && (
									<Popover text="??????????????????????????????????????????" popoverStyle={{ top: '-0.2rem' }} />
								)}
								<li
									className={style.listItem}
									onClick={() => {
										this.selectCoupon();
									}}
								>
									<label>?????????</label>
									<div
										className={[style.listValue, couponData.forceFlag !== 'Y' && style.hasArrow].join(' ')}
									>
										{this.renderCoupon()}
										{couponData.forceFlag !== 'Y' && <Icon type="right" className={style.icon} />}
									</div>
								</li>
							</ul>

							<ul className={style.pannel}>
								<li className={`${style.listItem} ${style.listItem3}`} onClick={this.handleShowModal}>
									<label>{repayInfo2 && repayInfo2.perdUnit === 'D' ? '????????????(???)' : '????????????'}</label>
									<div>
										{(this.getTerm() && repayInfo2 && (
											<span
												className={
													repayInfo2 && repayInfo2.perdUnit === 'D'
														? [style.listValue, style.listValue3].join(' ')
														: [style.listValue, style.listValue3, style.hasArrow].join(' ')
												}
											>
												??????<span className={style.numberFont}>{this.getTerm()}</span>???
												{repayInfo2 && repayInfo2.perdUnit !== 'D' && (
													<Icon type="right" className={style.icon} />
												)}
											</span>
										)) || <span className={style.listValue2}>??????</span>}
										{
											<div>
												<div className={style.listDesc}>
													<span className={style.moneyTit}>???????????????</span>
													<span className={style.derateMoney}>
														??
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
													<span className={style.moneyTit}>????????????</span>
													<span className={style.allMoney}>
														??
														<span className={style.numberFont}>{repayInfo2 && repayInfo2.intrFeeTotAmt}</span>
													</span>
												</div>
											</div>
										}
									</div>
								</li>
							</ul>
							<ul className={style.pannel}>
								<li className={style.listItem} onClick={this.handleClickChoiseBank}>
									<label>???????????????</label>

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
											???????????????
											<Icon type="right" className={style.icon} />
										</span>
									)}
								</li>
								<li className={style.listItem}>
									<label>???????????????</label>
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
									tip="???????????????????????????????????????"
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
							????????????
						</ButtonCustom>
						<span className={style.fix_bottom}>
							<NoticeBar
								marqueeProps={{
									loop: true,
									leading: 1000,
									trailing: 1000,
									style: { color: '#f76c5c', fontSize: '0.22rem' }
								}}
								icon={null}
							>
								?????????????????????????????????24%.??????:????????????????????????????????????36%
							</NoticeBar>
						</span>
					</div>

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
