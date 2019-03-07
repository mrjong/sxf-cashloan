import defaultBanner from 'assets/images/carousel/placeholder.png';
import React, { PureComponent } from 'react';
import { Modal, Progress } from 'antd-mobile';
import Cookie from 'js-cookie';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { isWXOpen, getDeviceType } from 'utils';
import { isMPOS } from 'utils/common';
import qs from 'qs';
import { buriedPointEvent } from 'utils/analytins';
import { home, mine } from 'utils/analytinsType';
import SXFButton from 'components/ButtonCustom';
import { SXFToast } from 'utils/SXFToast';
import fetch from 'sx-fetch';
import Carousels from 'components/Carousels';
import InfoCard from './components/InfoCard';
import BankContent from './components/BankContent';
import MsgBadge from './components/MsgBadge';
import ActivityModal from 'components/Modal';
import style from './index.scss';
import mockData from './mockData';
const API = {
	BANNER: '/my/getBannerList', // 0101-banner
	USR_INDEX_INFO: '/index/usrIndexInfo', // 0103-首页信息查询接口
	CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
	CHECK_CARD: '/my/chkCard', // 0410-是否绑定了银行卡
	GETSTSW: '/my/getStsw', // 获取首页进度
	AGENT_REPAY_CHECK: '/bill/agentRepayCheck' // 复借风控校验接口
};

let token = '';
let tokenFromStorage = '';

