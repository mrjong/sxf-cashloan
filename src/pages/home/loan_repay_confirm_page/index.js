import React, { PureComponent } from 'react';
import { Progress, Icon, InputItem, List } from 'antd-mobile';
import style from './index.scss';
import fetch from 'sx-fetch';
import ZButton from 'components/ButtonCustom';
import dayjs from 'dayjs';
import { createForm } from 'rc-form';
import AsyncCascadePicker from 'components/AsyncCascadePicker';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { getFirstError, handleClickConfirm, handleInputBlur, idChkPhoto } from 'utils';
import mockData from './mockData';

const API = {
	queryBillStatus: '/wap/queryBillStatus', //
	// qryPerdRate: '/bill/qryperdrate', // 0105-确认代还信息查询接口
	qryPerdRate: '/bill/prod',
	CARD_AUTH: '/auth/cardAuth', // 0404-信用卡授信
	CRED_CARD_COUNT: '/index/usrCredCardCount', // 授信信用卡数量查询
	USR_INDEX_INFO: '/index/usrIndexInfo' // 0103-首页信息查询接口
};
let timer = null;
@fetch.inject()
@createForm()
@setBackGround('#fff')
export default class loan_repay_confirm_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			usrIndexInfo: {},
			activeTag: 0, //激活的tag
			isShowProgress: false,
			percent: 0,
			loanMoney: '',
			time: 0,
			retryCount: 2,
			showAgainUpdateBtn: false, // 重新获取账单按钮是否显示
			overDt: '', //还款日
			billDt: '', //账单日
			cardBillAmt: '' //账单金额
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
				this.setState(
					{
						usrIndexInfo: res.data.indexData ? res.data : Object.assign({}, res.data, { indexData: {} })
					},
					() => {
						// const { indexSts, indexData } = {
						//   indexSts: 'LN0003',
						//   indexMsg: '一键还卡',
						//   indexData: {
						//     autSts: '1', // 1 中, 2,成功  3失败  1更新中
						//     bankName: '招商银行',
						//     bankNo: 'ICBC',
						//     cardNoHid: '6785 **** **** 6654',
						//     cardBillDt: '2018-07-17',
						//     cardBillAmt: '786.45',
						//     overDt: '7'
						//   }
						// };
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
				search: `?autId=${usrIndexInfo.indexSts === 'LN0010' ? '' : usrIndexInfo.indexData.autId}`
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
		const { selectedLoanDate = {}, usrIndexInfo } = this.state;
		if (!this.state.fetchBillSucc) {
			this.props.toast.info('账单正在更新中，请耐心等待哦');
			return;
		}
		if (this.updateBillInf()) {
			return;
		}
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
								autId: usrIndexInfo.indexSts === 'LN0010' ? '' : usrIndexInfo.indexData.autId,
								rpyAmt: Number(values.loanMoney)
							});
							break;
						case '2':
							// 失败
							const params = {
								...selectedLoanDate,
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
	filterLoanDate = (value) => {
		const { perdRateList, usrIndexInfo, activeTag, fetchBillSucc } = this.state;
		const { cardBillAmt = '', minPayment = '', billRemainAmt } = usrIndexInfo.indexData;
		let selectedLoanDateArr = perdRateList.filter((item, idx) => {
			return item.perdLth === value[0];
		});
		this.setState(
			{
				selectedLoanDate: selectedLoanDateArr[0] // 设置选中的期数
			},
			() => {
				if (!fetchBillSucc) {
					return;
				}
				//全额还款
				if (activeTag === 0) {
					this.calcLoanMoney(billRemainAmt === 0 || billRemainAmt ? billRemainAmt : cardBillAmt);
				} else if (activeTag === 1) {
					//最低还款
					this.calcLoanMoney(minPayment);
				} else {
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

	//切换tag标签
	toggleTag = (idx, type) => {
		// type为是自动执行该方法，还是点击执行该方法
		const { usrIndexInfo, fetchBillSucc } = this.state;
		const { indexData = {} } = usrIndexInfo;
		const { cardBillAmt = '', minPayment = '', billRemainAmt } = indexData;
		if (!fetchBillSucc) {
			this.props.toast.info('账单更新成功方可选择，请耐心等待哦');
			return;
		}
		if (type && type === 'click') {
			if (this.updateBillInf()) {
				return;
			}
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

	inputDisabled = () => {
		const { fetchBillSucc, activeTag } = this.state;
		if (fetchBillSucc && (activeTag === 0 || activeTag === 1)) {
			return true;
		}
		return false;
	};

	placeholderText = () => {
		const { fetchBillSucc, selectedLoanDate = {}, activeTag } = this.state;
		if (fetchBillSucc && activeTag === 2) {
			return `申请金额${selectedLoanDate.factLmtLow || ''}-${selectedLoanDate.factAmtHigh || ''}元`;
		} else {
			return `请输入账单金额`;
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

	render() {
		const {
			isShowProgress,
			percent,
			showAgainUpdateBtn,
			usrIndexInfo,
			activeTag,
			selectedLoanDate = {}
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
		const { getFieldDecorator } = this.props.form;
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
			if (billRemainAmt === 0 || billRemainAmt) {
				cardBillAmtData = parseFloat(billRemainAmt, 10).toFixed(2);
			} else if (!cardBillAmt && cardBillAmt !== 0) {
				cardBillAmtData = '----.--';
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
			} else {
				minPaymentData = parseFloat(minPayment, 10).toFixed(2);
			}
		}
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

		return (
			<div className={[ style.pageWrapper, 'loan_repay_confirm_page' ].join(' ')}>
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
				<div>
					{getFieldDecorator('loanMoney', {
						initialValue: this.state.loanMoney,
						rules: [ { required: true, message: '请输入还款金额' } ]
					})(
						<InputItem
							placeholder={this.placeholderText()}
							type="text"
							disabled={this.inputDisabled()}
							ref={(el) => (this.inputRef = el)}
							className={this.inputDisabled() ? '' : 'blackColor'}
							onBlur={() => {
								handleInputBlur();
							}}
							onFocus={(v) => {
								this.updateBillInf();
							}}
						>
							帮你还多少(元)
						</InputItem>
					)}
				</div>
				<div>
					{getFieldDecorator('loanDate', {
						initialValue: selectedLoanDate && [ selectedLoanDate.perdLth ],
						rules: [ { required: true, message: '请选择借款期限' } ],
						onChange: (value, label) => {
							this.filterLoanDate(value);
						}
					})(
						<AsyncCascadePicker
							loadData={[
								() => {
									//如果账单爬取成功，请求期限接口
									return this.props.$fetch.get(`${API.qryPerdRate}`).then((res) => {
										const date =
											res.data && res.data.perdRateList.length ? res.data.perdRateList : [];
										this.setState({
											perdRateList: date,
											selectedLoanDate: date[0] // 默认选中3期
										});
										// 设置默认选中的还款金额
										return date.map((item) => ({
											value: item.perdLth,
											label: item.perdPageNm
										}));
									});
								}
							]}
							cols={1}
							onVisibleChange={(bool) => {
								if (bool) {
									this.updateBillInf();
								}
							}}
						>
							<List.Item>借多久</List.Item>
						</AsyncCascadePicker>
					)}
				</div>
				<ZButton onClick={this.handleSubmit} className={style.confirmApplyBtn}>
					提交申请
				</ZButton>
				<p className="bottomTip">怕逾期，用还到</p>
			</div>
		);
	}
}
