/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-01-11 15:16:08
 */
import React from 'react';
import { Modal } from 'antd-mobile';
import ButtonCustom from '../ButtonCustom';
import styles from './index.scss';

export default class TipModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { visible, closeHandler, onConfirm, onCancel } = this.props;
		return (
			<Modal visible={visible} transparent wrapClassName="loan_tip_modal">
				<div className={styles.modalContent}>
					<p className={styles.head}>尊敬的还到用户</p>
					<div className={styles.mainContent}>
						<p className={styles.title}>2020年1月24日-2月2日暂缓放款</p>
						<p className={styles.desc}>
							受法定节假日影响，在您提交申请后，还到将于1月27日后为您陆续发放借款，请您耐心等待。同时，春节期间还到将继续为您提供其他相关金融服务。还到全体员工，祝您新春快乐！
						</p>
						<ButtonCustom
							onClick={() => {
								closeHandler && closeHandler();
								onConfirm && onConfirm();
							}}
						>
							现在申请
						</ButtonCustom>
						<div
							className={styles.cancelStyle}
							onClick={() => {
								onCancel && onCancel();
							}}
						>
							稍后申请
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}
