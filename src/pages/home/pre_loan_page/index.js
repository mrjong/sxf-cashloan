import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { Modal, InputItem, Icon, NoticeBar } from 'antd-mobile';
import { ButtonCustom, RepayPlanModal, ProtocolSmsModal, ProtocolRead, Popover } from 'components';
import { store } from 'utils/store';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { preLoan, home, loan_fenqi } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import { getH5Channel } from 'utils/common';
import { connect } from 'react-redux';
import { getDeviceType } from 'utils';
import {
	setCardTypeAction,
	setConfirmAgencyInfoAction,
	setCouponDataAction,
	setPreLoanDataAction
} from 'reduxes/actions/commonActions';
import linkConf from 'config/link.conf';
import Images from 'assets/image';
import style from './index.scss';
import {
	loan_loanPlan,
	loan_queryContractInfo,
	loan_contractPreview,
	bank_card_protocol_sms,
	bank_card_protocol_bind,
	loan_queryPreLoanApplInfo,
	coup_queyUsrLoanUsbCoup
} from 'fetch/api.js';
import {
	cardBillAmtRiskBury,
	preLoanUsageInRiskBury,
	preLoanUsageOutRiskBury,
	prePayPlanInRiskBury,
	prePayPlanOutRiskBury,
	preLoanSubmitRiskBury,
	preCheckboxClickRiskBury
} from './riskBuryConfig';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { domListen } from 'utils/domListen';

