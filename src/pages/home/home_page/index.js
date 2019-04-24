import defaultBanner from 'assets/images/carousel/placeholder.png';
import React, { PureComponent } from 'react';
import { Modal, Progress, Icon, List, InputItem } from 'antd-mobile';
import Cookie from 'js-cookie';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { isWXOpen, getDeviceType, getNextStr, getFirstError, handleInputBlur, idChkPhoto } from 'utils';
import { isMPOS } from 'utils/common';
import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import SXFButton from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import Card50000 from './components/Card50000';
import Carousels from 'components/Carousels';
import BankContent from './components/BankContent';
import MsgBadge from './components/MsgBadge';
import ActivityModal from 'components/Modal';
import overDueImg from 'assets/images/home/overDue_icon.png';
import font50000 from './components/img/50000@2x.png';
import style from './index.scss';
import Circle from './components/Circle';
import mockData from './mockData';
import { createForm } from 'rc-form';
import AgreementModal from 'components/AgreementModal';
import ScrollText from 'components/ScrollText';

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
	checkIsEngagedUser: '/activeConfig/checkIsEngagedUser/AC001', // 用户是否参与过免息
	saveUserInfoEngaged: '/activeConfig/saveUserInfoEngaged/AC001', // 参与418活动
	creditSts: '/bill/credit/sts' // 用户是否过人审接口
};
const tagList = [
	{
		name: '全额还款',
		value: 1
	},
	{
		name: '最低还款',
		value: 2
	},
	{
		name: '部分还款',
		value: 3
	}
];
let token = '';
let tokenFromStorage = '';

let timer;
let timerOut;
@createForm()
@fetch.inject()
export default class home_page extends PureComponent {
	constructor(props) {
		// 获取token
		token = Cookie.get('fin-v-card-token');
		tokenFromStorage = store.getToken();
		super(props);
		this.state = {
			showDefaultTip: false,
			bannerList: [],
			isShowCreditModal: true,
			usrIndexInfo: '',
			haselescard: 'true',
			percentSatus: '',
			percent: 0,
			showToast: false,
			newUserActivityModal: false,
			modalType: 'huodongTootip3',
			handleMoxie: false, // 触发跳转魔蝎方法
			percentData: 0,
			showDiv: '',
			modal_left: false,
			activeTag: 0,
			perdRateList: [],
			firstUserInfo: '',
			CardOverDate: false,
			pageCode: '',
			showAgreement: false, // 显示协议弹窗
			billOverDue: false, //逾期弹窗标志
			isShowActivityModal: false, // 是否显示活动弹窗
			visibleLoading: false, //认证弹窗
			isNeedExamine: false // 是否需要人审
		};
	}

