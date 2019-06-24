import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { isWXOpen, getDeviceType, getNextStr, isCanLoan, getMoxieData, dateDiffer } from 'utils';
import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { home, mine, activity, loan_fenqi } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import Carousels from 'components/Carousels';
import style from './index.scss';
import mockData from './mockData';
import { createForm } from 'rc-form';
import FeedbackModal from 'components/FeedbackModal';
import { setBackGround } from 'utils/background';
import TFDInit from 'utils/getTongFuDun';
// console.log(aa)
import {
	CarouselHome,
	BlackCard,
	MsgTip,
	MoneyCard,
	ProgressBlock,
	HomeModal,
	CardProgress,
	AddCards,
	ExamineCard
} from './components';
const API = {
	BANNER: '/my/getBannerList', // 0101-banner
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
	indexshowType: '/index/showType', // 首页现金分期基本信息查询接口
	CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
	CHECK_CARD_AUTH: '/auth/checkCardAuth/', // 查询爬取进度
	mxoieCardList: '/moxie/mxoieCardList/C', // 魔蝎银行卡列表
	cashShowSwitch: '/my/switchFlag/cashShowSwitchFlag', // 是否渲染现金分期
	checkKoubei: '/activeConfig/userCheck', //是否参与口碑活动,及新老用户区分
	couponTest: '/activeConfig/couponTest' //签约测试
};
let token = '';
let tokenFromStorage = '';

let timer;
let timerOut;