@fetch.inject()
@setBackGround('#f0f4f9')
@domListen()
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		withholdCardData: state.commonState.withholdCardData,
		withdrawCardData: state.commonState.withdrawCardData,
		confirmAgencyInfo: state.commonState.confirmAgencyInfo,
		couponData: state.commonState.couponData
	}),
	{
		setCardTypeAction,
		setConfirmAgencyInfoAction,
		setCouponDataAction,
		setPreLoanDataAction
	}
)
export default class pre_loan_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			inputClear: false,
			usageModal: false,
			planModal: false,
			prdId: '',
			loanDate: null,
			loanMoney: '',
			usageList: [],
			productList: [],
			contractList: [],
			buttonDisabled: true,
			deratePrice: '',
			repayPlanInfo: {
				perds: []
			},
			isShowSmsModal: false, //?????????????????????????????????
			smsCode: '',
			payBankCode: '',
			resaveBankCode: '',
			checkBox1: false,
			loanUsage: {},
			repayCardNo: '', //?????????????????????
			repayCardLast: '', //????????????????????????
			repayCardName: '', //?????????????????????
			resaveCardNo: '', //?????????????????????
			resaveCardLast: '', //????????????????????????
			resaveCardName: '', //?????????????????????
			isShowDetail: false, // ????????????????????????
			productListCopy: []
		};
	}

	componentWillMount() {
		const { withholdCardData, withdrawCardData, confirmAgencyInfo } = this.props;
		if (confirmAgencyInfo) {
			if (withdrawCardData) {
				confirmAgencyInfo.repayCardNo = withdrawCardData.agrNo || '';
				confirmAgencyInfo.repayCardLast = withdrawCardData.lastCardNo;
				confirmAgencyInfo.repayCardName = withdrawCardData.bankName;
			}
			if (withholdCardData) {
				confirmAgencyInfo.resaveCardNo = withholdCardData.agrNo || '';
				confirmAgencyInfo.resaveCardLast = withholdCardData.lastCardNo;
				confirmAgencyInfo.resaveCardName = withholdCardData.bankName;
				confirmAgencyInfo.resaveBankCode = withholdCardData.bankCode;
			}
			this.handleDataDisplay(confirmAgencyInfo);
		} else {
			this.queryCashLoanApplInfo();
		}
	}
	componentWillUnmount() {
		// store.setHrefFlag(true);
	}

	//??????????????????
	handleDataDisplay = (confirmAgencyInfo = {}) => {
		this.setState({ ...confirmAgencyInfo }, () => {
			// ?????????????????????
			this.selectMax();
		});
	};

	// ??????????????????
	queryCashLoanApplInfo = () => {
		this.props.$fetch
			.post(loan_queryPreLoanApplInfo)
			.then((res) => {
				this.props.toast.hide();
				if (res.code === '000000') {
					if (!(res.data && res.data.prods && res.data.prods.length)) {
						this.props.toast.info('?????????????????????????????????');
						return;
					}
					this.setState(
						{
							pageInfo: res.data
						},
						() => {
							this.dataInit();
						}
					);
				} else {
					this.props.toast.info(res.message);
					// setTimeout(() => {
					// 	this.props.history.push('/home/home');
					// }, 2000);
				}
			})
			.catch(() => {
				this.props.toast.info('???????????????,???????????????');
				// setTimeout(() => {
				// 	this.props.history.push('/home/home');
				// }, 2000);
			});
	};

	//?????????????????????
	dataInit = () => {
		const { pageInfo = {} } = this.state;
		let withdrawCardInf = {};
		let withholdCardInf = {};
		withdrawCardInf = {
			repayCardNo: pageInfo.withdrawBankAgrNo,
			repayCardLast: pageInfo.withdrawBankLastNo,
			repayCardName: pageInfo.withdrawBankName
		};
		withholdCardInf = {
			resaveCardNo: pageInfo.withholdBankAgrNo,
			resaveCardLast: pageInfo.withholdBankLastNo,
			resaveCardName: pageInfo.withholdBankName,
			resaveBankCode: pageInfo.withholdBankCode
		};
		this.setState(
			{
				productListCopy: pageInfo.prods || [],
				productList: this.state.loanMoney ? this.filterProdList() : pageInfo.prods || [],
				usageList: pageInfo.loanUsages || [],
				...withdrawCardInf,
				...withholdCardInf,
				priceMax: pageInfo.maxAmt,
				priceMin: pageInfo.minAmt
			},
			() => {
				this.selectLoanUsage(this.state.usageList[0]);
				this.selectMax();
			}
		);
	};

	/**
	 * ??????????????????????????????
	 */
	requestProdInfo = () => {
		const { loanMoney } = this.state;
		if (!loanMoney) {
			return;
		}
		const prodList = this.filterProdList();
		this.setState(
			{
				productList: prodList
				// loanDate: null
			},
			() => {
				this.selectMax();
			}
		);
	};

	// ??????????????????
	filterProdList = () => {
		const { loanMoney, pageInfo, productList } = this.state;
		let prodList = [];
		if (pageInfo && pageInfo.prods && pageInfo.prods.length) {
			prodList = pageInfo.prods.filter((item) => loanMoney <= item.maxAmt && loanMoney >= item.minAmt);
		} else {
			prodList = productList.filter((item) => loanMoney <= item.maxAmt && loanMoney >= item.minAmt);
		}
		return prodList;
	};

	selectMax = () => {
		const { productList = [], loanDate } = this.state;
		// ??????prodCount???????????????????????????
		let maxItem = null;
		let indexOfMax = 0;
		if (loanDate) {
			maxItem = loanDate;
		} else {
			productList.reduce((a, c, i) => (c.prodCount > a ? ((indexOfMax = i), c.prodCount) : a), 0);
			maxItem = productList[indexOfMax];
		}
		this.selectLoanDate(maxItem);
	};

	/**
	 * ??????????????????
	 */
	requestProtocolCoupon = async () => {
		if (!parseFloat(this.state.loanMoney) > 0) {
			return;
		}
		this.props.toast.loading('', 10);
		const { loanDate = {}, loanMoney, repayCardNo, resaveCardNo } = this.state;
		//????????????????????????
		const protocolParams = {
			loanAmt: loanMoney,
			prodLth: loanDate.prodLth,
			prodCount: loanDate.prodCount,
			prodUnit: loanDate.prodUnit,
			withdrawBankAgrNo: repayCardNo,
			withholdBankAgrNo: resaveCardNo,
			prodType: '21', //??????????????????Type
			wtdwTyp: '0' //????????????
		};

		this.props.$fetch.post(loan_queryContractInfo, protocolParams).then((res) => {
			this.props.toast.hide();
			if (res.code === '000000') {
				this.setState(
					{
						protocolList: (res.data && res.data.contracts) || []
					},
					() => {
						this.queryCouponCount();
					}
				);
			} else {
				this.setState(
					{
						protocolList: [],
						repayPlanInfo: { perds: [] }
					},
					() => {
						this.props.toast.info(res.message);
					}
				);
			}
		});
	};

	// ????????????
	requestLoanPlan = () => {
		const { loanMoney, protocolList = [] } = this.state;
		// ????????????
		let params = {
			loanAmt: loanMoney,
			prodType: '21',
			repayType: '0',
			prodId: protocolList[0] && protocolList[0].prodId
		};
		const { couponData } = this.props;
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
		this.props.$fetch.post(loan_loanPlan, params).then((res) => {
			this.props.toast.hide();
			if (res.code === '000000') {
				this.setState({
					repayPlanInfo: res.data,
					deratePrice: res.data.deductAmount || res.data.deductRiskAmt
				});
			} else {
				this.setState(
					{
						protocolList: [],
						repayPlanInfo: { perds: [] }
					},
					() => {
						this.props.toast.info(res.message);
					}
				);
			}
		});
	};

	/**
	 * ??????????????????????????????
	 */
	queryCouponCount = () => {
		const { loanMoney, protocolList = [] } = this.state;
		if (!parseFloat(loanMoney) > 0) {
			return;
		}
		let params = {
			loanAmt: loanMoney, //????????????
			prodId: protocolList[0].prodId, //??????ID ?????????productId
			prodType: '21',
			coupSts: '00',
			startPage: 1,
			pageRow: 1,
			riskGuarantee: '0'
		};
		this.props.toast.loading('', 10);
		this.props.$fetch
			.post(coup_queyUsrLoanUsbCoup, params)
			.then((res) => {
				this.props.toast.hide();
				if (res.code === '000000' && res.data) {
					if ((!this.props.couponData || JSON.stringify(this.props.couponData) === '{}') && res.data.coups) {
						this.setRecommendCoupon(res.data.coups);
					}
					this.setState(
						{
							availableCoupNum: res.data.totalRow
						},
						() => {
							this.requestLoanPlan();
						}
					);
				}
			})
			.catch(() => {
				this.props.toast.hide();
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
		const { protocolList, availableCoupNum, loanMoney, loanDate = {} } = this.state;
		const { couponData } = this.props;
		if (couponData.forceFlag === 'Y') return;

		this.storeTempData();
		let prodId = protocolList && protocolList[0] && protocolList[0].prodId ? protocolList[0].prodId : '';
		let perCont = loanDate.prodUnit === 'M' ? loanDate.prodLth : 1;

		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?prodType=21&price=${loanMoney}&perCont=${perCont}&prodId=${prodId}`,
			state: { nouseCoupon: !availableCoupNum }
		});
	};

	// ???????????????
	selectBankCard = (agrNo, cardType) => {
		this.storeTempData();
		this.props.setCardTypeAction(cardType);
		this.props.history.push({
			pathname: '/mine/select_save_page',
			search: `?agrNo=${agrNo}&cardType=${cardType}`
		});
		if (cardType === 'withdraw') {
			buriedPointEvent(preLoan.loanResaveCard, {
				clickType: 'select'
			});
		} else {
			buriedPointEvent(preLoan.loanPayCard, {
				clickType: 'select'
			});
		}
	};

	//???????????????
	bindBankCard = (cardType) => {
		if (cardType === 'withdraw') {
			buriedPointEvent(preLoan.loanResaveCard, {
				clickType: 'bind'
			});
		} else {
			buriedPointEvent(preLoan.loanPayCard, {
				clickType: 'bind'
			});
		}
		this.storeTempData();
		this.props.setCardTypeAction('both');
		this.props.history.push({
			pathname: '/mine/bind_save_page'
		});
	};

	// ??????????????????
	selectLoanDate = (item) => {
		this.setState(
			{
				loanDate: item
			},
			() => {
				if (parseFloat(this.state.loanMoney) > 0) {
					this.requestProtocolCoupon();
				}
			}
		);
		switch (Number(item.prodCount)) {
			case 30:
				buriedPointEvent(preLoan.loanDateMonth1);
				sxfburiedPointEvent('preProdTerm1');
				break;
			case 3:
				buriedPointEvent(preLoan.loanDateMonth3);
				sxfburiedPointEvent('preProdTerm3');
				break;
			case 6:
				buriedPointEvent(preLoan.loanDateMonth6);
				sxfburiedPointEvent('preProdTerm6');
				break;
			case 9:
				buriedPointEvent(preLoan.loanDateMonth9);
				sxfburiedPointEvent('preProdTerm9');
				break;
			case 12:
				buriedPointEvent(preLoan.loanDateMonth12);
				sxfburiedPointEvent('preProdTerm12');
				break;
			default:
				break;
		}
	};

	//????????????
	selectLoanUsage = (item) => {
		this.setState(
			{
				loanUsage: item
			},
			() => {
				this.closeModal('usage');
			}
		);
	};

	openModal = (type) => {
		this.setState(
			{
				[type + 'Modal']: true
			},
			() => {
				if (type === 'usage') {
					sxfburiedPointEvent(preLoanUsageInRiskBury.key);
				} else if (type === 'plan') {
					buriedPointEvent(preLoan.loanRepayPlan);
					sxfburiedPointEvent(prePayPlanInRiskBury.key);
				}
			}
		);
	};

	closeModal = (type) => {
		this.setState(
			{
				[type + 'Modal']: false
			},
			() => {
				if (type === 'usage') {
					sxfburiedPointEvent(preLoanUsageOutRiskBury.key);
				} else if (type === 'plan') {
					sxfburiedPointEvent(prePayPlanOutRiskBury.key);
				}
			}
		);
	};

	//??????????????????
	readContract = (item) => {
		const { loanMoney, resaveCardNo, repayCardNo, loanUsage } = this.state;
		const { couponData } = this.props;
		this.storeTempData();
		const tokenId = Cookie.get('FIN-HD-AUTH-TOKEN') || store.getToken();
		const osType = getDeviceType();
		let pathUrl = `${linkConf.PDF_URL}${loan_contractPreview}?loanUsage=${loanUsage.usageCd}&contractType=${
			item.contractType
		}&contractNo=${item.contractNo}&loanAmount=${loanMoney}&prodId=${
			item.prodId
		}&withdrawBankAgrNo=${repayCardNo}&withholdBankAgrNo=${resaveCardNo}&tokenId=${tokenId}&coupId=${couponData.coupId ||
			''}`;
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

	//?????????????????????????????????
	storeTempData = () => {
		const {
			loanMoney,
			loanDate,
			loanUsage,
			prdId,
			priceMax,
			priceMin,
			repayCardNo,
			repayCardLast,
			repayCardName,
			resaveCardNo,
			resaveCardLast,
			resaveCardName,
			protocolList,
			usageList,
			payBankCode,
			resaveBankCode,
			checkBox1,
			productList,
			productListCopy
		} = this.state;
		this.props.setConfirmAgencyInfoAction({
			loanMoney,
			loanDate,
			loanUsage,
			prdId,
			priceMax,
			priceMin,
			repayCardNo,
			repayCardLast,
			repayCardName,
			resaveCardNo,
			resaveCardLast,
			resaveCardName,
			protocolList,
			usageList,
			payBankCode,
			resaveBankCode,
			checkBox1,
			productList,
			productListCopy
		});
	};

	//????????????????????????
	calcLoanMoney = (m) => {
		if (this.state.loanMoney === m) return;
		const { priceMax, priceMin } = this.state;
		let loanMoney;
		if (m === 0 || m < priceMin) {
			loanMoney = priceMin;
		} else if (m > priceMax) {
			loanMoney = priceMax;
		} else {
			loanMoney = Math.ceil(Number(m) / 100) * 100; //????????????100??????
		}
		this.setState({ loanMoney }, () => {
			this.requestProdInfo();
			buriedPointEvent(preLoan.loanAmtInputBlur, { amount_value: loanMoney });
		});
	};

	//??????????????????????????????
	validateFn = () => {
		const { loanMoney, loanDate, loanUsage } = this.state;
		// if (loanMoney && loanDate && loanDate.prodCount && loanUsage && repayCardNo && resaveCardNo) {
		if (loanMoney && loanDate && loanDate.prodCount && loanUsage) {
			return true;
		}
		return false;
	};

	//??????????????????
	loanApplySubmit = () => {
		sxfburiedPointEvent(preLoanSubmitRiskBury.key);
		const { loanMoney, loanDate, loanUsage, checkBox1, repayCardLast, resaveCardLast } = this.state;
		if (!loanMoney) {
			this.props.toast.info('?????????????????????');
			return;
		}
		if (!loanDate) {
			this.props.toast.info('?????????????????????');
			return;
		}
		if (!loanUsage) {
			this.props.toast.info('?????????????????????');
			return;
		}
		if (!repayCardLast || !(repayCardLast.length > 0)) {
			this.props.toast.info('????????????????????????');
			return;
		}
		if (!resaveCardLast || !(resaveCardLast.length > 0)) {
			this.props.toast.info('????????????????????????');
			return;
		}
		if (!checkBox1) {
			this.props.toast.info('??????????????????????????????????????????????????????');
			return;
		}

		buriedPointEvent(preLoan.loanSignBtn, {
			loanMoney,
			loanDate: loanDate.prodCount
		});
		this.checkProtocolBindCard();
	};

	// ????????????????????????
	checkProtocolBindCard = () => {
		const { resaveCardNo, resaveBankCode } = this.state;
		let params = {
			agrNo: resaveCardNo,
			bankCode: resaveBankCode,
			channelFlag: '1', // 0 ???????????? 1 ???????????????
			supportType: '',
			merType: '', // * ?????????????????? * ??????????????????????????????????????????????????????, * JR??????????????? XD??????????????? ZY????????????  ????????????:????????????
			usrSignCnl: getH5Channel()
		};

		this.props.$fetch.post(bank_card_protocol_sms, params).then((res) => {
			switch (res.code) {
				case '000000':
					//?????????????????????????????????????????????????????????
					this.setState({
						isShowSmsModal: true
					});
					break;
				case '0000010':
					this.props.toast.info(res.message);
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
				case '999999':
					//?????????????????????
					this.setState({
						protocolSmsFailInfo: res.data,
						protocolSmsFailFlag: true,
						isShowSmsModal: true
					});
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
				case '999973': // ????????????????????? ?????????????????????
					this.submitHandler();
					break;
				case '999968':
					this.props.toast.info(res.message);
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
				default:
					this.props.toast.info('??????????????????????????????????????????');
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
			}
		});
	};

	submitHandler = () => {
		this.props.toast.loading('', 10);
		this.storeTempData();
		const { couponData } = this.props;
		// const { loanMoney, loanUsage, repayCardNo, resaveCardNo, prdId, couponInfo } = this.state;

		const { loanMoney, repayCardNo, resaveCardNo, loanUsage, protocolList, loanDate } = this.state;

		let couponId = '';
		if (couponData && couponData.coupId) {
			if (couponData.coupId !== 'null') {
				couponId = couponData.coupId;
			} else {
				couponId = '';
			}
		}

		const params = {
			loanAmt: loanMoney, //????????????
			withDrawAgrNo: repayCardNo, //?????????????????????
			withHoldAgrNo: resaveCardNo, //??????????????????
			prodId: protocolList && protocolList[0] && protocolList[0].prodId, //??????ID ?????????productId
			repayType: '0', //????????????
			coupId: couponId, //?????????id
			loanUsage: loanUsage.usageCd, //????????????
			prodType: '21',
			location: store.getPosition() || '-1,-1'
		};
		this.props.setPreLoanDataAction({ sendParams: params, selProduct: loanDate });
		getNextStatus({
			$props: this.props,
			actionType: 'preLoanPage',
			actionMsg: '??????'
		});
	};

	// ??????????????????
	confirmProtocolBindCard = () => {
		if (!this.state.smsCode) {
			this.props.toast.info('??????????????????');
			return;
		}
		if (this.state.smsCode.length !== 6) {
			this.props.toast.info('???????????????????????????');
			return;
		}
		buriedPointEvent(loan_fenqi.protocolBindBtnClick);
		this.props.$fetch.get(`${bank_card_protocol_bind}/${this.state.smsCode}`).then((res) => {
			if (res.code === '000000') {
				this.closeSmsModal();
			} else if (res.code === '0000010') {
				this.props.toast.info(res.data);
				this.setState({ smsCode: '' });
				buriedPointEvent(loan_fenqi.protocolBindFail, { reason: `${res.code}-${res.message}` });
			} else if (res.code === '999999') {
				//?????????????????????
				this.setState({
					protocolSmsFailInfo: res.data,
					protocolSmsFailFlag: true,
					isShowSmsModal: true
				});
				buriedPointEvent(loan_fenqi.protocolBindFail, { reason: `${res.code}-${res.message}` });
			} else {
				this.props.toast.info('?????????????????????????????????');
				this.setState({
					smsCode: '',
					isShowSmsModal: false
				});
				buriedPointEvent(loan_fenqi.protocolBindFail, { reason: `${res.code}-${res.message}` });
			}
		});
	};

	// ???????????????????????????
	closeSmsModal = () => {
		this.setState(
			{
				isShowSmsModal: false,
				smsCode: ''
			},
			() => {
				this.submitHandler();
			}
		);
	};

	// ????????????????????????
	handleSmsCodeChange = (smsCode) => {
		this.setState({
			smsCode,
			buttonDisabled: smsCode.length !== 6
		});
	};

	// ??????????????????
	checkAgreement = () => {
		buriedPointEvent(preLoan.loanProtocolSelect);
		sxfburiedPointEvent(preCheckboxClickRiskBury.key);
		this.setState({ checkBox1: !this.state.checkBox1 });
	};

	renderProductListDom = () => {
		const { productList, loanDate } = this.state;
		if (productList && productList.length) {
			return (
				<div className={style.tagListWrap}>
					{productList.map((item, index) => (
						<ButtonCustom
							long="false"
							key={index}
							size="md"
							className={style.tagButton}
							type={loanDate && loanDate.prodCount === item.prodCount ? 'yellow' : 'gray'}
							onClick={() => {
								//???????????????
								this.props.setCouponDataAction({});
								this.selectLoanDate(item);
							}}
						>
							{item.prodName}
						</ButtonCustom>
					))}
				</div>
			);
		}
		return null;
	};

	/**
	 * ???????????????????????????
	 */
	renderListRowCouponValue() {
		const { deratePrice, availableCoupNum } = this.state;
		if (availableCoupNum) {
			if (deratePrice) {
				return (
					<span className={style.repayPlan} style={{ color: '#FE6666' }}>
						-{deratePrice}???
					</span>
				);
			}
			return (
				<ButtonCustom
					long="false"
					className={style.couponBtn}
					size="sm"
					shape="radius"
					iconsource={Images.adorn.coupon}
					onClick={this.goSelectCoupon}
				>
					{availableCoupNum}?????????
				</ButtonCustom>
			);
		}
		return <span className={style.repayPlan}>??????????????????</span>;
	}

	/**
	 * ????????????
	 */
	renderProtocol = () => {
		const { protocolList } = this.state;
		return protocolList.map((item, index) => (
			<em
				key={index}
				onClick={(e) => {
					e.stopPropagation();
					this.readContract(item);
				}}
			>
				{`???${item.contractMdlName}???`}
			</em>
		));
	};

	// ????????????
	showDetail = () => {
		buriedPointEvent(preLoan.loanTermClick);
		this.setState({
			isShowDetail: !this.state.isShowDetail
		});
	};

	render() {
		const { userInfo = {}, couponData = {} } = this.props;
		const {
			usageModal,
			loanUsage,
			usageList,
			loanDate,
			loanMoney,
			planModal,
			repayCardNo,
			resaveCardNo,
			priceMax = '',
			priceMin = '',
			repayPlanInfo,
			isShowSmsModal,
			smsCode,
			checkBox1,
			repayCardLast,
			repayCardName,
			resaveCardLast,
			resaveCardName,
			protocolList,
			buttonDisabled,
			isShowDetail
		} = this.state;

		const placeholderText = (priceMin && priceMax && `????????????${priceMin}???${priceMax}`) || '';
		const replayPlanLength =
			repayPlanInfo && repayPlanInfo.perds && repayPlanInfo.perds.length ? repayPlanInfo.perds.length : '';

		return (
			<div className={[style.fenqi_page, 'loan_fenqi_page'].join(' ')}>
				<div className={style.scrollWrap}>
					<div className={style.inputWrap}>
						<div className={style.billInpBox}>
							<i className={style.moneyUnit}>??</i>
							<InputItem
								className={style.billInput}
								placeholder={placeholderText}
								clear={true}
								type="number"
								value={loanMoney}
								maxLength={7}
								onChange={(v) => {
									if (!v) {
										this.setState(
											{
												isShowDetail: false,
												loanMoney: v,
												inputClear: true,
												loanDate: null,
												productList: this.state.productListCopy
											},
											() => {
												this.selectMax();
												// this.removeTempData();
											}
										);
										return;
									}
									this.setState({
										loanMoney: v
									});
								}}
								onBlur={(v) => {
									if (!v) {
										// ?????????????????????????????????????????????, ?????????????????????
										this.props.setCouponDataAction({});
										v && this.calcLoanMoney(Number(v));
										return;
									}
									this.setState(
										{
											loanMoney: v,
											loanDate: null,
											productList: this.state.productListCopy
										},
										() => {
											// ?????????????????????????????????????????????, ?????????????????????
											this.props.setCouponDataAction({});
											v && this.calcLoanMoney(Number(v));
										}
									);
								}}
								data-sxf-props={JSON.stringify({
									type: cardBillAmtRiskBury.type,
									name: cardBillAmtRiskBury.key,
									actContain: cardBillAmtRiskBury.actContain
								})}
							/>
						</div>
						<p className={style.inputTip}>??????????????????????????????????????????????????????</p>
					</div>

					<div className={style.pannel}>
						<ul>
							<li
								className={style.listItem}
								onClick={() => {
									this.showDetail();
								}}
							>
								<label>?????????</label>
								<div className={style.listValue}>
									{(!isShowDetail && loanDate && loanDate.prodName) || null}
									<Icon type={isShowDetail ? 'up' : 'down'} className={style.icon} />
								</div>
								{(isShowDetail && this.renderProductListDom()) || null}
							</li>
							<li className={style.listItem}>
								<label>????????????</label>
								<div
									onClick={() => {
										this.openModal('usage');
									}}
									className={style.listValue}
								>
									{loanUsage && loanUsage.loanUseRmk}
									<Icon type="right" className={style.icon} />
								</div>
							</li>
						</ul>
					</div>
					<div className={style.pannel}>
						{loanMoney &&
							loanDate &&
							loanDate.prodCount &&
							replayPlanLength &&
							couponData.forceFlag === 'Y' && (
								<Popover text="??????????????????????????????????????????" popoverStyle={{ top: '-0.2rem' }} />
							)}
						<ul>
							{loanMoney && loanDate && loanDate.prodCount && replayPlanLength ? (
								<li className={style.listItem}>
									<label>?????????</label>
									<div className={`${style.listValue} ${style.couponListValue}`} onClick={this.selectCoupon}>
										{this.renderListRowCouponValue()}
										{couponData.forceFlag !== 'Y' && <Icon type="right" className={style.icon} />}
									</div>
								</li>
							) : null}
							<li className={style.listItem}>
								<label>????????????</label>
								<span>
									{loanMoney && loanDate && loanDate.prodCount && replayPlanLength ? (
										<span
											className={style.listValue}
											onClick={() => {
												this.openModal('plan');
											}}
										>
											????????????
											<Icon type="right" className={style.icon} />
										</span>
									) : (
										<span className={style.greyText}>??????</span>
									)}
								</span>
							</li>
						</ul>
					</div>
					<div className={style.pannel}>
						<ul>
							<li className={style.listItem}>
								<label>???????????????</label>
								{repayCardLast && repayCardLast.length > 0 ? (
									<span
										className={style.listValue}
										onClick={() => {
											this.selectBankCard(repayCardNo, 'withdraw');
										}}
									>
										{`${repayCardName}(${repayCardLast})`}
										<Icon type="right" className={style.icon} />
									</span>
								) : (
									<span
										className={style.highlightText}
										onClick={() => {
											this.bindBankCard('withdraw');
										}}
									>
										??????????????????
										<Icon type="right" className={style.icon} />
									</span>
								)}
							</li>
							<li className={style.listItem}>
								<label>???????????????</label>
								{resaveCardLast && resaveCardLast.length > 0 ? (
									<span
										className={style.listValue}
										onClick={() => {
											this.selectBankCard(resaveCardNo, 'withhold');
										}}
									>
										{`${resaveCardName}(${resaveCardLast})`}
										<Icon type="right" className={style.icon} />
									</span>
								) : (
									<span
										className={style.highlightText}
										onClick={() => {
											this.bindBankCard('withhold');
										}}
									>
										??????????????????
										<Icon type="right" className={style.icon} />
									</span>
								)}
							</li>
						</ul>
					</div>

					{loanMoney &&
					loanDate &&
					loanDate.prodCount &&
					replayPlanLength &&
					protocolList &&
					protocolList.length ? (
						<ProtocolRead
							className={style.protocolLink}
							tip="???????????????????????????????????????"
							isSelect={checkBox1}
							protocolList={this.state.protocolList}
							clickRadio={this.checkAgreement}
							clickProtocol={this.readContract}
							offsetH="0"
						/>
					) : null}
				</div>
				<div className={style.buttonWrap}>
					<ButtonCustom
						onClick={this.loanApplySubmit}
						type={this.validateFn() && checkBox1 ? 'yellow' : 'default'}
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
				<Modal
					popup
					className="purpose_modal"
					visible={usageModal}
					animationType="slide-up"
					transparent
					onClose={() => {
						this.closeModal('usage');
					}}
				>
					<h3 className={style.modalTitle}>????????????</h3>
					<p className={style.modalDesc}>???????????????????????????????????????????????????????????????????????????????????????</p>
					<ul>
						{usageList.map((item) => (
							<li
								className={[
									style.modalItem,
									item.usageCd === loanUsage.usageCd ? style.modalItemActive : ''
								].join(' ')}
								key={item.usageCd}
								onClick={() => {
									this.selectLoanUsage(item);
								}}
							>
								{item.loanUseRmk}
							</li>
						))}
					</ul>
				</Modal>

				<RepayPlanModal
					visible={planModal}
					onClose={() => {
						this.closeModal('plan');
					}}
					data={repayPlanInfo.perds}
					loanMoney={loanMoney}
					history={this.props.history}
					goPage={() => {
						sxfburiedPointEvent(prePayPlanOutRiskBury.key);
						this.storeTempData();
						this.props.history.push('/home/payment_notes');
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
							this.selectBankCard(resaveCardNo, 'withhold');
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
						bankNo={resaveCardNo}
						buttonDisabled={buttonDisabled}
						bnkTelNoHid={userInfo && userInfo.telNoHid ? userInfo.telNoHid : ''}
					/>
				)}
			</div>
		);
	}
}