	componentWillMount() {
		// 删除授信弹窗信息
		store.removeLoanAspirationHome();
		// 弹新弹窗的标识
		const newUserActivityModal = store.getNewUserActivityModal();
		store.removeNewUserActivityModal();
		this.setState({
			newUserActivityModal
		});
		// 清除返回的flag
		store.removeBackFlag();
		// 运营商直接返回的问题
		store.removeCarrierMoxie();
		// 信用卡绑卡之后立即去提交页需要提示
		store.removeCreditSuccessBack();
		// 未提交授信用户
		store.removeCreditExtensionNot();
		// 去除需要调用获取下一步url方法
		store.removeNeedNextUrl();
		// 清除订单缓存
		store.removeBackData();
		// 结清页去活动页
		store.removeSuccessPay();
		// 清除四项认证进入绑卡页的标识
		store.removeCheckCardRouter();
		this.getTokenFromUrl();
		// 判断是否是微信打通（微信登陆）
		if (isWXOpen() && !tokenFromStorage && !token) {
			this.cacheBanner();
			this.setState({
				showDefaultTip: true
			});
		} else {
			// 判断是否提交过授信
			this.credit_extension();
		}
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
	// 判断是否参与免息活动
	isInvoking_mianxi = () => {
		return new Promise((resolve, reject) => {
			this.props.$fetch
				.get(API.checkIsEngagedUser)
				.then((res) => {
					// 0:不弹出  1:弹出
					if (res.data && res.data === '1') {
						// 如果是活动来的，
						if (store.getInvoking418()) {
							this.props.$fetch.get(API.saveUserInfoEngaged);
							resolve('0');
						} else {
							resolve(res.data);
						}
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
		this.props.$fetch
			.post(API.procedure_user_sts)
			.then(async (res) => {
				if (res && res.msgCode === 'PTM0000') {
					this.setState({
						firstUserInfo: res.data.flag,
						showAgreement: res.data.agreementPopupFlag === '1',
						billOverDue: res.data.popupFlag === '1'
					});
					let isInvoking_mianxi = await this.isInvoking_mianxi();
					if (res.data.flag === '01') {
						// 历史未提交过授信的用户才弹
						if (isInvoking_mianxi === '1' && !store.getShowActivityModal()) {
							this.setState(
								{
									isShowActivityModal: true,
									modalType: 'mianxi30'
								},
								() => {
									store.setShowActivityModal(true);
								}
							);
						} else if (isMPOS() && this.state.newUserActivityModal && !store.getShowActivityModal()) {
							this.setState(
								{
									isShowActivityModal: true,
									modalType: 'huodongTootip1'
								},
								() => {
									store.setShowActivityModal(true);
								}
							);
						}

						this.credit_extension_not();
					} else {
						this.requestGetUsrInfo(isInvoking_mianxi);
					}
				} else {
					this.props.toast.info(res.msgInfo);
				}
			})
			.catch((err) => {
				this.setState({
					firstUserInfo: 'error'
				});
			});
	};
	// 未提交授信
	credit_extension_not = async () => {
		let data = await getNextStr({ $props: this.props, needReturn: true });
		store.setCreditExtensionNot(true);
		this.calculatePercent(data, true);
		this.cacheBanner();
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
		let data = await getNextStr({ $props: this.props, needReturn: true });
		this.calculatePercent(data);
	};

	// 进度计算
	calculatePercent = (data, isshow) => {
		let codes = [];
		let demo = data.codes;
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
		if (codes.length !== 0 && newCodes2.length === 0 && newCodes3.length != 0) {
			this.setState({
				showDiv: 'circle',
				percentSatus: '3',
				percentData: 40
			});
			return;
		}
		switch (newCodes2.length) {
			case 0: // 新用户，信用卡未授权
				this.setState({
					percentSatus: '3',
					showDiv: '50000'
				});
				break;
			case 1: // 新用户，信用卡未授权
				this.setState({
					percentSatus: '2',
					percentData: 60,
					showDiv: 'circle'
				});
				break;

			case 2: // 新用户，信用卡未授权
				this.setState({
					percentSatus: '1',
					percentData: 80,
					showDiv: 'circle'
				});
				break;

			case 3: // 新用户，信用卡未授权
				this.setState({
					percentData: 98,
					percentSatus: isshow ? '1' : '',
					showDiv: 'circle'
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
				} else if (
					usrIndexInfo.indexData &&
					usrIndexInfo.indexData.autSts === '2' &&
					usrIndexInfo.indexData.cardBillSts === '01' &&
					Number(usrIndexInfo.indexData.cardBillAmt) <= 0
				) {
					this.props.toast.info('账单已结清，请代偿其他信用卡');
					setTimeout(() => {
						// 跳新版魔蝎
						store.setMoxieBackUrl('/home/home');
						this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
					}, 2000);
				} else if (usrIndexInfo.indexData.autSts === '2') {
					if (
						usrIndexInfo &&
						usrIndexInfo.indexData &&
						usrIndexInfo.indexData.buidSts &&
						usrIndexInfo.indexData.buidSts === '02'
					) {
						this.props.toast.info('暂不支持当前信用卡，请代偿其他信用卡');
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
		// timerOut = setTimeout(() => { // 进度条
		//   this.setState(
		//     {
		//       percent: 0,
		//       visibleLoading: true,
		//       showToast: true,
		//     },
		//     () => {
		//       timer = setInterval(() => {
		//         this.setPercent();
		//         ++this.state.time;
		//       }, 1000);
		//     },
		//   );
		// }, 800);
		const osType = getDeviceType();
		const params = {
			osTyp: osType
		};
		this.props.$fetch
			.post(
				API.AGENT_REPAY_CHECK,
				params,
				{
					// timeout: 100000,
					// hideLoading: true,
				}
			)
			.then((result) => {
				// this.setState(
				//   {
				//     percent: 100,
				//   },
				//   () => {
				//     clearInterval(timer);
				//     clearTimeout(timerOut);
				//     this.setState({
				//       visibleLoading: false,
				//     });
				if (result && result.msgCode === 'PTM0000') {
					// if (this.state.showToast) {
					//   this.setState({
					//     showToast: false,
					//   });
					//   this.props.toast.info('资质检测完成，可正常借款', 3, () => {
					//     this.requestBindCardState();
					//   });
					// } else {
					//   this.requestBindCardState();
					// }
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
			$props: this.props,
			callBack: (resBackMsg) => {
				if (this.state.showDiv === 'circle') {
					buriedPointEvent(home.homeContinueApply, {
						next_step: resBackMsg
					});
				}
			}
		});
	};

	// 获取首页信息
	requestGetUsrInfo = (isInvoking_mianxi) => {
		this.props.$fetch.post(API.USR_INDEX_INFO).then((result) => {
			// let result = {
			// 	data: mockData.LN0003,
			// 	msgCode: 'PTM0000',
			// 	msgMsg: 'PTM0000'
			// };
			this.setState({
				showDefaultTip: true
			});
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				// let resultData = result.data;
				// const sessionCardData = store.getSomeData();
				// Object.assign(resultData.indexData, sessionCardData);
				// result.data.indexSts = 'LN0001'
				// result.data.indexData = {
				//   autSts : '2'
				// }
				if (result.data.indexSts === 'LN0003') {
					this.getPercent();
				}
				if (result.data.indexSts === 'LN0007') {
					// 获取是否需要人审
					this.getExamineSts();
				}
				this.setState({
					usrIndexInfo: result.data.indexData
						? result.data
						: Object.assign({}, result.data, { indexData: {} })
				});
				// 对于历史提交过授信的用户不弹框
				// if (isMPOS() && this.state.newUserActivityModal && !store.getShowActivityModal()) {
				//   // 新弹窗（188元）4月11号改为688元
				//   this.setState(
				//     {
				//       isShowActivityModal: true,
				//       modalType: true
				//     },
				//     () => {
				//       store.setShowActivityModal(true);
				//     }
				//   );
				// } else
				if (isInvoking_mianxi === '1' && !store.getShowActivityModal()) {
					this.setState(
						{
							isShowActivityModal: true,
							modalType: 'mianxi30'
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

				// TODO: 这里优化了一下，等卡片信息成功后，去请求 banner 图的接口
				this.cacheBanner();
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
		this.setState({
			showDefaultTip: true
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
		if (this.state.firstUserInfo === 'error') {
			this.props.toast.info('系统开小差，请稍后重试');
			setTimeout(() => {
				location.reload();
			}, 2000);
			return;
		}
		this.props.toast.info('请先登录', 2, () => {
			this.props.history.push({ pathname: '/login', state: { isAllowBack: true } });
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
							this.setState({
								handleMoxie: true
							});
						}
						break;
					default:
						console.log('关闭弹窗');
				}
				break;
			case 'mianxi30': // 账单爬取成功
				this.props.history.push('/activity/mianxi418_page?entry=isxdc_home_alert');
				break;
			default:
				break;
		}
	};

	//切换tag标签
	toggleTag = (idx) => {
		const { usrIndexInfo } = this.state;
		const { indexData = {} } = usrIndexInfo;
		const { cardBillAmt, minPayment, billRemainAmt } = indexData;
		// 埋点
		switch (idx) {
			case 0:
				buriedPointEvent(home.repaymentIntentionAll, {
					userType: 'oldUser'
				});
				break;
			case 1:
				buriedPointEvent(home.repaymentIntentionLowest, {
					userType: 'oldUser'
				});
				break;
			case 2:
				buriedPointEvent(home.repaymentIntentionPart, {
					userType: 'oldUser'
				});
				break;

			default:
				break;
		}
		this.setState(
			{
				activeTag: idx
			},
			() => {
				//全额还款
				if (idx === 0) {
					this.calcLoanMoney(billRemainAmt === 0 || billRemainAmt ? billRemainAmt : cardBillAmt);
				} else if (idx === 1) {
					//最低还款
					this.calcLoanMoney(minPayment);
				} else {
					this.inputRef.focus();
					this.props.form.setFieldsValue({
						loanMoney: ''
					});
				}
			}
		);
	};

	//计算该显示的还款金额
	calcLoanMoney = (money) => {
		const { selectedLoanDate: obj = {} } = this.state;
		if (money > obj.factAmtHigh) {
			this.props.form.setFieldsValue({
				loanMoney: obj.factAmtHigh
			});
		} else if (money < obj.factLmtLow) {
			this.props.form.setFieldsValue({
				loanMoney: obj.factLmtLow
			});
		} else {
			this.props.form.setFieldsValue({
				loanMoney: money
			});
		}
	};

	//过滤选中的还款期限
	filterLoanDate = (item) => {
		const { usrIndexInfo, activeTag } = this.state;
		const { cardBillAmt, minPayment, billRemainAmt } = usrIndexInfo.indexData;
		this.setState(
			{
				selectedLoanDate: item // 设置选中的期数
			},
			() => {
				//全额还款
				if (activeTag === 0) {
					this.calcLoanMoney(billRemainAmt === 0 || billRemainAmt ? billRemainAmt : cardBillAmt);
				} else if (activeTag === 1) {
					//最低还款
					this.calcLoanMoney(minPayment);
				}
			}
		);
		this.dateType(item.perdLth);
	};

	//查询还款期限
	qryPerdRate = () => {
		this.props.$fetch.get(`${API.qryPerdRate}`).then((res) => {
			const date = res.data && res.data.perdRateList.length ? res.data.perdRateList : [];
			this.dateType(date[0].perdLth);
			this.setState(
				{
					perdRateList: date,
					selectedLoanDate: date[0] // 默认选中3期
				},
				() => {
					this.toggleTag(0);
				}
			);
		});
	};

	dateType = (value) => {
		// 埋点
		switch (value) {
			case '30':
				buriedPointEvent(home.durationDay30, {
					userType: 'oldUser'
				});
				break;
			case '3':
				buriedPointEvent(home.durationMonth3, {
					userType: 'oldUser'
				});
				break;
			case '6':
				buriedPointEvent(home.durationMonth6, {
					userType: 'oldUser'
				});
				break;
			case '9':
				buriedPointEvent(home.durationMonth9, {
					userType: 'oldUser'
				});
				break;
			case '12':
				buriedPointEvent(home.durationMonth12, {
					userType: 'oldUser'
				});
				break;
			default:
				break;
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
		this.setState(
			{
				isShowCreditModal: true
			},
			() => {
				this.qryPerdRate();
				window.handleCloseHomeModal = this.closeCreditModal;
			}
		);
	};

	closeCreditModal = () => {
		this.setState({
			isShowCreditModal: false
		});
		store.removeLoanAspirationHome();
		window.handleCloseHomeModal = null;
	};

	submitCredit = () => {
		const { selectedLoanDate = {}, usrIndexInfo } = this.state;
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (!/^\d+(\.\d{0,2})?$/.test(values.loanMoney)) {
					this.props.toast.info('请输入数字或两位小数');
					this.props.form.setFieldsValue({
						loanMoney: ''
					});
					return;
				}
				if (values.loanMoney < selectedLoanDate.factLmtLow || values.loanMoney > selectedLoanDate.factAmtHigh) {
					this.props.toast.info(
						`申请金额区间应为${selectedLoanDate.factLmtLow || ''}-${selectedLoanDate.factAmtHigh || ''}元`
					);
					this.props.form.setFieldsValue({
						loanMoney: ''
					});
					return;
				}
				if (!selectedLoanDate.perdCnt) {
					this.props.toast.info('请选择借款期限');
					return;
				}
				const params = {
					...selectedLoanDate,
					rpyAmt: Number(values.loanMoney),
					activeName: tagList[this.state.activeTag].name,
					autId: usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId
				};

				store.setLoanAspirationHome(params);
				idChkPhoto({
					$props: this.props,
					type: 'historyCreditExtension',
					msg: '认证'
				}).then((res) => {
					switch (res) {
						case '1':
							buriedPointEvent(home.compensationCreditCardConfirm, {
								pageCode: this.state.pageCode
							});
							//调用授信接口
							getNextStr({
								$props: this.props
							});
							break;
						case '2':
							buriedPointEvent(home.compensationCreditCardConfirm, {
								pageCode: '补充身份证照片'
							});
							break;
						default:
							break;
					}
				});

				// 关闭授信弹窗
				this.setState({
					isShowCreditModal: false
				});
			} else {
				this.props.toast.info(getFirstError(err));
			}
		});
	};

	handleOverDueClick = () => {
		const { usrIndexInfo } = this.state;
		store.setBillNo(usrIndexInfo.indexData.billNo);
		this.props.history.push({ pathname: '/order/order_detail_page', search: '?entryFrom=home' });
	};

	readAgreementCb = () => {
		this.props.$fetch.post(`${API.readAgreement}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.setState({
					showAgreement: false
				});
			}
		});
	};
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
	placeholderText = () => {
		const { activeTag, usrIndexInfo } = this.state;
		const { indexData } = usrIndexInfo;
		if (activeTag === 2) {
			return `申请金额${indexData.minApplAmt || ''}-${indexData.maxApplAmt || ''}元`;
		} else {
			return `请输入账单金额`;
		}
	};
	render() {
		const {
			bannerList,
			usrIndexInfo,
			percent,
			percentSatus,
			percentData,
			showDiv,
			activeTag,
			perdRateList,
			selectedLoanDate = {},
			firstUserInfo,
			showAgreement,
			billOverDue,
			isShowActivityModal,
			visibleLoading
		} = this.state;
		const { indexData = {} } = usrIndexInfo;
		const { cardNoHid, bankNo, bankName } = indexData;
		const { history } = this.props;
		const { getFieldProps } = this.props.form;
		const iconClass = bankNo ? `bank_ico_${bankNo}` : 'logo_ico';
		let componentsDisplay = null;
		// 未登录也能进入到首页的时候看到的样子
		if (!token || firstUserInfo === 'error') {
			componentsDisplay = (
				<BankContent
					showDefaultTip={this.state.showDefaultTip}
					fetch={this.props.$fetch}
					contentData={usrIndexInfo}
					history={history}
					haselescard={this.state.haselescard}
					progressNum={percentSatus}
					toast={this.props.toast}
				>
					<SXFButton className={style.smart_button_two} onClick={this.handleNeedLogin}>
						查看我的账单，帮我还
					</SXFButton>
					<div className={style.subDesc}>安全绑卡，放心还卡</div>
				</BankContent>
			);
		} else {
			switch (usrIndexInfo.indexSts) {
				case 'LN0001': // 新用户，信用卡未授权
				case 'LN0002': // 账单爬取中
				case 'LN0003': // 账单爬取成功
				case 'LN0004': // 代还资格审核中
				case 'LN0005': // 暂无代还资格
				case 'LN0006': // 风控审核通过
				case 'LN0007': // 放款中
				case 'LN0008': // 放款失败
				case 'LN0009': // 放款成功
				case 'LN0010': // 账单爬取失败/老用户
					componentsDisplay = (
						<BankContent
							handleMoxie={this.state.handleMoxie}
							showDefaultTip={this.state.showDefaultTip}
							fetch={this.props.$fetch}
							contentData={usrIndexInfo}
							history={history}
							haselescard={this.state.haselescard}
							progressNum={percentSatus}
							toast={this.props.toast}
						>
							{usrIndexInfo.indexSts === 'LN0002' ||
							usrIndexInfo.indexSts === 'LN0010' ||
							(usrIndexInfo.indexData &&
								usrIndexInfo.indexData.autSts &&
								usrIndexInfo.indexData.autSts !== '2') ||
							((usrIndexInfo.indexSts === 'LN0003' ||
								usrIndexInfo.indexSts === 'LN0006' ||
								usrIndexInfo.indexSts === 'LN0008') &&
								(!usrIndexInfo.indexData ||
									!usrIndexInfo.indexData.autSts ||
									usrIndexInfo.indexData.autSts !== '2')) ? null : (
								<SXFButton className={style.smart_button_two} onClick={this.handleSmartClick}>
									{usrIndexInfo.indexSts === 'LN0003' ||
									usrIndexInfo.indexSts === 'LN0006' ||
									usrIndexInfo.indexSts === 'LN0008' ? (
										'一键还账单'
									) : usrIndexInfo.indexSts === 'LN0004' ? (
										'快速审批中'
									) : usrIndexInfo.indexSts === 'LN0001' ? (
										'查看我的账单，帮我还'
									) : (
										usrIndexInfo.indexMsg.replace('代还', '代偿')
									)}
								</SXFButton>
							)}
						</BankContent>
					);
					break;
				default:
			}
		}

		let homeModal = null;
		if (showAgreement) {
			homeModal = <AgreementModal visible={showAgreement} readAgreementCb={this.readAgreementCb} />;
		} else if (billOverDue) {
			homeModal = (
				<Modal className="overDueModal" visible={billOverDue} transparent maskClosable={false}>
					<div>
						<img src={overDueImg} />
						<h3 className={style.modalTitle}>信用风险提醒</h3>
						<p>您的逾期记录已经报送至央行监管的征信机构，未来会影响银行及金融类借款申请，请尽快还款，维护信用。</p>
						<SXFButton onClick={this.handleOverDueClick}>我知道了，前去还款</SXFButton>
					</div>
				</Modal>
			);
		} else if (isShowActivityModal) {
			homeModal = (
				<ActivityModal
					activityModalBtn={this.activityModalBtn}
					closeActivityModal={this.closeActivityModal}
					history={history}
					modalType={this.state.modalType}
				/>
			);
		} else if (visibleLoading) {
			homeModal = (
				<Modal
					className="zijian"
					wrapClassName={style.modalLoadingBox}
					visible={visibleLoading}
					transparent
					maskClosable={false}
				>
					<div className="show-info">
						<div className={style.modalLoading}>资质检测中...</div>
						<div className="progress">
							<Progress percent={percent} position="normal" />
						</div>
					</div>
				</Modal>
			);
		}
		return (
			<div className={style.home_page}>
				{isWXOpen() && !tokenFromStorage && !token ? (
					<Carousels data={bannerList} entryFrom="banner" />
				) : bannerList && bannerList.length > 0 ? (
					<Carousels data={bannerList} entryFrom="banner">
						<MsgBadge toast={this.props.toast} />
					</Carousels>
				) : (
					<img className={style.default_banner} src={defaultBanner} alt="banner" />
				)}
				{/* 未提交授信用户 */}
				{firstUserInfo === '01' ? (
					<Card50000 showDiv={showDiv} handleApply={this.handleApply}>
						{showDiv === 'circle' ? (
							<div className={style.circle_box}>
								<Circle percentSatus={percentSatus} percentData={percentData} />
							</div>
						) : null}
						{showDiv === '50000' ? (
							<div className={style.font50000_box}>
								<img className={style.font50000} src={font50000} />
								<div className={style.font50000_desc}>最高金额(元）</div>
							</div>
						) : null}
					</Card50000>
				) : null}
				{/* 历史授信用户 */}
				{(firstUserInfo === '00' && token) || firstUserInfo === 'error' || (!token && componentsDisplay) ? (
					<div>
						<div className={style.content_wrap}>{componentsDisplay}</div>
					</div>
				) : null}
				<p className="bottomTip">怕逾期，用还到</p>
				<Modal
					popup
					className="modal_l_r"
					visible={this.state.isShowCreditModal}
					animationType="slide-up"
					maskClosable={false}
				>
					<div className={style.modal_box}>
						<div className={[ style.modal_left, this.state.modal_left ? style.modal_left1 : '' ].join(' ')}>
							<div className={style.modal_header}>
								确认代偿信息
								<Icon
									onClick={() => {
										this.closeCreditModal();
									}}
									className={style.close}
									type="cross"
								/>
							</div>
							<ScrollText />
							<div className={style.modal_content}>
								<div className={style.modal_card_wrap}>
									<div className={style.card_top}>
										<span className={[ 'bank_ico', iconClass, `${style.bankLogo}` ].join(' ')} />
										<span className={style.name}>{!bankName ? '****' : bankName}</span>
										<span className={style.lastNo}>
											{!cardNoHid ? '****' : cardNoHid.slice(-4)}
										</span>
									</div>
									<div className={style.card_bottom}>
										<div className={style.item}>
											{usrIndexInfo &&
											usrIndexInfo.indexData && (
												<span className={style.value}>
													{usrIndexInfo.indexData.billRemainAmt === 0 ||
													usrIndexInfo.indexData.billRemainAmt ? (
														usrIndexInfo.indexData.billRemainAmt
													) : (
														usrIndexInfo.indexData.cardBillAmt
													)}
												</span>
											)}
											<span className={style.name}>信用卡剩余应还金额(元)</span>
										</div>
										<div className={style.item}>
											{usrIndexInfo &&
											usrIndexInfo.indexData && (
												<span className={style.value}>
													{usrIndexInfo.indexData.minPayment &&
														usrIndexInfo.indexData.minPayment}
												</span>
											)}
											<span className={style.name}>最低还款金额(元)</span>
										</div>
									</div>
								</div>

								<div className={style.tagList}>
									{tagList.map((item, idx) => (
										<span
											key={idx}
											className={[ style.tagButton, activeTag === idx && style.activeTag ].join(
												' '
											)}
											onClick={() => {
												this.toggleTag(idx);
											}}
										>
											{item.name}
										</span>
									))}
								</div>
								<div className={style.labelDiv}>
									{/* {getFieldDecorator('loanMoney', {
										initialValue: this.state.loanMoney,
										rules: [ { required: true, message: '请输入还款金额' } ]
									})(
										<div className={style.money_input}>
											<InputItem
												placeholder={`申请金额${selectedLoanDate.factLmtLow ||
													''}-${selectedLoanDate.factAmtHigh || ''}元`}
												type="number"
												disabled={activeTag !== 2}
												ref={(el) => (this.inputRef = el)}
												className={activeTag === 2 ? 'blackColor' : ''}
												onBlur={() => {
													handleInputBlur();
												}}
											>
												帮你还多少(元)
											</InputItem>
											{!this.inputDisabled() ? (
												<div className={style.desc}>{this.placeholderText()}</div>
											) : null}
										</div>
									)} */}
									<div className={style.money_input}>
										<InputItem
											{...getFieldProps('loanMoney', {
												rules: [ { required: true, message: '请输入还款金额' } ]
											})}
											type="number"
											placeholder={`申请金额${selectedLoanDate.factLmtLow ||
												''}-${selectedLoanDate.factAmtHigh || ''}元`}
											disabled={activeTag !== 2}
											ref={(el) => (this.inputRef = el)}
											className={activeTag === 2 ? 'blackColor' : ''}
											onBlur={(v) => {
												handleInputBlur();
												this.calcLoanMoney(v);
											}}
											onFocus={(v) => {
												// this.updateBillInf();
											}}
										>
											帮你还多少(元)
										</InputItem>
										{activeTag === 2 ? (
											<div className={style.desc}>{this.placeholderText()}</div>
										) : null}
									</div>
									<List.Item
										onClick={() => {
											this.setState({
												modal_left: true
											});
										}}
										extra={selectedLoanDate.perdPageNm || '请选择'}
										arrow="horizontal"
									>
										借多久
									</List.Item>
								</div>
								<SXFButton className={style.modal_btn_box} onClick={this.submitCredit}>
									确定
								</SXFButton>
							</div>
						</div>
						<div
							className={[ style.modal_right, this.state.modal_left ? style.modal_left2 : '' ].join(' ')}
							onClick={() => {
								this.setState({
									modal_left: false
								});
							}}
						>
							<div className={style.modal_header}>
								选择期限
								<Icon className={style.modal_leftIcon} type="left" />
							</div>
							<div>
								{perdRateList.map((item, idx) => (
									<div
										key={idx}
										className={style.listitem}
										onClick={() => {
											//设置选中的期限
											this.filterLoanDate(item);
										}}
									>
										<span>{item.perdPageNm}</span>
										{selectedLoanDate.perdCnt === item.perdCnt && <i className={style.checkIcon} />}
									</div>
								))}
							</div>
						</div>
					</div>
				</Modal>

				{homeModal}
			</div>
		);
	}
}
