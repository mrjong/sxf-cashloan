import React, { PureComponent } from 'react';
import { Modal, InputItem, Icon } from 'antd-mobile';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { loan_fenqi, home } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import { setBackGround } from 'utils/background';
import { getDeviceType } from 'utils';
import SXFButton from 'components/ButtonCustom';
import RepayPlanModal from 'components/RepayPlanModal';
import style from './index.scss';
import linkConf from 'config/link.conf';
import Cookie from 'js-cookie';
import { getH5Channel } from 'utils/common';
import SmsModal from '../../order/order_common_page/components/SmsModal';

const API = {
	prodInfo: '/cash/prodList', //产品列表基本信息查询
	prodInfoByMoney: '/cash/prodInfo', //根据用户金额获取产品信息
	loanUsage: '/cash/loanUsage', //借款用途
	couponSupport: '/cash/couponSupport', //最佳优惠券获取
	contractList: '/fund/info', //合同列表
	repayPlan: '/bill/prebill', //还款计划查询
	agentRepay: '/bill/agentRepay', // 借款申请接口
	qryContractInfo: '/fund/qryContractInfo', // 合同数据流获取
	doCouponCount: '/bill/doCouponCount', // 后台处理优惠劵抵扣金额
	protocolSms: '/withhold/protocolSms', // 校验协议绑卡
	protocolBind: '/withhold/protocolBink' //协议绑卡接口
};

let isFetching = false;

