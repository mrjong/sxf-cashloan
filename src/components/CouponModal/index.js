/*
 * @Author: sunjiankun
 * @LastEditors  : sunjiankun
 * @LastEditTime : 2020-02-18 10:05:40
 */
import React from 'react';
import { Modal } from 'antd-mobile';
import styles from './index.scss';

export default class CouponModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { visible, onConfirm, couponData } = this.props;
		const filterCouponData = couponData && JSON.parse(couponData);
		return (
			<Modal visible={visible} transparent wrapClassName="coupon_tip_modal">
				<div className={styles.modalContent}>
					<p className={styles.title}>意外惊喜</p>
					<p className={styles.subTitle}>恭喜您，获得专享优惠券</p>
					<div className={styles.couponBox}>
						<div className={styles.leftPart}>
							<p className={styles.couponNmStyle}>
								{(filterCouponData && filterCouponData.couponName) || ''}
							</p>
							<p className={styles.couponDtStyle}>
								有效期至
								{(filterCouponData && filterCouponData.couponValid) || ''}
							</p>
						</div>
						<p className={styles.rightPart}>
							<span className={styles.couponValStyle}>
								{(filterCouponData && filterCouponData.couponAmt) || ''}
							</span>
							元
						</p>
					</div>
					<p className={styles.couponDesc}>{(filterCouponData && filterCouponData.couponDesc) || ''}</p>
					<div
						className={styles.btnStyle}
						onClick={() => {
							onConfirm && onConfirm();
						}}
					>
						知道了
					</div>
				</div>
			</Modal>
		);
	}
}
