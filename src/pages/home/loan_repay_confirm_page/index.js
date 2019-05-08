import React, { PureComponent } from 'react';
import { Progress, Icon, InputItem, List, Modal } from 'antd-mobile';
import style from './index.scss';
import fetch from 'sx-fetch';
import dayjs from 'dayjs';
import { createForm } from 'rc-form';
import AsyncCascadePicker from 'components/AsyncCascadePicker';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { getFirstError, handleClickConfirm, handleInputBlur, idChkPhoto, isCanLoan } from 'utils';
import mockData from './mockData';
import { buriedPointEvent } from 'utils/analytins';
import { home, loan_repay_confirm } from 'utils/analytinsType';
import SXFButton from 'components/ButtonCustom';
import ScrollText from 'components/ScrollText';
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

let timer = null;
@fetch.inject()
@createForm()
@setBackGround('#fff')
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
			dayPro: {}
		};
	}

	componentDidMount() {
		store.removeToggleMoxieCard();
		this.queryUsrInfo();
	}

	componentWillUnmount() {
		clearInterval(timer);
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
					btnDisabled:
						(tag3 === 'tag3' && this.state.activeTag == 2) || this.state.activeTag !== 2 ? false : true,
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

	//更新账单
	updateBill = () => {
		// 重新更新按钮埋点
		buriedPointEvent(home.HomeCardRenew);
		this.queryUsrInfo();
	};

	goMoxieBankList = () => {
		store.setToggleMoxieCard(true);
		store.setMoxieBackUrl(`/home/loan_repay_confirm_page`);
		this.props.history.push('/home/moxie_bank_list_page');
	};
	// 代还其他信用卡点击事件
	repayForOtherBank = (count) => {
		store.setToggleMoxieCard(true);
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
	};

	// 请求信用卡数量
	requestCredCardCount = () => {
		this.props.$fetch
			.post(API.CRED_CARD_COUNT)
			.then((result) => {
				if (result && result.msgCode === 'PTM0000') {
					this.repayForOtherBank(result.data.count);
				} else {
					this.props.toast.info(result.msgInfo);
				}
			})
			.catch((err) => {
				this.props.toast.info(err.message);
			});
	};

	handleSubmit = () => {
		buriedPointEvent(home.moneyCreditCardConfirmBtn);
		const { selectedLoanDate = {}, usrIndexInfo } = this.state;
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
				goMoxieBankList: this.requestCredCardCount,
				usrIndexInfo: this.state.usrIndexInfo
			})
		) {
			return;
		}
		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (values.loanMoney === 0 || !values.loanMoney) {
					this.props.toast.info('请输入借款金额');
					return;
				}
				isinputBlur = true;
				setTimeout(() => {
					isinputBlur = false;
				}, 100);

				if (
					Number(values.loanMoney) > Number(maxApplAmt) ||
					Number(values.loanMoney) < Number(minApplAmt) ||
					Number(values.loanMoney) % 100 !== 0
				) {
					this.props.toast.info(`申请金额${minApplAmt}~${maxApplAmt}元且为100整数倍`, 2, () => {
						this.calcLoanMoney(values.loanMoney, 'tag3');
					});
					return;
				}
				this.setState({
					btnDisabled: false
				});
				setTimeout(() => {
					if (!this.state.btnDisabled) {
						return;
					}
				});
				if (!selectedLoanDate.perdCnt) {
					this.props.toast.info('请选择借款期限');
					return;
				}
				idChkPhoto({
					$props: this.props,
					type: 'creditExtension',
					msg: '审核'
				}).then((res) => {
					switch (res) {
						case '1':
							// 成功
							//调用授信接口
							handleClickConfirm(this.props, {
								...this.state.selectedLoanDate,
								activeName: tagList[this.state.activeTag].name,
								autId: usrIndexInfo.indexSts === 'LN0010' ? '' : usrIndexInfo.indexData.autId,
								rpyAmt: Number(values.loanMoney)
							});
							break;
						case '2':
							// 失败
							const params = {
								...this.state.selectedLoanDate,
								activeName: tagList[this.state.activeTag].name,
								autId: usrIndexInfo.indexSts === 'LN0010' ? '' : usrIndexInfo.indexData.autId,
								rpyAmt: Number(values.loanMoney)
							};
							store.setLoanAspirationHome(params);
							break;
						default:
							break;
					}
				});
			} else {
				this.props.toast.info(getFirstError(err));
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
					modal_left: false
				});
			}
		);
	};

	//计算该显示的还款金额
	calcLoanMoney = (money, tag3) => {
		const { usrIndexInfo } = this.state;
		const { indexData } = usrIndexInfo;
		if (indexData && indexData.maxApplAmt && Number(money) >= Number(indexData.maxApplAmt)) {
			this.props.form.setFieldsValue({
				loanMoney: indexData.maxApplAmt
			});
			this.getQryPerdRate(indexData.maxApplAmt, tag3);
		} else if (indexData && indexData.minApplAmt && Number(money) <= Number(indexData.minApplAmt)) {
			this.props.form.setFieldsValue({
				loanMoney: indexData.minApplAmt
			});
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
		const { usrIndexInfo, fetchBillSucc } = this.state;
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
				buriedPointEvent(home.repaymentIntentionAll, {
					userType: 'newUser'
				});
				break;
			case 1:
				buriedPointEvent(home.repaymentIntentionLowest, {
					userType: 'newUser'
				});
				break;
			case 2:
				buriedPointEvent(home.repaymentIntentionPart, {
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
				goMoxieBankList: this.requestCredCardCount,
				usrIndexInfo: this.state.usrIndexInfo
			})
		) {
			return;
		}
		this.setState(
			{
				activeTag: idx
			},
			() => {
				//全额还款
				if (idx === 0) {
					this.calcLoanMoney(maxApplAmt);
				} else if (idx === 1) {
					//最低还款
					this.calcLoanMoney(minApplAmt);
				} else {
					this.inputRef.focus();
					this.calcLoanMoney(maxApplAmt);
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

	placeholderText = () => {
		const { fetchBillSucc, activeTag, usrIndexInfo } = this.state;
		const { indexData } = usrIndexInfo;
		if (fetchBillSucc && activeTag === 2) {
			return `申请金额${indexData.minApplAmt || ''}-${indexData.maxApplAmt || ''}元`;
		} else {
			return ``;
		}
	};

	updateBillInf = () => {
		const { usrIndexInfo } = this.state;
		const { cardBillSts } = usrIndexInfo.indexData;
		if (cardBillSts === '00') {
			this.props.toast.info('还款日已到期，请更新账单获取最新账单信息');
			return true;
		} else if (cardBillSts === '02') {
			this.props.toast.info('已产生新账单，请更新账单或代偿其他信用卡', 2, () => {
				// 跳新版魔蝎
				this.goMoxieBankList();
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
			isShowProgress,
			percent,
			showAgainUpdateBtn,
			usrIndexInfo,
			activeTag,
			selectedLoanDate,
			perdRateList,
			btnDisabled
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
			billRemainAmt
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

		let cardBillAmtData = '';
		if (cardBillSts === '02') {
			cardBillAmtData = '待更新';
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

		let minPaymentData = '';
		if (cardBillSts === '02') {
			minPaymentData = '待更新';
		} else {
			if (!minPayment && minPayment !== 0) {
				minPaymentData = '----.--';
			} else if (cardBillSts === '01' && cardBillAmtData === '已结清') {
				minPaymentData = '已结清';
			} else {
				minPaymentData = parseFloat(minPayment, 10).toFixed(2);
			}
		}
		return (
			<div className={[ style.pageWrapper, 'loan_repay_confirm' ].join(' ')}>
				<ScrollText />
				<div className={[ style.page_inner_wrap, 'modal_l_r2' ].join(' ')}>
					<div className={style.bankCard}>
						<div className={style.top}>
							<div>
								<span className={[ 'bank_ico', iconClass, `${style.bankLogo}` ].join(' ')} />
								<span className={style.name}>{!bankName ? '****' : bankName}</span>
								<span className={style.lastNo}>{!cardNoHid ? '****' : cardNoHid.slice(-4)}</span>
							</div>
							{isShowProgress ? (
								<div className={style.progressWrap}>
									<div className={style.percentTitleWrap}>
										<span className={style.percentTitle}>账单导入中</span>
										<em className={style.percentNum}>{percent}%</em>
									</div>
									<Progress percent={percent} position="normal" />
								</div>
							) : showAgainUpdateBtn ? (
								<span onClick={this.updateBill} className={style.updateButton}>
									重新更新
								</span>
							) : (
								<span onClick={this.goMoxieBankList} className={style.updateButton}>
									更新账单
								</span>
							)}
						</div>
						<div className={style.center}>
							<p className={style.billTitle}>剩余应还金额(元)</p>
							<strong className={style.billMoney}>{cardBillAmtData}</strong>
							<div className={style.billInfo}>
								<div className={style.item}>
									<span className={style.value}>{minPaymentData}</span>
									<span className={style.name}>最低还款</span>
								</div>
								<div className={style.item}>
									<span className={style.value}>{billDtData}</span>
									<span className={style.name}>账单日</span>
								</div>
								<div className={style.item}>
									<span className={style.value} dangerouslySetInnerHTML={{ __html: overDtStr }} />
									<span className={style.name}>还款日</span>
								</div>
							</div>
						</div>
						<div className={style.bottom} onClick={this.requestCredCardCount}>
							<span>代还其他信用卡</span>
							<Icon type="right" color="#C5C5C5" className={style.rightArrow} />
						</div>
					</div>
					<div className={style.tagList}>
						{tagList.map((item, idx) => (
							<span
								key={idx}
								className={[ style.tagButton, activeTag === idx && style.activeTag ].join(' ')}
								onClick={() => {
									this.toggleTag(idx, 'click');
								}}
							>
								{item.name}
							</span>
						))}
					</div>
					<div className={style.money_input}>
						<InputItem
							{...getFieldProps('loanMoney', {
								rules: [ { required: true, message: '请输入还款金额' } ]
							})}
							type="number"
							placeholder={this.placeholderText()}
							disabled={this.inputDisabled()}
							ref={(el) => (this.inputRef = el)}
							className={this.inputDisabled() ? 'blackColor' : 'blackColor'}
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
									btnDisabled: true
								});
								this.updateBillInf();
							}}
						>
							帮你还多少(元)
						</InputItem>
						{!this.inputDisabled() ? <div className={style.desc}>{this.placeholderText()}</div> : null}
					</div>
					<div>
						<List.Item
							onClick={() => {
								if (
									!isCanLoan({
										$props: this.props,
										goMoxieBankList: this.goMoxieBankList,
										usrIndexInfo: this.state.usrIndexInfo
									})
								) {
									return;
								}
								if (this.state.perdRateList && this.state.perdRateList.length !== 0) {
									if (
										this.state.perdRateList.length === 1 &&
										this.state.perdRateList[0].perdLth == 30 &&
										(this.state.perdRateList[0].factLmtLow >
											Number(this.props.form.getFieldValue('loanMoney')) ||
											Number(this.props.form.getFieldValue('loanMoney')) >
												this.state.perdRateList[0].factAmtHigh)
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
							arrow="horizontal"
							extra={(selectedLoanDate && selectedLoanDate.perdPageNm) || '请选择'}
						>
							借多久
						</List.Item>
					</div>
					<SXFButton
						onClick={this.handleSubmit}
						className={[ style.confirmApplyBtn, btnDisabled ? style.disabledBtn : '' ].join(' ')}
					>
						提交申请
					</SXFButton>
					<p className="bottomTip">怕逾期，用还到</p>
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
									<div>
										{perdRateList.map((item, idx) => {
											return (
												<div key={idx}>
													{(item.perdLth == 30 &&
														item.factLmtLow <=
															Number(this.props.form.getFieldValue('loanMoney')) &&
														Number(this.props.form.getFieldValue('loanMoney')) <=
															item.factAmtHigh) ||
													item.perdLth != 30 ? (
														<div
															className={style.listitem}
															onClick={() => {
																// if (
																// 	item.factLmtLow <=
																// 		Number(this.props.form.getFieldValue('loanMoney')) &&
																// 	Number(this.props.form.getFieldValue('loanMoney')) <=
																// 		item.factAmtHigh
																// ) {
																// }
																this.filterLoanDate(item);
															}}
														>
															{/* {item.perdLth == 30 ? (
													<div className={[ style.dayProd ].join(' ')}>
														<div className={style.title}>
															{item.perdPageNm}
															<i />
														</div>
														<div className={style.subtitle}>
															代偿区间{item.factLmtLow}-{item.factAmtHigh}元
														</div>
													</div>
												) : ()} */}
															<span>{item.perdPageNm}</span>

															{selectedLoanDate.perdCnt === item.perdCnt && (
																<i className={style.checkIcon} />
															)}
														</div>
													) : null}
												</div>
											);
										})}
									</div>
								</div>
							</div>
						</div>
						<div
							className={[ style.modal_right, this.state.modal_left ? style.modal_left2 : '' ].join(' ')}
						>
							<div className={style.modal_header}>
								会员产品介绍
								<Icon
									className={style.modal_leftIcon}
									onClick={() => {
										buriedPointEvent(loan_repay_confirm.back30);
										this.setState({
											modal_left: false
										});
									}}
									type="left"
								/>
							</div>
							<div className={style.modal_Vip}>
								<div>
									<div className={style.title}>30天产品为会员专属产品</div>
									<div className={style.desc}>1.使用前，需购买会员卡仅限于当次使用；</div>
									<div className={style.desc}>2.购买后，获得68元等价MPOS刷卡优惠权益；</div>
									<div className={style.desc}>3.申请后，当期借款期限不可修改；</div>
									<div className={style.btn_box}>
										<SXFButton
											onClick={() => {
												buriedPointEvent(loan_repay_confirm.cancle30);
												this.setState({
													modal_left: false
												});
											}}
											type="line"
											className={style.btn_item}
										>
											选择其他期限
										</SXFButton>
										<SXFButton
											onClick={() => {
												buriedPointEvent(loan_repay_confirm.sure30);
												this.filterLoanDate(null, '30');
											}}
											className={style.btn_item}
										>
											确认申请
										</SXFButton>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}
