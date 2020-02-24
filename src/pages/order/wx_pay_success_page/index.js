import React, { Component } from 'react';
import fetch from 'sx-fetch';
import ButtonCustom from 'components/ButtonCustom';
import { store } from 'utils/store';
import { bill_queryBillDetail } from 'fetch/api';
import qs from 'qs';
import styles from './index.scss';

let queryData = null;
@fetch.inject()
export default class wx_pay_success_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			thisRepTotAmt: ''
		};
	}
	componentWillMount() {
		queryData = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		store.setHistoryRouter(window.location.pathname);
		this.getLoanInfo();
	}
	// 获取还款信息
	getLoanInfo = () => {
		let test = store.getOrderSuccess();
		this.props.$fetch.post(bill_queryBillDetail, { billNo: queryData.billNo }).then((res) => {
			if (res.code === '000000' && res.data) {
				if (test && !test.isPayAll) {
					for (let index = 0; index < res.data.preds.length; index++) {
						const element = res.data.preds[index];
						if (test.thisPerdNum == element.perdNum) {
							this.setState({
								orderData: element,
								thisRepTotAmt: (test && test.thisRepTotAmt) || ''
							});
							break;
						}
					}
				} else {
					this.setState({
						orderData: (res.data && res.data.preds && res.data.preds[res.data.preds.length - 1]) || {},
						thisRepTotAmt: (test && test.thisRepTotAmt) || ''
					});
				}
			} else {
				this.props.toast.info(res.message);
			}
		});
	};
	backHome = () => {
		this.props.history.push('/order/order_page');
	};
	render() {
		const { orderData, thisRepTotAmt } = this.state;
		return (
			<div className={styles.repayment_succ_page}>
				<div className={styles.tips}>
					<i className={orderData && orderData.perdSts === '4' ? styles.success_ico : styles.loading_ico} />
					<p>{orderData && orderData.perdSts === '4' ? '还款成功' : '处理中'}</p>
					{orderData && orderData.perdSts === '4' ? null : (
						<div className={styles.desc}>5分钟后返回处理结果，请耐心等待</div>
					)}
				</div>
				<div>
					<div className={styles.box}>
						<div className={styles.item}>
							<span className={styles.title}>还款金额</span>
							<span className={styles.money}>{thisRepTotAmt || '--'}</span>
						</div>
						<div className={styles.item}>
							<span className={styles.title}>支付方式</span>
							<span className={styles.money}>微信</span>
						</div>
					</div>
				</div>
				<ButtonCustom
					onClick={() => {
						this.backHome();
					}}
					className={styles.back_btn}
				>
					完成
				</ButtonCustom>
			</div>
		);
	}
}
