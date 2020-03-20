import React, { Component } from 'react';
import styles from './index.scss';
class TipConfirmModal extends Component {
	render() {
		const { onButtonClick, visible, title, desc, cancelButtonText, okButtonText } = this.props;

		return (
			<div>
				{visible ? (
					<div className={styles.alert_wrap}>
						<div className={styles.alert_body}>
							<div className={styles.alert_body_box}>
								{title ? <h3 className={styles.title}>{title}</h3> : null}
								<p className={styles.desc}>{desc}</p>
							</div>
							<div className={styles.button_box}>
								<div className={styles.button_wrap}>
									<span
										className={[styles.button, styles.exit].join(' ')}
										onClick={() => {
											onButtonClick('exit');
										}}
									>
										{cancelButtonText}
									</span>
									<span
										className={styles.button}
										onClick={() => {
											onButtonClick('submit');
										}}
									>
										{okButtonText}
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

export default TipConfirmModal;
