import React from 'react';
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
		const { className } = this.props;
		return (
			<div className={`${styles.checkCoupon} ${className}`}>
				您可以在 <i>我的-优惠券</i> 中<span onClick={this.goCoupon}>查看</span>
			</div>
		);
	}
}
