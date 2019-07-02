import React from 'react';
import styles from './index.scss';
import { Modal, ActivityIndicator, Icon } from 'antd-mobile';
import SXFButton from 'components/ButtonCustom';
import fetch from 'sx-fetch';
import success_icon from '../../img/success_icon.png';

const API = {
	queryPayStatus: '/bill/payNotify'
};
let timer = null;
let isFetching = false;
@fetch.inject()
export default class Cashier extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			seconds: 15,
			status: 'waiting',
			remainAmt: 0,
			repayOrdAmt: 0,
			crdOrdAmt: 0,
			orgFnlCd: ''
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
					if (this.state.status === 'waiting' && !isFetching) {
						this.queryPayStatus();
					}
				}
			);
		}, 1000);
	}

	componentWillUnmount() {
		clearInterval(timer);
	}

	queryPayStatus = () => {
		isFetching = true;
		this.props.$fetch
			.get(API.queryPayStatus + `/${this.props.repayOrdNo}`)
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					isFetching = false;
					const { resultMark, repayOrdAmt, crdOrdAmt, orgFnlCd } = res.data || {};
					if (resultMark === '01') {
						this.setState(
							{
								status: Number(repayOrdAmt) === Number(crdOrdAmt) ? 'success' : 'part',
								repayOrdAmt: Number(repayOrdAmt).toFixed(2),
								crdOrdAmt: Number(crdOrdAmt).toFixed(2),
								remainAmt: (Number(crdOrdAmt) - Number(repayOrdAmt)).toFixed(2),
								orgFnlCd
							},
							() => {
								setTimeout(() => {
									this.props.onClose('success');
									clearInterval(timer);
								}, 2000);
							}
						);
					} else if (resultMark === '00') {
						this.setState({
							status: 'fail'
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
		const { seconds, status, remainAmt, repayOrdAmt, crdOrdAmt, orgFnlCd } = this.state;
		const { onClose, bankName, bankNo } = this.props;
		return (
			<Modal visible={true} transparent className="cashier_modal" animationType="slide-up" popup>
				<div className={styles.modal_title}>
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
				</div>
				{status === 'waiting' && (
					<div>
						<div className={styles.icon_wrap}>
							<ActivityIndicator animating className={styles.loading_icon} />
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
						{orgFnlCd ? (
							<p className={styles.desc}>
								还款失败
								<br />
								{bankName}({bankNo}
								)还款失败: {orgFnlCd}
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
						{orgFnlCd && (
							<p>
								失败原因：
								{orgFnlCd}
							</p>
						)}
						<SXFButton
							onClick={() => {
								onClose();
							}}
							className={styles.modal_btn}
						>
							继续还款
						</SXFButton>
					</div>
				)}
			</Modal>
		);
	}
}
