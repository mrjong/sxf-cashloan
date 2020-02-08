import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import styles from './index.scss';
import Image from 'assets/image';

class OverdueTipModal extends Component {
	render() {
		const { visible, billOvduStartDt, handleClick } = this.props;
		return (
			<Modal
				className={styles.antModal}
				visible={visible}
				transparent
				footer={[
					{
						text: '我知道了',
						onPress: () => {
							handleClick();
						}
					}
				]}
			>
				<div className={styles.modalWrap}>
					<h3 className={styles.modalTitle}>
						<img src={Image.adorn.mark} alt="" className={styles.modalTitleIcon} />
						逾期天数说明
					</h3>
					<p className={styles.modalDesc}>
						任意一期未按时足额还款，视为逾期，计算逾期天数，直至还清全部应还未还款项为止。
					</p>
					<p className={styles.modalDesc}>罚息由出借方收取,逾期管理费由平台方收取。</p>
					<p className={styles.modalDesc}>
						您的逾期开始日期：<em className={styles.overdueDate}>{billOvduStartDt}</em>
					</p>
				</div>
			</Modal>
		);
	}
}

export default OverdueTipModal;
