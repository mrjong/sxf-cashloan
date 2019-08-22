import React from 'react';
import { store } from 'utils/store';
import styles from './index.scss';

export default class CouponDesc extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	goCoupon = () => {
		this.props.history.push('/mine/coupon_page');
	};

	render() {
		return (
			<div className={styles.checkCoupon}>
				您可以在 <i>我的-优惠券</i> 中<span onClick={this.goCoupon}>查看</span>
			</div>
		);
	}
}
