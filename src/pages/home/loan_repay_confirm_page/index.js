import React, { PureComponent } from 'react';
import { Progress, Icon, InputItem, List, Modal } from 'antd-mobile';
import style from './index.scss';
import fetch from 'sx-fetch';
import dayjs from 'dayjs';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { handleClickConfirm, handleInputBlur, idChkPhoto, isCanLoan, getOperatorStatus, getMoxieData } from 'utils';
import mockData from './mockData';
import { buriedPointEvent } from 'utils/analytins';
import { home, loan_repay_confirm } from 'utils/analytinsType';
import TimeoutPayModal from 'components/TimeoutPayModal';
import FeedbackModal from 'components/FeedbackModal';
import SelectList from 'components/SelectList';
// import ScrollText from 'components/ScrollText';
let isinputBlur = false;
const API = {
	queryBillStatus: '/wap/queryBillStatus', //
	// qryPerdRate: '/bill/qryperdrate', // 0105-确认代还信息查询接口
	qryPerdRate: '/bill/prod',
	CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
	CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
	USR_INDEX_INFO: '/index/usrIndexInfo' // 0103-首页信息查询接口
};
const tagList = [
	{
		name: '部分还款',
		value: 'part'
	},
	{
		name: '最低还款',
		value: 'min'
	},
	{
		name: '全额还款',
		value: 'full'
	}
];

