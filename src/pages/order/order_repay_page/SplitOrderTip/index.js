import React, { PureComponent } from 'react';
import styles from './index.scss';

export default class SplitOrderTip extends PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		const { visible, onClick } = this.props;
		return (
			<div>
				{visible ? (
					<div className={styles.alert_wrap}>
						<div className={styles.alert_body}>
							<div className={styles.alert_body_box}>
								<h3>温馨提示</h3>
								<p>分单还款不慎容易造成逾期，建议您合并还款！</p>
							</div>
							<div className={styles.button_box}>
								<div className={styles.button_wrap}>
									<span
										className={[styles.button, styles.exit].join(' ')}
										onClick={() => {
											onClick('exit');
										}}
									>
										分单还款
									</span>
									<span
										className={styles.button}
										onClick={() => {
											onClick('submit');
										}}
									>
										合并还款
									</span>
								</div>
							</div>
						</div>
					</div>
				) : null}
			</div>
		);
	}
}
