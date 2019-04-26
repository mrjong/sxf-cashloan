import React, { PureComponent } from 'react';
import { Modal, InputItem } from 'antd-mobile';
import dayjs from 'dayjs';
import { store } from 'utils/store';
import { isMPOS } from 'utils/common';
import { buriedPointEvent } from 'utils/analytins';
import { home } from 'utils/analytinsType';
import fetch from 'sx-fetch';
import SXFButton from 'components/ButtonCustom';
import { createForm } from 'rc-form';
import { getFirstError, handleClickConfirm, handleInputBlur, idChkPhoto } from 'utils';

import icon_arrow_right_default from 'assets/images/home/icon_arrow_right_default@2x.png';
import TabList from './components/TagList';
import style from './index.scss';
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
	moneyKeyboardWrapProps = {
		onTouchStart: (e) => e.preventDefault()
	};
}
const API = {
	QUERY_REPAY_INFO: '/bill/queryRepayInfo', // 确认代还信息查询接口
	CHECK_WITH_HOLD_CARD: '/bill/checkWithHoldCard', // 储蓄卡是否支持代扣校验接口
	CHECK_CARD: '/my/chkCard', // 是否绑定了银行卡
	checkApplyProdMemSts: '/bill/checkApplyProdMemSts', // 校验借款产品是否需要会员卡
	queryUsrMemSts: '/my/queryUsrMemSts', // 查询用户会员卡状态
	queryFundInfo: '/fund/info', // 获取资金code,合同code
	chkCredCard: '/my/chkCredCard' // 查询信用卡列表中是否有授权卡
};

let indexData = null; // 首页带过来的信息
let pageData = null;
let isSaveAmt = false;

@fetch.inject()
@createForm()
export default class confirm_agency_page extends PureComponent {
	constructor(props) {
		super(props);
		if (this.props.history.location.state && this.props.history.location.state.indexData) {
			indexData = this.props.history.location.state.indexData;
		}
		this.state = {
			cardBillAmt: 0,
			dateDiff: 0,
			repayInfo: {},
			repaymentDate: '',
			repaymentIndex: 0, // mpos取1（最后一个），只限返回两种期限的情况
			lendersDate: '',
			lendersIndex: 0,
			defaultIndex: 0,
			repaymentDateList: [],
			lendersDateList: [
				{
					name: '还款日前一天',
					value: '1'
				},
				{
					name: '立即放款',
					value: '0',
					style: {
						width: '2.07rem'
					}
				}
			],
			isShowVIPModal: false,
			isVIP: false, // 是否有会员卡
			contractData: [] // 合同和产品id数据
		};
	}

	componentWillMount() {
		isSaveAmt = store.getSaveAmt();
		store.removeSaveAmt();
		let bankInfo = store.getCardData();
		store.removeCardData();
		pageData = store.getRepaymentModalData();
		console.log(pageData, 'pageData');
		store.removeRepaymentModalData();
		if (pageData) {
			if (bankInfo && JSON.stringify(bankInfo) !== '{}') {
				// 如果存在 bankInfo 并且弹框缓存数据崔仔 则更新弹框缓存的数据
				pageData.repayInfo.bankName = bankInfo.bankName;
				pageData.repayInfo.cardNoHid = bankInfo.lastCardNo;
				pageData.repayInfo.withHoldAgrNo = bankInfo.agrNo;
			}
			this.recoveryPageData();
		} else {
			this.requestGetRepaymentDateList();
		}
		if (isMPOS()) {
			this.checkUsrMemSts();
		}
	}

