import React, { PureComponent } from 'react';
import IframeProtocol from 'components/IframeProtocol';
import style from './index.scss';

export default class AgreementModal extends PureComponent {
	render() {
		const { handleClick } = this.props;
		return (
			<div className={style.modal_outer_wrap}>
				<div className={style.title}>用户隐私权政策</div>
				<div className={style.modal_inner_wrap}>
					<IframeProtocol name="privacy_agreement_page" />
				</div>
				<div className={style.button} onClick={handleClick}>
					我已阅读
				</div>
			</div>
		);
	}
}
