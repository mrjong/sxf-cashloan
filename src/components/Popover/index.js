import React, { PureComponent } from 'react';
import styles from './index.scss';

export default class Popover extends PureComponent {
	render() {
		const { text = '', popoverStyle } = this.props;
		return (
			<div style={{ ...{ position: 'absolute', right: '.1rem' }, ...popoverStyle }}>
				<div className={styles.popover_inner_wrap}>
					<span className={styles.popover_text}>{text}</span>
				</div>
				<div className={styles.arrow}></div>
			</div>
		);
	}
}
