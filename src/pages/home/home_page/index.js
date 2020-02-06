/*
 * @Author: shawn
 * @LastEditTime : 2020-02-06 11:49:47
 */
import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { connect } from 'react-redux';
import { Toast } from 'antd-mobile';

import {
	isWXOpen,
	getDeviceType,
	getNextStr,
	isCanLoan,
	getMoxieData,
	dateDiffer,
	activeConfigSts
} from 'utils';
import {
	index_queryIndexInfo,
	index_queryBannerList,
	index_queryWelfareList,
	bank_card_check
} from 'fetch/api';

import { showRedDot } from 'reduxes/actions/specialActions';
import { setAuthId } from 'reduxes/actions/staticActions';
import {
	setOverDueModalInfo,
	setHomeData,
	setBannerList,
	setWelfareList
} from 'reduxes/actions/commonActions';

import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { home, mine, activity, loan_fenqi } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import Carousels from 'components/Carousels';
import style from './index.scss';
// import mockData from './mockData';
import linkConf from 'config/link.conf';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import { TFDLogin } from 'utils/getTongFuDun';
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
	ExamineCard,
	CreditCard,
	ActivityEntry,
	SwitchCard,
	Welfare
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
	usrCashIndexInfo: '/index/usrCashIndexInfo', // 现金分期首页接口
	indexshowType: '/index/showType', // 首页现金分期基本信息查询接口
	CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
	CHECK_CARD_AUTH: '/auth/checkCardAuth/', // 查询爬取进度
	cashShowSwitch: '/my/switchFlag/cashShowSwitchFlag', // 是否渲染现金分期
	checkKoubei: '/activeConfig/userCheck', //是否参与口碑活动,及新老用户区分
	couponTest: '/activeConfig/couponTest', //签约测试
	mxCheckJoin: '/activeConfig/checkJoin', // 免息活动检查是否参与
	couponNotify: '/activeConfig/couponNotify', // 免息活动检查是否参与
	bonusSts: 'activeConfig/hundred/sts', // 百元活动用户状态查询
	couponRedDot: '/index/couponRedDot', // 优惠券红点
	actiPopupSwitch: '/my/switchFlag/ACTIVITY_POPUP_SWITCH', // 还款优惠劵测试弹框开关
	popupList: '/popup/list', // 首页弹框
	thirdCheck: '/activeConfig/thirdCheck', // 三陪一返,首页用户获取优惠券校验 01情况下首页弹框
	queryRepayReward: '/activeConfig/queryRepayReward'
};
let token = '';
let tokenFromStorage = '';

let timer;
let timerOut;

//隔5秒调取接口相关变量
let timerPercent; //计时器

