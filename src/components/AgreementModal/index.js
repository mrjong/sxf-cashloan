/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-03-26 14:36:57
 */
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
						src={`/disting/#/user_privacy_page`}
						name="user_privacy_page"
						id="user_privacy_page"
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
