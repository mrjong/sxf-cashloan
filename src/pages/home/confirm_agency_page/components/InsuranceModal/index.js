import React from 'react';
import { Modal } from 'antd-mobile';
import style from './index.scss';

export default class InsuranceModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	render() {
		const { onConfirmCb } = this.props;
		return (
			<Modal visible={true} transparent maskClosable={false} className="insureModal">
				<p className={style.insureCont}>
					<span>借款人意外险</span>
					是中银保险为还到用户提供的意外伤害保障服务。用户可在借款期间获得一份意外伤害保险，在保险期内，由于意外伤害事故，由保险公司按照保险合同约定负责赔付。
				</p>
				<button
					className={style.insureBtn}
					onClick={() => {
						onConfirmCb();
					}}
				>
					确定
				</button>
			</Modal>
		);
	}
}
