import React from 'react';
import styles from './index.scss';
import { Modal } from 'antd-mobile';
import SXFButton from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import success_icon from './img/success_icon.png';
import circle_icon from './img/circle_icon.png';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { order, activity } from 'utils/analytinsType';

const API = {
	queryPayStatus: '/bill/payNotify',
	queryRepayReward: '/activeConfig/queryRepayReward',
	fundPlain: '/fund/plain' // 费率接口
};
let timer = null;
let isFetching = false;
@fetch.inject()
@setBackGround('#F7F8FA')
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
			rewardDate: ''
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

	queryRepayReward = () => {
		const { billDesc, repayPerds, isLastPerd, prodType } = this.props.history.location.state;

		this.props.$fetch
			.get(API.queryRepayReward, {
				totalPerds: billDesc.perdCnt,
				perdNum: repayPerds[repayPerds.length - 1],
				entrance: 1
			})
			.then((res) => {
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
			.catch(() => {});
	};

	//查询本期减免金额
	queryPlain = () => {
		const { repayOrdNo, ordNo, isSettle, prodType, repayPerds } = this.props.history.location.state;
		this.props.$fetch
			.post(API.fundPlain, {
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
		const { repayOrdNo } = this.props.history.location.state;
		isFetching = true;
		this.props.$fetch
			.get(API.queryPayStatus + `/${repayOrdNo}`)
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
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
		const { repayPerds, billOvduDays } = this.props.history.location.state;
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
			rewardDate
		} = this.state;
		const { bankName, bankNo, isLastPerd } = this.props.history.location.state;

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
									<img src={success_icon} />
								</div>
							</div>
							<p className={styles.desc}>还款成功</p>
							<p className={styles.sub_desc}>您正常还款，维护了自身信用</p>
						</div>
					)}
					{status === 'timeout' && (
						<div>
							<div className={styles.icon_wrap}>
								<div className={[styles.timeout_icon, styles.icon].join(' ')} />
							</div>
							<p className={styles.desc}>还款超时，请关注账单详情，避免逾期</p>
						</div>
					)}
					{status === 'fail' && (
						<div>
							<div className={styles.icon_wrap}>
								<div className={[styles.fail_icon, styles.icon].join(' ')} />
							</div>
							{orgFnlMsg ? (
								<p className={styles.desc}>
									还款失败
									<br />
									{bankName}({bankNo}
									)还款失败: <span>{orgFnlMsg}</span>
									<br />
									请选择其他银行卡还款
								</p>
							) : (
								<p className={styles.desc}>
									还款失败
									<br />
									{bankName}({bankNo}
									)还款失败，请重试！
								</p>
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
						<span>为您剩余账单减免</span>
						<span className={styles.discount}>{exceedingAmt}元</span>
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
						<p className={styles.title}>
							已激活<span className={styles.date}>15天</span>免息
						</p>
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
