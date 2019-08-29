import React, { PureComponent } from 'react';
import IframeProtocol from 'components/IframeProtocol';
import style from './index.scss';
import { Modal } from 'antd-mobile';
import { recordContract } from 'utils';

export default class AgreementModal extends PureComponent {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		// document.body.addEventListener('touchmove', (e) => {
		//   e.preventDefault()
		// }, { passive: false })
	}

	btnHandler = () => {
		const { readAgreementCb } = this.props;
		// contractType 为协议类型 01为用户注册协议 02为用户隐私协议 03为用户协议绑卡,用户扣款委托书
		recordContract({
			contractType: '02'
		});
		readAgreementCb();
	};

	render() {
		const { visible } = this.props;
		return (
			<Modal wrapClassName="agreement_modal_warp" visible={visible} transparent>
				<div className={style.modal_outer_wrap}>
					<div className={style.title}>随行付用户隐私权政策</div>
					<div className={style.modal_inner_wrap}>
						<IframeProtocol name="privacy_agreement_page" />
					</div>
					<div className={style.button} onClick={this.btnHandler}>
						我已阅读
					</div>
				</div>
			</Modal>
		);
	}
}
