/*
 * @Author: shawn
 * @LastEditTime : 2020-02-14 15:29:04
 */
import React, { PureComponent } from 'react';
import { Icon, InputItem, List, Modal, Toast } from 'antd-mobile';
import style from './index.scss';
import fetch from 'sx-fetch';
import { createForm } from 'rc-form';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { domListen } from 'utils/domListen';
import { connect } from 'react-redux';
import { updateBillInf } from 'utils/CommonUtil/commonFunc';
import { getNextStatus } from 'utils/CommonUtil/getNextStatus';
import { setApplyCreditData } from 'reduxes/actions/commonActions';
import Image from 'assets/image';

import { handleInputBlur, getMoxieData, activeConfigSts } from 'utils';
import { buriedPointEvent, sxfburiedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import { TimeoutPayModal, SelectList, ButtonCustom, FixedTopTip } from 'components';

let isinputBlur = false;

import { cred_queryApplPageInfo } from 'fetch/api.js';
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
@setBackGround('#eeeff8')
@domListen()
@connect(
	(state) => ({
		authId: state.staticState.authId
	}),
	{ setApplyCreditData }
)
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
			inputFocus: false
		};
	}

	componentDidMount() {
		store.removeToggleMoxieCard();
		store.removeAutIdCard(); // 信用卡前置
		this.queryUsrInfo();
		let _this = this;
		let originClientHeight = document.documentElement.clientHeight;
		// 安卓键盘抬起会触发resize事件，ios则不会
		window.addEventListener('resize', function() {
			if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
				let clientHeight = document.documentElement.clientHeight;
				_this.setState({
					inputFocus: originClientHeight > clientHeight
				});
				window.setTimeout(function() {
					document.activeElement.scrollIntoViewIfNeeded();
				}, 0);
			}
		});
	}

	componentWillUnmount() {
		clearInterval(timer);
		store.removeRealNameNextStep();
	}

	//查询用户相关信息
	queryUsrInfo = () => {
		this.props.$fetch.post(cred_queryApplPageInfo, { autId: this.props.authId }).then((res) => {
			if (res && res.code === '000000' && res.data) {
				this.setState(
					{
						usrIndexInfo: res.data
					},
					() => {
						this.toggleTag(0);
					}
				);
			}
		});
	};

	closeCreditModal = () => {
		sxfburiedPointEvent('isShowCreditModal_out');
		this.setState({
			isShowCreditModal: false
		});
	};
	getQryPerdRate = (money) => {
		const { usrIndexInfo = {} } = this.state;
		const { prods } = usrIndexInfo;
		if (!money) {
			return;
		}

		let perdRateList = [];
		if (prods && prods.length) {
			prods.forEach((item) => {
				if (money >= Number(item.minAmt) && money <= Number(item.maxAmt)) {
					perdRateList.push(item);
				}
			});
		}
		this.setState({
			perdRateList,
			selectedLoanDate: {}
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

	goMoxieBankList = async () => {
		store.setToggleMoxieCard(true);
		store.setMoxieBackUrl(`/home/crawl_progress_page`);
		activeConfigSts({
			$props: this.props,
			type: 'B'
		});
	};
	// 代还其他信用卡点击事件
	repayForOtherBank = () => {
		buriedPointEvent(home.replaceCard);
		// type针对一张卡也可以跳到银行列表页的情况
		store.setToggleMoxieCard(true);
		this.props.history.push({
			pathname: '/mine/credit_list_page'
		});
	};

	handleSubmit = async () => {
		sxfburiedPointEvent('moneyCreditCardConfirmBtn');
		buriedPointEvent(home.moneyCreditCardConfirmBtn);
		const { selectedLoanDate = {}, usrIndexInfo = {}, btnDisabled, fullMinAmt } = this.state;
		const { minApplAmt, maxApplAmt } = usrIndexInfo;
		if (
			updateBillInf({
				$props: this.props,
				usrIndexInfo: this.state.usrIndexInfo,
				type: 'LoanRepayConfirm'
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

		if (!selectedLoanDate.prodCnt) {
			this.props.toast.info('请选择借款期限');
			return;
		}
		if (btnDisabled) {
			return;
		}
		const params = {
			...selectedLoanDate,
			activeName: tagList[this.state.activeTag].name,
			autId: this.props.authId,
			applAmt: Number(repayMoney)
		};
		this.props.setApplyCreditData(params);
		Toast.loading('加载中...', 20);
		getNextStatus({
			$props: this.props,
			actionType: 'creditExtension',
			actionMsg: '审核'
		});
	};

	//过滤选中的还款期限
	filterLoanDate = (item) => {
		let itemCopy = item;
		this.dateType(itemCopy.perdLth);
		if (this.updateBillInf()) {
			return;
		}
		this.setState(
			{
				selectedLoanDate: itemCopy, // 设置选中的期数
				isShowCreditModal: false
			},
			() => {
				sxfburiedPointEvent('isShowCreditModal_out');
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
		const { usrIndexInfo = {} } = this.state;
		const { maxApplAmt, minApplAmt } = usrIndexInfo;
		if (maxApplAmt && Number(money) >= Number(maxApplAmt)) {
			this.props.form.setFieldsValue({
				loanMoney: (maxApplAmt && !isNaN(maxApplAmt) && Number(maxApplAmt) >= 0 && maxApplAmt) || '0'
			});
			this.getQryPerdRate(maxApplAmt, tag3);
		} else if (minApplAmt && Number(money) <= Number(minApplAmt)) {
			if (money === '') {
				// 默认最大值
				this.props.form.setFieldsValue({
					loanMoney: (maxApplAmt && !isNaN(maxApplAmt) && Number(maxApplAmt) >= 0 && maxApplAmt) || '0'
				});
			} else {
				this.props.form.setFieldsValue({
					loanMoney: minApplAmt
				});
			}
			this.getQryPerdRate(minApplAmt, tag3);
		} else {
			if (money) {
				this.props.form.setFieldsValue({
					loanMoney: Math.ceil(money / 100) * 100
				});
				this.getQryPerdRate(Math.ceil(money / 100) * 100, tag3);
			} else if (minApplAmt) {
				this.props.form.setFieldsValue({
					loanMoney: minApplAmt
				});
				this.getQryPerdRate(minApplAmt, tag3);
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
		const { usrIndexInfo = {} } = this.state;
		const { minApplAmt, maxApplAmt } = usrIndexInfo;
		if (type && type === 'click') {
			if (
				updateBillInf({
					$props: this.props,
					usrIndexInfo: this.state.usrIndexInfo,
					type: 'LoanRepayConfirm'
				})
			) {
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

	updateBillInf = () => {
		const { usrIndexInfo = {} } = this.state;
		const { cardBillSts, bankNo } = usrIndexInfo;
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
			usrIndexInfo = {},
			selectedLoanDate,
			perdRateList,
			btnDisabled,
			fullMinAmt,
			showTimeoutPayModal
		} = this.state;
		const { cardBillAmt, bankNo, bankName, cardBillSts, minApplAmt, maxApplAmt, lastNo } = usrIndexInfo;

		const { getFieldProps } = this.props.form;
		const iconClass = bankNo ? `bank_ico_${bankNo}` : 'logo_ico';

		let cardBillAmtData = '';
		if (cardBillSts === '02' || cardBillSts === '00') {
			cardBillAmtData = '待更新';
		} else if (cardBillAmt && Number(cardBillAmt) > 0) {
			// 优先取剩余应还，否则去账单金额
			cardBillAmtData = parseFloat(cardBillAmt, 10).toFixed(2);
		} else if (!cardBillAmt && cardBillAmt !== 0) {
			cardBillAmtData = '----.--';
		} else if (cardBillSts === '01' && (cardBillAmt === 0 || (cardBillAmt && Number(cardBillAmt) <= 0))) {
			cardBillAmtData = '已结清';
		} else {
			cardBillAmtData = parseFloat(cardBillAmt, 10).toFixed(2);
		}

		let placeholderText = `可申请 ${usrIndexInfo.minApplAmt || ''}~${usrIndexInfo.maxApplAmt || ''}`;

		let repayMoney = this.props.form.getFieldValue('loanMoney')
			? this.props.form.getFieldValue('loanMoney')
			: fullMinAmt;
		return (
			<div className={[style.pageWrapper, 'loan_repay_confirm'].join(' ')}>
				<FixedTopTip />
				<div className={[style.page_inner_wrap].join(' ')}>
					<div className={style.bankCard}>
						<div className={style.titleBg}>收款信用卡</div>
						{usrIndexInfo && usrIndexInfo.credCardCount > 0 ? (
							<div
								className={style.cardNumBox}
								onClick={() => {
									this.repayForOtherBank();
								}}
							>
								<span>更换信用卡</span>
								<Icon type="right" color="#C5C5C5" className={style.rightArrow} />
							</div>
						) : null}
						<div className={style.top}>
							<div className={style.bankBox}>
								<span className={['bank_ico', iconClass, `${style.bankLogo}`].join(' ')} />
								<span className={style.name}>{!bankName ? '****' : bankName}</span>
								<span className={style.lastNo}>({!lastNo ? '****' : lastNo.slice(-4)})</span>
							</div>
						</div>
						<div className={style.center}>
							<strong className={style.billMoney}>
								{(isNaN(cardBillAmtData) && <span style={{ fontSize: '.6rem' }}>{cardBillAmtData}</span>) ||
									cardBillAmtData}
							</strong>
							<div className={style.billInfo}>
								<div className={style.item}>
									<p className={`${style.name} ${style.moneyTit}`}>账单金额(元)</p>
								</div>
								<div className={style.item}>
									<span className={style.name}>还款日：{usrIndexInfo.cardRepayDt || '----/--/--'}</span>
								</div>
							</div>
						</div>
					</div>

					<div className={[style.bankCard, style.heightMoney, 'modal_l_r2'].join(' ')}>
						<div>
							<div className={style.titleBg}>借多少钱</div>
						</div>
						<div className={style.inputBox}>
							<div className={style.dw}>￥</div>
							<InputItem
								data-sxf-props={JSON.stringify({
									type: 'input',
									name: 'loanMoney',
									eventList: [
										{
											type: 'focus'
										},
										{
											type: 'delete'
										},
										{
											type: 'blur'
										},
										{
											type: 'paste'
										}
									]
								})}
								maxLength={15}
								{...getFieldProps('loanMoney', {
									rules: [{ required: true, message: '请输入还款金额' }]
								})}
								type="number"
								placeholder={placeholderText}
								ref={(el) => (this.inputRef = el)}
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
								className={[style.item, style.item1].join(' ')}
								onClick={() => {
									this.toggleTag(2, 'click');
								}}
								data-sxf-props={JSON.stringify({
									type: 'btn',
									name: 'maxApplAmt',
									eventList: [
										{
											type: 'click'
										}
									]
								})}
							>
								<div>
									<span className={style.title}>借全额</span>
									<span className={style.money}>
										¥{(maxApplAmt && !isNaN(maxApplAmt) && Number(maxApplAmt) >= 0 && maxApplAmt) || '-.--'}
									</span>
								</div>
								<div className={style.desc}>一键结清账单，释放卡额度</div>
							</div>
							<div
								className={[style.item, style.item2].join(' ')}
								data-sxf-props={JSON.stringify({
									type: 'btn',
									name: 'minApplAmt',
									eventList: [
										{
											type: 'click'
										}
									]
								})}
								onClick={() => {
									this.toggleTag(1, 'click');
								}}
							>
								<div>
									<span className={style.title}>借最低</span>
									<span className={style.money}>
										¥{(minApplAmt && !isNaN(minApplAmt) && Number(minApplAmt) >= 0 && minApplAmt) || '-.--'}
									</span>
								</div>
								<div className={style.desc}>信用卡免逾期，还款无压力</div>
							</div>
						</div>
					</div>

					<div className={[style.bankCard, style.heightSelect].join(' ')}>
						<div>
							<div className={style.titleBg}>借多久</div>
						</div>
						<div className={style.border_bottom}>
							<List.Item
								onClick={() => {
									if (
										updateBillInf({
											$props: this.props,
											usrIndexInfo: this.state.usrIndexInfo,
											type: 'LoanRepayConfirm'
										})
									) {
										return;
									}
									if (this.state.perdRateList && this.state.perdRateList.length !== 0) {
										if (
											perdRateList.length === 1 &&
											perdRateList[0].prodLth === 30 &&
											(perdRateList[0].minAmt > Number(repayMoney) ||
												Number(repayMoney) > perdRateList[0].maxAmt)
										) {
											this.props.toast.info('暂无可借产品');
										} else {
											sxfburiedPointEvent('isShowCreditModal_in');
											this.setState({
												isShowCreditModal: true
											});
										}
									} else {
										this.props.toast.info('暂无可借产品');
									}
								}}
								extra={
									<SelectList
										selectText={(selectedLoanDate && selectedLoanDate.prodName) || ''}
										defaultText={'请选择'}
									/>
								}
							>
								&nbsp;
							</List.Item>
						</div>
					</div>
					<div
						onClick={() => {
							sxfburiedPointEvent('freeServiceIn');
							this.setState({
								showTimeoutPayModal: true
							});
						}}
						className={style.freeService}
					>
						<div className={style.title}>
							审核超时赔（免费服务）
							<i />
						</div>
						<div className={style.desc}>50元免息券</div>
					</div>
				</div>
				<div className={style.buttonWrap}>
					<ButtonCustom type={btnDisabled ? 'default' : 'yellow'} onClick={this.handleSubmit}>
						提交申请
					</ButtonCustom>
				</div>

				<Modal
					className="question_feedback_modal"
					popup
					visible={this.state.isShowCreditModal}
					animationType="slide-up"
					maskClosable={false}
				>
					<div className={style.modal_box}>
						<div className={[style.modal_left, this.state.modal_left ? style.modal_left1 : ''].join(' ')}>
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
								<div className={style.limitBox}>
									{perdRateList.map((item, index) => {
										return (item.perdLth == 30 &&
											item.factLmtLow <= Number(repayMoney) &&
											Number(repayMoney) <= item.factAmtHigh) ||
											item.perdLth != 30 ? (
											<ButtonCustom
												className={style.listBtn}
												key={index}
												size="md"
												long="false"
												type={selectedLoanDate.prodCnt === item.prodCnt ? 'yellow' : 'default'}
												onClick={() => {
													this.filterLoanDate(item);
												}}
											>
												{item.prodName}
											</ButtonCustom>
										) : null;
									})}
								</div>
								<div className={style.trendBox}>
									<i />
									<img className={style.trendArrow} src={Image.adorn.line_arrow} alt="" />
									<div className={style.trendDesc}>
										<span>月还款金额大，费用低</span>
										<span>月还款金额小，费用高</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Modal>
				<TimeoutPayModal
					visible={showTimeoutPayModal}
					closeModal={() => {
						sxfburiedPointEvent('freeServiceOut');
						this.setState({
							showTimeoutPayModal: false
						});
					}}
				/>
			</div>
		);
	}
}
