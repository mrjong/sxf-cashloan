import React, { Component } from 'react';
import fetch from 'sx-fetch';
import ButtonCustom from 'components/ButtonCustom';
import { store } from 'utils/store';
import styles from './index.scss';
const API = {
	qryDtl: '/bill/qryDtl'
};
@fetch.inject()
export default class wx_middle_page extends Component {
	constructor(props) {
		super(props);
		this.state = {
			thisRepTotAmt: ''
		};
	}
	componentWillMount() {
		this.getLoanInfo();
	}
	// 获取还款信息
	getLoanInfo = () => {
		let test = store.getOrderSuccess();
		this.props.$fetch
			.post(API.qryDtl, {
				billNo: store.getBillNo()
			})
			.then((res) => {
				if (res.msgCode === 'PTM0000') {
					for (let index = 0; index < res.data.perdList.length; index++) {
						const element = res.data.perdList[index];
						if (res.data.perdNum == element.perdNum) {
							this.setState({
								orderData: element,
								thisRepTotAmt: (test && test.thisRepTotAmt) || ''
							});

							break;
						}
					}
					if (
						res.data &&
						res.data.perdList &&
						res.data.perdList[res.data.perdList.length - 1].perdSts === '4'
					) {
						store.setWxPayEnd(true);
					} else {
						store.setWxPayEnd(false);
					}
				} else {
					this.props.toast.info(res.msgInfo);
				}
			});
	};
	backHome = () => {
		let WxPayEnd = store.getWxPayEnd();
		if (WxPayEnd) {
			window.ReactRouterHistory.replace('/order/repayment_succ_page');
		} else {
			window.ReactRouterHistory.replace('/order/order_detail_page');
		}
	};
	render() {
		const { orderData, thisRepTotAmt } = this.state;
		console.log(orderData);
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
