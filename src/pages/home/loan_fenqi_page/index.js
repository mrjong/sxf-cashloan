import React, { PureComponent } from 'react';
import fetch from 'sx-fetch';
import Cookie from 'js-cookie';
import { Modal, InputItem, Icon } from 'antd-mobile';
import { ButtonCustom, RepayPlanModal, CheckRadio, ProtocolSmsModal } from 'components';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { loan_fenqi, home } from 'utils/analytinsType';
import { setBackGround } from 'utils/background';
import { getH5Channel } from 'utils/common';
import { base64Decode } from 'utils/CommonUtil/toolUtil';
import { connect } from 'react-redux';
import { getDeviceType } from 'utils';
import {
	setCardTypeAction,
	setConfirmAgencyInfoAction,
	setCouponDataAction
} from 'reduxes/actions/commonActions';
import linkConf from 'config/link.conf';
import WarningModal from 'pages/home/confirm_agency_page/components/WarningModal';
import Images from 'assets/image';
import style from './index.scss';
import {
	loan_loanPlan,
	loan_queryContractInfo,
	loan_contractPreview,
	bank_card_protocol_sms,
	bank_card_protocol_bind,
	loan_loanSub,
	loan_queryCashLoanApplInfo
} from 'fetch/api.js';

let isFetching = false;

