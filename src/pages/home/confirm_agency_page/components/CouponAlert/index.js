import React, { PureComponent } from 'react';
import style from './index.scss';

export default class CouponAlert extends PureComponent {
	constructor(props) {
		super(props);
	}

	handleButton = (type) => {
		if (type === 'exit') {
			this.props.history.push('/home/home');
		} else {
			this.props.onConfirm();
		}
	};

	render() {
		const { visible, data } = this.props;
		return (
			<div>
				{visible && (
					<div className={style.alert_wrap}>
						<div className={style.alert_mask}></div>
						<div className={style.alert_body}>
							<div className={style.alert_body_box}>
								<h3>今日借款可享受以下优惠</h3>
								<p>确定退出吗？</p>
								<div className={style.coupon_box}>
									<div className={style.coupon_time}>有效期至{data.validEndTm}</div>
									<div className={style.coupon_value}>{data.coupVal}元</div>
								</div>
							</div>
							<div className={style.button_box}>
								<div className={style.button_wrap}>
									<span
										className={[style.button, style.exit].join(' ')}
										onClick={() => {
											this.handleButton('exit');
										}}
									>
										退出
									</span>
									<span
										className={style.button}
										onClick={() => {
											this.handleButton('submit');
										}}
									>
										立即使用
									</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}