let timer = null;
@fetch.inject()
@createForm()
@setBackGround('#F7F8FA')
export default class loan_repay_confirm_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			usrIndexInfo: {},
			btnDisabled: true,
			activeTag: '', //激活的tag
			isShowProgress: false,
			percent: 0,
			loanMoney: '',
			time: 0,
			retryCount: 2,
			showAgainUpdateBtn: false, // 重新获取账单按钮是否显示
			overDt: '', //还款日
			billDt: '', //账单日
			cardBillAmt: '', //账单金额
			modal_left: false,
			isShowCreditModal: false,
			perdRateList: [],
			dayPro: {},
			cardCount: '', // 卡的数量
			repayType: '', // 还款方式
			fullMinAmt: '', // 全额或者最低还卡金额
			showTimeoutPayModal: false,
			showFeedbackModal: false
		};
	}

	componentDidMount() {
		store.removeToggleMoxieCard();
		this.queryUsrInfo();
		this.requestCredCardCount();
		this.showFeedbackModal();
	}

	componentWillUnmount() {
		clearInterval(timer);
		store.removeRealNameNextStep();
	}

	startInterval = () => {
		timer = setInterval(() => {
			this.setState(
				{
					percent: this.state.percent + parseInt(Math.random() * (100 / 30) + 1),
					time: this.state.time + 1
				},
				() => {
					if (this.state.time > 29) {
						clearInterval(timer);
						this.queryUsrInfo(true);
					} else if (this.state.time % 5 === 0) {
						clearInterval(timer);
						this.queryUsrInfo();
					}
				}
			);
		}, 1000);
	};

	//查询用户相关信息
	queryUsrInfo = (hideFlag) => {
		this.props.$fetch
			.post(API.USR_INDEX_INFO)
			.then((res) => {
				// let res = {
				// 	data: mockData.LN0003,
				// 	msgCode: 'PTM0000',
				// 	msgMsg: 'PTM0000'
				// };
				this.setState(
					{
						usrIndexInfo: res.data.indexData ? res.data : Object.assign({}, res.data, { indexData: {} })
					},
					() => {
						const { indexSts, indexData } = this.state.usrIndexInfo;
						if (indexSts === 'LN0002' || (indexSts === 'LN0003' && indexData.autSts === '1')) {
							//更新中
							if (hideFlag) {
								this.hideProgress();
								this.state.retryCount--;
								this.setState({
									showAgainUpdateBtn: true // 显示 重新更新按钮
								});
							} else {
								this.showProgress();
							}
						} else if (indexSts === 'LN0010' || (indexSts === 'LN0003' && indexData.autSts === '3')) {
							//更新失败
							this.hideProgress();
							this.state.retryCount--;
							this.setState({
								showAgainUpdateBtn: false
							});
						} else if (indexSts === 'LN0003' && indexData.autSts === '2') {
							//更新成功
							this.hideProgress();
							// this.getQryPerdRate()
							this.setState(
								{
									fetchBillSucc: true,
									showAgainUpdateBtn: false
								},
								() => {
									this.toggleTag(0);
								}
							);
						}
					}
				);
			})
			.catch((err) => {
				this.hideProgress();
				this.state.retryCount--;
				this.setState({
					showAgainUpdateBtn: true
				});
			});
	};

	showProgress = () => {
		this.setState(
			{
				isShowProgress: true
			},
			() => {
				this.startInterval();
			}
		);
	};

	closeCreditModal = () => {
		this.setState({
			isShowCreditModal: false
		});
	};
	getQryPerdRate = (money, tag3) => {
		if (!money) {
			return;
		}
		this.props.$fetch
			.get(`${API.qryPerdRate}`, {
				applAmt: money
			})
			.then((res) => {
				const date = res.data && res.data.perdRateList.length ? res.data.perdRateList : [];
				// const dateCopy =
				// 	date[0] && date[0].perdLth == 30
				// 		? date[1]
				// 		: date[0] && date[0].perdLth == 30 && date.length !== 1 && date[0];
				this.setState({
					perdRateList: date,
					selectedLoanDate: {}
				});
			});
	};
	//隐藏进度条
	hideProgress = () => {
		this.setState(
			{
				percent: 100
			},
			() => {
				clearInterval(timer);
				let timer2 = setTimeout(() => {
					if (this.state.retryCount === 0) {
						this.props.toast.info('账单更新失败');
						this.setState({
							showAgainUpdateBtn: false
						});
					}
					this.setState({
						isShowProgress: false,
						percent: 0,
						time: 0
					});
					clearTimeout(timer2);
				}, 1000);
			}
		);
	};

	goMoxieBankList = () => {
		store.setToggleMoxieCard(true);
		store.setMoxieBackUrl(`/home/crawl_progress_page`);
		this.props.history.push('/home/moxie_bank_list_page');
	};
	// 代还其他信用卡点击事件
	repayForOtherBank = (count, type) => {
		buriedPointEvent(home.replaceCard);
		// type针对一张卡也可以跳到银行列表页的情况
		store.setToggleMoxieCard(true);
		if (type && type === 'switch') {
			store.setBackUrl('/home/loan_repay_confirm_page');
			const { usrIndexInfo } = this.state;
			this.props.history.push({
				pathname: '/mine/credit_list_page',
				search: `?autId=${usrIndexInfo.indexSts === 'LN0010'
					? ''
					: (usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId) || ''}`
			});
		} else {
			if (count > 1) {
				store.setBackUrl('/home/loan_repay_confirm_page');
				const { usrIndexInfo } = this.state;
				this.props.history.push({
					pathname: '/mine/credit_list_page',
					search: `?autId=${usrIndexInfo.indexSts === 'LN0010'
						? ''
						: (usrIndexInfo && usrIndexInfo.indexData && usrIndexInfo.indexData.autId) || ''}`
				});
			} else {
				this.goMoxieBankList();
			}
		}
	};

	// 请求信用卡数量
	requestCredCardCount = () => {
		this.props.$fetch
			.post(API.CRED_CARD_COUNT)
			.then((result) => {
				if (result && result.msgCode === 'PTM0000') {
					this.setState({
						cardCount: result.data.count
					});
				} else {
					this.props.toast.info(result.msgInfo);
				}
			})
			.catch((err) => {
				this.props.toast.info(err.message);
			});
	};

	handleSubmit = async () => {
		buriedPointEvent(home.moneyCreditCardConfirmBtn);
		const { selectedLoanDate = {}, usrIndexInfo, cardCount, btnDisabled, fullMinAmt } = this.state;
		const { indexData = {} } = usrIndexInfo;
		const { minApplAmt, maxApplAmt } = indexData;
		if (!this.state.fetchBillSucc) {
			this.props.toast.info('账单正在更新中，请耐心等待哦');
			return;
		}
		if (this.updateBillInf()) {
			return;
		}
		if (
			!isCanLoan({
				$props: this.props,
				goMoxieBankList: () => {
					this.repayForOtherBank(cardCount);
				},
				usrIndexInfo: this.state.usrIndexInfo
			})
		) {
			return;
		}
		let repayMoney = this.props.form.getFieldValue('loanMoney')
			? this.props.form.getFieldValue('loanMoney')
			: fullMinAmt;
		if (repayMoney === 0 || !repayMoney) {
			this.props.toast.info('请输入借款金额');
			return;
		}
		isinputBlur = true;
		setTimeout(() => {
			isinputBlur = false;
		}, 100);

		if (
			Number(repayMoney) > Number(maxApplAmt) ||
			Number(repayMoney) < Number(minApplAmt) ||
			Number(repayMoney) % 100 !== 0
		) {
			this.props.toast.info(`申请金额${minApplAmt}~${maxApplAmt}元且为100整数倍`, 2, () => {
				this.calcLoanMoney(repayMoney, 'tag3');
			});
			return;
		}
		let getOperatorData = await getOperatorStatus({ $props: this.props });
		console.log(getOperatorData);
		if (!getOperatorData) {
			return;
		}

		if (!selectedLoanDate.perdCnt) {
			this.props.toast.info('请选择借款期限');
			return;
		}
		if (btnDisabled) {
			return;
		}
		const params = {
			...this.state.selectedLoanDate,
			activeName: tagList[this.state.activeTag].name,
			autId: usrIndexInfo.indexSts === 'LN0010' ? '' : usrIndexInfo.indexData.autId,
			rpyAmt: Number(repayMoney)
		};
		idChkPhoto({
			$props: this.props,
			type: 'creditExtension',
			msg: '审核'
		}).then((res) => {
			switch (res) {
				case '1':
					// 成功
					//调用授信接口
					handleClickConfirm(this.props, params);
					break;
				case '2':
					store.setLoanAspirationHome(params);
					break;
				case '3':
					store.setIdChkPhotoBack(-2); //从人脸中间页回退3层到此页面
					store.setLoanAspirationHome(params);
					break;
				default:
					break;
			}
		});
	};

	//过滤选中的还款期限
	filterLoanDate = (item, type) => {
		let itemCopy = item;
		console.log(item);
		this.dateType(itemCopy.perdLth);
		// if (item && item.perdLth == 30) {
		// 	this.setState({
		// 		modal_left: true,
		// 		dayPro: item
		// 	});
		// 	return;
		// }
		if (this.updateBillInf()) {
			return;
		}
		this.setState(
			{
				selectedLoanDate: itemCopy, // 设置选中的期数
				isShowCreditModal: false
			},
			() => {
				this.setState({
					btnDisabled: false,
					modal_left: false
				});
			}
		);
	};

	//计算该显示的还款金额
	calcLoanMoney = (money, tag3) => {
		// isClear为true的时候点击最低还卡或者最高还卡都清除输入框
		const { usrIndexInfo } = this.state;
		const { indexData } = usrIndexInfo;
		if (indexData && indexData.maxApplAmt && Number(money) >= Number(indexData.maxApplAmt)) {
			this.props.form.setFieldsValue({
				loanMoney: indexData.maxApplAmt
			});
			this.getQryPerdRate(indexData.maxApplAmt, tag3);
		} else if (indexData && indexData.minApplAmt && Number(money) <= Number(indexData.minApplAmt)) {
			if (money === '') {
				// 默认最大值
				this.props.form.setFieldsValue({
					loanMoney: indexData.maxApplAmt
				});
			} else {
				this.props.form.setFieldsValue({
					loanMoney: indexData.minApplAmt
				});
			}
			this.getQryPerdRate(indexData.minApplAmt, tag3);
		} else {
			if (money) {
				this.props.form.setFieldsValue({
					loanMoney: Math.ceil(money / 100) * 100
				});
				this.getQryPerdRate(Math.ceil(money / 100) * 100, tag3);
			} else if (indexData.minApplAmt) {
				this.props.form.setFieldsValue({
					loanMoney: indexData.minApplAmt
				});
				this.getQryPerdRate(indexData.minApplAmt, tag3);
			} else {
				this.props.form.setFieldsValue({
					loanMoney: ''
				});
			}
		}
	};

	//切换tag标签
	toggleTag = (idx, type) => {
		if (this.state.activeTag === idx) {
			return;
		}
		isinputBlur = true;
		setTimeout(() => {
			isinputBlur = false;
		}, 100);
		// type为是自动执行该方法，还是点击执行该方法
		const { usrIndexInfo, fetchBillSucc, cardCount } = this.state;
		const { indexData = {} } = usrIndexInfo;
		const { minApplAmt, maxApplAmt } = indexData;
		if (!fetchBillSucc) {
			this.props.toast.info('账单更新成功方可选择，请耐心等待哦');
			return;
		}
		if (type && type === 'click') {
			if (this.updateBillInf()) {
				return;
			}
		}
		// 埋点
		switch (idx) {
			case 0:
				buriedPointEvent(home.repaymentIntentionPart, {
					userType: 'newUser'
				});
				break;
			case 1:
				buriedPointEvent(home.repaymentIntentionLowest, {
					userType: 'newUser'
				});
				break;
			case 2:
				buriedPointEvent(home.repaymentIntentionAll, {
					userType: 'newUser'
				});
				break;
			default:
				break;
		}
		if (
			type &&
			type === 'click' &&
			!isCanLoan({
				$props: this.props,
				goMoxieBankList: () => {
					this.repayForOtherBank(cardCount);
				},
				usrIndexInfo: this.state.usrIndexInfo
			})
		) {
			return;
		}
		this.setState(
			{
				activeTag: idx,
				btnDisabled: true,
				repayType: tagList[idx]
			},
			() => {
				//全额还款
				if (idx === 2) {
					this.setState({
						fullMinAmt: maxApplAmt
					});
					this.calcLoanMoney(maxApplAmt, '');
				} else if (idx === 1) {
					this.setState({
						fullMinAmt: minApplAmt
					});
					//最低还款
					this.calcLoanMoney(minApplAmt, '');
				} else {
					this.calcLoanMoney(maxApplAmt, '');
				}
			}
		);
	};

	inputDisabled = () => {
		const { fetchBillSucc, activeTag } = this.state;
		if (fetchBillSucc && (activeTag === 0 || activeTag === 1)) {
			return true;
		}
		return false;
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

	// placeholderText = () => {
	// 	const { fetchBillSucc, activeTag, usrIndexInfo } = this.state;
	// 	const { indexData } = usrIndexInfo;
	// 	if (fetchBillSucc && activeTag === 2) {
	// 		return `申请金额${indexData.minApplAmt || ''}-${indexData.maxApplAmt || ''}元`;
	// 	} else {
	// 		return ``;
	// 	}
	// };

	updateBillInf = () => {
		const { usrIndexInfo } = this.state;
		const { cardBillSts, bankNo } = usrIndexInfo.indexData;
		if (cardBillSts === '00') {
			this.props.toast.info('还款日已到期，请更新账单获取最新账单信息', 2, () => {
				// 跳银行登录页面
				getMoxieData({
					bankCode: bankNo,
					$props: this.props,
					goMoxieBankList: this.goMoxieBankList
				});
			});
			return true;
		} else if (cardBillSts === '02') {
			this.props.toast.info('已产生新账单，请更新账单或代偿其他信用卡', 2, () => {
				// 跳银行登录页面
				getMoxieData({
					bankCode: bankNo,
					$props: this.props,
					goMoxieBankList: this.goMoxieBankList
				});
			});
			return true;
		}
		return false;
	};
	dateType = (value) => {
		console.log(value, '---------');
		// 埋点
		switch (value) {
			case '30':
				buriedPointEvent(home.durationDay30, {
					userType: 'newUser'
				});
				break;
			case '3':
				buriedPointEvent(home.durationMonth3, {
					userType: 'newUser'
				});
				break;
			case '6':
				buriedPointEvent(home.durationMonth6, {
					userType: 'newUser'
				});
				break;
			case '9':
				buriedPointEvent(home.durationMonth9, {
					userType: 'newUser'
				});
				break;
			case '12':
				buriedPointEvent(home.durationMonth12, {
					userType: 'newUser'
				});
				break;
			default:
				break;
		}
	};
	render() {
		const {
			usrIndexInfo,
			selectedLoanDate,
			perdRateList,
			btnDisabled,
			cardCount,
			repayType,
			fetchBillSucc,
			fullMinAmt,
			showTimeoutPayModal,
			showFeedbackModal
		} = this.state;
		const { indexData = {} } = usrIndexInfo;
		const {
			overDt,
			billDt,
			cardBillAmt,
			minPayment,
			cardNoHid,
			bankNo,
			bankName,
			cardBillSts,
			billRemainAmt,
			cardBillDt,
			minApplAmt,
			maxApplAmt
		} = indexData;
		const { getFieldProps } = this.props.form;
		const iconClass = bankNo ? `bank_ico_${bankNo}` : 'logo_ico';
		let overDtStr = '';
		if (overDt > 0) {
			overDtStr = `<span class="blod">${overDt}</span>天 后到期`;
		} else if (parseInt(overDt, 10) === 0) {
			overDtStr = '<span class="blod">今天到期</span>';
		} else if (overDt < 0) {
			overDtStr = `<span class="blod">已到期</span>`;
		} else {
			overDtStr = `<span class="blod">--</span>天`;
		}
		const billDtData = !billDt ? '----/--/--' : dayjs(billDt).format('YYYY/MM/DD');

		const cardBillDtData = !cardBillDt ? '----/--/--' : dayjs(cardBillDt).format('YYYY/MM/DD');

		let cardBillAmtData = '';
		if (cardBillSts === '02') {
			cardBillAmtData = '需更新账单';
		} else {
			// 优先取剩余应还，否则去账单金额
			if (billRemainAmt && Number(billRemainAmt) > 0) {
				cardBillAmtData = parseFloat(billRemainAmt, 10).toFixed(2);
			} else if (!cardBillAmt && cardBillAmt !== 0) {
				cardBillAmtData = '----.--';
			} else if (cardBillSts === '01' && (billRemainAmt === 0 || (billRemainAmt && Number(billRemainAmt) <= 0))) {
				cardBillAmtData = '已结清';
			} else if (cardBillSts === '01' && (cardBillAmt === 0 || (cardBillAmt && Number(cardBillAmt) <= 0))) {
				cardBillAmtData = '已结清';
			} else {
				cardBillAmtData = parseFloat(cardBillAmt, 10).toFixed(2);
			}
		}

		let placeholderText = '';
		if (fetchBillSucc) {
			placeholderText = `可申请 ${indexData.minApplAmt || ''}~${indexData.maxApplAmt || ''}`;
		} else {
			placeholderText = ``;
		}
		let repayMoney = this.props.form.getFieldValue('loanMoney')
			? this.props.form.getFieldValue('loanMoney')
			: fullMinAmt;
		return (
			<div className={[ style.pageWrapper, 'loan_repay_confirm' ].join(' ')}>
				{/* <ScrollText /> */}
				<div className={[ style.page_inner_wrap, 'modal_l_r2' ].join(' ')}>
					<div className={style.bankCard}>
						<div className={style.titleBg}>收款信用卡</div>
						{cardCount && cardCount > 0 ? (
							<div
								className={style.cardNumBox}
								onClick={() => {
									this.repayForOtherBank(cardCount, 'switch');
								}}
							>
								<span>更换信用卡</span>
								<Icon type="right" color="#C5C5C5" className={style.rightArrow} />
							</div>
						) : null}
						<div className={style.top}>
							<div className={style.bankBox}>
								<span className={[ 'bank_ico', iconClass, `${style.bankLogo}` ].join(' ')} />
								<span className={style.name}>{!bankName ? '****' : bankName}</span>
								<span className={style.lastNo}>({!cardNoHid ? '****' : cardNoHid.slice(-4)})</span>
							</div>
						</div>
						<div className={style.center}>
							<strong className={style.billMoney}>{cardBillAmtData}</strong>
							<div className={style.billInfo}>
								<div className={style.item}>
									<p className={`${style.name} ${style.moneyTit}`}>剩余应还金额(元)</p>
								</div>
								<div className={style.item}>
									<span className={style.name}>还款日：{cardBillDtData}</span>
								</div>
							</div>
						</div>
					</div>

					<div className={[ style.bankCard, style.heightMoney ].join(' ')}>
						<div>
							<div className={style.titleBg}>借多少钱</div>
						</div>
						<div className={style.inputBox}>
							<div className={style.dw}>￥</div>
							<InputItem
								maxLength={15}
								{...getFieldProps('loanMoney', {
									rules: [ { required: true, message: '请输入还款金额' } ]
								})}
								type="number"
								placeholder={placeholderText}
								ref={(el) => (this.inputRef = el)}
								// className={this.inputDisabled() ? 'blackColor' : 'blackColor'}
								onBlur={(v) => {
									setTimeout(() => {
										if (isinputBlur) {
											return;
										}
										this.calcLoanMoney(v, 'tag3');
									});

									handleInputBlur();
								}}
								onFocus={(v) => {
									this.setState({
										repayType: tagList[0],
										activeTag: 0,
										btnDisabled: true,
										fullMinAmt: ''
									});
									if (this.updateBillInf()) {
										return;
									}
									this.props.form.setFieldsValue({
										loanMoney: v ? v : maxApplAmt ? maxApplAmt : ''
									});
								}}
							/>
							<i
								className={style.edit_icon}
								onClick={() => {
									this.inputRef.focus();
								}}
							/>
						</div>
						<div className={style.repayTypeBox}>
							<div
								className={style.item}
								onClick={() => {
									this.toggleTag(2, 'click');
								}}
							>
								<div>
									<span className={style.title}>借全额</span>
									<span className={style.money}>¥{maxApplAmt || '-.--'}</span>
								</div>
								<div className={style.desc} style={{ paddingLeft: 0 }}>
									一键结清账单，释放卡额度
								</div>
							</div>
							<div
								className={style.item}
								onClick={() => {
									this.toggleTag(1, 'click');
								}}
							>
								<div>
									<span className={style.title}>借最低</span>
									<span className={style.money}>¥{minApplAmt || '-.--'}</span>
								</div>
								<div className={style.desc} style={{ paddingRight: 0 }}>
									信用卡免逾期，还款无压力
								</div>
							</div>
						</div>
					</div>

					<div className={[ style.bankCard, style.heightSelect ].join(' ')}>
						<div>
							<div className={style.titleBg}>借多久</div>
						</div>
						<div className={style.border_bottom}>
							<List.Item
								onClick={() => {
									if (
										!isCanLoan({
											$props: this.props,
											goMoxieBankList: () => {
												this.repayForOtherBank(cardCount);
											},
											usrIndexInfo: this.state.usrIndexInfo
										})
									) {
										return;
									}
									if (this.state.perdRateList && this.state.perdRateList.length !== 0) {
										if (
											this.state.perdRateList.length === 1 &&
											this.state.perdRateList[0].perdLth == 30 &&
											(this.state.perdRateList[0].factLmtLow > Number(repayMoney) ||
												Number(repayMoney) > this.state.perdRateList[0].factAmtHigh)
										) {
											this.props.toast.info('暂无可借产品');
										} else {
											this.setState({
												isShowCreditModal: true
											});
										}
									} else {
										this.props.toast.info('暂无可借产品');
									}
								}}
								extra={<SelectList text={selectedLoanDate}>22</SelectList>}
							>
								&nbsp;
							</List.Item>
						</div>
					</div>
					<div
						onClick={() => {
							this.setState({
								showTimeoutPayModal: true
							});
						}}
						className={style.freeService}
					>
						<div className={style.title}>
							审核超时赔（免费服务）<i />
						</div>
						<div className={style.desc}>50元免息券</div>
					</div>
				</div>
				<div className={style.handle_authority}>
					<div
						className={[ style.button, btnDisabled ? style.disabledBtn : '' ].join(' ')}
						onClick={this.handleSubmit}
					>
						提交申请
					</div>
				</div>
				<Modal popup visible={this.state.isShowCreditModal} animationType="slide-up" maskClosable={false}>
					<div className={style.modal_box}>
						<div className={[ style.modal_left, this.state.modal_left ? style.modal_left1 : '' ].join(' ')}>
							<div className={style.modal_header}>
								选择期限
								<Icon
									onClick={() => {
										this.closeCreditModal();
									}}
									className={style.close}
									type="cross"
								/>
							</div>
							<div className={style.modal_content}>
								<div className={style.labelDiv}>
									<div className={style.trendBox}>
										<i />
										<div className={style.trendDesc}>
											<span>月还款金额大，费用低</span>
											<span>月还款金额小，费用高</span>
										</div>
									</div>
									<div className={style.limitBox}>
										{perdRateList.map((item, index) => {
											return (item.perdLth == 30 &&
												item.factLmtLow <= Number(repayMoney) &&
												Number(repayMoney) <= item.factAmtHigh) ||
											item.perdLth != 30 ? (
												<div
													key={index}
													className={style.listitem}
													className={
														selectedLoanDate.perdCnt === item.perdCnt ? (
															`${style.listitem} ${style.listActiveItem}`
														) : (
															style.listitem
														)
													}
													onClick={() => {
														this.filterLoanDate(item);
													}}
												>
													<span>{item.perdPageNm}</span>
												</div>
											) : null;
										})}
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
				<TimeoutPayModal
					visible={showTimeoutPayModal}
					closeModal={() => {
						this.setState({
							showTimeoutPayModal: false
						});
					}}
				/>
				<FeedbackModal
					history={this.props.history}
					toast={this.props.toast}
					visible={showFeedbackModal}
					closeModal={this.closeFeedbackModal}
				/>
			</div>
		);
	}
}
