/*
 * @Author: sunjiankun
 * @LastEditors: sunjiankun
 * @LastEditTime: 2020-03-27 17:01:09
 */
import React, { Component } from 'react';
import Image from 'assets/image';
import styles from './index.scss';

class FooterBar extends Component {
	render() {
		return (
			<div className={styles.navBarStyle}>
				<img src={Image.bg.navBarBg} />
			</div>
		);
	}
}

export default FooterBar;