//隔5秒调取接口相关变量
let timerPercent; //计时器
let timers = 0; //时间秒级

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
			modalType: '',
			modalBtnFlag: false,
			// handleMoxie: false, // 触发跳转魔蝎方法
			percentData: 0,
			showDiv: '',
			modal_left: false,
			activeTag: '',
			perdRateList: [],
			CardOverDate: false,
			pageCode: '',
			showAgreement: false, // 显示协议弹窗
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
			blackData: {},
			cardStatus: '',
			statusSecond: '', //每隔5秒状态
			bizId: '', // 跳转到银行列表的autId
			userMaxAmt: '', // 最高可申请还款金(元)
			showFeedbackModal: false
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
		this.isRenderCash();
		this.showFeedbackModal();
		// 重新设置HistoryRouter，解决点击两次才能弹出退出框的问题
		if (isWXOpen()) {
			store.setHistoryRouter(window.location.pathname);
		}
		// 从进度页面返回不删除AutId
		if (!store.getAutId2()) {
			store.removeAutId();
		}

		// 隔5秒调取相关变量
		timers = 0;
		timerPercent = null;
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
		if (timerPercent) {
			clearInterval(timerPercent);
		}
	}
	// 移除store
	removeStore = () => {
		// 去除支付方式默认选中
		store.removePayType();
		// 去除借款页面参数
		store.removeHomeConfirmAgency();
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
		store.removeCouponData();
	};

	// 是否渲染现金分期模块
	isRenderCash = () => {
		this.props.$fetch
			.get(API.cashShowSwitch)
			.then((result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					if (result.data.value === '1') {
						if (token && tokenFromStorage) {
							this.indexshowType();
						} else {
							this.setState({
								blackData: { cashAcBalSts: '4' }
							});
						}
					} else {
						if (token && tokenFromStorage) {
							this.credit_extension();
						}
					}
				} else {
					this.props.toast.info(result.msgInfo);
				}
			})
			.catch((err) => {
				if (token && tokenFromStorage) {
					this.credit_extension();
				}
			});
	};
	// 首页现金分期基本信息查询接口
	indexshowType = () => {
		this.props.$fetch.post(API.indexshowType).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					blackData: result.data
				});
				if (result.data.cashAcBalSts === '1' || result.data.cashAcBalSts === '3') {
					// 分期流程
					this.usrCashIndexInfo(result.data.cashAcBalSts);
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
	usrCashIndexInfo = (code) => {
		this.props.$fetch.post(API.usrCashIndexInfo).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState(
					{
						usrCashIndexInfo: result.data
					},
					() => {
						if (code === '1' && !store.getFQActivity() && this.state.usrCashIndexInfo.indexSts === 'CN0003') {
							store.setFQActivity(true);
							this.setState({
								modalType: 'xianjin',
								isShowActivityModal: true
							});
						}
					}
				);
			} else {
				this.props.toast.info(result.msgInfo);
			}
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
				this.requestGetUsrInfo();
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
		let data = await getNextStr({ $props: this.props, needReturn: true });
		this.calculatePercent(data);
	};

	// 进度计算
	calculatePercent = (data, isshow) => {
		const { usrIndexInfo } = this.state;
		let codes = [];
		let demo = data.codes;
		// console.log(demo, 'demo');
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
				showDiv: '50000',
				percentBtnText: demo[0] === '0' || demo[0] === '4' ? '' : data.btnText
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
			case 3: // 显示信用卡爬取进度
				// 获取爬取卡的进度
				if (store.getAutId()) {
					this.goProgress();
				} else if (usrIndexInfo && usrIndexInfo.indexSts && usrIndexInfo.indexSts === 'LN0003') {
					this.setState({
						showDiv: 'applyCredict'
					});
				} else {
					this.setState({
						showDiv: '',
						percentData: '',
						percentSatus: ''
					});
				}
				break;
			default:
		}
	};

	showFeedbackModal = () => {
		if (store.getGotoMoxieFlag()) {
			this.setState({
				showFeedbackModal: true
			});
		}
	};

	closeFeedbackModal = () => {
		this.setState({
			showFeedbackModal: false
		});
		store.removeGotoMoxieFlag();
	};

	// 请求信用卡数量
	requestCredCardCount = (type, callback) => {
		// 爬取卡进度页特殊处理
		const { bizId } = this.state;
		this.props.$fetch
			.post(API.CRED_CARD_COUNT)
			.then((result) => {
				if (result && result.msgCode === 'PTM0000') {
					if (type && type === 'progress') {
						if (result.data.count > 1) {
							store.setToggleMoxieCard(true);
							this.props.history.replace(`/mine/credit_list_page?autId=${bizId}`);
						} else {
							this.props.history.replace('/home/loan_repay_confirm_page');
						}
					} else if (type && type === 'cbFn') {
						if (result.data.count > 1) {
							store.setToggleMoxieCard(true);
							this.props.history.replace(`/mine/credit_list_page?autId=${bizId}`);
						} else {
							callback && callback();
						}
					} else {
						this.repayForOtherBank(result.data.count);
					}
				} else {
					this.props.toast.info(result.msgInfo);
				}
			})
			.catch((err) => {
				this.props.toast.info(err.message);
			});
	};

	// 代还其他信用卡点击事件
	repayForOtherBank = (count) => {
		if (count > 1) {
			store.setToggleMoxieCard(true);
			const { usrIndexInfo } = this.state;
			this.props.history.push({
				pathname: '/mine/credit_list_page',
				search: `?autId=${usrIndexInfo.indexSts === 'LN0010' ? '' : usrIndexInfo.indexData.autId}`
			});
		} else {
			this.goToNewMoXie();
		}
	};

	// 智能按钮点击事件
	handleSmartClick = (days) => {
		const { usrIndexInfo = {}, isNeedExamine } = this.state;
		const { indexData } = usrIndexInfo;
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
				// console.log('LN0003 无风控信息 直接跳数据风控');
				buriedPointEvent(home.applyLoan);
				buriedPointEvent(mine.creditExtension, {
					entry: '首页'
				});
				if (this.state.CardOverDate) {
					this.props.toast.info('当前信用卡已过期，请重新导入');
					setTimeout(() => {
						// 跳新版魔蝎
						this.goToNewMoXie();
					}, 2000);
				} else if (usrIndexInfo.indexData.autSts === '2') {
					if (
						!isCanLoan({
							$props: this.props,
							usrIndexInfo: this.state.usrIndexInfo,
							goMoxieBankList: this.requestCredCardCount
						})
					) {
						return;
					}
					this.jumpToUrl();
				}
				break;
			case 'LN0004': // 代还资格审核中
				buriedPointEvent(home.machineAudit);
				this.props.history.push({
					pathname: '/home/credit_apply_succ_page',
					search: `?autId=${indexData.autId}`
				});
				break;
			case 'LN0005': // 暂无代还资格
				console.log('LN0005');
				days && days > 60
					? this.props.toast.info(`您暂时没有代偿资格`)
					: this.props.toast.info(
							`您暂时没有代偿资格，请${dayjs(usrIndexInfo.indexData.netAppyDate).format('YYYY-MM-DD')}日再试`
					  );
				break;
			case 'LN0006': // 风控审核通过
				console.log('LN0006');
				buriedPointEvent(home.signedLoan);
				this.repayCheck();
				break;
			case 'LN0007': // 放款中
				console.log('LN0007');
				let title =
					indexData.repayType === '0'
						? `预计60秒完成放款`
						: `${dayjs(indexData.repayDt).format('YYYY年MM月DD日')}完成放款`;
				let desc = indexData.repayType === '0' ? `超过2个工作日没有放款成功，可` : '如有疑问，可';
				this.props.history.push({
					pathname: '/home/loan_apply_succ_page',
					search: `?title=${title}&desc=${desc}&autId=${indexData.autId}`
				});
				break;
			case 'LN0008': // 放款失败
				console.log('LN0008 不跳账单页 走弹框流程');
				buriedPointEvent(home.signedLoan);
				this.repayCheck();
				break;
			case 'LN0009': // 放款成功
				console.log('LN0009');
				store.setBillNo(usrIndexInfo.indexData.billNo);
				// entryFrom 给打点使用，区分从哪个页面进入订单页的
				this.props.history.push({
					pathname: '/order/order_detail_page',
					search: '?entryFrom=home'
				});
				break;
			case 'LN0010': // 账单爬取失败/老用户 无按钮不做处理
				console.log('LN0010');
				break;
			case 'LN0011': // 账单爬取失败/老用户 无按钮不做处理
				this.props.history.push('/home/loan_person_succ_page');
				break;
			default:
				console.log('default');
		}
	};

	jumpToUrl = () => {
		const { usrIndexInfo, pageCode } = this.state;
		const { cardBillSts, bankNo } = usrIndexInfo.indexData;
		if (cardBillSts === '00') {
			this.requestCredCardCount('cbFn', () => {
				this.props.toast.info('还款日已到期，请更新账单获取最新账单信息', 2, () => {
					// 跳银行登录页面
					getMoxieData({
						$props: this.props,
						bankCode: bankNo,
						goMoxieBankList: this.goToNewMoXie
					});
				});
			});
			return;
		} else if (cardBillSts === '02') {
			this.requestCredCardCount('cbFn', () => {
				this.props.toast.info('已产生新账单，请更新账单或代偿其他信用卡', 2, () => {
					// 跳银行登录页面
					getMoxieData({
						$props: this.props,
						bankCode: bankNo,
						goMoxieBankList: this.goToNewMoXie
					});
				});
			});
			return;
		}
		this.requestCredCardCount('cbFn', () => {
			this.props.history.push('/home/loan_repay_confirm_page');
		});
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
		store.setMoxieBackUrl(`/home/crawl_progress_page`);
		store.setBackUrl('/home/loan_repay_confirm_page');
		// store.setMoxieBackUrl(`/mine/credit_extension_page?noAuthId=true`);
		this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
	};
	// 请求用户绑卡状态
	requestBindCardState = () => {
		const { usrIndexInfo = {} } = this.state;
		const { indexData = {} } = usrIndexInfo;
		const autId = usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId;
		const api = autId ? `${API.chkCredCard}/${autId}` : API.CHECK_CARD;
		this.props.$fetch.get(api).then((result) => {
			if (result && result.msgCode === 'PTM0000') {
				store.setHomeConfirmAgency({
					autId: usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId,
					bankName: indexData.bankName,
					cardNoHid: indexData.cardNoHid
				});
				// 有风控且绑信用卡储蓄卡
				this.props.history.push({
					pathname: '/home/confirm_agency'
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
		getNextStr({
			$props: this.props
		});
	};
	// 获取首页信息
	requestGetUsrInfo = async () => {
		this.props.$fetch.post(API.USR_INDEX_INFO).then(async (result) => {
			// const result = {
			// 	msgCode: 'PTM0000',
			// 	msgInfo: '',
			// 	data: mockData.LN0011
			// };
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				if (result.data.indexSts === 'LN0002') {
					store.getAutId() && store.setAutId2(store.getAutId());
				}
				// 从进度页面返回或者卡是爬取中不删除AutId
				if (!store.getAutId2() || result.data.indexSts !== 'LN0002') {
					store.removeAutId();
				}
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
						if (
							result.data.indexSts === 'LN0001' ||
							result.data.indexSts === 'LN0003' ||
							result.data.indexSts === 'LN0010'
						) {
							this.getPercent();
						}
						if (result.data.indexSts === 'LN0006' || result.data.indexSts === 'LN0008') {
							let maxAmtArr = [];
							maxAmtArr =
								(result.data &&
									result.data.indexData &&
									result.data.indexData.prodList &&
									result.data.indexData.prodList.length &&
									result.data.indexData.prodList.map((item, index) => {
										return item.maxAmt;
									})) ||
								[];
							this.setState({
								userMaxAmt: maxAmtArr.length ? Math.max(...maxAmtArr) : ''
							});
						}
					}
				);
				let couponTestData = await this.props.$fetch.get(API.couponTest);
				if (couponTestData && couponTestData.data && couponTestData.data !== '0') {
					this.props.globalTask(couponTestData.data === '1' ? 'yhq7' : 'yhq50');
					this.setState({
						isShowActivityModal: true,
						modalType: couponTestData.data === '1' ? 'yhq7' : 'yhq50'
					});
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

	// 神策用户绑定
	queryUsrSCOpenId = () => {
		if (token && tokenFromStorage) {
			if (!store.getQueryUsrSCOpenId()) {
				this.props.$fetch.get(API.queryUsrSCOpenId).then((res) => {
					// console.log(res);
					if (res.msgCode === 'PTM0000') {
						sa.login(res.data);
						store.setQueryUsrSCOpenId(res.data);
					}
				});
			}
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
		const { usrCashIndexInfo } = this.state;
		switch (code) {
			case 'CN0003':
				// 通付盾 获取设备指纹
				TFDInit('fq');
				buriedPointEvent(loan_fenqi.fenqiHomeApplyBtn);
				if (usrCashIndexInfo.indexData.downloadFlg === '01') {
					//需要引导下载app
					this.props.history.push(`/home/deposit_tip?cashMoney=${usrCashIndexInfo.indexData.curAmt}`);
				} else {
					this.props.history.push('/home/loan_fenqi');
				}
				break;
			case 'CN0004':
				this.props.toast.info('正在放款中，马上到账');
				break;
			case 'CN0005':
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
	closeActivityModal = (type) => {
		this.setState({
			isShowActivityModal: !this.state.isShowActivityModal
		});
		store.setShowActivityModal(true);
		switch (type) {
			case 'xianjin': // 品牌活动弹框按钮
				buriedPointEvent(activity.fenqiHomeModalClose);
				break;
			default:
				break;
		}
	};
	// 弹窗 按钮事件
	activityModalBtn = (type) => {
		this.closeActivityModal();
		switch (type) {
			case 'xianjin': // 品牌活动弹框按钮
				buriedPointEvent(activity.fenqiHomeModalGoBtn);
				break;
			case 'yhq7':
				buriedPointEvent(activity.yhq7ModalBtnClick);
				this.handleSmartClick();
				break;
			case 'yhq50':
				buriedPointEvent(activity.yhq50ModalBtnClick);
				this.handleSmartClick();
				break;
			default:
				break;
		}
	};

	// 逾期弹窗
	handleOverDueClick = () => {
		const { usrIndexInfo } = this.state;
		if (usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.billNo) {
			store.setBillNo(usrIndexInfo.indexData.billNo);
			this.props.history.push({
				pathname: '/order/order_detail_page',
				search: '?entryFrom=home'
			});
		} else {
			this.props.history.push({
				pathname: '/order/order_page'
			});
		}
	};

	//处理现金分期额度有效期显示
	handleAcOverDtShow = () => {
		const { indexData } = this.state.usrCashIndexInfo;
		const overDt = Number(indexData.acOverDt);
		if (overDt > 10) return false;
		if (overDt === 0 || overDt <= 0) {
			return '1天后失去资格';
		} else {
			return `${overDt}天后失去资格`;
		}
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
							topTip: this.handleAcOverDtShow(),
							subtitle: '可提现金额(元)',
							money:
								usrCashIndexInfo &&
								usrCashIndexInfo.indexData &&
								usrCashIndexInfo.indexData.curAmt.toFixed(2),
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
							money: usrCashIndexInfo && usrCashIndexInfo.indexData && usrCashIndexInfo.indexData.orderAmt,
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
							money: usrCashIndexInfo && usrCashIndexInfo.indexData && usrCashIndexInfo.indexData.orderAmt,
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
		const {
			usrIndexInfo,
			showDiv,
			percentSatus,
			percentData,
			percentBtnText,
			cardStatus,
			userMaxAmt
		} = this.state;
		let componentsDisplay = null;
		const { indexData = {}, indexSts } = usrIndexInfo;
		const { cardBillAmt, cardBillSts, billRemainAmt, cardBillDt, bankName, bankNo, cardNoHid } = indexData;
		const bankNm = !bankName ? '****' : bankName;
		const cardCode = !cardNoHid ? '****' : cardNoHid.slice(-4);
		const bankCode = !bankNo ? '' : bankNo;
		const cardBillDtData = !cardBillDt ? '----/--/--' : dayjs(cardBillDt).format('YYYY/MM/DD');
		let cardBillAmtData = '';
		if (cardBillSts === '02' || cardBillSts === '00') {
			cardBillAmtData = '需更新账单';
		} else {
			// 优先取剩余应还，否则去账单金额
			if (billRemainAmt && Number(billRemainAmt) > 0) {
				cardBillAmtData = parseFloat(billRemainAmt, 10).toFixed(2);
			} else if (!cardBillAmt && cardBillAmt !== 0) {
				cardBillAmtData = '----.--';
			} else if (
				cardBillSts === '01' &&
				(billRemainAmt === 0 || (billRemainAmt && Number(billRemainAmt) <= 0))
			) {
				cardBillAmtData = '已结清';
			} else if (cardBillSts === '01' && (cardBillAmt === 0 || (cardBillAmt && Number(cardBillAmt) <= 0))) {
				cardBillAmtData = '已结清';
			} else {
				cardBillAmtData = parseFloat(cardBillAmt, 10).toFixed(2);
			}
		}
		let differDays = '';
		if (usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.netAppyDate) {
			differDays = dateDiffer(
				dayjs(new Date()).format('YYYY/MM/DD'),
				dayjs(usrIndexInfo.indexData.netAppyDate).format('YYYY/MM/DD')
			);
		}
		if (showDiv) {
			switch (showDiv) {
				case '50000':
					componentsDisplay = (
						<CarouselHome
							showData={{
								demoTip: true
							}}
							handleClick={this.handleApply}
							btnText={percentBtnText}
						/>
					);
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
				case 'progress':
					componentsDisplay = (
						<CardProgress
							showData={{
								title: '还到-基础版',
								btnText: '查看进度'
							}}
							handleClick={() => {
								this.handleProgressApply(cardStatus);
							}}
							cardStatus={cardStatus}
						/>
					);
					break;
				case 'applyCredict':
					componentsDisplay = (
						<MoneyCard
							handleClick={() => {
								this.handleSmartClick();
							}}
							showData={{
								btnText: '申请借钱还信用卡',
								title: bankNm,
								subtitle: '信用卡剩余应还金额(元)',
								money: cardBillAmtData,
								desc: `还款日：${cardBillDtData}`,
								cardNoHid: cardCode,
								bankNo: bankCode
							}}
						/>
					);
					break;
				default:
					break;
			}
		} else {
			switch (indexSts) {
				case 'LN0001': // 新用户，信用卡未授权
					componentsDisplay = (
						<CarouselHome
							showData={{
								demoTip: true
							}}
							handleClick={this.handleApply}
						/>
					);
					break;
				case 'LN0002': // 账单爬取中
					componentsDisplay = (
						<CardProgress
							showData={{
								title: '还到-基础版',
								btnText: '查看进度'
							}}
							handleClick={() => {
								this.handleProgressApply('01');
							}}
							cardStatus={'01'}
						/>
					);
					break;
				// case 'LN0003': // 账单爬取成功
				case 'LN0004': // 代还资格审核中
					componentsDisplay = (
						<ExamineCard
							handleClick={() => {
								this.handleSmartClick();
							}}
							showData={{
								type: 'LN0004',
								btnText: '查看进度',
								title: bankNm,
								subtitle: '预计最快90秒完成审核',
								money: cardBillAmtData,
								desc: `高峰期可能5分钟左右`,
								cardNoHid: cardCode,
								bankNo: bankCode
							}}
						/>
					);
					break;
				case 'LN0005': // 暂无代还资格
					componentsDisplay = (
						<MoneyCard
							handleClick={() => {
								this.handleSmartClick(differDays);
							}}
							showData={{
								btnText: '暂无借款资格',
								title: bankNm,
								subtitle: '信用卡剩余应还金额(元)',
								money: cardBillAmtData,
								desc: `还款日：${cardBillDtData}`,
								cardNoHid: cardCode,
								bankNo: bankCode,
								topTip:
									usrIndexInfo.indexData.netAppyDate &&
									differDays <= 60 &&
									`${dayjs(usrIndexInfo.indexData.netAppyDate).format('YYYY/MM/DD')} 可再次申请`
							}}
						/>
					);
					break;
				case 'LN0006': // 风控审核通过
				case 'LN0008': // 放款失败
					componentsDisplay = (
						<MoneyCard
							handleClick={() => {
								this.handleSmartClick();
							}}
							showData={{
								btnText: '立即签约借款',
								title: bankNm,
								subtitle: '信用卡剩余应还金额(元)',
								money: cardBillAmtData,
								desc: `还款日：${cardBillDtData}`,
								cardNoHid: cardCode,
								bankNo: bankCode,
								topTip:
									usrIndexInfo.indexData.acOverDt &&
									`额度有效期至${dayjs(usrIndexInfo.indexData.acOverDt).format('YYYY/MM/DD')}`,
								subtitle2: '最高可申请还款金(元)',
								money2: userMaxAmt ? parseFloat(userMaxAmt, 10).toFixed(2) : ''
							}}
						/>
					);
					break;
				case 'LN0007': // 放款中
					componentsDisplay = (
						<ExamineCard
							handleClick={() => {
								this.handleSmartClick();
							}}
							showData={{
								type: 'LN0007',
								btnText: '查看进度',
								title: bankNm,
								subtitle:
									indexData.repayType === '0'
										? `预计60秒完成放款`
										: `${dayjs(indexData.repayDt).format('YYYY年MM月DD日')}完成放款`,
								money: indexData.billAmt || '-.--',
								date: indexData.perdCnt || '-',
								desc: indexData.repayType === '0' ? `最长不超过2个工作日` : '请耐心等待...',
								cardNoHid: cardCode,
								bankNo: bankCode
							}}
						/>
					);
					break;
				case 'LN0009': // 放款成功
					componentsDisplay = (
						<MoneyCard
							handleClick={() => {
								this.handleSmartClick();
							}}
							showData={{
								btnText: '查看代偿账单',
								title: bankNm,
								subtitle: '信用卡剩余应还金额(元)',
								money: cardBillAmtData,
								desc: `还款日：${cardBillDtData}`,
								cardNoHid: cardCode,
								bankNo: bankCode
							}}
						/>
					);
					break;
				case 'LN0010': // 账单爬取失败/老用户
					componentsDisplay = <CarouselHome handleClick={this.goToNewMoXie} />;
					break;
				case 'LN0011': // 账单爬取失败/老用户
					componentsDisplay = (
						<ExamineCard
							showData={{
								type: 'LN0011',
								btnText: '查看进度',
								title: '还到-基础版',
								subtitle: '需要人工审核，耐心等待',
								money: indexData.billAmt || '-.--',
								date: indexData.perdCnt || '-',
								dw: '申请借款金额(元) ',
								dw2: '申请期限 ',
								tel: `010-86355XXX的审核电话`
							}}
							handleClick={this.handleSmartClick}
						/>
					);
					break;
				default:
			}
		}

		return componentsDisplay;
	};

	// 点击不同进度状态，跳转页面
	handleProgressApply = (sts) => {
		buriedPointEvent(home.billImport);
		// ，01：爬取中，02：爬取成功，03：爬取失败
		switch (sts) {
			case '00':
			case '01':
				const mainAutId = store.getAutId() ? store.getAutId() : '';
				store.setAutId(mainAutId);
				this.props.history.push('/home/crawl_progress_page');
				break;
			case '02':
				store.removeAutId();
				this.requestCredCardCount('progress');
				break;
			case '03':
				store.removeAutId();
				this.props.history.push('/home/crawl_fail_page');
				break;
			default:
				break;
		}
	};

	// 每隔5秒调取接口
	goProgress() {
		timerPercent = setInterval(() => {
			timers = timers + 5;
			if (timers > 29) {
				clearInterval(timerPercent);
				return;
			}
			this.queryUsrInfo();
		}, 5000);
	}

	//查询用户相关信息
	queryUsrInfo = () => {
		const autId = store.getAutId() ? store.getAutId() : '';
		this.props.$fetch
			.get(API.CHECK_CARD_AUTH + autId)
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					if (res.data === '02' || res.data === '03') {
						clearInterval(timerPercent);
					}
					this.setState({
						cardStatus: res.data && res.data.autSts,
						bizId: res.data && res.data.bizId,
						showDiv: 'progress'
					});
				} else {
					res.msgInfo && this.props.toast.info(res.msgInfo);
				}
			})
			.catch((err) => {
				err.msgInfo && this.props.toast.info(err.msgInfo);
			});
	};

	componentsAddCards = () => {
		const { usrIndexInfo } = this.state;
		let componentsAddCards = null;
		const { indexSts } = usrIndexInfo;
		switch (indexSts) {
			case 'LN0003': // 新用户，信用卡未授权
				componentsAddCards = (
					<AddCards
						handleClick={() => {
							// 埋点-首页-点击代还其他信用卡
							buriedPointEvent(home.repayOtherCredit);
							this.goToNewMoXie();
						}}
					/>
				);
				break;
			default:
				break;
		}
		return componentsAddCards;
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

	render() {
		const {
			bannerList,
			percent,
			showAgreement,
			isShowActivityModal,
			visibleLoading,
			overDueInf,
			overDueModalFlag,
			modalType,
			modalBtnFlag,
			blackData,
			DownTime321,
			showFeedbackModal
		} = this.state;
		let componentsDisplay = null;
		let componentsBlackCard = null;
		if (JSON.stringify(blackData) !== '{}') {
			componentsBlackCard = <BlackCard blackData={blackData} history={this.props.history} />;
		}
		componentsDisplay = this.getDCDisPlay() || this.getFQDisPlay() || (
			<CarouselHome
				showData={{
					demoTip: true
				}}
				handleClick={this.handleNeedLogin}
			/>
		);
		return (
			<div className={style.home_new_page}>
				<MsgTip $fetch={this.props.$fetch} history={this.props.history} />
				{componentsBlackCard}
				{componentsDisplay}
				{bannerList.length > 0 && (
					<Carousels className={style.home_banner} data={bannerList} entryFrom="banner" />
				)}
				{this.componentsAddCards()}
				<FeedbackModal
					history={this.props.history}
					toast={this.props.toast}
					visible={showFeedbackModal}
					closeModal={this.closeFeedbackModal}
				/>
				{/* <Demo globalTask={this.props.globalTask}/> */}
				<HomeModal
					showAgreement={showAgreement}
					modalType={modalType}
					modalBtnFlag={modalBtnFlag}
					percent={percent}
					history={this.props.history}
					toast={this.props.toast}
					isShowActivityModal={isShowActivityModal}
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
