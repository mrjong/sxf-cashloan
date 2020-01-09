/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-01-09 10:28:58
 */
import React from 'react';
import { Modal, Toast } from 'antd-mobile';
import style from './index.scss';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default class CopyModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			copyText: '还到'
		};
	}

	// 点我复制“还到”
	copyOperation = () => {
		const { closeModal, confirmAction } = this.props;
		closeModal && closeModal();
		confirmAction && confirmAction();
		Toast.info('复制成功');
	};

	render() {
		const { copyText } = this.state;
		const { visible } = this.props;
		return (
			<Modal visible={visible} transparent wrapClassName="copy_modal">
				<p className={style.copyModalCont}>
					恭喜，您收到50000元备用金，请在应用商店搜索“还到”下载，完成申请后可直接提现至信用卡，额度请以最终审批结果为准。
				</p>
				<CopyToClipboard text={copyText} onCopy={() => this.copyOperation()}>
					<p className={style.copyBtn}>点我复制“还到”</p>
				</CopyToClipboard>
			</Modal>
		);
	}
}