@fetch.inject()
@setBackGround('#f0f4f9')
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
		setCouponDataAction
	}
)
export default class loan_fenqi_page extends PureComponent {
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
			repayPlanInfo: {
				perds: []
			},
			isShowSmsModal: false, //是否显示短信验证码弹窗
			smsCode: '',
			payBankCode: '',
			resaveBankCode: '',
			checkBox1: false,
			loanUsage: {},
			repayCardNo: '', //借款银行卡卡号
			repayCardLast: '', //借款银行卡后四位
			repayCardName: '', //借款银行卡银行
			resaveCardNo: '', //还款银行卡卡号
			resaveCardLast: '', //还款银行卡后四位
			resaveCardName: '', //还款银行卡银行
			isShowDetail: false // 是否展示产品列表
		};
	}

	componentWillMount() {
		const { withholdCardData, withdrawCardData, confirmAgencyInfo } = this.props;
		if (confirmAgencyInfo) {
			if (withdrawCardData) {
				confirmAgencyInfo.repayCardNo = withdrawCardData.agrNo;
				confirmAgencyInfo.repayCardLast = withdrawCardData.lastCardNo;
				confirmAgencyInfo.repayCardName = withdrawCardData.bankName;
			}
			if (withholdCardData) {
				confirmAgencyInfo.resaveCardNo = withholdCardData.agrNo;
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
		store.setHrefFlag(true);
	}

	//处理数据反显
	handleDataDisplay = (confirmAgencyInfo = {}) => {
		this.setState({ ...confirmAgencyInfo }, () => {
			// 初始化数据渲染
			this.selectMax();
		});
	};

	// 获取页面数据
	queryCashLoanApplInfo = () => {
		this.props.$fetch
			.post(loan_queryCashLoanApplInfo)
			.then((res) => {
				this.props.toast.hide();
				if (res.code === '000000') {
					if (!(res.data && res.data.prods && res.data.prods.length)) {
						this.props.toast.info('无借款产品，请联系客服');
						return;
					}
					if (res.data && res.data.contacts && res.data.contacts.length) {
						res.data.contacts.map((item, index) => {
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
					if (res.data && res.data.excludedContacts && res.data.excludedContacts.length) {
						for (let i = 0; i < res.data.excludedContacts.length; i++) {
							res.data.excludedContacts[i] = base64Decode(res.data.excludedContacts[i]);
						}
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
				this.props.toast.info('系统开小差,请稍后重试');
				// setTimeout(() => {
				// 	this.props.history.push('/home/home');
				// }, 2000);
			});
	};

	//产品数据初始化
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
	 * 根据金额获取产品信息
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

	// 筛选产品列表
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
		// 找出prodCount最大对象所在的索引
		let maxItem = null;
		let indexOfMax = 0;
		console.log(loanDate, 'aw');
		if (loanDate) {
			maxItem = loanDate;
		} else {
			productList.reduce((a, c, i) => (c.prodCount > a ? ((indexOfMax = i), c.prodCount) : a), 0);
			maxItem = productList[indexOfMax];
		}
		this.selectLoanDate(maxItem);
	};

	/**
	 * 获取借款合同与优惠券，注意请求报错则清空选中期数termSelected=null
	 */
	requestProtocolCoupon = async () => {
		if (!parseFloat(this.state.loanMoney) > 0 || !this.state.repayCardLast.length > 0) {
			return;
		}
		this.props.toast.loading('', 10);
		const { loanDate = {}, loanMoney, repayCardNo, resaveCardNo } = this.state;
		//借款相关协议传参
		const protocolParams = {
			loanAmt: loanMoney,
			prodLth: loanDate.prodLth,
			prodCount: loanDate.prodCount,
			prodUnit: loanDate.prodUnit,
			withdrawBankAgrNo: repayCardNo,
			withholdBankAgrNo: resaveCardNo,
			prodType: '11', //现金分期业务Type
			wtdwTyp: '0' //还款时间
		};

		this.props.$fetch.post(loan_queryContractInfo, protocolParams).then((protocolRes) => {
			if (protocolRes.code === '000000') {
				// 试算传参
				let couponParams = {
					loanAmt: loanMoney,
					prodType: '11',
					repayType: '0',
					prodId:
						protocolRes &&
						protocolRes.data &&
						protocolRes.data.contracts &&
						protocolRes.data.contracts[0] &&
						protocolRes.data.contracts[0].prodId
				};
				const { couponData } = this.props;
				// 不使用优惠券,不传coupId,
				// 使用优惠券,coupId传优惠券ID
				if (couponData && (couponData.coupId === 'null' || couponData.coupVal === -1)) {
					// 不使用优惠劵的情况
					couponParams = {
						...couponParams
					};
				} else if (couponData && JSON.stringify(couponData) !== '{}') {
					couponParams = {
						...couponParams,
						coupId: couponData.coupId
					};
				}
				this.requestLoanPlan(couponParams, protocolRes);
			} else {
				this.setState(
					{
						protocolList: [],
						repayPlanInfo: { perds: [] }
					},
					() => {
						this.props.toast.info(protocolRes.message);
					}
				);
			}
		});
	};

	// 借款试算
	requestLoanPlan = (planParam, protocolRes) => {
		this.props.$fetch.post(loan_loanPlan, planParam).then((planRes) => {
			this.props.toast.hide();
			if (planRes.code === '000000') {
				this.props.toast.hide();
				this.setState({
					protocolList: (protocolRes.data && protocolRes.data.contracts) || [],
					repayPlanInfo: planRes.data
				});
				buriedPointEvent(loan_fenqi.repayPlan);
			} else {
				this.setState(
					{
						protocolList: [],
						repayPlanInfo: { perds: [] }
					},
					() => {
						this.props.toast.info(planRes.message);
					}
				);
			}
		});
	};

	// 选择优惠劵
	selectCoupon = () => {
		const { protocolList, repayPlanInfo } = this.state;
		this.storeTempData();
		const { loanMoney, loanDate = {} } = this.state;
		let prodId = protocolList && protocolList[0] && protocolList[0].prodId ? protocolList[0].prodId : '';
		let perCont = loanDate.prodUnit === 'M' ? loanDate.prodLth : 1;

		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?prodType=11&price=${loanMoney}&perCont=${perCont}&prodId=${prodId}`,
			state: { nouseCoupon: !(repayPlanInfo && repayPlanInfo.availableCoupCount) }
		});
	};

	// 选择银行卡
	selectBankCard = (agrNo, cardType) => {
		this.storeTempData();
		this.props.setCardTypeAction(cardType);
		this.props.history.push({
			pathname: '/mine/select_save_page',
			search: `?agrNo=${agrNo}&cardType=${cardType}`
		});
		if (cardType === 'withdraw') {
			buriedPointEvent(loan_fenqi.resaveCard);
		} else {
			buriedPointEvent(loan_fenqi.payCard);
		}
	};

	//绑定银行卡
	bindBankCard = (cardType) => {
		this.storeTempData();
		this.props.setCardTypeAction(cardType);
		this.props.history.push({
			pathname: '/mine/bind_save_page',
			search: `?cardType=${cardType}`
		});
	};

	// 选择分期期限
	selectLoanDate = (item) => {
		if (isFetching) return;
		this.setState(
			{
				loanDate: item
			},
			() => {
				if (
					parseFloat(this.state.loanMoney) > 0 &&
					this.state.repayCardLast &&
					this.state.repayCardLast.length > 0
				) {
					this.requestProtocolCoupon();
				}
			}
		);
		switch (item.prodCount) {
			case '30':
				buriedPointEvent(loan_fenqi.day30);
				break;
			case '3':
				buriedPointEvent(loan_fenqi.month3);
				break;
			case '6':
				buriedPointEvent(loan_fenqi.month6);
				break;
			case '9':
				buriedPointEvent(loan_fenqi.month9);
				break;
			case '12':
				buriedPointEvent(loan_fenqi.month12);
				break;
			default:
				break;
		}
	};

	//选择用途
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
		this.setState({
			[type + 'Modal']: true
		});
	};

	closeModal = (type) => {
		this.setState({
			[type + 'Modal']: false
		});
	};

	//阅读合同详情
	readContract = (item) => {
		const { loanMoney, resaveCardNo, repayCardNo, loanUsage } = this.state;
		this.storeTempData();
		const tokenId = Cookie.get('FIN-HD-AUTH-TOKEN') || store.getToken();

		const osType = getDeviceType();
		let pathUrl = `${linkConf.PDF_URL}${loan_contractPreview}?loanUsage=${loanUsage.usageCd}&contractType=${item.contractType}&contractNo=${item.contractNo}&loanAmount=${loanMoney}&prodId=${item.prodId}&withdrawBankAgrNo=${repayCardNo}&withholdBankAgrNo=${resaveCardNo}&tokenId=${tokenId}`;
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
		buriedPointEvent(loan_fenqi.contract, { contractName: item.contractMdlName });
	};

	//暂存页面反显的临时数据
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
			isShowTipModal
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
			isShowTipModal
		});
	};

	//计算待提交的金额
	calcLoanMoney = (m) => {
		if (this.state.loanMoney === m) return;
		const { priceMax, priceMin } = this.state;
		let loanMoney;
		if (m === 0 || m < priceMin) {
			loanMoney = priceMin;
		} else if (m > priceMax) {
			loanMoney = priceMax;
		} else {
			loanMoney = Math.ceil(Number(m) / 100) * 100; //金额向上100取整
		}
		this.setState({ loanMoney }, () => {
			this.requestProdInfo();
			buriedPointEvent(loan_fenqi.moneyBlur, { loanMoney });
		});
	};

	//验证信息是否填写完整
	validateFn = () => {
		const { loanMoney, loanDate, loanUsage } = this.state;
		// if (loanMoney && loanDate && loanDate.prodCount && loanUsage && repayCardNo && resaveCardNo) {
		if (loanMoney && loanDate && loanDate.prodCount && loanUsage) {
			return true;
		}
		return false;
	};

	//借款申请提交
	loanApplySubmit = () => {
		const { loanMoney, loanDate, loanUsage, checkBox1 } = this.state;
		if (!loanMoney) {
			this.props.toast.info('请输入借款金额');
			return;
		}
		if (!loanDate) {
			this.props.toast.info('请选择借款期限');
			return;
		}
		if (!loanUsage) {
			this.props.toast.info('请选择借款用途');
			return;
		}
		if (!checkBox1) {
			this.props.toast.info('请先阅读并勾选相关协议，继续签约借款');
			return;
		}

		buriedPointEvent(loan_fenqi.clickSubmit, {
			loanMoney,
			loanDate: loanDate.prodCount
		});
		this.checkProtocolBindCard();
	};

	// 协议绑卡校验接口
	checkProtocolBindCard = () => {
		const { resaveCardNo, resaveBankCode } = this.state;
		let params = {
			agrNo: resaveCardNo,
			bankCode: resaveBankCode,
			channelFlag: '1', // 0 可以重复 1 不可以重复
			supportType: '',
			merType: '', // * 优先绑定标识 * 标识该次绑卡是否要求优先绑定某类型卡, * JR随行付金融 XD随行付小贷 ZY中元保险  其他情况:无优先级
			usrSignCnl: getH5Channel()
		};

		this.props.$fetch.post(bank_card_protocol_sms, params).then((res) => {
			switch (res.code) {
				case '000000':
					//协议绑卡校验成功提示（走协议绑卡逻辑）
					this.setState({
						isShowSmsModal: true
					});
					break;
				case '0000010':
					this.props.toast.info(res.message);
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
				case '999999':
					//该卡完全绑不上
					this.setState({
						protocolSmsFailInfo: res.data,
						protocolSmsFailFlag: true,
						isShowSmsModal: true
					});
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
				case '999973': // 银行卡已经绑定 直接继续往下走
					this.handleShowTipModal();
					break;
				case '999968':
					this.props.toast.info(res.message);
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
				default:
					this.props.toast.info('暂不支持该银行卡，请换卡重试');
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.code}-${res.message}` });
					break;
			}
		});
	};

	submitHandler = () => {
		const { couponData } = this.props;
		// const { loanMoney, loanUsage, repayCardNo, resaveCardNo, prdId, couponInfo } = this.state;

		const { loanMoney, repayCardNo, resaveCardNo, loanUsage, protocolList } = this.state;

		let couponId = '';
		if (couponData && couponData.coupId) {
			if (couponData.coupId !== 'null') {
				couponId = couponData.coupId;
			} else {
				couponId = '';
			}
		}

		const params = {
			loanAmt: loanMoney, //签约金额
			withDrawAgrNo: repayCardNo, //代偿信用卡主键
			withHoldAgrNo: resaveCardNo, //还款卡号主键
			prodId: protocolList && protocolList[0] && protocolList[0].prodId, //产品ID 合同的productId
			repayType: '0', //还款方式
			coupId: couponId, //优惠劵id
			loanUsage: loanUsage.usageCd, //借款用途
			prodType: '11'
		};

		this.props.$fetch
			.post(loan_loanSub, params)
			.then((res) => {
				if (res.code === '000000') {
					this.props.toast.info('签约成功，请留意放款通知！');
					setTimeout(() => {
						this.props.history.push('/home/home');
					}, 2000);
					buriedPointEvent(loan_fenqi.submitResult, {
						is_success: true
					});
				} else {
					this.props.toast.info(res.message);
					buriedPointEvent(loan_fenqi.submitResult, {
						is_success: false,
						fail_cause: res.message
					});
				}
			})
			.catch((err) => {
				buriedPointEvent(loan_fenqi.submitResult, {
					is_success: false,
					fail_cause: err
				});
			});
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
		buriedPointEvent(loan_fenqi.protocolBindBtnClick);
		this.props.$fetch.get(`${bank_card_protocol_bind}/${this.state.smsCode}`).then((res) => {
			if (res.code === '000000') {
				this.closeSmsModal();
			} else if (res.code === '0000010') {
				this.props.toast.info(res.data);
				this.setState({ smsCode: '' });
				buriedPointEvent(loan_fenqi.protocolBindFail, { reason: `${res.code}-${res.message}` });
			} else if (res.code === '999999') {
				//该卡完全绑不上
				this.setState({
					protocolSmsFailInfo: res.data,
					protocolSmsFailFlag: true,
					isShowSmsModal: true
				});
				buriedPointEvent(loan_fenqi.protocolBindFail, { reason: `${res.code}-${res.message}` });
			} else {
				this.props.toast.info('绑卡失败，请换卡或重试');
				this.setState({
					smsCode: '',
					isShowSmsModal: false
				});
				buriedPointEvent(loan_fenqi.protocolBindFail, { reason: `${res.code}-${res.message}` });
			}
		});
	};

	// 关闭短信弹窗并还款
	closeSmsModal = () => {
		this.setState(
			{
				isShowSmsModal: false,
				smsCode: ''
			},
			() => {
				this.handleShowTipModal();
			}
		);
	};

	// 处理输入的验证码
	handleSmsCodeChange = (smsCode) => {
		this.setState({
			smsCode,
			buttonDisabled: smsCode.length !== 6
		});
	};

	// 点击勾选协议
	checkAgreement = () => {
		this.setState({ checkBox1: !this.state.checkBox1 });
	};

	handleShowTipModal = () => {
		this.props.toast.hide();
		this.setState({
			isShowTipModal: true
		});
	};

	// 关闭弹框
	handleCloseTipModal = (type) => {
		this.setState({
			[type]: false
		});
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

	renderListRowCouponValue() {
		const { repayPlanInfo = {} } = this.state;
		if (repayPlanInfo && repayPlanInfo.availableCoupCount && Number(repayPlanInfo.availableCoupCount)) {
			if (repayPlanInfo.deductAmount) {
				return (
					<span className={style.repayPlan} style={{ color: '#FE6666' }}>
						{repayPlanInfo.deductAmount}元
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
					{repayPlanInfo.availableCoupCount}个可用
				</ButtonCustom>
			);
		}
		return <span className={style.repayPlan}>无可用优惠券</span>;
	}

	/**
	 * 渲染协议
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
				{`《${item.contractMdlName}》`}
			</em>
		));
	};

	// 展示产品
	showDetail = () => {
		this.setState({
			isShowDetail: !this.state.isShowDetail
		});
	};

	render() {
		const { userInfo = {} } = this.props;
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
			isShowTipModal,
			buttonDisabled,
			isShowDetail
		} = this.state;

		const placeholderText = (priceMin && priceMax && `可借金额${priceMin}～${priceMax}`) || '';
		const replayPlanLength =
			repayPlanInfo && repayPlanInfo.perds && repayPlanInfo.perds.length ? repayPlanInfo.perds.length : 0;

		return (
			<div className={[style.fenqi_page, 'loan_fenqi_page'].join(' ')}>
				<div className={style.scrollWrap}>
					<div className={style.inputWrap}>
						<div className={style.billInpBox}>
							<i className={style.moneyUnit}>¥</i>
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
												inputClear: true
											},
											() => {
												// this.removeTempData();
											}
										);
									}
									this.setState({
										loanMoney: v
										// loanDate: null
									});
								}}
								onBlur={(v) => {
									// 每次改变金额需要重新选择优惠劵, 清空优惠劵数据
									this.props.setCouponDataAction({});
									v && this.calcLoanMoney(Number(v));
								}}
							/>
						</div>
						<p className={style.inputTip}>建议全部借出，借款后剩余额度将不可用</p>
					</div>

					<div className={style.pannel}>
						<ul>
							<li
								className={style.listItem}
								onClick={() => {
									this.showDetail();
								}}
							>
								<label>借多久</label>
								<div className={style.listValue}>
									{(!isShowDetail && loanDate && loanDate.prodName) || null}
									<Icon type={isShowDetail ? 'up' : 'down'} className={style.icon} />
								</div>
								{(isShowDetail && this.renderProductListDom()) || null}
							</li>
							<li className={style.listItem}>
								<label>借款用途</label>
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
							<li className={style.listItem}>
								<label>还款计划</label>
								<span>
									{loanMoney && loanDate && loanDate.prodCount && replayPlanLength ? (
										<span
											className={style.listValue}
											onClick={() => {
												this.openModal('plan');
											}}
										>
											点击查看
											<Icon type="right" className={style.icon} />
										</span>
									) : (
										<span className={style.greyText}>暂无</span>
									)}
								</span>
							</li>
							{loanMoney && loanDate && loanDate.prodCount && replayPlanLength ? (
								<li className={style.listItem}>
									<label>优惠券</label>
									<div className={`${style.listValue} ${style.couponListValue}`} onClick={this.selectCoupon}>
										{this.renderListRowCouponValue()}
										<Icon type="right" className={style.icon} />
									</div>
								</li>
							) : null}
							<li className={style.listItem}>
								<label>收款银行卡</label>
								{repayCardLast.length > 0 ? (
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
										绑定储蓄卡 <i className={style.addIcon}>+</i>
									</span>
								)}
							</li>
							<li className={style.listItem}>
								<label>还款银行卡</label>
								{resaveCardLast.length > 0 ? (
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
										绑定储蓄卡 <i className={style.addIcon}>+</i>
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
						<p className={style.protocolLink} onClick={this.checkAgreement}>
							<CheckRadio isSelect={checkBox1} />
							点击“签约借款”，表示同意 {this.renderProtocol()}
						</p>
					) : null}
				</div>
				<div className={style.buttonWrap}>
					<ButtonCustom
						onClick={this.loanApplySubmit}
						type={this.validateFn() && checkBox1 ? 'yellow' : 'default'}
					>
						签约借款
					</ButtonCustom>
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
					<h3 className={style.modalTitle}>借款用途</h3>
					<p className={style.modalDesc}>借款资金不得用于购买房产、证券投资等投机经营及其他违法交易</p>
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
						this.props.history.push('/home/payment_notes');
					}}
				/>

				{isShowTipModal ? (
					<WarningModal
						history={this.props.history}
						handleConfirm={this.submitHandler}
						closeWarningModal={() => {
							this.handleCloseTipModal('isShowTipModal');
						}}
						prodType="现金分期"
						toast={this.props.toast}
						cacheData={this.storeTempData}
					/>
				) : null}

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
