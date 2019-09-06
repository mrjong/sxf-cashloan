/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-09-06 17:56:53
 */
import React, { PureComponent } from 'react';
import styles from './index.scss';

export default class crash_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	// 重新加载
	reloadHandler = () => {
		window.location.reload();
	};
	render() {
		return (
			<div className={styles.err_page}>
				<i className={styles.err_img}></i>
				<p className={styles.err_cont}>系统维护中</p>
				<p className={styles.err_cont2}>我们正在不断努力提升用户体验</p>
				<div className={styles.contact_tips}>联系还到：400-088-7626</div>
			</div>
		);
	}
}