@fetch.inject()
@setBackGround('#fff')
export default class loan_fenqi_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			inputClear: false,
			usageModal: false,
			planModal: false,
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
			contractList: [],
			repayPlanInfo: {
				perd: []
			},
			couponData: {}, // 优惠劵的信息
			isShowSmsModal: false, //是否显示短信验证码弹窗
			smsCode: '',
			payBankCode: '',
			resaveBankCode: '',
			contactList: []
		};
	}

	componentWillMount() {
		let storeData = store.getCashFenQiStoreData(); // 代提交的借款信息
		let cashFenQiCardArr = store.getCashFenQiCardArr(); // 收、还款卡信息
		let couponInfo = store.getCouponData(); //优惠券数据

		if (storeData && cashFenQiCardArr) {
			this.handleDataDisplay(storeData, cashFenQiCardArr);
		} else {
			this.queryProdInfo();
			this.queryLoanUsageList();
		}

		if (couponInfo && couponInfo.coupVal === -1) {
			this.setState({
				couponInfo,
				deratePrice: ''
			});
		}

		if (couponInfo && storeData && couponInfo.coupVal !== -1) {
			this.dealMoney(couponInfo, storeData.prdId);
		}
	}

	componentDidUpdate(prevProps, prevState) {
		this.shouldQueryContractList(prevState, this.state);
	}

	//是否需要重新请求合同产品
	shouldQueryContractList = (prevState, curState) => {
		const { loanMoney, loanDate, resaveBankCardAgrNo, payBankCardAgrNo } = curState;
		if (
			loanMoney &&
			loanDate &&
			resaveBankCardAgrNo &&
			(loanMoney !== prevState.loanMoney ||
				loanDate.perdCnt !== prevState.loanDate.perdCnt ||
				payBankCardAgrNo !== prevState.payBankCardAgrNo ||
				resaveBankCardAgrNo !== prevState.resaveBankCardAgrNo)
		) {
			this.queryContractList();
		}
	};

	//查询产品基本信息
	queryProdInfo = () => {
		this.props.$fetch
			.get(API.prodInfo, {
				channelType: 'h5'
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000' && res.data !== null) {
					const {
						resaveBankCardAgrNo,
						resaveBankCardLastNo,
						resaveBankCardName,
						payBankCardAgrNo,
						payBankCardLastNo,
						payBankCardName,
						perdRateList,
						priceMax,
						priceMin,
						payBankCode,
						resaveBankCode,
						contactList
					} = res.data;

					let filterContactList = [];
					if (contactList && contactList.length) {
						for (var i = 0; i < contactList.length; i++) {
							if (i < 5) {
								contactList[i].isMarked = true;
							} else {
								contactList[i].isMarked = false;
							}
							contactList[i].uniqMark = 'uniq' + i;
							filterContactList.push(contactList[i]);
						}
					}

					this.setState({
						resaveBankCardAgrNo,
						resaveBankCardLastNo,
						resaveBankCardName,
						payBankCardAgrNo,
						payBankCardLastNo,
						payBankCardName,
						perdRateList,
						priceMax,
						priceMin,
						payBankCode,
						resaveBankCode,
						contactList: filterContactList
					});
				} else {
					this.props.toast.info(res.msgInfo);
				}
			});
	};

	//根据用户金额获取产品信息
	queryProdInfoByMoney = () => {
		isFetching = true;
		this.props.$fetch
			.get(API.prodInfoByMoney, {
				price: this.state.loanMoney
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000' && res.data !== null) {
					isFetching = false;
					this.setState({
						perdRateList: res.data,
						loanDate: ''
					});
				} else {
					this.props.toast.info(res.msgInfo);
				}
			});
	};

	//查询借款用途列表
	queryLoanUsageList = () => {
		this.props.$fetch.get(API.loanUsage).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data !== null) {
				this.setState(
					{
						usageList: res.data
					},
					() => {
						this.selectLoanUsage(this.state.usageList[0]);
					}
				);
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	//查询合同列表
	queryContractList = () => {
		const { loanMoney, resaveBankCardAgrNo, loanDate } = this.state;
		const { perdCnt, perdLth, perdUnit } = loanDate;
		this.props.$fetch
			.post(API.contractList, {
				loanAmount: loanMoney,
				periodLth: perdLth,
				periodCount: perdCnt,
				periodUnit: perdUnit,
				prodType: '11',
				wtdwTyp: '0',
				agrNo: resaveBankCardAgrNo
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000' && res.data !== null) {
					this.setState(
						{
							contractList: res.data,
							prdId: res.data[0].productId //产品ID
						},
						() => {
							this.queryCouponInfo();
						}
					);
				} else {
					this.setState({
						contractList: [],
						prdId: ''
					});
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch(() => {
				this.removeTempData();
			});
	};

	//查询优惠券
	queryCouponInfo = () => {
		const { loanMoney, loanDate, prdId } = this.state;
		this.props.$fetch
			.post(API.couponSupport, {
				price: loanMoney,
				type: 'LOAN',
				prodType: '11',
				periodCount: loanDate.perdCnt,
				prdId: prdId
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000' && res.data !== null) {
					this.setState(
						{
							// couponInfo: res.data
							couponData: res.data,
							couponInfo: {
								coupVal: -1,
								usrCoupNo: 'null'
							},
							deratePrice: ''
						}
						// () => {
						// 	this.dealMoney(res.data, prdId);
						// }
					);
				} else {
					this.setState({
						couponInfo: {}
					});
				}
			})
			.catch(() => {
				this.removeTempData();
			});
	};

	//查询还款计划
	queryRepayPlan = () => {
		let couponInfo = store.getCouponData();
		const { loanMoney, prdId } = this.state;
		if (!prdId || !loanMoney) return;

		let params = {
			billPrcpAmt: loanMoney,
			prdId,
			wtdwTyp: '0',
			prodType: '11'
		};
		if (couponInfo && (couponInfo.usrCoupNo === 'null' || couponInfo.coupVal === -1)) {
			// 不使用优惠劵的情况
			params = {
				...params
				// coupId: '-1'
			};
		} else if (couponInfo && JSON.stringify(couponInfo) !== '{}') {
			params = {
				...params,
				coupId: couponInfo.usrCoupNo
			};
		}
		this.props.$fetch.post(API.repayPlan, params).then((res) => {
			if (res.msgCode === 'PTM0000' && res.data !== null) {
				this.setState(
					{
						repayPlanInfo: res.data
					},
					() => {
						buriedPointEvent(loan_fenqi.repayPlan);
						this.openModal('plan');
					}
				);
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	// 选择优惠劵
	selectCoupon = () => {
		const { prdId, couponData } = this.state;
		this.storeTempData();
		const { couponInfo, loanMoney, loanDate } = this.state;
		if (couponInfo && couponInfo.usrCoupNo) {
			store.setCouponData(couponInfo);
		}
		this.props.history.push({
			pathname: '/mine/coupon_page',
			search: `?transactionType=fenqi&price=${loanMoney}&perCont=${
				loanDate.perdUnit === 'M' ? loanDate.perdLth : 1
			}&prodId=${prdId}`,
			state: { nouseCoupon: !(couponData && couponData.availableCoupAmt) }
		});
	};

	// 选择银行卡
	selectBankCard = (agrNo, cardType) => {
		store.setBackUrl('/home/loan_fenqi');
		this.storeTempData();
		this.props.history.push({
			pathname: '/mine/select_save_page',
			search: `?agrNo=${agrNo}&cardType=${cardType}`
		});
		if (cardType === 'resave') {
			buriedPointEvent(loan_fenqi.resaveCard);
		} else {
			buriedPointEvent(loan_fenqi.payCard);
		}
	};

	//绑定银行卡
	bindBankCard = (cardType) => {
		store.setBackUrl('/home/loan_fenqi');
		this.storeTempData();
		this.props.history.push({
			pathname: '/mine/bind_save_page',
			search: `?cardType=${cardType}`
		});
	};

	selectLoanDate = (item) => {
		if (isFetching) return;
		this.setState({
			loanDate: item
		});
		switch (item.perdCnt) {
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
		const { loanMoney, payBankCardAgrNo, resaveBankCardAgrNo, loanUsage } = this.state;
		this.storeTempData();
		this.props.history.push({
			pathname: '/protocol/pdf_page',
			state: {
				url: `${linkConf.PDF_URL}${API.qryContractInfo}?loanUsage=${loanUsage.value}&contractTyep=${
					item.contractTyep
				}&contractNo=${item.contractNo}&loanAmount=${loanMoney}&productId=${
					item.productId
				}&agreementNo=${resaveBankCardAgrNo}&withholdAgrNo=${payBankCardAgrNo}&fin-v-card-token=${Cookie.get(
					'fin-v-card-token'
				) || store.getToken()}`,
				name: item.contractMdlName
			}
		});
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
			couponInfo,
			resaveBankCardAgrNo,
			resaveBankCardLastNo,
			resaveBankCardName,
			payBankCardAgrNo,
			payBankCardLastNo,
			payBankCardName,
			perdRateList,
			contractList,
			usageList,
			deratePrice,
			couponData,
			payBankCode,
			resaveBankCode
		} = this.state;
		const resaveCard = {
			agrNo: resaveBankCardAgrNo,
			lastCardNo: resaveBankCardLastNo,
			bankName: resaveBankCardName,
			bankCode: resaveBankCode
		};
		const payCard = {
			agrNo: payBankCardAgrNo,
			lastCardNo: payBankCardLastNo,
			bankName: payBankCardName,
			bankCode: payBankCode
		};
		store.setCashFenQiStoreData({
			loanMoney,
			loanDate,
			loanUsage,
			prdId,
			priceMax,
			priceMin,
			perdRateList,
			contractList,
			usageList,
			couponInfo,
			deratePrice,
			resaveBankCardAgrNo,
			payBankCardAgrNo,
			couponData,
			payBankCode,
			resaveBankCode
		});
		store.setCashFenQiCardArr([resaveCard, payCard]);
	};

	// 清空暂存数据,但不清除选择的银行卡
	removeTempData = () => {
		store.removeCashFenQiStoreData();
		console.log(this.state.perdRateList);
		this.setState({
			perdRateList: this.state.perdRateList
		});
	};

	//处理数据反显
	handleDataDisplay = (storeData = {}, cardArr = []) => {
		let tempResaveCard = cardArr[0] || {};
		let tempPayCard = cardArr[1] || {};
		let perdRateList = [];
		let usageList = [];
		let {
			agrNo: resaveBankCardAgrNo,
			bankName: resaveBankCardName,
			lastCardNo: resaveBankCardLastNo
		} = tempResaveCard;
		let resaveBankCode = tempResaveCard && (tempResaveCard.bankCode || tempResaveCard.bankCd);
		let { agrNo: payBankCardAgrNo, bankName: payBankCardName, lastCardNo: payBankCardLastNo } = tempPayCard;
		let payBankCode = tempPayCard && (tempPayCard.bankCode || tempPayCard.bankCd);
		if (!resaveBankCardAgrNo) {
			//处理用户无卡,去绑定的反显问题
			resaveBankCardAgrNo = payBankCardAgrNo;
			resaveBankCardName = payBankCardName;
			resaveBankCardLastNo = payBankCardLastNo;
			resaveBankCode = payBankCode;
		} else if (!payBankCardAgrNo) {
			payBankCardAgrNo = resaveBankCardAgrNo;
			payBankCardName = resaveBankCardName;
			payBankCardLastNo = resaveBankCardLastNo;
			payBankCode = resaveBankCode;
		}
		if (this.state.inputClear || !storeData.perdRateList || !storeData.usageList) {
			perdRateList = this.state.perdRateList;
			usageList = this.state.usageList;
		} else {
			perdRateList = storeData.perdRateList;
			usageList = storeData.usageList;
		}
		let data = Object.assign({}, storeData, {
			resaveBankCardAgrNo,
			resaveBankCardName,
			resaveBankCardLastNo,
			payBankCardAgrNo,
			payBankCardName,
			payBankCardLastNo,
			perdRateList,
			usageList,
			payBankCode,
			resaveBankCode
		});
		this.setState({ ...data }, () => {
			this.shouldQueryContractList(storeData, this.state);
		});
	};

	//验证信息是否填写完整
	validateFn = () => {
		const { loanMoney, loanDate, resaveBankCardAgrNo, payBankCardAgrNo, prdId } = this.state;
		if (
			loanMoney &&
			loanDate &&
			resaveBankCardAgrNo &&
			payBankCardAgrNo &&
			prdId &&
			(store.getSaveEmptyContactList() || store.getSaveContactList())
		) {
			return true;
		}
		return false;
	};

	// 处理优惠券金额显示
	dealMoney = (couponInfo, prdId) => {
		let storeData = store.getCashFenQiStoreData() || {}; // 代提交的借款信息
		this.props.$fetch
			.get(API.doCouponCount, {
				prodId: prdId,
				couponId: couponInfo.usrCoupNo,
				type: '00', // 00为借款 01为还款
				price: this.state.loanMoney || storeData.loanMoney,
				prodType: '11'
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					this.setState({
						couponInfo, // 计算之后更新state的优惠券信息
						deratePrice: result.data.deratePrice
					});
				} else {
					this.props.toast.info(result.msgInfo);
				}
			})
			.catch(() => {
				this.removeTempData();
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
			this.queryProdInfoByMoney();
			buriedPointEvent(loan_fenqi.moneyBlur, { loanMoney });
		});
	};

	//借款申请提交
	loanApplySubmit = () => {
		const { loanMoney, loanDate } = this.state;
		if (!(store.getSaveEmptyContactList() || store.getSaveContactList())) {
			this.props.toast.info('请选择指定联系人');
			return;
		}
		if (this.validateFn()) {
			buriedPointEvent(loan_fenqi.clickSubmit, {
				loanMoney,
				loanDate: loanDate.perdCnt
			});
			this.checkProtocolBindCard();
		}
	};

	submitHandler = () => {
		const { loanMoney, loanUsage, resaveBankCardAgrNo, payBankCardAgrNo, prdId, couponInfo } = this.state;
		let contactParams = '';
		const selectedList = [];
		if (store.getSelContactList() && store.getSelContactList().length) {
			store.getSelContactList().map((item) => {
				selectedList.push({
					num: item.number,
					n: item.name
				});
			});
			contactParams = selectedList;
		} else if (store.getSelEmptyContactList()) {
			store.getSelEmptyContactList().map((item) => {
				selectedList.push({
					num: item.number,
					n: item.name
				});
			});
			contactParams = selectedList;
		}
		this.props.$fetch
			.post(API.agentRepay, {
				withDrawAgrNo: resaveBankCardAgrNo, // 代还信用卡主键
				withHoldAgrNo: payBankCardAgrNo, // 还款卡号主键
				prdId, // 产品ID
				repayType: '0', // 还款方式
				coupId: couponInfo.coupId || '', // 优惠劵id
				price: loanMoney, // 签约金额
				osType: getDeviceType(), // 操作系统
				prodType: '11',
				channelType: 'h5',
				loanUsage: loanUsage.value,
				contactList: contactParams
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					// 清除卡信息
					store.removeCardData();
					// 清除借款中总的联系人
					store.removeContactList();
					// 清除借款选中的五个联系人
					store.removeSelContactList();
					store.removeSelEmptyContactList();
					store.removeSaveContactList();
					store.removeSaveEmptyContactList();
					this.props.toast.info('签约成功，请留意放款通知！');
					setTimeout(() => {
						this.props.history.push('/home/home');
					}, 2000);
					buriedPointEvent(loan_fenqi.submitResult, {
						is_success: true
					});
				} else {
					this.props.toast.info(res.msgInfo);
					buriedPointEvent(loan_fenqi.submitResult, {
						is_success: false,
						fail_cause: res.msgInfo
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

	// 关闭短信弹窗并还款
	closeSmsModal = () => {
		this.setState({
			isShowSmsModal: false,
			smsCode: ''
		});
		this.submitHandler();
	};

	// 确认协议绑卡
	confirmProtocolBindCard = () => {
		const { payBankCardAgrNo } = this.state;
		if (!this.state.smsCode) {
			this.props.toast.info('请输入验证码');
			return;
		}
		if (this.state.smsCode.length !== 6) {
			this.props.toast.info('请输入正确的验证码');
			return;
		}
		buriedPointEvent(loan_fenqi.protocolBindBtnClick);
		this.props.$fetch
			.post(API.protocolBind, {
				cardNo: payBankCardAgrNo,
				smsCd: this.state.smsCode,
				isEntry: '01'
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					this.closeSmsModal();
				} else if (res.msgCode === 'PTM9901') {
					this.props.toast.info(res.data);
					this.setState({ smsCode: '' });
					buriedPointEvent(loan_fenqi.protocolBindFail, { reason: `${res.msgCode}-${res.msgInfo}` });
				} else if (res.msgCode === 'PTM9902') {
					//该卡完全绑不上
					this.setState({
						protocolSmsFailInfo: res.data,
						protocolSmsFailFlag: true,
						isShowSmsModal: true
					});
					buriedPointEvent(loan_fenqi.protocolBindFail, { reason: `${res.msgCode}-${res.msgInfo}` });
				} else {
					this.props.toast.info('绑卡失败，请换卡或重试');
					this.setState({
						smsCode: '',
						isShowSmsModal: false
					});
					buriedPointEvent(loan_fenqi.protocolBindFail, { reason: `${res.msgCode}-${res.msgInfo}` });
				}
			});
	};
	// 协议绑卡校验接口
	checkProtocolBindCard = () => {
		const { payBankCardAgrNo, payBankCode } = this.state;
		const params = {
			cardNo: payBankCardAgrNo,
			bankCd: payBankCode,
			usrSignCnl: getH5Channel(),
			cardTyp: 'D',
			isEntry: '01',
			type: '1' // 0 可以重复 1 不可以重复
		};
		this.props.$fetch.post(API.protocolSms, params).then((res) => {
			switch (res.msgCode) {
				case 'PTM0000':
					//协议绑卡校验成功提示（走协议绑卡逻辑）
					this.setState({
						isShowSmsModal: true
					});
					break;
				case 'PTM9901':
					this.props.toast.info(res.data);
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.msgCode}-${res.msgInfo}` });
					break;
				case 'PTM9902':
					//该卡完全绑不上
					this.setState({
						protocolSmsFailInfo: res.data,
						protocolSmsFailFlag: true,
						isShowSmsModal: true
					});
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.msgCode}-${res.msgInfo}` });
					break;
				case '1010': // 银行卡已经绑定 直接继续往下走
					this.submitHandler();
					break;
				case 'PBM1010':
					this.props.toast.info(res.msgInfo);
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.msgCode}-${res.msgInfo}` });
					break;
				default:
					this.props.toast.info('暂不支持该银行卡，请换卡重试');
					buriedPointEvent(loan_fenqi.protocolSmsFail, { reason: `${res.msgCode}-${res.msgInfo}` });
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
		const { contactList } = this.state;
		if (contactList.length) {
			if (store.getSelContactList()) {
				this.props.history.push({
					pathname: '/home/contact_result_page'
				});
			} else {
				this.props.history.push({
					pathname: '/home/reco_contact_page',
					state: {
						contactList: contactList
					}
				});
			}
		} else {
			this.props.history.push({
				pathname: '/home/add_contact_page'
			});
		}
	};

	render() {
		const {
			usageModal,
			prdId,
			loanUsage: loanUsageObj,
			usageList,
			loanDate,
			loanMoney,
			planModal,
			resaveBankCardAgrNo,
			resaveBankCardLastNo,
			resaveBankCardName,
			payBankCardAgrNo,
			payBankCardLastNo,
			payBankCardName,
			perdRateList,
			priceMax = '',
			priceMin = '',
			contractList,
			repayPlanInfo,
			deratePrice,
			couponData,
			isShowSmsModal,
			smsCode
		} = this.state;
		return (
			<div className={style.fenqi_page}>
				<div className={style.scrollWrap}>
					<div className={style.inputWrap}>
						<div className={style.billInpBox}>
							<i className={style.moneyUnit}>¥</i>
							<InputItem
								className={style.billInput}
								placeholder={`可借金额${priceMin}～${priceMax}`}
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
												this.removeTempData();
											}
										);
									}
									this.setState({
										loanMoney: v,
										loanDate: ''
									});
								}}
								onBlur={(v) => {
									v && this.calcLoanMoney(Number(v));
								}}
							/>
						</div>
						<p className={style.inputTip}>建议全部借出，借款后剩余额度将不可用</p>
					</div>

					<div className={style.pannel}>
						<ul>
							<li className={style.listItem}>
								<label>借多久</label>
								<span className={style.tagListWrap}>
									{perdRateList.map((item) => (
										<span
											key={item.perdCnt}
											className={[
												style.tagButton,
												loanDate.perdCnt === item.perdCnt && style.tagButtonActive
											].join(' ')}
											onClick={() => {
												this.selectLoanDate(item);
											}}
										>
											{item.perdPageNm}
										</span>
									))}
								</span>
							</li>
							<li className={style.listItem}>
								<label>借款用途</label>
								<span
									onClick={() => {
										this.openModal('usage');
									}}
									className={style.listValue}
								>
									{loanUsageObj && loanUsageObj.loanUsage}
									<Icon type="right" className={style.icon} />
								</span>
							</li>
							<li className={style.listItem}>
								<label>还款计划</label>
								<span>
									{loanMoney && loanDate && prdId ? (
										<span className={style.listValue} onClick={this.queryRepayPlan}>
											点击查看
											<Icon type="right" className={style.icon} />
										</span>
									) : (
										<span className={style.greyText}>暂无</span>
									)}
								</span>
							</li>
							<li className={style.listItem} onClick={this.handleClickChooseContact}>
								<label>指定联系人</label>
								<span className={style.listValue}>
									请选择
									<Icon type="right" className={style.icon} />
								</span>
							</li>
							{loanMoney && loanDate && prdId && (
								<li className={style.listItem}>
									<label>优惠券</label>
									<div className={`${style.listValue} ${style.couponListValue}`} onClick={this.selectCoupon}>
										{couponData && Number(couponData.availableCoupAmt) ? (
											<div className={style.redText}>
												{deratePrice ? (
													`${deratePrice}`
												) : (
													<span className={style.couNumBox}>
														<i />
														{couponData.availableCoupAmt}个可用
													</span>
												)}
											</div>
										) : (
											<span className={style.greyText}>无可用优惠券</span>
										)}
										<Icon type="right" className={style.icon} />
									</div>
								</li>
							)}
							<li className={style.listItem}>
								<label>收款银行卡</label>
								{resaveBankCardAgrNo ? (
									<span
										className={style.listValue}
										onClick={() => {
											this.selectBankCard(resaveBankCardAgrNo, 'resave');
										}}
									>
										{resaveBankCardName}({resaveBankCardLastNo})
										<Icon type="right" className={style.icon} />
									</span>
								) : (
									<span
										className={style.highlightText}
										onClick={() => {
											this.bindBankCard('resave');
										}}
									>
										绑定储蓄卡 <i className={style.addIcon}>+</i>
									</span>
								)}
							</li>
							<li className={style.listItem}>
								<label>还款银行卡</label>
								{payBankCardAgrNo ? (
									<span
										className={style.listValue}
										onClick={() => {
											this.selectBankCard(payBankCardAgrNo, 'pay');
										}}
									>
										{payBankCardName}({payBankCardLastNo})
										<Icon type="right" className={style.icon} />
									</span>
								) : (
									<span
										className={style.highlightText}
										onClick={() => {
											this.bindBankCard('pay');
										}}
									>
										绑定储蓄卡 <i className={style.addIcon}>+</i>
									</span>
								)}
							</li>
						</ul>
						{loanMoney && loanDate && contractList.length > 0 && (
							<p className={style.protocolLink}>
								点击“签约借款”，表示同意{' '}
								{contractList.map((item, idx) => (
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
						onClick={this.loanApplySubmit}
						className={this.validateFn() ? style.submitBtn : style.submitBtnDisabled}
					>
						签约借款
					</SXFButton>
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
								className={style.modalItem}
								key={item.value}
								onClick={() => {
									this.selectLoanUsage(item);
								}}
							>
								{item.loanUsage}
							</li>
						))}
					</ul>
				</Modal>

				<RepayPlanModal
					visible={planModal}
					onClose={() => {
						this.closeModal('plan');
					}}
					data={repayPlanInfo.perd}
					loanMoney={loanMoney}
					history={this.props.history}
					goPage={() => {
						this.props.history.push('/home/payment_notes');
					}}
				/>

				{isShowSmsModal && (
					<SmsModal
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
							this.selectBankCard(payBankCardAgrNo, 'pay');
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
						bankNo={payBankCardAgrNo}
					/>
				)}
			</div>
		);
	}
}
