import React from 'react';
import styles from './index.scss';
import { Modal } from 'antd-mobile';
import SXFButton from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import circle_icon from './img/circle_icon.png';
import reward_loading from './img/reward_loading.png';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { order, activity } from 'utils/analytinsType';
import { repay_payNotify, repay_queryCashRegisterDetail } from 'fetch/api.js';
import Images from 'assets/image';

const API = {
	queryRepayReward: '/activeConfig/queryRepayReward'
};
let timer = null;
let timer1 = null;
let isFetching = false;
@fetch.inject()
@setBackGround('#fff')
export default class Cashier extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			seconds: 15,
			status: 'waiting',
			remainAmt: 0,
			repayOrdAmt: 0,
			crdOrdAmt: 0,
			orgFnlMsg: '',
			tip_modal: false,
			reward_modal: false,
			showRewardLoading: false,
			rewardDate: '',
			percent: 0
		};
	}

	componentDidMount() {
		clearInterval(timer);
		timer = setInterval(() => {
			this.setState(
				{
					seconds: this.state.seconds - 1
				},
				() => {
					if (this.state.seconds < 1) {
						clearInterval(timer);
						this.setState({
							status: 'timeout'
						});
					}
					if (this.state.status === 'waiting' && this.state.seconds % 2 === 0 && !isFetching) {
						this.queryPayStatus();
					}
				}
			);
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(timer);
	}

	startRewardLoading = () => {
		clearInterval(timer1);
		this.setState({
			showRewardLoading: true
		});
		timer1 = setInterval(() => {
			this.setState(
				{
					percent: this.state.percent + 1
				},
				() => {
					if (this.state.percent >= 100) {
						clearInterval(timer1);
					}
				}
			);
		}, 1000);
	};

	stopRewardLoading = () => {
		clearInterval(timer1);
		this.setState({
			showRewardLoading: false,
			percent: 0
		});
	};

	queryRepayReward = () => {
		const { state = {} } = this.props.history.location;
		const { billDesc, repayPerds, isLastPerd, prodType } = state;
		this.startRewardLoading();
		this.props.$fetch
			.get(API.queryRepayReward, {
				totalPerds: billDesc.perdCnt,
				perdNum: repayPerds[repayPerds.length - 1],
				entrance: 1
			})
			.then((res) => {
				this.stopRewardLoading();
				if (res.msgCode === 'PTM0000') {
					this.setState({
						rewardDate: res.data
					});
					if (res.data === 15) {
						this.setState({
							reward_modal: true
						});
						buriedPointEvent(activity.rewardResultModalShow, {
							positon: 'orderRepayResult'
						});
					} else {
						this.setState({
							tip_modal: true
						});
						buriedPointEvent(activity.rewardTipModalShow, {
							positon: 'orderRepayResult'
						});
					}
				} else if (isLastPerd) {
					//如果还的是最后一期
					setTimeout(() => {
						store.removeBackData();
						this.props.history.replace(`/order/repayment_succ_page?prodType=${prodType}`);
					}, 2000);
				}
			})
			.catch(() => {
				this.stopRewardLoading();
			});
	};

	//查询本期减免金额
	queryPlain = () => {
		const { state = {} } = this.props.history.location;
		const { repayOrdNo, ordNo, isSettle, prodType, repayPerds } = state;
		this.props.$fetch
			.post(repay_queryCashRegisterDetail, {
				repayOrdNo,
				ordNo,
				isSettle,
				prodType,
				repayPerds
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					if (res.data) {
						this.setState({
							exceedingAmt: res.data[0].exceedingAmt
						});
					}
				}
			})
			.catch((err) => {
				console.log(err);
			});
	};

	queryPayStatus = () => {
		const { state = {} } = this.props.history.location;

		const { repayOrdNo } = state;
		isFetching = true;
		this.props.$fetch
			.get(`${repay_payNotify}/${repayOrdNo}`)
			.then((res) => {
				if (res.msgCode === '000000') {
					isFetching = false;
					store.removeCouponData();

					const { resultMark, repayOrdAmt, crdOrdAmt, orgFnlMsg } = res.data || {};
					if (resultMark === '01') {
						this.setState(
							{
								status: Number(repayOrdAmt) === Number(crdOrdAmt) ? 'success' : 'part',
								repayOrdAmt: Number(repayOrdAmt).toFixed(2),
								crdOrdAmt: Number(crdOrdAmt).toFixed(2),
								remainAmt: (Number(crdOrdAmt) - Number(repayOrdAmt)).toFixed(2),
								orgFnlMsg
							},
							() => {
								buriedPointEvent(order.repayResultStatus, {
									repayStatus: this.state.status
								});
								if (this.state.status === 'success') {
									this.queryRepayReward();
									this.queryPlain();
									clearInterval(timer);
								}
							}
						);
					} else if (resultMark === '00') {
						this.setState(
							{
								status: 'fail',
								orgFnlMsg
							},
							() => {
								buriedPointEvent(order.repayResultStatus, {
									repayStatus: this.state.status
								});
							}
						);
						clearInterval(timer);
					}
				}
			})
			.catch((err) => {
				console.log(err);
				isFetching = false;
			});
	};

	continueRepay = () => {
		const { state = {} } = this.props.history.location;

		const { repayPerds = [], billOvduDays } = state;
		buriedPointEvent(order.continueRepayBtn, {
			isOverdue: !!billOvduDays,
			repayPerds: repayPerds.join(',')
		});
		this.props.history.replace('/order/order_repay_page');
	};

	renderContinueButton = (isLastPerd, status) => {
		if (isLastPerd) {
			if (status === 'success' || status === 'waiting') {
				return null;
			}
			return (
				<SXFButton onClick={this.continueRepay} className={styles.button}>
					继续还款
				</SXFButton>
			);
		} else if (!isLastPerd) {
			if (status === 'waiting') {
				return null;
			}
			return (
				<SXFButton onClick={this.continueRepay} className={styles.button}>
					继续还款
				</SXFButton>
			);
		}
	};

	render() {
		const {
			seconds,
			status,
			remainAmt,
			repayOrdAmt,
			crdOrdAmt,
			orgFnlMsg,
			exceedingAmt,
			tip_modal,
			reward_modal,
			rewardDate,
			showRewardLoading,
			percent
		} = this.state;
		const { state = {} } = this.props.history.location;
		const { bankName, bankNo, isLastPerd } = state;

		return (
			<div>
				<div className={styles.loading_box}>
					{status === 'waiting' && (
						<div>
							<div className={styles.icon_wrap}>
								<img src={circle_icon} alt="" className={styles.circle_icon} />
							</div>
							<p className={styles.desc}>
								还款中，预计
								{seconds}
								秒内完成...
							</p>
						</div>
					)}
					{status === 'success' && (
						<div>
							<div className={styles.icon_wrap}>
								<div className={[styles.success_icon, styles.icon].join(' ')}>
									<img src={Images.adorn.success} />
								</div>
							</div>
							<p className={styles.desc}>还款成功</p>
							<p className={styles.sub_desc}>您正常还款，维护了自身信用</p>
						</div>
					)}
					{status === 'timeout' && (
						<div>
							<div className={styles.icon_wrap}>
								<img
									className={[styles.timeout_icon, styles.icon].join(' ')}
									src={Images.adorn.timeout}
									alt=""
								/>
							</div>
							<p className={styles.desc}>处理中</p>
							<p className={styles.desc_tip}>您正常还款，维护了自身信用</p>
						</div>
					)}

					{status === 'fail' && (
						<div>
							<div className={styles.icon_wrap}>
								<img
									className={[styles.timeout_icon, styles.icon].join(' ')}
									src={Images.adorn.fail}
									alt=""
								/>
							</div>
							{orgFnlMsg ? (
								<div>
									<p className={styles.desc}>还款失败</p>
									<p className={styles.desc}>{orgFnlMsg}</p>
									<p className={styles.desc}>请选择其他银行卡还款</p>
								</div>
							) : (
								<div>
									<p className={styles.desc}>还款失败</p>
									<p className={styles.desc}>
										{bankName}({bankNo})还款失败，请重试
									</p>
								</div>
							)}
						</div>
					)}
					{status === 'part' && (
						<div className={styles.list_wrap}>
							<ul>
								<li className={styles.list_item}>
									<span>发起还款金额</span>
									<span className={styles.value}>{crdOrdAmt}元</span>
								</li>
								<li className={styles.list_item}>
									<span>成功还款</span>
									<span className={styles.value}>{repayOrdAmt}元</span>
								</li>
								<li className={styles.list_item}>
									<span>剩余应还</span>
									<span className={styles.value}>{remainAmt}元</span>
								</li>
							</ul>
							{orgFnlMsg && (
								<p>
									失败原因：
									{orgFnlMsg}
								</p>
							)}
						</div>
					)}
				</div>
				{exceedingAmt ? (
					<div className={styles.discount_box}>
						<span>为您下期账单减免</span>
						<span className={styles.discount}>{exceedingAmt}元</span>
					</div>
				) : null}
				{showRewardLoading ? (
					<div className={styles.reward_loading}>
						<img src={reward_loading} alt="" className={styles.reward_loading_icon} />
						<span>{percent}s</span>
					</div>
				) : null}
				{this.renderContinueButton(isLastPerd, status)}

				<Modal wrapClassName={styles.modal_tip} visible={tip_modal} transparent>
					<i
						className={styles.close_btn}
						onClick={() => {
							this.setState({
								tip_modal: false
							});
							buriedPointEvent(activity.rewardTipModalClose, {
								positon: 'orderRepayResult'
							});
						}}
					/>
					<div className={styles.modal_tip_content}>
						<span className={styles.date}>{rewardDate}天</span>
					</div>
				</Modal>

				<Modal wrapClassName={styles.modal_tip} visible={reward_modal} transparent>
					<div className={styles.modal_tip_content1}>
						<div
							onClick={() => {
								this.props.history.replace({
									pathname: '/mine/coupon_page',
									search: '?entryFrom=orderRepayResult'
								});
								buriedPointEvent(activity.rewardResultModalClick, {
									positon: 'orderRepayResult'
								});
							}}
							className={styles.modal_btn}
						/>
					</div>
				</Modal>
			</div>
		);
	}
}