let timer;
let timerOut;

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
			usrIndexInfo: '',
			haselescard: 'true',
			percentSatus: '',
			visibleLoading: false,
			percent: 0,
			showToast: false,
			isShowActivityModal: false // 是否显示活动弹窗
		};
	}

	componentWillMount() {
		// 清除订单缓存
		store.removeBackData();
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
			this.requestGetUsrInfo();
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

	// 从 url 中获取参数，如果有 token 就设置下
	getTokenFromUrl = () => {
		const urlParams = qs.parse(location.search, { ignoreQueryPrefix: true });
		if (urlParams.token) {
			Cookie.set('fin-v-card-token', urlParams.token, { expires: 365 });
			store.setToken(urlParams.token);
		}
	};

	// 首页进度
	getPercent = () => {
		this.props.$fetch.post(API.GETSTSW).then(
			(result) => {
				if (result && result.data !== null) {
					this.calculatePercent(result.data);
				}
			},
			(err) => {
				err.msgInfo && this.props.toast.info(err.msgInfo);
			}
		);
	};

	// 进度计算
	calculatePercent = (list) => {
		let codes = [];
		list.forEach((element) => {
			if (element.code === 'basicInf' || element.code === 'operator' || element.code === 'idCheck') {
				codes.push(element.stsw.dicDetailCd);
			}
		});
		// case '1': // 认证中
		// case '2': // 认证成功
		// case '3': // 认证失败
		// case '4': // 认证过期
		let newCodes2 = codes.filter((ele, index, array) => {
			return ele === '1' || ele === '2';
		});
		console.log(newCodes2);
		// 还差 2 步 ：三项认证项，完成任何一项认证项且未失效
		// 还差 1 步 ：三项认证项，完成任何两项认证项且未失效
		// 还差 0 步 ：三项认证项，完成任何三项认证项且未失效（不显示）
		switch (newCodes2.length) {
			case 1: // 新用户，信用卡未授权
				this.setState({
					percentSatus: '2'
				});
				break;
			case 2: // 新用户，信用卡未授权
				this.setState({
					percentSatus: '1'
				});
				break;
			case 0: // 新用户，信用卡未授权
				this.setState({
					percentSatus: '3'
				});
				break;
			default:
				this.setState({
					percentSatus: ''
				});
		}
	};

	// 智能按钮点击事件
	handleSmartClick = () => {
		const { usrIndexInfo } = this.state;
		if (usrIndexInfo.indexSts === 'LN0001') {
			// 埋点-首页-点击申请信用卡代还按钮
			buriedPointEvent(home.applyCreditRepayment);
		} else if (usrIndexInfo.indexSts === 'LN0009') {
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
				this.props.history.push({
					pathname: '/mine/credit_extension_page',
					search: `?isShowCommit=true&autId=${usrIndexInfo.indexData.autId}`
				});
				break;
			case 'LN0004': // 代还资格审核中
				console.log('LN0004');
				this.props.toast.info('正在审批中，请耐心等待');
				break;
			case 'LN0005': // 暂无代还资格
				console.log('LN0005');
				this.props.toast.info(
					`您暂时没有代还资格，请${dayjs(usrIndexInfo.indexData.netAppyDate).format('YYYY-MM-DD')}日再试`
				);
				break;
			case 'LN0006': // 风控审核通过
				console.log('LN0006');
				buriedPointEvent(home.repaymentBtnClick6);
				this.repayCheck();
				break;
			case 'LN0007': // 放款中
				console.log('LN0007');
				this.props.toast.info(`您的代还资金将于${dayjs(usrIndexInfo.indexData.repayDt).format('YYYY-MM-DD')}到账，请耐心等待`);
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
		// /mine/credit_extension_page?
		store.setMoxieBackUrl(`/mine/credit_extension_page?noAuthId=true`);
		this.props.history.push({ pathname: '/home/moxie_bank_list_page' });
	};

	// 请求用户绑卡状态
	requestBindCardState = () => {
		const { usrIndexInfo } = this.state;
		this.props.$fetch.get(API.CHECK_CARD).then((result) => {
			if (result && result.msgCode === 'PTM0000') {
				// 有风控且绑信用卡储蓄卡
				// this.props.history.push({ pathname: '/home/confirm_agency', search: `?indexData=${usrIndexInfo && JSON.stringify(usrIndexInfo.indexData)}`});
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
					this.props.history.push({ pathname: '/mine/bind_credit_page', search: '?noBankInfo=true' });
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

	// 获取首页信息
	requestGetUsrInfo = () => {
		this.props.$fetch
			.post(API.USR_INDEX_INFO)
			.then((result) => {
				// let result = {
				// 	data: {},
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
					this.setState(
						{
							usrIndexInfo:
								result.data && result.data.indexData
									? result.data
									: Object.assign({}, result.data, { indexData: {} })
						},
						() => {
							console.log(this.state.usrIndexInfo);
						}
					);
					if (
						isMPOS() &&
						(result.data.indexSts === 'LN0001' || result.data.indexSts === 'LN0003') &&
						!store.getShowActivityModal()
					) {
						this.setState(
							{
								isShowActivityModal: true
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
			})
			.catch(() => {
				this.setState({
					showDefaultTip: true
				});
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

	render() {
		const { bannerList, usrIndexInfo, visibleLoading, percent, percentSatus } = this.state;
		const { history } = this.props;
		let componentsDisplay = null;
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
							usrIndexInfo.indexData.autSts !== '2') ? null : (
							<SXFButton className={style.smart_button_two} onClick={this.handleSmartClick}>
								{usrIndexInfo.indexSts === 'LN0003' ||
								usrIndexInfo.indexSts === 'LN0006' ||
								usrIndexInfo.indexSts === 'LN0008' ? (
									'一键还账单'
								) : usrIndexInfo.indexSts === 'LN0001' ? (
									'查看我的账单，帮我还'
								) : (
									usrIndexInfo.indexMsg
								)}
							</SXFButton>
						)}
					</BankContent>
				);
				break;
			default:
				// if (isWXOpen()) {
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
			// }
		}
		return (
			<div className={style.home_page}>
				{isWXOpen() && !tokenFromStorage && !token ? (
					<Carousels data={bannerList} entryFrom="banner" />
				) : usrIndexInfo ? bannerList && bannerList.length > 0 ? (
					<Carousels data={bannerList} entryFrom="banner">
						<MsgBadge toast={this.props.toast} />
					</Carousels>
				) : (
					<img className={style.default_banner} src={defaultBanner} alt="banner" />
				) : (
					<img className={style.default_banner} src={defaultBanner} alt="banner" />
				)}
				<div className={style.content_wrap}>{componentsDisplay}</div>
				<div className={style.tip_bottom}>怕逾期，用还到</div>
				{/* {首页活动提示弹窗（对内有）} */}
				{this.state.isShowActivityModal && (
					<ActivityModal closeActivityModal={this.closeActivityModal} history={history} />
				)}
				<Modal wrapClassName={style.modalLoadingBox} visible={visibleLoading} transparent maskClosable={false}>
					<div className="show-info">
						<div className={style.modalLoading}>资质检测中...</div>
						<div className="progress">
							<Progress percent={percent} position="normal" />
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}
