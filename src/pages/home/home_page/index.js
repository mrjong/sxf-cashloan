/*
 * @Author: shawn
 * @LastEditTime : 2020-02-12 16:11:44
 */
import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { connect } from 'react-redux';
import { Toast } from 'antd-mobile';
import { isWXOpen, dateDiffer, activeConfigSts } from 'utils';
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
import { updateBillInf } from 'utils/CommonUtil/commonFunc';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { buriedPointEvent } from 'utils/analytins';
import { home, mine, loan_fenqi } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import { Carousels, commonPage, FooterBar } from 'components';
import style from './index.scss';
// import mockData from './mockData';
import linkConf from 'config/link.conf';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import { TFDLogin } from 'utils/getTongFuDun';
// console.log(aa)
import { MsgTip, HomeModal, AddCards, ActivityEntry, SwitchCard, Welfare } from './components';

//隔5秒调取接口相关变量

@createForm()
@fetch.inject()
@setBackGround('#F0F3F9')
@commonPage()
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
			homeData: this.props.homeData || {},
			bannerList: this.props.bannerList || [],
			welfareList: (this.props.welfareList && this.props.welfareList.welfares) || [],
			activities: (this.props.welfareList && this.props.welfareList.activities) || []
		};
	}

	componentWillMount() {
		const { userInfo } = this.props;
		// 已经登录
		if (userInfo && userInfo.tokenId) {
			// 获取首页信息
			this.index_queryIndexInfo();
			// 获取福利专区/新手活动信息
			this.index_queryWelfareList();
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
	}

	/**
	 * @description: 获取首页信息
	 * @param {type}
	 * @return:
	 */
	index_queryIndexInfo = () => {
		Toast.loading('加载中...', 10);
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
			cilent: 'wap_out'
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

	// 智能按钮点击事件
	handleSmartClick = () => {
		const { homeData } = this.state;
		Toast.loading('加载中...', 10);
		if (homeData.indexSts !== 'LN0009' && homeData.indexSts !== 'LN0001') {
			// 首页-点击一键还卡（代偿）
			buriedPointEvent(home.easyRepay, {
				stateType: homeData.indexSts
			});
		}
		switch (homeData.indexSts) {
			case 'LN0001': // 新用户，信用卡未授权
				buriedPointEvent(home.applyCreditRepayment);
				getNextStatus({ $props: this.props });
				break;
			case 'LN0002': // 账单爬取中
				break;
			case 'LN0003': // 账单爬取成功 (直接跳数据风控)
				// console.log('LN0003 无风控信息 直接跳数据风控');
				buriedPointEvent(home.applyLoan);
				buriedPointEvent(mine.creditExtension, {
					entry: '首页'
				});
				if (
					!updateBillInf({
						$props: this.props,
						usrIndexInfo: homeData.dcDataInfo,
						type: 'home'
					})
				) {
					getNextStatus({ $props: this.props });
				}
				break;
			case 'LN0004': // 代还资格审核中
				Toast.hide();
				buriedPointEvent(home.machineAudit);
				this.props.history.push({
					pathname: '/home/credit_apply_succ_page',
					search: `?autId=${homeData.dcDataInfo.autId}`
				});
				break;
			case 'LN0005': // 暂无代还资格
				Toast.hide();
				buriedPointEvent(home.goSuperMarket, {
					medium: 'H5'
				});
				store.setCarrierMoxie(true); // 设置去到第三方标示
				window.location.href = linkConf.MARKET_URL;
				break;
			case 'LN0006': // 风控审核通过
				buriedPointEvent(home.signedLoan);
				getNextStatus({ $props: this.props });
				break;
			case 'LN0007': {
				// 放款中
				let title =
					homeData && homeData.dcDataInfo && homeData.dcDataInfo.repayType === '0'
						? `预计60秒完成放款`
						: `${dayjs(homeData.dcDataInfo.repayDt).format('YYYY年MM月DD日')}完成放款`;
				let desc =
					homeData && homeData.dcDataInfo && homeData.dcDataInfo.repayType === '0'
						? `超过2个工作日没有放款成功，可`
						: '如有疑问，可';
				this.props.history.push({
					pathname: '/home/loan_apply_succ_page',
					search: `?title=${title}&desc=${desc}&autId=${homeData.dcDataInfo.autId}`
				});
				break;
			}
			case 'LN0008': // 放款失败
				buriedPointEvent(home.signedLoan);
				getNextStatus({ $props: this.props });
				// this.bank_card_check();
				break;
			case 'LN0009': // 放款成功
				// 埋点-首页-点击查看代还账单
				Toast.hide();
				buriedPointEvent(home.viewBill);
				// entryFrom 给打点使用，区分从哪个页面进入订单页的
				this.props.history.push({
					pathname: '/order/order_detail_page',
					search: '?entryFrom=home',
					state: {
						billNo: homeData.dcDataInfo.billNo
					}
				});
				break;
			case 'LN0010': // 账单爬取失败/老用户 无按钮不做处理
				Toast.hide();
				break;
			case 'LN0011': // 需要过人审，人审中
				Toast.hide();
				this.props.history.push({
					pathname: '/home/loan_person_succ_page',
					search: `?creadNo=${homeData.dcDataInfo.credNo}`
				});
				break;
			case 'LN0012': // 机器人审核
				Toast.hide();
				this.props.history.push({
					pathname: '/home/loan_robot_succ_page',
					search: `?telNo=${homeData.dcDataInfo.telNo}`
				});
				break;
			case 'CN0003':
				// 通付盾 获取设备指纹
				TFDLogin();
				buriedPointEvent(loan_fenqi.fenqiHomeApplyBtn);
				if (homeData.cashDataInfo.downloadFlg === '01') {
					//需要引导下载app
					this.props.history.push(`/home/deposit_tip?cashMoney=${homeData.cashDataInfo.curAmt}`);
				} else {
					this.props.history.push('/home/loan_fenqi');
				}
				break;
			case 'CN0004':
				this.props.toast.info('正在放款中，马上到账');
				break;
			case 'CN0005':
				this.props.history.push({
					pathname: '/order/order_detail_page',
					search: '?entryFrom=home',
					state: {
						billNo: homeData.cashDataInfo.billNo
					}
				});
				break;
			default:
				Toast.hide();
		}
	};

	handleApply = () => {
		// TODONEW
		if (this.state.showDiv === '50000') {
			// 埋点-首页-点击申请信用卡代还按钮
			buriedPointEvent(home.applyCreditRepayment);
		}
		Toast.loading('加载中...', 10);
		getNextStatus({
			RouterType: 'home',
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
	/**
	 * @description: 现金分期介绍
	 * @param {type}
	 * @return:
	 */
	handleGoPlusDetail = () => {
		this.props.history.push('/others/fenqi_landing');
	};

	getCardBillAmtData() {
		const { homeData = {} } = this.state;
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
		const { homeData = {} } = this.state;
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

	goToNewMoXie = async () => {
		activeConfigSts({
			$props: this.props,
			type: 'B'
		});
	};

	/**
	 * @description: 是否展示添加银行卡按钮
	 * @param {type}
	 * @return:
	 */
	componentsAddCards = () => {
		const { homeData } = this.state;
		let componentsAddCards = null;
		const { indexSts } = homeData;
		switch (indexSts) {
			case 'LN0003': // 新用户，信用卡未授权
				componentsAddCards = (
					<AddCards
						handleClick={() => {
							// 埋点-首页-点击代偿其他信用卡
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

	render() {
		const { bannerList, welfareList, activities } = this.state;
		const { userInfo = {}, msgCount = 0 } = this.props;
		return (
			<div className={style.home_new_page}>
				<div className={style.content_top}>
					<MsgTip msgCount={msgCount} tokenObj={userInfo && userInfo.tokenId} history={this.props.history} />
				</div>

				<div className={activities && activities.length ? style.content_main_more : style.content_main}>
					<ActivityEntry data={activities} history={this.props.history} />
					<SwitchCard data={this.getDisPlayData()} />
					{bannerList.length > 0 && (
						<Carousels className={style.home_banner} data={bannerList} entryFrom="banner" />
					)}
					{welfareList && welfareList.length > 0 ? <Welfare welfareList={welfareList} /> : null}
					{this.componentsAddCards()}
					<div className={style.bottomSlogen}>
						<FooterBar />
					</div>
				</div>

				<HomeModal history={this.props.history} />
			</div>
		);
	}
}
