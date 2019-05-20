import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { isWXOpen, getDeviceType, getNextStr, getFirstError, handleInputBlur, idChkPhoto, isCanLoan } from 'utils';
import { isMPOS } from 'utils/common';
import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { home, mine, activity } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import Carousels from 'components/Carousels';
import style from './index.scss';
import mockData from './mockData';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import { CarouselHome, BlackCard, MsgTip, MoneyCard, ProgressBlock, HomeModal } from './components';
let isinputBlur = false;
const API = {
	BANNER: '/my/getBannerList', // 0101-banner
	// qryPerdRate: '/bill/qryperdrate', // 0105-确认代还信息查询接口
	qryPerdRate: '/bill/prod',
	USR_INDEX_INFO: '/index/usrIndexInfo', // 0103-首页信息查询接口
	CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
	CHECK_CARD: '/my/chkCard', // 0410-是否绑定了银行卡
	AGENT_REPAY_CHECK: '/bill/agentRepayCheck', // 复借风控校验接口
	procedure_user_sts: '/procedure/user/sts', // 判断是否提交授信
	chkCredCard: '/my/chkCredCard', // 查询信用卡列表中是否有授权卡
	readAgreement: '/index/saveAgreementViewRecord', // 上报我已阅读协议
	creditSts: '/bill/credit/sts', // 用户是否过人审接口
	checkJoin: '/jjp/checkJoin', // 用户是否参与过拒就赔
	queryUsrSCOpenId: '/my/queryUsrSCOpenId', // 用户标识
	usrCashIndexInfo: '/index/usrCashIndexInfo', // 现金分期首页接口
	indexshowType: '/index/showType' // 首页现金分期基本信息查询接口
};
let token = '';
let tokenFromStorage = '';

