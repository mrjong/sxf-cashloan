/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2019-09-06 18:14:50
 */
import React, { PureComponent } from 'react';
import qs from 'qs';
import styles from './index.scss';
import { buriedPointEvent } from 'utils/analytins';
import { other } from 'utils/analytinsType';

export default class crash_page extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}
	componentWillMount() {
		const query = qs.parse(this.props.history.location.search, { ignoreQueryPrefix: true });
		const { RouterType } = query;
		buriedPointEvent(other.previewMaintenance, { from_page: RouterType });
	}
	render() {
		return (
			<div className={styles.err_page}>
				<i className={styles.err_img}></i>
				<p className={styles.err_cont}>系统升级中</p>
				<p className={styles.err_cont2}>我们正在不断努力提升用户体验</p>
				<div className={styles.contact_tips}>联系还到：400-088-7626</div>
			</div>
		);
	}
}
