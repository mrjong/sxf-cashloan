import React, { Component } from 'react';
import styles from './index.scss';
import { ButtonCustom } from 'components';
class BottomButton extends Component {
	render() {
		const { totalAmt, disabled, handleClick } = this.props;
		return (
			<div className={styles.bottomButtonWrap}>
				<span className={styles.moneyShow}>
					共计<em>{totalAmt}</em>元
				</span>
				<ButtonCustom
					onClick={handleClick}
					loading={!totalAmt || disabled}
					className={[styles.sxf_btn, (!totalAmt || disabled) && styles.sxf_btn_disabled].join(' ')}
				>
					立即还款
				</ButtonCustom>
			</div>
		);
	}
}

export default BottomButton;
