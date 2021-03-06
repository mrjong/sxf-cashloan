import React from 'react';
import styles from './index.scss';
import SXFButton from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import circle_icon from './img/circle_icon.png';
import reward_loading from './img/reward_loading.png';
import { setBackGround } from 'utils/background';
import { setHomeModalAction } from 'reduxes/actions/commonActions';
import { connect } from 'react-redux';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
import { repay_payNotify, msg_popup_list } from 'fetch/api.js';
import Images from 'assets/image';
import { isWXOpen } from 'utils';

let timer = null;
let timer1 = null;
let isFetching = false;
@fetch.inject()
@setBackGround('#fff')
@connect(
	() => ({}),
	{ setHomeModalAction }
)
export default class order_repay_result_page extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			seconds: 15,
			status: 'waiting',
			remainAmt: 0,
			repayOrdAmt: 0,
			crdOrdAmt: 0,
			failMsg: '',
			showRewardLoading: false,
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

	/**
	 * 复贷活动奖励提示弹框
	 *
	 */
	queryFudaiReward = () => {
		const { state = {} } = this.props.history.location;
		const { prodType } = state;
		this.startRewardLoading();
		this.props.$fetch
			.get(`${msg_popup_list}/2`)
			.then((res) => {
				this.stopRewardLoading();
				if (res.code === '000000' && res.data && res.data.popups && res.data.popups.length > 0) {
					if (!isWXOpen()) {
						this.props.setHomeModalAction({
							DataList: res.data.popups,
							mPosition: '还款结果页'
						});
					}
				} else if (this.state.billSts === '4') {
					if (isWXOpen()) {
						//微信菜单栏过来的
						this.props.history.replace(`/order/order_page`);
					} else {
						setTimeout(() => {
							this.props.history.replace(`/order/repayment_succ_page?prodType=${prodType}`);
						}, 2000);
					}
				}
			})
			.catch(() => {
				this.stopRewardLoading();
				if (this.state.billSts === '4') {
					setTimeout(() => {
						this.props.history.replace(`/order/repayment_succ_page?prodType=${prodType}`);
					}, 2000);
				}
			});
	};

	queryPayStatus = () => {
		const { state = {} } = this.props.history.location;
		const { repayOrdNo } = state;
		isFetching = true;
		this.props.$fetch
			.get(`${repay_payNotify}/${repayOrdNo}`)
			.then((res) => {
				if (res.code === '000000' && res.data) {
					isFetching = false;
					const { payResultCode, repayOrdAmt, crdOrdAmt, failMsg, billSts } = res.data || {};
					if (payResultCode === '00') {
						this.setState(
							{
								status: Number(repayOrdAmt) === Number(crdOrdAmt) ? 'success' : 'part',
								repayOrdAmt: Number(repayOrdAmt).toFixed(2),
								crdOrdAmt: Number(crdOrdAmt).toFixed(2),
								remainAmt: (Number(crdOrdAmt) - Number(repayOrdAmt)).toFixed(2),
								failMsg,
								billSts
							},
							() => {
								buriedPointEvent(order.repayResultStatus, {
									repayStatus: this.state.status,
									isWXOpen: isWXOpen()
								});
								if (this.state.status === 'success') {
									this.queryFudaiReward();
									clearInterval(timer);
								}
							}
						);
					} else if (payResultCode === '01') {
						this.setState(
							{
								status: 'fail',
								failMsg
							},
							() => {
								buriedPointEvent(order.repayResultStatus, {
									repayStatus: this.state.status,
									isWXOpen: isWXOpen()
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
			repayPerds: repayPerds.join(','),
			isWXOpen: isWXOpen()
		});
		this.props.history.replace({
			pathname: '/order/order_repay_page',
			state: {
				billNo: state.billNo
			}
		});
	};

	renderContinueButton = () => {
		const { billSts, status } = this.state;
		if (!((billSts === '4' && status === 'success') || status === 'waiting')) {
			return (
				<SXFButton onClick={this.continueRepay} className={styles.button}>
					继续还款
				</SXFButton>
			);
		}
		return null;
	};

	render() {
		const {
			seconds,
			status,
			remainAmt,
			repayOrdAmt,
			crdOrdAmt,
			failMsg,
			showRewardLoading,
			percent
		} = this.state;
		const { state = {} } = this.props.history.location;
		const { bankName, bankNo, exceedingAmt } = state;

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
							<p className={styles.sub_desc}>您正常还款，维护了自身信用</p>
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
							{failMsg ? (
								<div>
									<p className={styles.desc}>还款失败</p>
									<p className={styles.desc}>{failMsg}</p>
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
							{failMsg && (
								<p>
									失败原因：
									{failMsg}
								</p>
							)}
						</div>
					)}
				</div>
				{status === 'success' && exceedingAmt ? (
					<div className={styles.discount_box}>
						<span>为您下期账单减免</span>
						<span className={styles.discount}>
							<em>{exceedingAmt}</em>元
						</span>
					</div>
				) : null}
				{showRewardLoading ? (
					<div className={styles.reward_loading}>
						<img src={reward_loading} alt="" className={styles.reward_loading_icon} />
						<span>{percent}s</span>
					</div>
				) : null}
				{this.renderContinueButton()}
			</div>
		);
	}
}
