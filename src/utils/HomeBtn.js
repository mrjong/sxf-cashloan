/*
 * @Author: shawn
 * @LastEditTime: 2019-09-06 18:05:43
 */
import { store } from 'utils/store';
import { getDeviceType, getNextStr, isCanLoan, getMoxieData } from 'utils';
import { buriedPointEvent } from 'utils/analytins';
import { home, mine, loan_fenqi } from 'utils/analytinsType';
import TFDInit from 'utils/getTongFuDun';
const API = {
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
	mxoieCardList: '/moxie/mxoieCardList/C', // 魔蝎银行卡列表
	cashShowSwitch: '/my/switchFlag/cashShowSwitchFlag', // 是否渲染现金分期
	checkKoubei: '/activeConfig/userCheck', //是否参与口碑活动,及新老用户区分
	couponTest: '/activeConfig/couponTest', //签约测试
	mxCheckJoin: '/activeConfig/checkJoin', // 免息活动检查是否参与
	couponNotify: '/activeConfig/couponNotify' // 免息活动检查是否参与
};
class HomeBtn {
	constructor(instance) {
		this.instance = instance;
	}
	fetchData = () => {
		this.isRenderCash();
	};
	getData = () => {
		if (this.getDCDisPlay()) {
			this.getDCDisPlay()();
		} else if (this.getFQDisPlay()) {
			this.getFQDisPlay()();
		} else {
			this.goHome();
		}
	};

