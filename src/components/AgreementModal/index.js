import React, { PureComponent } from 'react';
import style from './index.scss';

export default class AgreementModal extends PureComponent {
	render() {
		const { handleClick } = this.props;
		return (
			<div className={style.modal_outer_wrap}>
				<div className={style.title}>用户隐私权政策</div>
				<div className={style.modal_inner_wrap}>
					<iframe
						src={`/disting/#/privacy_agreement_page`}
						name="privacy_agreement_page"
						id="privacy_agreement_page"
						width="100%"
						height="100%"
						frameBorder="0"
					/>
				</div>
				<div className={style.button} onClick={handleClick}>
					我已阅读
				</div>
			</div>
		);
	}
}
