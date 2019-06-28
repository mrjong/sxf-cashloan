import React from 'react';
import styles from './index.scss';
import { Modal, ActivityIndicator, Icon } from 'antd-mobile';
import SXFButton from 'components/ButtonCustom';

export default class Cashier extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { status, onClose, visible, onConfirm } = this.props;
		return (
			<Modal visible={visible} transparent className="cashier_modal" animationType="slide-up" popup>
				<div className={styles.modal_title}>
					{status === 'part' ? '本次还款明细' : '支付'}
					<Icon type="cross" className={styles.modal_close_btn} onClick={onClose} />
				</div>
				{status === 'waiting' && (
					<div>
						<div className={styles.icon_wrap}>
							<ActivityIndicator animating className={styles.loading_icon} color="red" />
						</div>
						<p className={styles.desc}>还款中，预计15秒内完成...</p>
					</div>
				)}
				{status === 'success' && (
					<div>
						<div className={styles.icon_wrap}>
							<div className={[styles.success_icon, styles.icon].join(' ')} />
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
						<p className={styles.desc}>
							还款失败
							<br />
							交通银行(1234)还款失败，请重试！
						</p>
					</div>
				)}
				{status === 'part' && (
					<div className={styles.list_wrap}>
						<ul>
							<li className={styles.list_item}>
								<span>发起还款金额</span>
								<span className={styles.value}>158.00元</span>
							</li>
							<li className={styles.list_item}>
								<span>成功还款</span>
								<span className={styles.value}>158.00元</span>
							</li>
							<li className={styles.list_item}>
								<span>剩余应还</span>
								<span className={styles.value}>158.00元</span>
							</li>
						</ul>
						<p>失败原因：余额不足</p>
						<SXFButton onClick={onConfirm} className={styles.modal_btn}>
							继续还款
						</SXFButton>
					</div>
				)}
			</Modal>
		);
	}
}
