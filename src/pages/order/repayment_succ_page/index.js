import React, { PureComponent } from 'react';
import ButtonCustom from 'components/ButtonCustom';
import { Modal } from 'antd-mobile';
import { store } from 'utils/store';
import { buriedPointEvent } from 'utils/analytins';
import { order } from 'utils/analytinsType';
// import 'utils/noRouterBack'
import styles from './index.scss';

export default class repayment_succ_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			orderSuccess: {
				billPrcpAmt: '--',
				perdUnit: '--',
				billRegDt: '--'
			},
			isShowTipsModal: true
		};
	}
	componentWillMount() {
		let test = store.getOrderSuccess();
		if (test) {
			let orderSuccess = test;
			this.setState({
				orderSuccess
			});
		}
	}

	// 返回首页
	backHome = (type, canyu) => {
		buriedPointEvent(type);
		if (canyu) {
			this.props.history.push('/activity/mianxi418_page?entry=isxdc_order_alert');
		} else {
			this.props.history.push('/home/home');
		}
	};

	// 关闭弹窗
	closeModal = () => {
		buriedPointEvent(order.closeModal);
		this.setState({
			isShowTipsModal: false
		});
	};

	render() {
		const { isShowTipsModal } = this.state;
		return (
			<div className={styles.repayment_succ_page}>
				<div className={styles.tips}>
					<i className={styles.success_ico} />
					<p>申请还款成功</p>
				</div>
				<div className={styles.details}>
					<p>借款金额：{this.state.orderSuccess.billPrcpAmt}元</p>
					<p>
						借款期限：{this.state.orderSuccess.perdLth}
						{this.state.orderSuccess.perdUnit === 'M' ? '个月' : '天'}
					</p>
					<p>申请借款日期：{this.state.orderSuccess.billRegDt}</p>
				</div>
				<ButtonCustom
					onClick={() => {
						this.backHome(order.returnHome);
					}}
					className={styles.back_btn}
				>
					返回首页
				</ButtonCustom>
				<Modal wrapClassName={styles.success_modal_warp} visible={isShowTipsModal} transparent>
					<div className={styles.modal_tip_content}>
						<div className={styles.modal_content}>
							<div className={styles.btn_mianxi} onClick={() => this.backHome(order.openNow, true)}>
								立即参与
							</div>
						</div>
					</div>
					<i className={styles.close_btn} onClick={this.closeModal} />
				</Modal>
			</div>
		);
	}
}