	// 是否渲染现金分期模块
	isRenderCash = () => {
		this.instance.props.$fetch
			.get(API.cashShowSwitch, null, {
				hideLoading: true
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					if (result.data.value === '1') {
						this.indexshowType();
					} else {
						this.credit_extension();
					}
				} else {
					this.instance.props.toast.info(result.msgInfo);
				}
			})
			.catch(() => {
				this.instance.HomeBtnStatus = false;
				this.credit_extension();
			});
	};

	// 现金分期首页信息
	usrCashIndexInfo = () => {
		this.instance.props.$fetch
			.post(API.usrCashIndexInfo, null, {
				hideLoading: true
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					this.instance.setState({
						usrCashIndexInfo: result.data,
						HomeBtnShow: true
					});
				} else {
					this.instance.props.toast.info(result.msgInfo);
				}
			})
			.catch(() => {
				this.instance.HomeBtnStatus = false;
			});
	};
	// 首页现金分期基本信息查询接口
	indexshowType = () => {
		this.instance.props.$fetch
			.post(API.indexshowType, null, {
				hideLoading: true
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					if (result.data.cashAcBalSts === '1' || result.data.cashAcBalSts === '3') {
						// 分期流程
						this.usrCashIndexInfo(result.data.cashAcBalSts);
					} else {
						// 代偿流程
						this.credit_extension();
					}
				} else {
					this.instance.props.toast.info(result.msgInfo);
				}
			})
			.catch(() => {
				this.instance.HomeBtnStatus = false;
			});
	};

	// 判断是否授信
	credit_extension = () => {
		this.requestGetUsrInfo();
	};

	// 获取代偿首页信息
	requestGetUsrInfo = async () => {
		this.instance.props.$fetch
			.post(API.USR_INDEX_INFO, null, {
				hideLoading: true
			})
			.then(async (result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					this.instance.setState(
						{
							HomeBtnShow: true,
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
						}
					);
				} else {
					this.instance.props.toast.info(result.msgInfo);
				}
			})
			.catch(() => {
				this.instance.HomeBtnStatus = false;
			});
	};

	// 首页进度
	getPercent = async () => {
		let data = await getNextStr({ $props: this.instance.props, needReturn: true });
		this.calculatePercent(data);
	};

	// 进度计算
	calculatePercent = (data) => {
		const { usrIndexInfo } = this.instance.state;
		let codes = [];
		let demo = data.codes;
		this.instance.setState({
			pageCode: demo
		});
		let codesCopy = demo.slice(1, 4);
		codes = codesCopy.split('');
		// case '0': // 未认证
		// case '1': // 认证中
		// case '2': // 认证成功
		// case '3': // 认证失败
		// case '4': // 认证过期
		let newCodes = codes.filter((ele) => {
			return ele === '0';
		});
		let newCodes2 = codes.filter((ele) => {
			return ele === '1' || ele === '2';
		});
		let newCodes3 = codes.filter((ele) => {
			return ele === '4';
		});
		if (codes[codes.length - 1] === '4') {
			this.instance.setState({
				CardOverDate: true
			});
		}
		// console.log(newCodes, newCodes2, newCodes3);
		// 还差 2 步 ：三项认证项，完成任何一项认证项且未失效
		// 还差 1 步 ：三项认证项，完成任何两项认证项且未失效
		// 还差 0 步 ：三项认证项，完成任何三项认证项且未失效（不显示）
		if (newCodes.length === 3) {
			this.instance.setState({
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
			this.instance.setState({
				showDiv: 'circle'
			});
			return;
		}
		switch (newCodes2.length) {
			case 0: // 新用户，信用卡未授权
				this.instance.setState({
					showDiv: '50000'
				});
				break;

			case 1: // 新用户，运营商未授权/基本信息未认证
				this.instance.setState({
					showDiv: 'circle'
				});
				break;

			case 2: // 新用户，信用卡未授权
				this.instance.setState({
					showDiv: 'circle'
				});
				break;
			case 3: // 显示信用卡爬取进度
				// 获取爬取卡的进度
				if (usrIndexInfo && usrIndexInfo.indexSts && usrIndexInfo.indexSts === 'LN0003') {
					this.instance.setState({
						showDiv: 'applyCredict'
					});
				} else {
					this.instance.setState({
						showDiv: ''
					});
				}
				break;
			default:
		}
	};
	goHome = () => {
		this.instance.props.history.push('/home/home');
	};
	// 跳新版魔蝎
	goToNewMoXie = () => {
		store.setMoxieBackUrl(`/home/crawl_progress_page`);
		store.setBackUrl('/home/loan_repay_confirm_page');
		this.instance.props.history.push({ pathname: '/home/moxie_bank_list_page' });
	};
	// 智能按钮点击事件
	handleSmartClick = () => {
		const { usrIndexInfo = {} } = this.instance.state;
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
				this.goHome();
				break;
			case 'LN0003': // 账单爬取成功 (直接跳数据风控)
				// console.log('LN0003 无风控信息 直接跳数据风控');
				buriedPointEvent(home.applyLoan);
				buriedPointEvent(mine.creditExtension, {
					entry: '首页'
				});
				if (this.instance.state.CardOverDate) {
					this.instance.props.toast.info('当前信用卡已过期，请重新导入');
					setTimeout(() => {
						// 跳新版魔蝎
						this.goToNewMoXie();
					}, 2000);
				} else if (usrIndexInfo.indexData.autSts === '2') {
					if (
						!isCanLoan({
							$props: this.instance.props,
							usrIndexInfo: this.instance.state.usrIndexInfo,
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
				this.goHome();
				break;
			case 'LN0005': // 暂无代还资格
				buriedPointEvent(home.goSuperMarket, {
					medium: 'H5'
				});
				store.setCarrierMoxie(true); // 设置去到第三方标示
				this.goHome();
				break;
			case 'LN0006': // 风控审核通过
				console.log('LN0006');
				buriedPointEvent(home.signedLoan);
				this.repayCheck();
				break;
			case 'LN0007': // 放款中
				console.log('LN0007');
				this.goHome();
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
				this.instance.props.history.push({
					pathname: '/order/order_detail_page',
					search: '?entryFrom=home'
				});
				break;
			case 'LN0010': // 账单爬取失败/老用户 无按钮不做处理
				this.goHome();
				break;
			case 'LN0011': // 需要过人审，人审中
				this.goHome();
				break;
			default:
				console.log('default');
		}
	};
	// 请求用户绑卡状态
	requestBindCardState = () => {
		const { usrIndexInfo = {} } = this.instance.state;
		const { indexData = {} } = usrIndexInfo;
		const autId = usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId;
		const api = autId ? `${API.chkCredCard}/${autId}` : API.CHECK_CARD;
		this.instance.props.$fetch
			.get(api, null, {
				hideLoading: true
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000') {
					store.setHomeConfirmAgency({
						autId: usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId,
						bankName: indexData.bankName,
						cardNoHid: indexData.cardNoHid
					});
					// 有风控且绑信用卡储蓄卡
					this.instance.props.history.push({
						pathname: '/home/confirm_agency'
					});
				} else if (result && result.msgCode === 'PTM2003') {
					// 有风控没绑储蓄卡 跳绑储蓄卡页面
					store.setBackUrl('/home/home');
					store.setCheckCardRouter(true);
					this.instance.props.toast.info(result.msgInfo);
					setTimeout(() => {
						this.instance.props.history.push({
							pathname: '/mine/bind_save_page',
							search: '?noBankInfo=true'
						});
					}, 3000);
				} else if (result && result.msgCode === 'PTM2002') {
					// 有风控没绑信用卡 跳绑信用卡页面
					store.setBackUrl('/home/home');
					store.setCheckCardRouter(true);
					this.instance.props.toast.info(result.msgInfo);
					setTimeout(() => {
						this.instance.props.history.push({
							pathname: '/mine/bind_credit_page',
							search: `?noBankInfo=true&autId=${autId}`
						});
					}, 3000);
				} else {
					this.instance.props.toast.info(result.msgInfo);
				}
			});
	};
	// 复借风控校验接口
	repayCheck = () => {
		const osType = getDeviceType();
		const params = {
			osTyp: osType
		};
		this.instance.props.$fetch
			.post(API.AGENT_REPAY_CHECK, params, {
				hideLoading: true
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000') {
					this.requestBindCardState();
				} else {
					// 失败的话刷新首页
					this.goHome();
				}
				// })
			});
	};

	jumpToUrl = () => {
		const { usrIndexInfo } = this.instance.state;
		const { cardBillSts, bankNo } = usrIndexInfo.indexData;
		if (cardBillSts === '00') {
			this.requestCredCardCount('cbFn', () => {
				this.instance.props.toast.info('还款日已到期，请更新账单获取最新账单信息', 2, () => {
					// 跳银行登录页面
					getMoxieData({
						$props: this.instance.props,
						bankCode: bankNo,
						goMoxieBankList: this.goToNewMoXie
					});
				});
			});
			return;
		} else if (cardBillSts === '02') {
			this.requestCredCardCount('cbFn', () => {
				this.instance.props.toast.info('已产生新账单，请更新账单或代偿其他信用卡', 2, () => {
					// 跳银行登录页面
					getMoxieData({
						$props: this.instance.props,
						bankCode: bankNo,
						goMoxieBankList: this.goToNewMoXie
					});
				});
			});
			return;
		}
		this.requestCredCardCount('cbFn', () => {
			this.instance.props.history.push('/home/loan_repay_confirm_page');
		});
	};
	// 请求信用卡数量
	requestCredCardCount = (type, callback) => {
		// 爬取卡进度页特殊处理
		const { bizId } = this.instance.state;
		this.instance.props.$fetch
			.post(API.CRED_CARD_COUNT, null, {
				hideLoading: true
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000') {
					if (type && type === 'progress') {
						if (result.data.count > 1) {
							store.setToggleMoxieCard(true);
							this.instance.props.history.replace(`/mine/credit_list_page?autId=${bizId}`);
						} else {
							this.instance.props.history.replace('/home/loan_repay_confirm_page');
						}
					} else if (type && type === 'cbFn') {
						if (result.data.count > 1) {
							store.setToggleMoxieCard(true);
							this.instance.props.history.replace(`/mine/credit_list_page?autId=${bizId}`);
						} else {
							callback && callback();
						}
					} else {
						this.repayForOtherBank(result.data.count);
					}
				} else {
					this.instance.props.toast.info(result.msgInfo);
				}
			});
	};
	// 代还其他信用卡点击事件
	repayForOtherBank = (count) => {
		if (count > 1) {
			store.setToggleMoxieCard(true);
			const { usrIndexInfo } = this.instance.state;
			this.instance.props.history.push({
				pathname: '/mine/credit_list_page',
				search: `?autId=${usrIndexInfo.indexSts === 'LN0010' ? '' : usrIndexInfo.indexData.autId}`
			});
		} else {
			this.goToNewMoXie();
		}
	};
	// 现金分期点击事件
	handleCN = (code) => {
		const { usrCashIndexInfo } = this.instance.state;
		switch (code) {
			case 'CN0003':
				// 通付盾 获取设备指纹
				TFDInit('fq');
				buriedPointEvent(loan_fenqi.fenqiHomeApplyBtn);
				if (usrCashIndexInfo.indexData.downloadFlg === '01') {
					//需要引导下载app
					this.instance.props.history.push(
						`/home/deposit_tip?cashMoney=${usrCashIndexInfo.indexData.curAmt}`
					);
				} else if (usrCashIndexInfo.indexData) {
					this.instance.props.history.push('/home/loan_fenqi');
				}
				break;
			case 'CN0004':
				this.goHome();
				break;
			case 'CN0005':
				store.setBillNo(usrCashIndexInfo.indexData.billNo);
				this.instance.props.history.push({
					pathname: '/order/order_detail_page',
					search: '?entryFrom=home'
				});
				break;
			default:
				break;
		}
	};
	// *****************************分期****************************** //
	getFQDisPlay = () => {
		let componentsDisplay = null;
		const { usrCashIndexInfo } = this.instance.state;
		console.log(usrCashIndexInfo);
		switch (usrCashIndexInfo && usrCashIndexInfo.indexSts) {
			case 'CN0001': // 现金分期额度评估中,不可能出现
			case 'CN0002': // (抱歉，暂无申请资格
				componentsDisplay = this.goHome;
				break;
			case 'CN0003': // 申请通过有额度
			case 'CN0004': // 放款中
			case 'CN0005': // 去还款
				componentsDisplay = () => {
					this.handleCN(usrCashIndexInfo.indexSts);
				};
				break;
			default:
		}
		return componentsDisplay;
	};
	// *****************************代偿****************************** //
	handleApply = () => {
		if (this.instance.state.showDiv === '50000') {
			// 埋点-首页-点击申请信用卡代还按钮
			buriedPointEvent(home.applyCreditRepayment);
		}
		getNextStr({
			$props: this.instance.props
		});
	};
	getDCDisPlay = () => {
		const { usrIndexInfo = {}, showDiv } = this.instance.state;
		let componentsDisplay = null;
		const { indexSts = '' } = usrIndexInfo;

		if (showDiv) {
			switch (showDiv) {
				case '50000':
				case 'circle':
					componentsDisplay = this.handleApply;
					break;
				case 'progress':
					componentsDisplay = this.goHome;
					break;
				case 'applyCredict':
					componentsDisplay = this.handleSmartClick;
					break;
				default:
					break;
			}
		} else {
			switch (indexSts) {
				case 'LN0001': // 新用户，信用卡未授权
					componentsDisplay = this.handleApply;
					break;
				case 'LN0002': // 账单爬取中
					componentsDisplay = () => {
						this.goHome();
						// this.handleProgressApply('01');
					};
					break;
				// case 'LN0003': // 账单爬取成功
				case 'LN0004': // 代还资格审核中
				case 'LN0005': // 暂无代还资格
				case 'LN0006': // 风控审核通过
				case 'LN0007': // 放款中
				case 'LN0008': // 放款失败
				case 'LN0009': // 放款成功
				case 'LN0011': // 账单爬取失败/老用户
					componentsDisplay = this.handleSmartClick;
					break;
				case 'LN0010': // 账单爬取失败/老用户
					componentsDisplay = this.goToNewMoXie;
					break;

				default:
					break;
			}
		}

		return componentsDisplay;
	};
}

export default HomeBtn;