	// 查询用户会员卡状态
	checkUsrMemSts = () => {
		this.props.$fetch.get(API.queryUsrMemSts).then((result) => {
			if (result && result.msgCode === 'PTM0000' && result.data !== null) {
				this.setState({
					isVIP: result.data.memSts === '1' ? true : false
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	// 数据回显
	recoveryPageData = () => {
		this.setState({ ...pageData });
	};

	// 代扣 Tag 点击事件
	handleRepaymentTagClick = (data, type) => {
		this.props.form.setFieldsValue({
			cardBillAmt: isSaveAmt && type && type === 'first' ? this.state.cardBillAmt : data.value.maxAmt + ''
		});
		this.setState({
			repaymentDate: data.value,
			repaymentIndex: data.index
			// cardBillAmt: data.value.cardBillAmt,
		});
	};

	// 还款 Tag 点击事件
	handleLendersTagClick = (data, type) => {
		this.setState({
			lendersDate: data.value,
			lendersIndex: data.index
		});
	};

	// 按钮点击事件
	_handleClick = (callback, e) => {
		e && e.preventDefault && e.preventDefault();
		callback && callback();
	};

	// 选择银行卡
	handleClickChoiseBank = () => {
		this.setState(
			{
				cardBillAmt: this.props.form.getFieldValue('cardBillAmt')
			},
			() => {
				const { repayInfo } = this.state;
				store.setSaveAmt(true);
				store.setRepaymentModalData(this.state);
				store.setBackUrl('/home/confirm_agency?showModal=true');
				this.props.history.push({
					pathname: '/mine/select_save_page',
					search: `?agrNo=${repayInfo.withHoldAgrNo}`
				});
			}
		);
	};

	// 确认按钮点击事件
	handleClickConfirm = () => {
		// 确认代还信息按钮点击埋点
		buriedPointEvent(home.borrowingPreSubmit);
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.setState(
					{
						cardBillAmt: values.cardBillAmt
					},
					() => {
						this.getFundInfo();
					}
				);
			} else {
				this.props.toast.info(getFirstError(err));
				this.props.form.setFieldsValue({
					cardBillAmt: ''
				});
			}
		});
	};

	// 请求用户绑卡状态
	requestBindCardState = () => {
		const api =
			indexData && indexData.autId ? `${API.chkCredCard}/${indexData && indexData.autId}` : API.CHECK_CARD;
		this.props.$fetch.get(api).then((result) => {
			// 确认代换信息返回结果失败埋点
			if (result && result.msgCode !== 'PTM0000') {
				buriedPointEvent(home.borrowingPreSubmitResult, {
					is_success: false,
					fail_cause: result.msgInfo
				});
			}
			if (result && result.msgCode === 'PTM0000') {
				// 有风控且绑信用卡储蓄卡
				this.requestCheckWithHoldCard();
			} else if (result && result.msgCode === 'PTM2003') {
				// 有风控没绑储蓄卡 跳绑储蓄卡页面
				store.setBackUrl('/home/confirm_agency');
				this.props.toast.info(result.msgInfo);
				setTimeout(() => {
					this.props.history.push({ pathname: '/mine/bind_save_page', search: '?noBankInfo=true' });
				}, 3000);
			} else if (result && result.msgCode === 'PTM2002') {
				// 有风控没绑信用卡 跳绑信用卡页面
				store.setBackUrl('/home/confirm_agency');
				this.props.toast.info(result.msgInfo);
				setTimeout(() => {
					this.props.history.push({
						pathname: '/mine/bind_credit_page',
						search: `?noBankInfo=true&autId=${indexData && indexData.autId}`
					});
				}, 3000);
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	// 储蓄卡是否支持代扣校验接口
	requestCheckWithHoldCard = () => {
		const { repayInfo } = this.state;
		const agrNo = repayInfo.withHoldAgrNo;
		this.props.$fetch.get(`${API.CHECK_WITH_HOLD_CARD}/${agrNo}`).then((res) => {
			if (res && res.msgCode === 'PTM0000') {
				this.checkMemSts();
			} else {
				// 确认代换信息返回结果失败埋点
				buriedPointEvent(home.borrowingPreSubmitResult, {
					is_success: false,
					fail_cause: res.msgInfo
				});
				this.props.toast.info(res.msgInfo);
			}
		});
	};

	// 如果当前还款卡支持代扣 则跳转确认页面
	beforeJump() {
		// 确认代换信息返回结果成功埋点
		buriedPointEvent(home.borrowingPreSubmitResult, {
			is_success: true
		});
		const { lendersDate, contractData, cardBillAmt } = this.state;
		// 由于info中的prdId都一致，所以取第一个中的prdId
		const search = `?prdId=${contractData[0] && contractData[0].productId}&cardId=${indexData &&
			indexData.autId}&wtdwTyp=${lendersDate.value}&billPrcpAmt=${cardBillAmt}`;
		// 跳转确认代还页面之前 将当前弹框数据保存下来
		store.setRepaymentModalData(this.state);
		// 跳转确认代还页面之前 将当前信用卡信息保存下来
		store.setHomeCardIndexData(indexData);
		store.setSaveAmt(true);
		this.props.history.push({
			pathname: '/home/agency',
			search,
			state: {
				contractList: contractData
			}
		});
	}

	// 获取合同列表和产品id
	getFundInfo = () => {
		const { lendersDate, repaymentDate, cardBillAmt, repayInfo } = this.state;
		this.props.$fetch
			.post(`${API.queryFundInfo}`, {
				loanAmount: cardBillAmt,
				periodCount: repaymentDate.periodCount,
				periodLth: repaymentDate.periodLth && parseInt(repaymentDate.periodLth),
				periodUnit: repaymentDate.periodUnit,
				agrNo: repayInfo.withDrawAgrNo,
				wtdwTyp: lendersDate.value,
				autId: indexData && indexData.autId
			})
			.then((result) => {
				if (result && result.msgCode === 'PTM0000' && result.data !== null) {
					this.setState(
						{
							contractData: result.data
						},
						() => {
							this.requestBindCardState();
						}
					);
				} else {
					this.props.toast.info(result.msgInfo);
				}
			});
	};

	// 获取代还期限列表 还款日期列表
	requestGetRepaymentDateList = () => {
		this.props.$fetch.get(`${API.QUERY_REPAY_INFO}/${indexData && indexData.autId}`).then((result) => {
			if (result && result.msgCode === 'PTM0000') {
				if (result.data && result.data.prdList && result.data.prdList.length === 0) {
					this.props.toast.info('当前渠道暂不支持提现申请，请进入MPOS代偿');
					return;
				}
				// const diff = dayjs(result.data.cardBillDt).diff(dayjs(), 'day');
				const diff = result.data.overDt;
				let lendersDateListFormat = this.state.lendersDateList;
				if (!result.data.cardBillDt || diff <= 4) {
					lendersDateListFormat[0].disable = true;
				}
				this.setState({
					repayInfo: result.data,
					repaymentDateList: result.data.prdList.map((item) => ({
						name: item.prdName,
						value: item.prdId,
						// cardBillAmt: item.cardBillAmt,
						minAmt: item.minAmt,
						maxAmt: item.maxAmt,
						periodUnit: item.periodUnit,
						periodCount: item.periodCount,
						periodLth: item.periodLth
					})),
					dateDiff: diff,
					lendersIndex: 1,
					defaultIndex: 1,
					lendersDateList: lendersDateListFormat
				});
			} else {
				this.props.toast.info(result.msgInfo);
			}
		});
	};

	// 校验代还金额
	verifyBillAmt = (rule, value, callback) => {
		const { repaymentDate } = this.state;
		if (
			!(
				/\d/.test(value) &&
				value % 100 == 0 &&
				parseInt(value) >= repaymentDate.minAmt &&
				repaymentDate.maxAmt >= parseInt(value)
			)
		) {
			callback(`可代偿金额为${repaymentDate.minAmt}~${repaymentDate.maxAmt}，且要为100整数倍`);
		} else {
			callback();
		}
	};

	// 关闭弹框
	handleCloseTipModal = () => {
		this.setState({
			isShowVIPModal: false
		});
	};

	// 跳转到会员卡
	goVIP = () => {
		this.setState(
			{
				cardBillAmt: this.props.form.getFieldValue('cardBillAmt'),
				isShowVIPModal: false
			},
			() => {
				store.setSaveAmt(true);
				store.setVipBackUrl('/home/confirm_agency');
				store.setRepaymentModalData(this.state);
				this.handleCloseTipModal();
				this.props.history.push('/mine/membership_card_page');
			}
		);
	};

	// 校验借款产品是否需要会员卡
	checkMemSts = () => {
		const { contractData } = this.state;
		this.props.$fetch
			.get(`${API.checkApplyProdMemSts}/${contractData[0] && contractData[0].productId}`)
			.then((result) => {
				if (result && result.msgCode === 'PTM3014') {
					this.setState({
						isShowVIPModal: true
					});
				} else if (result && result.msgCode === 'PTM0000') {
					this.beforeJump();
				} else {
					// 确认代换信息返回结果失败埋点
					buriedPointEvent(home.borrowingPreSubmitResult, {
						is_success: false,
						fail_cause: result.msgInfo
					});
					this.props.toast.info(result.msgInfo);
				}
			});
	};
	//计算该显示的还款金额
	calcLoanMoney = (money) => {
		const { repaymentDate } = this.state;
		if (repaymentDate && repaymentDate.maxAmt && money >= repaymentDate.maxAmt) {
			this.props.form.setFieldsValue({
				cardBillAmt: repaymentDate.maxAmt + ''
			});
		} else if (repaymentDate && repaymentDate.minAmt && money <= repaymentDate.minAmt) {
			this.props.form.setFieldsValue({
				cardBillAmt: repaymentDate.minAmt + ''
			});
		} else {
			if (money) {
				this.props.form.setFieldsValue({
					cardBillAmt: Math.ceil(money / 100) * 100 + ''
				});
			} else if (repaymentDate.minAmt) {
				this.props.form.setFieldsValue({
					cardBillAmt: repaymentDate.minAmt + ''
				});
			} else {
				this.props.form.setFieldsValue({
					cardBillAmt: ''
				});
			}
		}
	};
	render() {
		const { getFieldProps } = this.props.form;
		const {
			repayInfo,
			repaymentDateList,
			repaymentIndex,
			lendersDateList,
			lendersIndex,
			defaultIndex,
			repaymentDate,
			isShowVIPModal,
			isVIP,
			dateDiff
		} = this.state;
		let lendersTip = '';
		if (lendersIndex === 0) {
			lendersTip = (
				<p>
					选择代偿信用卡账单还款日前一天（{dayjs(repayInfo.cardBillDt)
						.subtract(1, 'day')
						.format('YYYY-MM-DD')}）放款，将最大程度节约您的成本。
				</p>
			);
		}

		if (lendersIndex === 1) {
			lendersTip = <p>选择立即放款，代偿金额将于当日汇入您的还款账户</p>;
		}
		return (
			<div className={style.confirm_agency_page}>
				<ul className={`${style.modal_list} ${style.modal_list_special}`}>
					<li className={`${style.list_item} ${style.list_item_special}`}>
						<div className={style.item_info}>
							<label className={style.item_name}>代偿期限</label>
							<div className={style.tagList}>
								<TabList
									tagList={repaymentDateList}
									defaultindex={repaymentIndex}
									activeindex={repaymentIndex}
									onClick={this.handleRepaymentTagClick}
								/>
							</div>
						</div>
					</li>
					<li className={style.list_item}>
						<div className={style.item_info}>
							<label className={style.item_name}>代偿金额</label>
							<div>
								<div className={[ style.billInpBox, 'money_input' ].join(' ')}>
									<i className={style.moneyUnit}>¥</i>
									<InputItem
										className={style.billInput}
										placeholder=""
										disabled={
											repaymentDate.minAmt &&
											repaymentDate.maxAmt &&
											Number(repaymentDate.minAmt) == Number(repaymentDate.maxAmt)
										}
										type="number"
										ref={(el) => (this.inputRef = el)}
										{...getFieldProps('cardBillAmt', {
											rules: [
												{ required: true, message: '请输入代偿金额' }
												// { validator: this.verifyBillAmt }
											]
										})}
										onBlur={(v) => {
											handleInputBlur();
											this.calcLoanMoney(v);
										}}
										onFocus={(v) => {
											// this.updateBillInf();
										}}
										// onFocus={(v) => {
										//     this.updateBillInf();
										// }}
										// onVirtualKeyboardConfirm={(v) => console.log('onVirtualKeyboardConfirm:', v)}
										moneykeyboardwrapprops={moneyKeyboardWrapProps}
									/>
								</div>
								<p className={style.billTips}>
									金额{repaymentDate.minAmt}-{repaymentDate.maxAmt}元，且为100整数倍
								</p>
							</div>
						</div>
					</li>
				</ul>
				<ul className={style.modal_list}>
					<li className={style.list_item}>
						<div className={style.item_info}>
							<label className={style.item_name}>放款日期</label>
							<div className={style.tagList}>
								<TabList
									burientype="lenders"
									tagType="lenders"
									tagList={lendersDateList}
									defaultindex={defaultIndex}
									activeindex={lendersIndex}
									onClick={this.handleLendersTagClick}
								/>
							</div>
						</div>
					</li>
					<li className={style.list_item} onClick={this.handleClickChoiseBank}>
						<div className={style.item_info}>
							<label className={style.item_name}>还款银行卡</label>
							<span className={[ style.item_value, style.item_value_bank ].join(' ')}>
								{repayInfo.bankName}
								({repayInfo.cardNoHid})
								<img className={style.icon} src={icon_arrow_right_default} alt="" />
							</span>
						</div>
					</li>
				</ul>
				<div className={style.tipsBox}>
					<p>温馨提示</p>
					<p>代偿期限：我们根据您信用卡账单情况为您推荐最佳代偿金额。</p>
					<div className={style.dateTips}>
						<p className={style.dateTipsLabel}>放款日期：</p>
						<div>
							{lendersTip}
							{/* <p>a.选择代偿信用卡账单还款日前一天{dayjs(repayInfo.cardBillDt).subtract(1, 'day').format('YYYY-MM-DD')}放款，将最大程度节约您的成本。</p>
              <p>b.选择立即放款，代偿金额将于当日汇入您的还款账户</p> */}
						</div>
					</div>
				</div>
				<SXFButton onClick={this.handleClickConfirm} className={style.modal_btn}>
					确定
				</SXFButton>
				<Modal
					wrapClassName="modal_VIPTip_warp"
					visible={isShowVIPModal}
					closable
					transparent
					onClose={this.handleCloseTipModal}
					footer={[ { text: '立即开通', onPress: this.goVIP } ]}
				>
					<h2 className={style.modalTitle}>仅限VIP使用</h2>
					<ul className={style.modalUl}>
						<li>
							<i className={style.vipIco1} />极速放款通道
						</li>
						<li>
							<i className={style.vipIco2} />精彩活动优先通知
						</li>
						<li>
							<i className={style.vipIco3} />30天明星产品专享
						</li>
						<li>
							<i className={style.vipIco4} />刷卡优惠超值套餐
						</li>
					</ul>
				</Modal>
			</div>
		);
	}
}
