import React from 'react';
import styles from './index.scss';
// import { Modal, ActivityIndicator, Icon } from 'antd-mobile';
import SXFButton from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import success_icon from './img/success_icon.png';
import circle_icon from './img/circle_icon.png';
import { setBackGround } from 'utils/background';
import { store } from 'utils/store';

const API = {
	queryPayStatus: '/bill/payNotify',
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
			orgFnlMsg: ''
		};
	}

	componentDidMount() {
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
		const { repayOrdNo, isLastPerd, prodType } = this.props.history.location.state;
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
								if (this.state.status === 'success') {
									if (isLastPerd) {
										//如果还的是最后一期
										setTimeout(() => {
											store.removeBackData();
											this.props.history.replace(`/order/repayment_succ_page?prodType=${prodType}`);
										}, 2000);
									} else {
										this.queryPlain();
									}
									clearInterval(timer);
								}
							}
						);
					} else if (resultMark === '00') {
						this.setState({
							status: 'fail',
							orgFnlMsg
						});
						clearInterval(timer);
					}
				}
			})
			.catch((err) => {
				console.log(err);
				isFetching = false;
			});
	};

	render() {
		const { seconds, status, remainAmt, repayOrdAmt, crdOrdAmt, orgFnlMsg, exceedingAmt } = this.state;
		const { bankName, bankNo, isLastPerd } = this.props.history.location.state;

		return (
			<div>
				{/* <div className={styles.modal_title}>
					{status === 'part' ? '本次还款明细' : '还款'}
					{status !== 'success' && status !== 'waiting' && (
						<Icon
							type="cross"
							className={styles.modal_close_btn}
							onClick={() => {
								onClose();
							}}
						/>
					)}
        </div> */}
				<div className={styles.loading_box}>
					{status === 'waiting' && (
						<div>
							<div className={styles.icon_wrap}>
								<img src={circle_icon} alt="" className={styles.circle_icon} />
								{/* <ActivityIndicator animating className={styles.loading_icon} /> */}
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
						<span>为您下期账单减免</span>
						<span className={styles.discount}>{exceedingAmt}元</span>
					</div>
				) : null}

				{!isLastPerd && status !== 'waiting' ? (
					<SXFButton
						onClick={() => {
							this.props.history.replace('/order/order_repay_page');
						}}
						className={styles.button}
					>
						继续还款
					</SXFButton>
				) : null}
			</div>
		);
	}
}