@createForm()
@fetch.inject()
@setBackGround('#F0F3F9')
@connect(
	(state) => ({
		userInfo: state.staticState.userInfo,
		homeData: state.commonState.homeData,
		bannerList: state.commonState.bannerList,
		welfareList: state.commonState.welfareList,
		overdueModalInfo: state.commonState.overdueModalInfo,
		msgCount: state.specialState.msgCount
	}),
	{ showRedDot, setHomeData, setBannerList, setWelfareList, setOverDueModalInfo, setAuthId }
)
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
			showFeedbackModal: false,
			isShowWelfareModal: false, // 福利专区弹框显示
			welfareModalInf: [] // 首页弹框信息
		};
	}

	componentWillMount() {
		// 获取token
		token = Cookie.get('FIN-HD-AUTH-TOKEN');
		tokenFromStorage = store.getToken();
		const { userInfo } = this.props;
		// 已经登录
		if (userInfo && userInfo.tokenId) {
			// 获取首页信息
			this.index_queryIndexInfo();
			// 获取福利专区/新手活动信息
			this.index_queryWelfareList();
			// 上报我已阅读(针对首次未登录用户上报)
			// this.readPrivacyProtocol();
			// 活动弹窗列表
			// this.msg_popup_list();
		} else {
			// this.initData();
		}
		// 获取banner
		this.index_queryBannerList();
		// 第三方直接打通方式
		this.getTokenFromUrl();
		// 重新设置HistoryRouter，解决点击两次才能弹出退出框的问题
		if (isWXOpen()) {
			store.setHistoryRouter(window.location.pathname);
		}
		// 清除一些store
		this.removeStore();
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
		// 关闭弹框
		this.setState({
			isShowWelfareModal: false
		});
	}

	/**
	 * @description: 获取首页信息
	 * @param {type}
	 * @return:
	 */
	index_queryIndexInfo = () => {
		Toast.loading('', 10);
		this.props.$fetch
			.get(index_queryIndexInfo)
			.then((result) => {
				if (result && result.code === '000000' && result.data) {
					// 前端缓存authid
					if (result.data && result.data.dcDataInfo && result.data.dcDataInfo.autId) {
						// 更换authid
						this.props.setAuthId(result.data.dcDataInfo.autId);
					} else {
						this.props.setAuthId('');
					}
					this.setState(
						{
							homeData: result.data
						},
						() => {
							this.props.setHomeData(result.data);
						}
					);
				} else {
					this.setState(
						{
							homeData: {}
						},
						() => {
							this.props.setHomeData({});
						}
					);
				}
			})
			.catch(() => {
				this.props.setHomeData({});
			})
			.finally(() => {
				Toast.hide();
			});
	};

	/**
	 * @description: 获取福利专区/新手活动信息
	 * @param {type}
	 * @return:
	 */
	index_queryWelfareList = () => {
		this.props.$fetch
			.get(index_queryWelfareList, null, { hideToast: true })
			.then((result) => {
				if (result && result.code === '000000' && result.data) {
					this.setState(
						{
							welfareList: result.data.welfares,
							activities: result.data.activities
						},
						() => {
							this.props.setWelfareList({
								welfares: result.data && result.data.welfares,
								activities: result.data && result.data.activities
							});
						}
					);
				} else {
					this.setState(
						{
							welfareList: [],
							activities: []
						},
						() => {
							this.props.setWelfareList({});
						}
					);
				}
			})
			.catch(() => {
				this.props.setWelfareList([]);
			});
	};
	/**
	 * @description: 获取 banner 列表
	 * @param {type}
	 * @return:
	 */
	index_queryBannerList = () => {
		const params = {
			type: '1',
			cilent: 'h5'
		};
		this.props.$fetch
			.post(index_queryBannerList, params, { hideToast: true })
			.then((result) => {
				if (result && result.code === '000000' && result.data) {
					const bannerData = result.data.list.map((item) => ({
						src: {
							uri: item.ossUrl
						},
						url: item.gotoFlag !== 0 ? item.gotoUrl : '',
						title: item.title
					}));
					this.setState(
						{
							bannerList: bannerData
						},
						() => {
							this.props.setBannerList(bannerData);
						}
					);
				} else {
					this.setState(
						{
							bannerList: []
						},
						() => {
							this.props.setBannerList([]);
						}
					);
				}
			})
			.catch(() => {
				this.props.setBannerList([]);
			});
	};
	// 移除store
	removeStore = () => {
		// 清除卡信息
		store.removeCardData();
		// 去除支付方式默认选中
		store.removePayType();
		// 去除借款页面参数
		store.removeHomeConfirmAgency();
		// 删除授信弹窗信息
		store.removeLoanAspirationHome();
		// 清除返回的flag
		store.removeBackFlag();
		// 信用卡前置
		store.removeAutIdCard();
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
		// 清除借款中总的联系人
		store.removeContactList();
		// 清除借款选中的五个联系人
		store.removeSelContactList();
		store.removeSelEmptyContactList();
		store.removeSaveContactList();
		store.removeSaveEmptyContactList();
		store.removeExcContactList();
	};
	// 是否渲染现金分期模块
	isRenderCash = () => {
		this.props.$fetch
			.get(API.cashShowSwitch)
			.then((result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					if (result.data.value === '1') {
						if (token && tokenFromStorage) {
							this.showCouponNoticeModal();
							this.requestGetHomeModal();
							this.indexshowType();
						} else {
							this.setState({
								blackData: { cashAcBalSts: '4' }
							});
						}
					} else {
						if (token && tokenFromStorage) {
							this.showCouponNoticeModal();
							this.requestGetHomeModal();
							this.queryUsrIndexInfo();
						}
					}
				} else {
					this.props.toast.info(result.msgInfo);
				}
			})
			.catch(() => {
				if (token && tokenFromStorage) {
					this.queryUsrIndexInfo();
				}
			});
	};
	// 是否展示还款券测试弹框
	showCouponTestModal = () => {
		// 接口调用
		this.props.$fetch.get(API.actiPopupSwitch).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data && result.data.value === '1') {
				if (Cookie.get('modalShowTime') !== dayjs(new Date()).format('YYYYMMDD')) {
					this.setState(
						{
							isShowActivityModal: true,
							modalType: 'payCouponTest'
						},
						() => {
							Cookie.set('modalShowTime', dayjs(new Date()).format('YYYYMMDD'), { expires: 365 });
							// store.setShowActivityModal(true);
						}
					);
				}
			}
		});
	};
	// 是否展示优惠劵到账通知弹框
	showCouponNoticeModal = () => {
		// 接口调用
		this.props.$fetch.get(API.thirdCheck).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data && result.data.flag === '01') {
				if (!Cookie.get('modalShowTime')) {
					this.setState(
						{
							isShowActivityModal: true,
							modalType: 'couponNotice'
						},
						() => {
							Cookie.set('modalShowTime', dayjs(new Date()).format('YYYYMMDD'), { expires: 365 });
							// store.setShowActivityModal(true);
						}
					);
				}
			}
		});
	};

	/**
	 * @description: 是否绑定了一张信用卡一张储蓄卡，且是否为授信信用卡
	 * @param {type}
	 * @return:
	 */
	bank_card_check = () => {
		const { homeData } = this.state;
		this.props.$fetch.get(`${bank_card_check}/${homeData.dcDataInfo.autId}`).then((result) => {
			if (result && result.code === '000000') {
				// 有风控且绑信用卡储蓄卡
				Toast.hide();
				this.props.navigation.navigate('ConfirmAgency');
			} else if (result && result.code === '999974') {
				// 有风控没绑储蓄卡 跳绑储蓄卡页面
				Toast.show({ message: result.message, code: result.code });
				setTimeout(() => {
					this.props.navigation.navigate('Deposit');
				}, 3000);
			} else if (result && result.code === '000012') {
				// 有风控没绑信用卡 跳绑信用卡页面
				Toast.show({ message: result.message, code: result.code });
				setTimeout(() => {
					this.props.navigation.navigate('Credit');
				}, 3000);
			} else {
				Toast.show({ message: result.message, code: result.code });
			}
		});
	};

	/**
	 * @description: 从 url 中获取参数，如果有 token 就设置下
	 * @param {type}
	 * @return:
	 */
	getTokenFromUrl = () => {
		const urlParams = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (urlParams.token) {
			Cookie.set('FIN-HD-AUTH-TOKEN', urlParams.token, { expires: 365 });
			store.setToken(urlParams.token);
		}
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
	handleSmartClick = () => {
		const { usrIndexInfo = {} } = this.state;
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
				buriedPointEvent(home.goSuperMarket, {
					medium: 'H5'
				});
				store.setCarrierMoxie(true); // 设置去到第三方标示
				window.location.href = linkConf.MARKET_URL;
				break;
			case 'LN0006': // 风控审核通过
				buriedPointEvent(home.signedLoan);
				this.repayCheck();
				break;
			case 'LN0007': {
				// 放款中
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
			}
			case 'LN0008': // 放款失败
				buriedPointEvent(home.signedLoan);
				this.repayCheck();
				break;
			case 'LN0009': // 放款成功
				store.setBillNo(usrIndexInfo.indexData.billNo);
				// entryFrom 给打点使用，区分从哪个页面进入订单页的
				this.props.history.push({
					pathname: '/order/order_detail_page',
					search: '?entryFrom=home'
				});
				break;
			case 'LN0010': // 账单爬取失败/老用户 无按钮不做处理
				break;
			case 'LN0011': // 需要过人审，人审中
				this.getExamineSts();
				break;
			case 'LN0012': // 机器人审核
				this.getRobotSts();
				break;
			default:
		}
	};

	// 检查是否需要机器人审核
	getRobotSts = () => {
		this.props.$fetch.post(`${API.creditSts}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				if (res.data && res.data.flag === '02') {
					this.props.history.push({
						pathname: '/home/loan_robot_succ_page',
						search: `?telNo=${res.data && res.data.telNo}`
					});
				}
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	// 检查是否需要人审
	getExamineSts = () => {
		this.props.$fetch.post(`${API.creditSts}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState(
					{
						isNeedExamine: res.data && res.data.flag === '01',
						examineData: {
							creadNo: res.data && res.data.creadNo
						}
					},
					() => {
						this.props.history.push({
							pathname: '/home/loan_person_succ_page',
							search: `?creadNo=${this.state.examineData.creadNo}`
						});
					}
				);
			} else {
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	jumpToUrl = () => {
		const { usrIndexInfo } = this.state;
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
	setPercent = () => {
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
		activeConfigSts({
			$props: this.props,
			type: 'B'
		});
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
						this.queryUsrIndexInfo();
					});
				}
				// })
			})
			.catch(() => {
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
					src: item.ossUrl ? item.ossUrl : `data:image/png;base64,${item.picUrl}`,
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
	queryUsrIndexInfo = async () => {
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
									result.data.indexData.prodList.map((item) => {
										return item.maxAmt;
									})) ||
								[];
							this.setState({
								userMaxAmt: maxAmtArr.length ? Math.max(...maxAmtArr) : ''
							});
						}
					}
				);
				if (store.getBonusActivity()) {
					store.removeBonusActivity();
					this.setState({
						isShowActivityModal: true,
						modalType: 'getBonus'
					});
				} else {
					this.isInvoking_bonus();
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

	// 现金分期点击事件
	handleCN = (code) => {
		const { usrCashIndexInfo } = this.state;
		switch (code) {
			case 'CN0003':
				// 通付盾 获取设备指纹
				TFDLogin();
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
			modalBtnFlag: false,
			isShowActivityModal: !this.state.isShowActivityModal
		});

		switch (type) {
			case 'xianjin': // 品牌活动弹框按钮
				buriedPointEvent(activity.fenqiHomeModalClose);
				break;
			case 'mianxi': // 免息活动弹框按钮，如果需要活动只弹一次，那么就加一个case
				store.setShowActivityModal(true);
				break;
			case 'couponNotice': // 安心计划活动弹框按钮
				buriedPointEvent(activity.anXinActivityCouponCloseClick, {
					medium: 'H5'
				});
				break;

			case 'reward_tip':
				buriedPointEvent(activity.rewardTipModalClose);

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
			case 'mianxi':
				buriedPointEvent(activity.mianxiModalBtnClick);
				this.props.history.push('/activity/mianxi_page?entry=home_alert');
				break;
			case 'getBonus':
				buriedPointEvent(activity.mianxi822ModalUseBtn, {
					medium: 'H5',
					clickType: 'getPrize'
				});
				this.couponHandler();
				break;
			case 'notUseBonus':
				buriedPointEvent(activity.mianxi822ModalUseBtn, {
					medium: 'H5',
					clickType: 'notUse'
				});
				this.couponHandler();
				break;
			case 'joinBonus':
				buriedPointEvent(activity.mianxi822ModalJoinBtn, {
					medium: 'H5'
				});
				this.props.history.push('/activity/mianxi100_page?entry=homeModal');
				break;
			case 'payCouponTest':
				buriedPointEvent(activity.couponTestModalJoinBtn, {
					medium: 'H5'
				});
				this.props.history.push('/activity/coupon_test_page?comeFrom=mposHomeModal');
				break;
			case 'couponNotice':
				buriedPointEvent(activity.anXinActivityCouponCheckClick, {
					medium: 'H5'
				});
				this.props.history.push({ pathname: '/mine/coupon_page', search: '?entryFrom=mine' });
				break;
			case 'reward_result':
				buriedPointEvent(activity.rewardResultModalClick, {
					positon: 'homeModal'
				});
				this.props.history.push('/mine/coupon_page?entry=homeModal');
				break;
			default:
				break;
		}
	};

	// 逾期弹窗
	handleOverDueClick = () => {
		const { usrIndexInfo, usrCashIndexInfo } = this.state;
		const billNo =
			(usrIndexInfo.indexData && usrIndexInfo.indexData.billNo) ||
			(usrCashIndexInfo.indexData && usrCashIndexInfo.indexData.billNo);
		if (billNo) {
			store.setBillNo(billNo);
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
		}
		return `${overDt}天后失去资格`;
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

	getCardBillAmtData() {
		const homeData = this.state.usrCashIndexInfo;
		const { dcDataInfo = {} } = homeData;
		const { cardBillAmt, cardBillSts, billRemainAmt } = dcDataInfo || {};
		let cardBillAmtData = '';
		if (cardBillSts === '00') {
			cardBillAmtData = '待更新';
			// 优先取剩余应还，否则去账单金额
		} else if (billRemainAmt && Number(billRemainAmt) > 0) {
			cardBillAmtData = parseFloat(billRemainAmt, 10);
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
			cardBillAmtData = parseFloat(cardBillAmt, 10);
		}
		return cardBillAmtData;
	}

	// 主要是设置 解锁状态
	setPlusCardData(plusCardData) {
		const homeData = this.state.usrCashIndexInfo;
		const { dcDataInfo = {} } = homeData;

		if (homeData.showType === '01' && dcDataInfo.cashAcSts === '00') {
			plusCardData.loanText = '解锁中...';
			plusCardData.loanAmont = 90;
			plusCardData.loanAmontUnit = 's';
		}
	}

	getDisPlayData() {
		let basicCardData = {
			cardType: 'basic',
			cardLabel: '基础版',
			title: '基础版',
			titleSub: '快速审批',
			loanText: '最高可申请还款金(元)',
			loanAmont: '50000',
			btnText: '查看额度',
			handleClick: this.handleApply
		};

		let plusCardData = {
			cardType: 'plus',
			cardLabel: 'PLUS版',
			title: 'PLUS版',
			titleSub: '灵活借款',
			loanText: '最高可借额度(元)',
			loanAmont: '300000',
			btnText: '查看额度',
			handleClick: this.handleGoPlusDetail,
			handleDetailClick: this.handleGoPlusDetail,
			isShowDetailLink: false
		};
		this.setPlusCardData(plusCardData);
		if (!this.props.userInfo || !this.props.userInfo.tokenId) {
			return [basicCardData, plusCardData];
		}

		const { homeData = {} } = this.state;

		const { dcDataInfo = {} } = homeData;
		const { cardRepayDt, bankName, cardNoHid } = dcDataInfo || {};

		const cardBillDtData = !cardRepayDt ? '----/--/--' : dayjs(cardRepayDt).format('YYYY/MM/DD');
		const cardCode = !cardNoHid ? '****' : cardNoHid.slice(-4);
		const bankNm = !bankName ? '****' : bankName;

		let differDays = '';
		if (homeData && homeData.dcDataInfo && homeData.dcDataInfo.netAppyDate) {
			differDays = dateDiffer(
				dayjs(new Date()).format('YYYY/MM/DD'),
				dayjs(homeData.dcDataInfo.netAppyDate).format('YYYY/MM/DD')
			);
		}

		basicCardData.codeType = homeData.indexSts;
		plusCardData.codeType = homeData.indexSts;

		let disPlayData = [];
		switch (homeData.indexSts) {
			case 'LN0001':
			case 'LN0003':
			case 'LN0010':
				if (homeData && homeData.dcDataInfo && homeData.dcDataInfo.credRateShow === '添加收款信用卡') {
					basicCardData.loanText = '预审额度（元）';
					basicCardData.loanAmont = '36000';
					basicCardData.bottomTip = '预审通过，添加收款信用卡';
					basicCardData.btnText = homeData.dcDataInfo.credRateShow;
					basicCardData.handleClick = this.handleSmartClick;
				} else if (homeData && homeData.dcDataInfo.credRate === 0) {
					basicCardData.btnText = homeData.dcDataInfo.credRateShow;
					basicCardData.handleClick = this.handleApply;
				} else if (homeData && homeData.dcDataInfo.credRate > 0) {
					basicCardData.btnText = homeData.dcDataInfo.credRateShow;
					basicCardData.progress = homeData.dcDataInfo.credRate;
					basicCardData.handleClick = this.handleSmartClick;
				}
				disPlayData.push(basicCardData);
				this.setPlusCardData(plusCardData);
				disPlayData.push(plusCardData);
				break;
			case 'LN0002': // 账单爬取中 不存在了
				disPlayData = [];
				break;
			case 'LN0004': // 代还资格审核中
				basicCardData.title = homeData.dcDataInfo.bankName;
				basicCardData.titleSub = `(${cardCode})`;
				basicCardData.statusTitle = '预计最快90秒完成审核';
				basicCardData.statusTitleSub = '高峰期可能5分钟左右';
				basicCardData.btnText = '查看进度';
				basicCardData.handleClick = this.handleSmartClick;
				disPlayData.push(basicCardData);
				this.setPlusCardData(plusCardData);
				disPlayData.push(plusCardData);
				break;
			case 'LN0005': // 暂无代还资格
				basicCardData.tipText =
					homeData.dcDataInfo.netAppyDate &&
					differDays <= 60 &&
					`${dayjs(homeData.dcDataInfo.netAppyDate).format('YYYY/MM/DD')}`;
				basicCardData.statusTitle = '非常抱歉,本次审核未通过';
				basicCardData.statusTitleSub = '去试试其他借款平台';
				basicCardData.btnText = '去试试';
				basicCardData.handleClick = this.handleSmartClick;
				disPlayData.push(basicCardData);
				this.setPlusCardData(plusCardData);
				disPlayData.push(plusCardData);
				break;
			case 'LN0006': // 风控审核通过
			case 'LN0008': // 放款失败
				basicCardData.title = bankNm;
				basicCardData.titleSub = `(${cardCode})`;
				basicCardData.titleSubIsBankNo = true;
				basicCardData.loanText = '最高可申请还款金(元)';
				basicCardData.loanAmont =
					homeData.dcDataInfo && homeData.dcDataInfo.maxApplAmt
						? parseFloat(homeData.dcDataInfo.maxApplAmt, 10)
						: '';
				basicCardData.topTip =
					homeData.dcDataInfo.acOverDt &&
					`额度有效期至${dayjs(homeData.dcDataInfo.acOverDt).format('YYYY/MM/DD')}`;
				basicCardData.bottomTip = `还款日：${cardBillDtData}`;
				basicCardData.btnText = '立即签约借款';
				basicCardData.handleClick = this.handleSmartClick;
				disPlayData.push(basicCardData);
				this.setPlusCardData(plusCardData);
				disPlayData.push(plusCardData);
				break;
			case 'LN0007': // 放款中
				basicCardData.title = bankNm;
				basicCardData.titleSub = `(${cardCode})`;
				basicCardData.titleSubIsBankNo = true;
				basicCardData.statusTitle =
					dcDataInfo.repayType === '0'
						? '预计60秒完成放款'
						: `${dayjs(dcDataInfo.repayDt).format('YYYY年MM月DD日')}完成放款`;
				basicCardData.statusTitleSub = dcDataInfo.repayType === '0' ? '最长不超过2个工作日' : '请耐心等待...';
				basicCardData.bottomTip = `申请借款金额:${dcDataInfo.billAmt}元`;
				basicCardData.bottomTip2 = `申请期数:${dcDataInfo.perdCnt}期`;
				basicCardData.btnText = '查看进度';
				basicCardData.handleClick = this.handleSmartClick;
				disPlayData.push(basicCardData);
				this.setPlusCardData(plusCardData);
				disPlayData.push(plusCardData);
				break;
			case 'LN0009': // 放款成功
				// 查询是否逾期
				basicCardData.title = bankNm;
				basicCardData.titleSub = `(${cardCode})`;
				basicCardData.titleSubIsBankNo = true;
				basicCardData.loanText = '信用卡账单金额(元)';
				basicCardData.loanAmont = this.getCardBillAmtData();
				basicCardData.bottomTip = `还款日：${cardBillDtData}`;
				basicCardData.btnText = '查看代偿账单';
				basicCardData.handleClick = this.handleSmartClick;
				disPlayData.push(basicCardData);
				this.setPlusCardData(plusCardData);
				disPlayData.push(plusCardData);
				break;
			case 'LN0011': // 人审中
				basicCardData.statusTitle = '需要人工审核，耐心等待';
				basicCardData.statusTitleSub = '010-86355XXX的审核电话';
				basicCardData.bottomTip = `申请借款金额:${dcDataInfo.billAmt}元`;
				basicCardData.bottomTip2 = `申请期数:${dcDataInfo.perdCnt}期`;
				basicCardData.btnText = '查看进度';
				basicCardData.handleClick = this.handleSmartClick;
				disPlayData.push(basicCardData);
				this.setPlusCardData(plusCardData);
				disPlayData.push(plusCardData);
				break;
			case 'LN0012': // 机器人审核中
				basicCardData.statusTitle = '需要人工审核，耐心等待';
				basicCardData.statusTitleSub = '请保持电话畅通';
				basicCardData.btnText = '查看进度';
				basicCardData.handleClick = this.handleSmartClick;
				disPlayData.push(basicCardData);
				this.setPlusCardData(plusCardData);
				disPlayData.push(plusCardData);
				break;
			case 'CN0001': // 现金分期额度评估中,不可能出现
			case 'CN0002': // 抱歉，暂无申请资格
				break;
			case 'CN0003': // 申请通过有额度
				plusCardData.isShowDetailLink = true;
				plusCardData.topTip =
					homeData &&
					homeData.cashDataInfo &&
					homeData.cashDataInfo.acOverDt &&
					homeData.cashDataInfo.acOverDt <= 10
						? `${homeData.cashDataInfo.acOverDt}天后失去资格`
						: '';
				plusCardData.loanText = '可提现金额(元)';
				plusCardData.loanAmont =
					(homeData.cashDataInfo.curAmt && parseFloat(homeData.cashDataInfo.curAmt, 10)) || '';
				plusCardData.btnText = homeData && homeData.indexMsg;
				plusCardData.handleClick = this.handleSmartClick;
				plusCardData.handleDetailClick = this.handleGoPlusDetail;
				disPlayData.push(plusCardData);
				break;
			case 'CN0004': // 放款中
				plusCardData.isShowDetailLink = true;
				plusCardData.loanText = '借款金额(元)';
				plusCardData.loanAmont =
					homeData &&
					homeData.cashDataInfo &&
					homeData.cashDataInfo.orderAmt &&
					parseFloat(homeData.cashDataInfo.orderAmt, 10);
				plusCardData.btnText = homeData && homeData.indexMsg;
				plusCardData.handleClick = this.handleSmartClick;
				plusCardData.handleDetailClick = this.handleGoPlusDetail;
				disPlayData.push(plusCardData);
				break;
			case 'CN0005': // 去还款
				plusCardData.isShowDetailLink = true;
				plusCardData.loanText = '借款金额(元)';
				plusCardData.loanAmont =
					homeData &&
					homeData.cashDataInfo &&
					homeData.cashDataInfo.orderAmt &&
					parseFloat(homeData.cashDataInfo.orderAmt, 10);
				plusCardData.btnText = homeData && homeData.indexMsg;
				plusCardData.handleClick = this.handleSmartClick;
				plusCardData.handleDetailClick = this.handleGoPlusDetail;
				disPlayData.push(plusCardData);
				break;
			default:
				basicCardData.handleClick = this.handleApply;
				disPlayData.push(basicCardData);
				break;
		}
		return disPlayData;
	}

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
				case 'creditCard':
					componentsDisplay = (
						<CreditCard handleClick={this.handleApply} btnText="添加收款信用卡" percentData={percentData} />
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
								subtitle: '信用卡账单金额(元)',
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
						<ExamineCard
							handleClick={() => {
								this.handleSmartClick();
							}}
							showData={{
								type: 'LN0005',
								btnText: '去试试其他借款平台',
								title: '还到-基础版',
								subtitle: '非常抱歉，本次审核未通过',
								money: cardBillAmtData,
								desc: '',
								cardNoHid: '',
								bankNo: '',
								highlightText:
									usrIndexInfo.indexData.netAppyDate &&
									differDays <= 60 &&
									`${dayjs(usrIndexInfo.indexData.netAppyDate).format('YYYY/MM/DD')}`
							}}
						/>
						// <MoneyCard
						// 	handleClick={() => {
						// 		this.handleSmartClick(differDays);
						// 	}}
						// 	showData={{
						// 		btnText: '暂无借款资格',
						// 		title: bankNm,
						// 		subtitle: '信用卡账单金额(元)',
						// 		money: cardBillAmtData,
						// 		desc: `还款日：${cardBillDtData}`,
						// 		cardNoHid: cardCode,
						// 		bankNo: bankCode,
						// 		topTip:
						// 			usrIndexInfo.indexData.netAppyDate &&
						// 			differDays <= 60 &&
						// 			`${dayjs(usrIndexInfo.indexData.netAppyDate).format('YYYY/MM/DD')} 可再次申请`
						// 	}}
						// />
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
								subtitle: '信用卡账单金额(元)',
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
								subtitle: '信用卡账单金额(元)',
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
								tel: `0532-5808XXXX的审核电话`
							}}
							handleClick={this.handleSmartClick}
						/>
					);
					break;
				case 'LN0012': // 账单爬取失败/老用户
					componentsDisplay = (
						<ExamineCard
							showData={{
								type: 'LN0012',
								btnText: '查看进度',
								title: '还到-基础版',
								subtitle: '等待电话审核中',
								desc: '请保持电话畅通'
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
		const mainAutId = store.getAutId() ? store.getAutId() : '';
		buriedPointEvent(home.billImport);
		// ，01：爬取中，02：爬取成功，03：爬取失败
		switch (sts) {
			case '00':
			case '01':
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
				.catch(() => {
					reject();
				});
		});
	};

	// 判断是否参与过与使用过100元利息红包限时领活动
	isInvoking_bonus = async () => {
		let mxData = await this.props.$fetch.get(API.bonusSts);
		if (mxData && mxData.msgCode === 'PTM0000') {
			if (mxData.data && mxData.data.sts === '00' && !store.getShowActivityModal()) {
				this.setState(
					{
						isShowActivityModal: true,
						modalType: 'joinBonus'
					},
					() => {
						store.setShowActivityModal(true);
					}
				);
			} else if (mxData.data && mxData.data.sts === '01' && !store.getShowActivityModal3()) {
				this.setState(
					{
						isShowActivityModal: true,
						modalType: 'notUseBonus'
					},
					() => {
						store.setShowActivityModal3(true);
					}
				);
			}
		}
	};

	// 100元利息红包限时领活动中点击去使用、去参与按钮
	couponHandler = () => {
		const { showDiv, cardStatus, usrIndexInfo } = this.state;
		const { indexSts } = usrIndexInfo;
		if (showDiv) {
			switch (showDiv) {
				case '50000':
				case 'circle':
					this.handleApply();
					break;
				case 'progress':
					this.handleProgressApply(cardStatus);
					break;
				case 'applyCredict':
					this.handleSmartClick();
					break;
				default:
					break;
			}
		} else {
			switch (indexSts) {
				case 'LN0001': // 新用户，信用卡未授权
					this.handleApply();
					break;
				case 'LN0002': // 账单爬取中
					this.handleProgressApply('01');
					break;
				case 'LN0003': // 账单爬取成功
				case 'LN0004': // 代还资格审核中
				case 'LN0005': // 暂无代还资格
				case 'LN0006': // 风控审核通过
				case 'LN0007': // 放款中
				case 'LN0008': // 放款失败
				case 'LN0009': // 放款成功
				case 'LN0011':
					this.handleSmartClick();
					break;
				case 'LN0010': // 账单爬取失败/老用户
					this.goToNewMoXie();
					break;
				default:
					break;
			}
		}
	};

	/**
	 * 首页弹框是否显示
	 * @param 无
	 * @return {void}
	 */
	requestGetHomeModal = () => {
		// site 0:首页
		this.props.$fetch.get(`${API.popupList}/0`, {}, { hideLoading: true }).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data && result.data.length) {
				result.data.map((item) => (item.hadShow = false));
				this.setState({
					isShowWelfareModal: true,
					welfareModalInf: result.data
					// welfareModalInf: result.data[0],
				});
			} else {
				this.setState({
					isShowWelfareModal: false,
					welfareModalInf: []
				});
			}
		});
	};

	/**
	 * 点击按钮跳转落地页
	 * @param 无
	 * @return {void}
	 */
	jumpLand = (modalInf) => {
		// this.closeWelfareModal();
		if (modalInf) {
			const { welfareModalInf } = this.state;
			let filterModalInf = welfareModalInf.filter((ele) => {
				return ele.hadShow === false && ele.code === modalInf.code;
			});
			if (filterModalInf[0].skipType === '1') {
				this.setState({
					isShowWelfareModal: !this.state.isShowWelfareModal
				});
				window.location.href = filterModalInf[0].skip;
			} else if (filterModalInf[0].skipType === '2') {
				// skip 0 代表跳转首页 1代码跳转优惠券列表页面
				if (filterModalInf[0].skip === '1') {
					this.setState({
						isShowWelfareModal: !this.state.isShowWelfareModal
					});
					this.props.history.push({ pathname: '/mine/coupon_page', search: '?entryFrom=mine' });
				} else {
					// 暂时不作处理 只关闭弹框
					this.closeWelfareModal(modalInf);
				}
			} else {
				// 无跳转
				// 暂时不作处理 只关闭弹框
				this.closeWelfareModal(modalInf);
			}
		}
	};

	/**
	 * 关闭首页弹框
	 * @param 无
	 * @return {void}
	 */
	closeWelfareModal = (modalInf) => {
		const { welfareModalInf } = this.state;
		welfareModalInf.length &&
			welfareModalInf.map((item) => {
				if (modalInf && item.code === modalInf.code) {
					return (item.hadShow = true);
				}
			});
		this.setState(
			{
				isShowWelfareModal: !this.state.isShowWelfareModal,
				welfareModalInf
			},
			() => {
				let filterModalInf =
					welfareModalInf.length &&
					welfareModalInf.filter((ele) => {
						return ele.hadShow === false;
					});
				if (filterModalInf.length) {
					setTimeout(() => {
						this.setState({
							isShowWelfareModal: !this.state.isShowWelfareModal
						});
					}, 200);
				}
			}
		);
	};

	render() {
		const {
			bannerList,
			welfareList,
			activities,
			percent,
			showAgreement,
			isShowActivityModal,
			visibleLoading,
			overDueInf,
			overDueModalFlag,
			decreaseCoupExpiryDate,
			modalType,
			modalBtnFlag,
			blackData,
			isShowWelfareModal,
			welfareModalInf,
			rewardDate
		} = this.state;
		const { userInfo = {}, msgCount = 0 } = this.props;
		let componentsDisplay = null;
		let componentsBlackCard = null;
		if (JSON.stringify(blackData) !== '{}') {
			componentsBlackCard = <BlackCard blackData={blackData} history={this.props.history} />;
		}
		componentsDisplay = this.getDCDisPlay() ||
			this.getFQDisPlay() || (
				<CarouselHome
					showData={{
						demoTip: true
					}}
					handleClick={this.handleNeedLogin}
				/>
			);
		return (
			<div className={style.home_new_page}>
				<div className={style.content_top}>
					<MsgTip msgCount={msgCount} tokenObj={userInfo && userInfo.tokenId} history={this.props.history} />
					<ActivityEntry data={activities} history={this.props.history} />
				</div>
				<div className={activities && activities.length ? style.content_main_more : style.content_main}>
					<SwitchCard data={this.getDisPlayData()} />
					{bannerList.length > 0 && (
						<Carousels className={style.home_banner} data={bannerList} entryFrom="banner" />
					)}
					{welfareList && welfareList.length > 0 ? <Welfare welfareList={welfareList} /> : null}
					{componentsBlackCard}
					{componentsDisplay}
					{this.componentsAddCards()}
				</div>

				<HomeModal
					showAgreement={showAgreement}
					modalType={modalType}
					modalBtnFlag={modalBtnFlag}
					percent={percent}
					history={this.props.history}
					toast={this.props.toast}
					isShowActivityModal={isShowActivityModal}
					overDueModalFlag={overDueModalFlag}
					decreaseCoupExpiryDate={decreaseCoupExpiryDate}
					overDueInf={overDueInf}
					visibleLoading={visibleLoading}
					readAgreementCb={this.readAgreementCb}
					handleOverDueClick={this.handleOverDueClick}
					activityModalBtn={this.activityModalBtn}
					closeActivityModal={this.closeActivityModal}
					fetch={this.props.$fetch}
					isShowWelfareModal={isShowWelfareModal}
					welfareModalBtn={this.jumpLand}
					closeWelfareModal={this.closeWelfareModal}
					welfareModalInf2={welfareModalInf}
					rewardDate={rewardDate}
				/>
			</div>
		);
	}
}