let timer;
let timerOut;
@createForm()
@fetch.inject()
@setBackGround('#fff')
export default class home_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			bannerList: [],
			isShowCreditModal: false,
			usrIndexInfo: '',
			haselescard: 'true',
			percentSatus: '',
			percent: 0,
			showToast: false,
			modalType: 'huodongTootip3',
			// handleMoxie: false, // 触发跳转魔蝎方法
			percentData: 0,
			showDiv: '',
			modal_left: false,
			activeTag: '',
			perdRateList: [],
			CardOverDate: false,
			pageCode: '',
			showAgreement: false, // 显示协议弹窗
			billOverDue: false, //逾期弹窗标志
			isShowActivityModal: false, // 是否显示活动弹窗
			visibleLoading: false, //认证弹窗
			isNeedExamine: false, // 是否需要人审
			modal_left2: false,
			dayPro: {},
			btnDisabled: true,
			usrCashIndexInfo: {},
			percentBtnText: '',
			overDueInf: {
				// 逾期弹框中的数据
			},
			overDueModalFlag: false, // 信用施压弹框标识
			blackData: {}
		};
	}

	componentWillMount() {
		// 获取token
		token = Cookie.get('fin-v-card-token');
		tokenFromStorage = store.getToken();
		// 清除一些store
		this.removeStore();
		// 埋点绑定
		this.queryUsrSCOpenId();
		// 获取token 并设置
		this.getTokenFromUrl();
		// 判断是否是微信打通（微信登陆）
		this.cacheBanner();
		this.indexshowType();
		// 重新设置HistoryRouter，解决点击两次才能弹出退出框的问题
		if (isWXOpen()) {
			store.setHistoryRouter(window.location.pathname);
		}
	}
	componentWillUnmount() {
		// 离开首页的时候 将 是否打开过底部弹框标志恢复
		store.removeHadShowModal();
		if (timer) {
			clearInterval(timer);
		}
		if (timerOut) {
			clearTimeout(timerOut);
		}
	}
	// 移除store
	removeStore = () => {
		// 删除授信弹窗信息
		store.removeLoanAspirationHome();
		// 清除返回的flag
		store.removeBackFlag();
		// 运营商直接返回的问题
		// store.removeCarrierMoxie();
		// 信用卡绑卡之后立即去提交页需要提示
		store.removeCreditSuccessBack();
		// 未提交授信用户
		store.removeCreditExtensionNot();
		// 去除需要调用获取下一步url方法
		store.removeNeedNextUrl();
		// 活体直接返回
		store.removeChkPhotoBackNew();
		// 清除订单缓存
		store.removeBackData();
		// 结清页去活动页
		store.removeSuccessPay();
		// 清除四项认证进入绑卡页的标识
		store.removeCheckCardRouter();
		//删除现金分期相关数据
		store.removeCashFenQiStoreData();
		store.removeCashFenQiCardArr();
	};
	// 首页现金分期基本信息查询接口
	indexshowType = () => {
		this.props.$fetch.post(API.indexshowType).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					blackData: result.data
				});
				if (result.data.cashAcBalSts === '1') {
					// 分期流程
					this.usrCashIndexInfo();
				} else {
					// 代偿流程
					this.credit_extension();
				}
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};
	// 现金分期首页接口
	usrCashIndexInfo = () => {
		this.props.$fetch.post(API.usrCashIndexInfo).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					usrCashIndexInfo: result.data
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};
	// 判断是否参与拒就赔活动
	isInvoking_jjp = () => {
		return new Promise((resolve, reject) => {
			this.props.$fetch
				.get(API.checkJoin)
				.then((res) => {
					// 0:不弹出  1:弹出
					if (res && res.msgCode === 'JJP0002') {
						// 用户没参加过拒就赔活动
						// 如果是活动来的，
						resolve('1');
					} else {
						resolve('0');
					}
				})
				.catch((err) => {
					reject();
				});
		});
	};

	// 判断是否授信
	credit_extension = () => {
		this.props.$fetch.post(API.procedure_user_sts).then(async (res) => {
			if (res && res.msgCode === 'PTM0000') {
				// overduePopupFlag信用施压弹框，1为显示，0为隐藏
				// popupFlag信用施压弹框，1为显示，0为隐藏
				this.setState({
					showAgreement: res.data.agreementPopupFlag === '1',
					billOverDue: res.data.popupFlag === '1',
					overDueModalFlag: res.data.popupFlag === '0' && res.data.overduePopupFlag === '1'
				});
				const currProgress =
					res.data &&
					res.data.processInfo &&
					res.data.processInfo.length > 0 &&
					res.data.processInfo.filter((item, index) => {
						return item.hasProgress;
					});
				this.setState({
					overDueInf: currProgress && currProgress.length > 0 && currProgress[currProgress.length - 1]
				});
				let isInvoking_jjp = await this.isInvoking_jjp();
				if (res.data.flag === '01') {
					// 拒就赔活动弹框
					if (isInvoking_jjp === '1' && !store.getShowActivityModal()) {
						this.setState(
							{
								isShowActivityModal: true,
								modalType: 'jujiupei'
							},
							() => {
								store.setShowActivityModal(true);
							}
						);
					}

					this.credit_extension_not();
				} else {
					this.requestGetUsrInfo(isInvoking_jjp);
				}
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};
	// 从 url 中获取参数，如果有 token 就设置下
	getTokenFromUrl = () => {
		const urlParams = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (urlParams.token) {
			Cookie.set('fin-v-card-token', urlParams.token, { expires: 365 });
			store.setToken(urlParams.token);
		}
	};

	// 首页进度
	getPercent = async () => {
		const { usrIndexInfo } = this.state;
		const autId = usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId;
		let data = await getNextStr({ $props: this.props, needReturn: true, autId });
		console.log(data.btnText);
		this.calculatePercent(data);
	};

	// 进度计算
	calculatePercent = (data, isshow) => {
		console.log(data, '0000000000');
		let codes = [];
		let demo = data.codes;
		// let demo = '2224'
		this.setState({
			pageCode: demo
		});
		let codesCopy = demo.slice(1, 4);
		codes = codesCopy.split('');
		// case '0': // 未认证
		// case '1': // 认证中
		// case '2': // 认证成功
		// case '3': // 认证失败
		// case '4': // 认证过期
		let newCodes = codes.filter((ele, index, array) => {
			return ele === '0';
		});
		let newCodes2 = codes.filter((ele, index, array) => {
			return ele === '1' || ele === '2';
		});
		let newCodes3 = codes.filter((ele, index, array) => {
			return ele === '4';
		});
		if (codes[codes.length - 1] === '4') {
			this.setState({
				CardOverDate: true
			});
		}
		// console.log(newCodes, newCodes2, newCodes3);
		// 还差 2 步 ：三项认证项，完成任何一项认证项且未失效
		// 还差 1 步 ：三项认证项，完成任何两项认证项且未失效
		// 还差 0 步 ：三项认证项，完成任何三项认证项且未失效（不显示）
		if (newCodes.length === 3) {
			this.setState({
				percentSatus: '3',
				showDiv: '50000'
			});
			return;
		}
		if (
			codes.length !== 0 &&
			newCodes2.length === 0 &&
			(newCodes3.length === 3 || newCodes3.length === 2 || newCodes3.length === 1)
		) {
			//认证过期
			this.setState({
				showDiv: 'circle',
				percentSatus: '3',
				percentData: 60,
				percentBtnText: data.btnText
			});
			return;
		}
		switch (newCodes2.length) {
			case 0: // 新用户，信用卡未授权
				this.setState({
					percentSatus: '3',
					showDiv: '50000',
					percentBtnText: data.btnText
				});
				break;

			case 1: // 新用户，运营商未授权/基本信息未认证
				this.setState({
					percentSatus: '2',
					percentData: 80,
					showDiv: 'circle',
					percentBtnText: data.btnText
				});
				break;

			case 2: // 新用户，信用卡未授权
				this.setState({
					percentData: 98,
					percentSatus: isshow ? '1' : '',
					showDiv: 'circle',
					percentBtnText: data.btnText
				});
				break;
			case 3: // 新用户，信用卡未授权
				this.setState({
					percentData: '',
					percentSatus: '',
					showDiv: ''
				});
				break;
			default:
		}
	};
	// 智能按钮点击事件
	handleSmartClick = () => {
		const { usrIndexInfo, isNeedExamine } = this.state;
		if (usrIndexInfo.indexSts === 'LN0009') {
			// 埋点-首页-点击查看代还账单
			buriedPointEvent(home.viewBill);
		} else {
			// 埋点-首页-点击一键还卡（代还）
			buriedPointEvent(home.easyRepay, {
				stateType: usrIndexInfo.indexSts
			});
		}
		switch (usrIndexInfo.indexSts) {
			case 'LN0001': // 新用户，信用卡未授权
				this.goToNewMoXie();
				break;
			case 'LN0002': // 账单爬取中
				break;
			case 'LN0003': // 账单爬取成功 (直接跳数据风控)
				console.log('LN0003 无风控信息 直接跳数据风控');
				buriedPointEvent(home.repaymentBtnClick3);
				buriedPointEvent(mine.creditExtension, {
					entry: '首页'
				});
				if (this.state.CardOverDate) {
					this.props.toast.info('当前信用卡已过期，请重新导入');
					setTimeout(() => {
						// 跳新版魔蝎
						store.setMoxieBackUrl('/home/home');
						this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
					}, 2000);
				} else if (usrIndexInfo.indexData.autSts === '2') {
					if (
						!isCanLoan({
							$props: this.props,
							usrIndexInfo: this.state.usrIndexInfo,
							goMoxieBankList: this.child.requestCredCardCount
						})
					) {
						return;
					}
					this.showCreditModal();
				}
				break;
			case 'LN0004': // 代还资格审核中
				console.log('LN0004');
				this.props.toast.info('正在审批中，请耐心等待');
				break;
			case 'LN0005': // 暂无代还资格
				console.log('LN0005');
				this.props.toast.info(
					`您暂时没有代偿资格，请${dayjs(usrIndexInfo.indexData.netAppyDate).format('YYYY-MM-DD')}日再试`
				);
				break;
			case 'LN0006': // 风控审核通过
				console.log('LN0006');
				buriedPointEvent(home.repaymentBtnClick6);
				this.repayCheck();
				break;
			case 'LN0007': // 放款中
				console.log('LN0007');
				if (isNeedExamine) {
					this.props.history.push('/home/loan_apply_succ_page');
				} else {
					this.props.toast.info(
						`您的代偿资金将于${dayjs(usrIndexInfo.indexData.repayDt).format('YYYY-MM-DD')}到账，请耐心等待`
					);
				}
				break;
			case 'LN0008': // 放款失败
				console.log('LN0008 不跳账单页 走弹框流程');
				buriedPointEvent(home.repaymentBtnClick8);
				this.repayCheck();
				break;
			case 'LN0009': // 放款成功
				console.log('LN0009');
				store.setBillNo(usrIndexInfo.indexData.billNo);
				// entryFrom 给打点使用，区分从哪个页面进入订单页的
				this.props.history.push({ pathname: '/order/order_detail_page', search: '?entryFrom=home' });
				break;
			case 'LN0010': // 账单爬取失败/老用户 无按钮不做处理
				console.log('LN0010');
				break;
			default:
				console.log('default');
		}
	};

	// 设置百分比
	setPercent = (percent) => {
		if (this.state.percent < 90 && this.state.percent >= 0) {
			this.setState({
				percent: this.state.percent + parseInt(Math.random() * 10 + 1)
			});
		} else {
			clearInterval(timer);
		}
	};

	// 跳新版魔蝎
	goToNewMoXie = () => {
		store.setMoxieBackUrl(`/mine/credit_extension_page?noAuthId=true`);
		this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
	};

	// 请求用户绑卡状态
	requestBindCardState = () => {
		const { usrIndexInfo } = this.state;
		const autId = usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId;
		const api = autId ? `${API.chkCredCard}/${autId}` : API.CHECK_CARD;
		this.props.$fetch.get(api).then((result) => {
			if (result && result.msgCode === 'PTM0000') {
				// 有风控且绑信用卡储蓄卡
				this.props.history.push({
					pathname: '/home/confirm_agency',
					state: { indexData: usrIndexInfo && usrIndexInfo.indexData }
				});
			} else if (result && result.msgCode === 'PTM2003') {
				// 有风控没绑储蓄卡 跳绑储蓄卡页面
				store.setBackUrl('/home/home');
				this.props.toast.info(result.msgInfo);
				setTimeout(() => {
					this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
				}, 3000);
			} else if (result && result.msgCode === 'PTM2002') {
				// 有风控没绑信用卡 跳绑信用卡页面
				store.setBackUrl('/home/home');
				this.props.toast.info(result.msgInfo);
				setTimeout(() => {
					this.props.history.push({
						pathname: '/mine/bind_credit_page',
						search: `?noBankInfo=true&autId=${autId}`
					});
				}, 3000);
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	// 复借风控校验接口
	repayCheck = () => {
		const osType = getDeviceType();
		const params = {
			osTyp: osType
		};
		this.props.$fetch
			.post(API.AGENT_REPAY_CHECK, params)
			.then((result) => {
				if (result && result.msgCode === 'PTM0000') {
					this.requestBindCardState();
				} else {
					// 失败的话刷新首页
					this.props.toast.info(result.msgInfo, 2, () => {
						this.requestGetUsrInfo();
					});
				}
				// })
			})
			.catch((err) => {
				clearInterval(timer);
				clearTimeout(timerOut);
				this.setState(
					{
						percent: 100
					},
					() => {
						this.setState({
							visibleLoading: false
						});
					}
				);
			});
	};

	// 获取 banner 列表
	requestGetBannerList = () => {
		const params = {
			type: 1,
			client: 'wap_out'
		};
		this.props.$fetch.post(API.BANNER, params, { hideLoading: true }).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				const bannerData = result.data.map((item) => ({
					src: `data:image/png;base64,${item.picUrl}`,
					url: item.gotoFlag !== 0 ? item.gotoUrl : '',
					title: item.title
				}));
				const inFifteenMinutes = new Date(new Date().getTime() + 1000 * 60 * 2);
				Cookie.set('bannerAble', true, { expires: inFifteenMinutes });
				store.setBannerData(bannerData);
				this.setState({
					bannerList: bannerData
				});
			}
		});
	};

	handleApply = () => {
		if (this.state.showDiv === '50000') {
			// 埋点-首页-点击申请信用卡代还按钮
			buriedPointEvent(home.applyCreditRepayment);
		}
		console.log('2222222222');
		const { usrIndexInfo } = this.state;
		const autId = usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId;
		getNextStr({
			$props: this.props,
			autId,
			callBack: (resBackMsg) => {
				if (this.state.showDiv === 'circle') {
					buriedPointEvent(home.homeContinueApply, {
						next_step: resBackMsg
					});
				}
			}
		});
	};
	// 未提交授信
	credit_extension_not = async () => {
		const { usrIndexInfo } = this.state;
		const autId = usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId;
		let data = await getNextStr({ $props: this.props, needReturn: true, autId });
		store.setCreditExtensionNot(true);
		this.calculatePercent(data, true);
	};
	// 获取首页信息
	requestGetUsrInfo = (isInvoking_jjp) => {
		this.props.$fetch.post(API.USR_INDEX_INFO).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				// if (result.data.indexSts === 'LN0003') {
				// 	this.getPercent();
				// }
				if (result.data.indexSts === 'LN0007') {
					// 获取是否需要人审
					this.getExamineSts();
				}
				this.setState(
					{
						usrIndexInfo: result.data.indexData
							? result.data
							: Object.assign({}, result.data, { indexData: {} })
					},
					() => {
						this.getPercent();
					}
				);
				if (isInvoking_jjp === '1' && !store.getShowActivityModal()) {
					this.setState(
						{
							isShowActivityModal: true,
							modalType: 'jujiupei'
						},
						() => {
							store.setShowActivityModal(true);
						}
					);
				} else if (
					isMPOS() &&
					(result.data.indexSts === 'LN0001' || result.data.indexSts === 'LN0003') &&
					!store.getShowActivityModal()
				) {
					// 老弹窗（3000元）
					this.setState(
						{
							isShowActivityModal: true,
							modalType: 'huodongTootip3'
						},
						() => {
							store.setShowActivityModal(true);
						}
					);
				}
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};
	// 缓存banner
	cacheBanner = () => {
		const bannerAble = Cookie.getJSON('bannerAble');
		const bannerDataFromSession = store.getBannerData();
		if (bannerAble && bannerDataFromSession && JSON.stringify(bannerDataFromSession) !== '{}') {
			this.setState({
				bannerList: bannerDataFromSession
			});
		} else {
			this.requestGetBannerList();
		}
	};

	// 去登陆
	handleNeedLogin = () => {
		if (!token || !tokenFromStorage) {
			this.props.toast.info('请先登录', 2, () => {
				this.props.history.push({ pathname: '/login', state: { isAllowBack: true } });
			});
		}
	};

	showCreditModal = () => {
		const { usrIndexInfo } = this.state;
		const { cardBillSts } = usrIndexInfo.indexData;
		if (cardBillSts === '00') {
			this.props.toast.info('还款日已到期，请更新账单获取最新账单信息');
			return;
		} else if (cardBillSts === '02') {
			this.props.toast.info('已产生新账单，请更新账单或代偿其他信用卡', 2, () => {
				// 跳新版魔蝎
				store.setMoxieBackUrl('/home/home');
				this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
			});
			return;
		}
		this.setState({
			isShowCreditModal: true
		});
	};

	// 神策用户绑定
	queryUsrSCOpenId = () => {
		if (!store.getQueryUsrSCOpenId()) {
			this.props.$fetch.get(API.queryUsrSCOpenId).then((res) => {
				console.log(res);
				if (res.msgCode === 'PTM0000') {
					sa.login(res.data);
					store.setQueryUsrSCOpenId(res.data);
				}
			});
		}
	};
	// 获取是否需要人审
	getExamineSts = () => {
		this.props.$fetch.post(`${API.creditSts}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState({
					isNeedExamine: res.data && res.data.flag === '01' && res.data.ptMark === '01'
				});
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};
	// 现金分期点击事件
	handleCN = (code) => {
		switch (code) {
			case 'CN0003':
				this.props.history.push('/home/loan_fenqi');
				break;
			case 'CN0004':
				this.props.toast.info('正在放款中，马上到账');
				break;
			case 'CN0005':
				const { usrCashIndexInfo } = this.state;
				store.setBillNo(usrCashIndexInfo.indexData.billNo);
				this.props.history.push({
					pathname: '/order/order_detail_page',
					search: '?entryFrom=home'
				});
				break;

			default:
				break;
		}
	};
	// *********************************************************** //
	// 关闭注册协议弹窗
	readAgreementCb = () => {
		this.props.$fetch.post(`${API.readAgreement}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState({
					showAgreement: false
				});
			}
		});
	};
	// 关闭活动弹窗
	closeActivityModal = () => {
		this.setState({
			isShowActivityModal: !this.state.isShowActivityModal
		});
	};
	// 弹窗 按钮事件
	activityModalBtn = (type) => {
		this.closeActivityModal();
		switch (type) {
			case 'huodongTootip3':
				// 有一键代还 就触发  或者绑定其他卡  跳魔蝎 或者不动  目前只考虑 00001  00003 1 ,2,3情况
				const { usrIndexInfo } = this.state;
				switch (usrIndexInfo.indexSts) {
					case 'LN0001': // 新用户，信用卡未授权
						this.goToNewMoXie();
						break;
					case 'LN0003': // 账单爬取成功
						if (usrIndexInfo.indexData && usrIndexInfo.indexData.autSts === '2') {
							this.handleSmartClick();
						} else {
							this.child.requestCredCardCount();
						}
						break;
					default:
						console.log('关闭弹窗');
				}
				break;
			case 'jjp': // 拒就赔弹框按钮
				buriedPointEvent(activity.jjpHomeModalClick);
				this.props.history.push('/activity/jupei_page?entry=isxdc_home_alert');
				break;
			default:
				break;
		}
	};
	// 逾期弹窗
	handleOverDueClick = () => {
		const { usrIndexInfo } = this.state;
		store.setBillNo(usrIndexInfo.indexData.billNo);
		this.props.history.push({
			pathname: '/order/order_detail_page',
			search: '?entryFrom=home'
		});
	};
	// *****************************分期****************************** //
	getFQDisPlay = () => {
		let componentsDisplay = null;
		const { usrCashIndexInfo } = this.state;
		switch (usrCashIndexInfo.indexSts) {
			case 'CN0001': // 现金分期额度评估中,不可能出现
				break;
			case 'CN0002': // (抱歉，暂无申请资格
				break;
			case 'CN0003': // 申请通过有额度
				componentsDisplay = (
					<MoneyCard
						handleClick={() => {
							this.handleCN(usrCashIndexInfo.indexSts);
						}}
						showData={{
							btnText: usrCashIndexInfo && usrCashIndexInfo.indexMsg,
							title: '还到-Plus',
							subtitle: '可提现金额(元)',
							money: usrCashIndexInfo && usrCashIndexInfo.indexData && usrCashIndexInfo.indexData.curAmt,
							desc: '你信用等级良好'
						}}
					/>
				);
				break;
			case 'CN0004': // 放款中
				componentsDisplay = (
					<MoneyCard
						handleClick={() => {
							this.handleCN(usrCashIndexInfo.indexSts);
						}}
						showData={{
							btnText: usrCashIndexInfo && usrCashIndexInfo.indexMsg,
							title: '还到-Plus',
							subtitle: '借款金额(元)',
							money:
								usrCashIndexInfo && usrCashIndexInfo.indexData && usrCashIndexInfo.indexData.orderAmt,
							desc: '你信用等级良好'
						}}
					/>
				);
				break;
			case 'CN0005': // 去还款
				componentsDisplay = (
					<MoneyCard
						handleClick={() => {
							this.handleCN(usrCashIndexInfo.indexSts);
						}}
						showData={{
							btnText: usrCashIndexInfo && usrCashIndexInfo.indexMsg,
							title: '还到-Plus',
							subtitle: '借款金额(元)',
							money:
								usrCashIndexInfo && usrCashIndexInfo.indexData && usrCashIndexInfo.indexData.orderAmt,
							desc: '你信用等级良好'
						}}
					/>
				);
				break;
			default:
		}
		return componentsDisplay;
	};
	// *****************************代偿****************************** //

	getDCDisPlay = () => {
		const { usrIndexInfo, showDiv, percentSatus, percentData, percentBtnText } = this.state;
		let componentsDisplay = null;
		console.log(showDiv);
		if (showDiv) {
			switch (showDiv) {
				case '50000':
					componentsDisplay = <CarouselHome handleClick={this.handleApply} />;
					break;
				case 'circle':
					componentsDisplay = (
						<ProgressBlock
							showData={{
								title: '还到-基础版',
								btnText: percentBtnText
							}}
							handleClick={this.handleApply}
							percentSatus={percentSatus}
							percentData={percentData}
						/>
					);
					break;

				default:
					break;
			}
		} else {
			switch (usrIndexInfo.indexSts) {
				case 'LN0001': // 新用户，信用卡未授权
					componentsDisplay = <CarouselHome handleClick={this.handleApply} />;
				case 'LN0002': // 账单爬取中
				case 'LN0003': // 账单爬取成功
				case 'LN0004': // 代还资格审核中
				case 'LN0005': // 暂无代还资格
				case 'LN0006': // 风控审核通过
				case 'LN0007': // 放款中
				case 'LN0008': // 放款失败
				case 'LN0009': // 放款成功
				case 'LN0010': // 账单爬取失败/老用户
					<CarouselHome />;
					break;
				default:
			}
		}

		return componentsDisplay;
	};

	render() {
		const {
			bannerList,
			percent,
			showAgreement,
			billOverDue,
			isShowActivityModal,
			visibleLoading,
			overDueInf,
			overDueModalFlag,
			modalType,
			blackData
		} = this.state;
		let componentsDisplay = null;
		let componentsBlackCard = <BlackCard blackData={{ cashAcBalSts: '3' }} />;
		if (JSON.stringify(blackData) !== '{}') {
			componentsBlackCard = <BlackCard blackData={blackData} />;
		}
		componentsDisplay = this.getFQDisPlay() ||
		this.getDCDisPlay() || <CarouselHome handleClick={this.handleNeedLogin} />;

		return (
			<div className={style.home_new_page}>
				<MsgTip $fetch={this.props.$fetch} history={this.props.history} />
				{componentsBlackCard}
				{componentsDisplay}
				{bannerList.length > 0 && (
					<Carousels className={style.home_banner} data={bannerList} entryFrom="banner" />
				)}
				<HomeModal
					showAgreement={showAgreement}
					modalType={modalType}
					percent={percent}
					history={this.props.history}
					toast={this.props.toast}
					isShowActivityModal={isShowActivityModal}
					billOverDue={billOverDue}
					overDueModalFlag={overDueModalFlag}
					overDueInf={overDueInf}
					visibleLoading={visibleLoading}
					readAgreementCb={this.readAgreementCb}
					handleOverDueClick={this.handleOverDueClick}
					activityModalBtn={this.activityModalBtn}
					closeActivityModal={this.closeActivityModal}
				/>
			</div>
		);
	}
}
